const nodemailer = require("nodemailer");

// 🔐 Strict SMTP Only (Zoho / Domain Email)
if (!process.env.SMTP_HOST) {
  throw new Error("❌ SMTP_HOST is not defined in environment variables");
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false, // true only if using port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    minVersion: "TLSv1.2",
  },
});

console.log("📧 Using SMTP:", process.env.SMTP_HOST);

// ✅ Common send function
async function sendMail({ to, subject, html, text }) {
  console.log("Sending mail to:", to);

  try {
    return await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME || "BBSCART"}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw error;
  }
}

/* ======================================================
   EMAIL TEMPLATES
====================================================== */

// Vendor temp password email
function vendorWelcomeEmail({ name, email, tempPassword }) {
  const subject = "Your BBSCART Vendor Login Credentials";

  const text = `Hello ${name || "Vendor"},

Your vendor account is ready.

Login email: ${email}
Temporary password: ${tempPassword}

For security, please sign in and change your password immediately.

Thanks,
BBSCART Team`;

  const html = `
  <p>Hello <b>${name || "Vendor"}</b>,</p>
  <p>Your vendor account is ready.</p>
  <p>
    <b>Login email:</b> ${email}<br/>
    <b>Temporary password:</b> ${tempPassword}
  </p>
  <p>For security, please sign in and change your password immediately.</p>
  <p>Thanks,<br/>BBSCART Team</p>
  `;

  return { subject, text, html };
}

// Vendor set password link
function vendorSetPasswordEmail({ name, email, link }) {
  const subject = "Set your BBSCART vendor password";

  const text = `Hello ${name || "Vendor"},

We created your vendor account for ${email}.
Set your password within 48 hours using this link:

${link}

If you didn’t request this, ignore this email.`;

  const html = `
  <p>Hello <b>${name || "Vendor"}</b>,</p>
  <p>We created your vendor account for <b>${email}</b>.</p>
  <p>Please set your password within <b>48 hours</b> using this link:</p>
  <p><a href="${link}">${link}</a></p>
  <p>If you didn’t request this, you can ignore this email.</p>
  `;

  return { subject, text, html };
}

// Admin invite email
async function sendAdminInviteEmail({ to, inviteUrl }) {
  const html = `
    <p>You’ve been invited to join BBSCART as an Admin.</p>
    <p>Click the link below to accept your invite and set your password:</p>
    <p><a href="${inviteUrl}">${inviteUrl}</a></p>
    <p>This link will expire soon. If you didn’t expect this, ignore it.</p>
  `;

  return sendMail({
    to,
    subject: "Admin Invite",
    html,
    text: `Admin Invite Link: ${inviteUrl}`,
  });
}

/* ======================================================
   VERIFY SMTP CONNECTION
====================================================== */

transporter.verify()
  .then(() => console.log("✅ SMTP server is ready"))
  .catch((err) => {
    console.error("❌ SMTP connection failed:", err.message);
  });

module.exports = {
  sendMail,
  vendorWelcomeEmail,
  vendorSetPasswordEmail,
  sendAdminInviteEmail,
};
