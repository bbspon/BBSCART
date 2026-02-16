const axios = require("axios");

const BSNL_SMS_CONFIG = {
  baseUrl: "https://bulksms.bsnl.in:5010",

  // Portal credentials (move to env ideally)
  username: process.env.BSNL_USERNAME || "bbspon",
  password: process.env.BSNL_PASSWORD || "1947@PEAcock",

  // From BSNL portal API Details
  serviceId: process.env.BSNL_SERVICE_ID || "10894",

  // From template screen
  senderId: process.env.BSNL_SENDER_ID || "GLXINF",
  contentTemplateId: process.env.BSNL_TEMPLATE_ID || "1407172612209917457",
  entityId: process.env.BSNL_ENTITY_ID || "1401534940000071127",   // ✅ ADD THIS

  // Token cache
  jwtToken: null,

  // Optional: comma-separated public IPs whitelisted in BSNL (if BSNL enforces it)
  // Example: set BSNL_IPS="49.204.xx.xx,103.xxx.xx.xx"
  ipAddresses: (process.env.BSNL_IPS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  mockMode: process.env.BSNL_MOCK_MODE === "true",
};

const generateBSNLToken = async () => {
  if (BSNL_SMS_CONFIG.jwtToken) return BSNL_SMS_CONFIG.jwtToken;

  const url = `${BSNL_SMS_CONFIG.baseUrl}/api/Create_New_API_Token`;

  const payload = {
    Service_Id: BSNL_SMS_CONFIG.serviceId,
    Username: BSNL_SMS_CONFIG.username,
    Password: BSNL_SMS_CONFIG.password,
    Token_Id: "1",
    IP_Addresses:
      BSNL_SMS_CONFIG.ipAddresses.length
        ? BSNL_SMS_CONFIG.ipAddresses
        : null,
  };

  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    timeout: 15000,
  });

  const token = response.data?.token || response.data;

  if (!token || typeof token !== "string") {
    throw new Error("Invalid JWT token received from BSNL");
  }

  BSNL_SMS_CONFIG.jwtToken = token;
  return token;
};

const normalizeMobile = (mobileNumber) => {
  let num = String(mobileNumber).replace(/[\s\+\-\(\)]/g, "");
  if (num.startsWith("91") && num.length === 12) num = num.slice(2);
  if (!/^[6-9]\d{9}$/.test(num)) throw new Error("Invalid Indian mobile number");
  return num;
};

const sendBSNLOTP = async (mobileNumber, otp) => {
  if (BSNL_SMS_CONFIG.mockMode) {
    console.log("📱 [MOCK] OTP SMS", { mobileNumber, otp });
    return { success: true, mock: true };
  }

  const token = await generateBSNLToken();
  const normalizedMobile = normalizeMobile(mobileNumber);

  const url = `${BSNL_SMS_CONFIG.baseUrl}/api/Send_SMS`;

  // Try BOTH formats:
  // 1) 10-digit (matches portal UI: "10 Digit Mobile No(s)")
  // 2) 91+10-digit
  const targetCandidates = [normalizedMobile, `91${normalizedMobile}`];

  const attempts = [];

  for (const target of targetCandidates) {
    const payload = {
      Header: BSNL_SMS_CONFIG.senderId,
      Target: target,
      Is_Unicode: "0",
      Is_Flash: "0",
      Message_Type: "SI",

      Entity_Id: BSNL_SMS_CONFIG.entityId,   // ⭐ REQUIRED
      Content_Template_Id: BSNL_SMS_CONFIG.contentTemplateId,
      Consent_Template_Id: null,

      Template_Keys_and_Values: [
        {
          Key: "var",
          Value: String(otp),
        },
      ],
    };

    console.log("📱 BSNL SMS Request:");
    console.log("   URL:", url);
    console.log("   Mobile (normalized):", normalizedMobile);
    console.log("   Target:", target);
    console.log("   Payload:", JSON.stringify(payload, null, 2));

    try {
      const res = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 15000,
      });

      attempts.push({ target, status: res.status, data: res.data });
      console.log("📱 BSNL SMS Response:", JSON.stringify(res.data, null, 2));

      // Success cases (BSNL may return Message_Id or some non-error object)
      if (
        !res.data?.Error &&
        (res.data?.Message_Id || res.data?.messageId || res.status === 200)
      ) {
        return {
          success: true,
          messageId: res.data?.Message_Id || res.data?.messageId || null,
          response: res.data,
          endpoint: url,
          attempts,
        };
      }

      // If BSNL still returns Error, continue to next target format
    } catch (err) {
      const resp = err.response ? err.response.data : null;
      attempts.push({ target, status: err.response?.status || null, data: resp || err.message });
      console.log("❌ BSNL Send_SMS error:", err.response?.status || err.message, resp || "");
    }
  }

  return {
    success: false,
    error: "BSNL returned Invalid Input for both Target formats",
    endpoint: url,
    attempts,
  };
};

const sendOTPSMS = async (mobileNumber, otp) => sendBSNLOTP(mobileNumber, otp);

module.exports = { sendOTPSMS, BSNL_SMS_CONFIG, normalizeMobile };
