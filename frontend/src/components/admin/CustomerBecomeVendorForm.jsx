import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Spinner, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const constitutionOptions = [
  { value: "proprietorship", label: "Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "private_ltd", label: "Private Limited" },
  { value: "public_ltd", label: "Public Limited" },
  { value: "llp", label: "LLP" },
  { value: "trust", label: "Trust" },
  { value: "society", label: "Society" },
];

export default function CustomerBecomeVendorForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [customerBecomeVendorId, setCustomerBecomeVendorId] = useState(
    () => localStorage.getItem("customerBecomeVendorId") || ""
  );

  const [loadingPan, setLoadingPan] = useState(false);
  const [loadingAFront, setLoadingAFront] = useState(false);
  const [loadingABack, setLoadingABack] = useState(false);
  const [loadingGST, setLoadingGST] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    panNumber: "",
    aadharNumber: "",
    gender: "",
    register_street: "",
    register_city: "",
    register_state: "",
    register_country: "India",
    register_postalCode: "",
    gstNumber: "",
    gstLegalName: "",
    constitution_of_business: "",
    gst_floorNo: "",
    gst_buildingNo: "",
    gst_street: "",
    gst_locality: "",
    gst_district: "",
  });

  const handleSelectChange = (selectedOption, field) => {
    setFormData((prev) => ({
      ...prev,
      [field.name]: selectedOption ? selectedOption.label : "",
    }));
  };

  const fmtAadhaarUI = (digits) =>
    (digits || "")
      .replace(/\D/g, "")
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  // upload helper (no OCR) – same URL pattern as your other forms
  const uploadDoc = async (file) => {
    const fd = new FormData();
    fd.append("document", file);
    const { data } = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/upload`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    if (!data?.ok || !data?.fileUrl) throw new Error("Upload failed");
    return data.fileUrl;
  };

  // Step 1: PAN
  const onPanUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingPan(true);
    try {
      const fileUrl = await uploadDoc(file);
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/step-by-key`,
        { customerBecomeVendorId, pan_pic: fileUrl }
      );
      console.log("CBV submit response:", r.status, r.data);

      const id = r?.data?.data?._id;
      if (id && !customerBecomeVendorId) {
        setCustomerBecomeVendorId(id);
        localStorage.setItem("customerBecomeVendorId", id);
      }
    } catch (err) {
      console.error(err);
      alert("PAN upload failed");
    } finally {
      setLoadingPan(false);
    }
  };
const submitCustomerVendorApplication = async () => {
  const cid =
    customerBecomeVendorId || localStorage.getItem("customerBecomeVendorId");
  if (!cid) {
    alert("Missing customerBecomeVendorId");
    return;
  }
  const r = await axios.post(
    `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/register`,
    { customerBecomeVendorId: cid }
  );
  if (!r?.data?.ok) throw new Error(r?.data?.message || "Submit failed");
};

  const saveStep1AndNext = async () => {
    try {
      const payload = {
        customerBecomeVendorId,
        pan_number: (formData.panNumber || "").toUpperCase(),
        vendor_fname: formData.firstName || "",
        vendor_lname: formData.lastName || "",
        dob: formData.dob || "",
      };
      const resp = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/step-by-key`,
        payload
      );
      if (!resp?.data?.ok) throw new Error("Save failed");
      const id = resp?.data?.data?._id;
      if (id) {
        setCustomerBecomeVendorId(id);
        localStorage.setItem("customerBecomeVendorId", id);
      }
      setStep(2);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || e.message || "Save failed");
    }
  };

  // Step 2: Aadhaar
  const onAadhaarFront = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingAFront(true);
    try {
      const fileUrl = await uploadDoc(file);
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/step-by-key`,
        { customerBecomeVendorId, aadhar_pic_front: fileUrl }
      );
      const id = r?.data?.data?._id;
      if (id && !customerBecomeVendorId) {
        setCustomerBecomeVendorId(id);
        localStorage.setItem("customerBecomeVendorId", id);
      }
    } catch (err) {
      console.error(err);
      alert("Aadhaar front upload failed");
    } finally {
      setLoadingAFront(false);
    }
  };

  const onAadhaarBack = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoadingABack(true);
    try {
      const fileUrl = await uploadDoc(file);
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/step-by-key`,
        { customerBecomeVendorId, aadhar_pic_back: fileUrl }
      );
      const id = r?.data?.data?._id;
      if (id && !customerBecomeVendorId) {
        setCustomerBecomeVendorId(id);
        localStorage.setItem("customerBecomeVendorId", id);
      }
    } catch (err) {
      console.error(err);
      alert("Aadhaar back upload failed");
    } finally {
      setLoadingABack(false);
    }
  };

  const saveStep2AndNext = async () => {
    try {
      const aNumRaw = (formData.aadharNumber || "").replace(/\D/g, "");
      if (!aNumRaw) {
        alert("Missing Aadhaar number");
        return;
      }
      const r = await axios.post(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/step-by-key`,
        {
          customerBecomeVendorId,
          aadhar_number: aNumRaw,
          register_business_address: {
            street: formData.register_street || "",
            city: formData.register_city || "",
            state: formData.register_state || "",
            country: formData.register_country || "India",
            postalCode: formData.register_postalCode || "",
          },
        }
      );
      const id = r?.data?.data?._id;
      if (id && !customerBecomeVendorId) {
        setCustomerBecomeVendorId(id);
        localStorage.setItem("customerBecomeVendorId", id);
      }
      alert("Aadhaar slide saved");
      setStep(3);
    } catch (e) {
      console.error(e);
      alert("Save failed");
    }
  };

  // Step 3: GST
  const [gstFile, setGstFile] = useState(null);
  const onGstFileSelect = (e) => setGstFile(e.target.files?.[0] || null);

  const saveGstAndNext = async () => {
    try {
      if (!customerBecomeVendorId) {
        alert("Missing customerBecomeVendorId. Complete Step 1 first.");
        return;
      }
      const fd = new FormData();
      fd.append("customerBecomeVendorId", customerBecomeVendorId);
      if (gstFile) fd.append("document", gstFile);
      fd.append("gst_number", (formData.gstNumber || "").toUpperCase());
      fd.append("gst_legal_name", formData.gstLegalName || "");
      fd.append("gst_constitution", formData.constitution_of_business || "");
      fd.append("gst_address[floorNo]", formData.gst_floorNo || "");
      fd.append("gst_address[buildingNo]", formData.gst_buildingNo || "");
      fd.append("gst_address[street]", formData.gst_street || "");
      fd.append("gst_address[locality]", formData.gst_locality || "");
      fd.append("gst_address[district]", formData.gst_district || "");

      setLoadingGST(true);
      const r = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/gst`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!r?.data?.ok) throw new Error(r?.data?.message || "Save failed");
      setStep(4);
    } catch (e) {
      console.error(e);
      alert("Save failed");
    } finally {
      setLoadingGST(false);
    }
  };

  // Step 4: Bank
  const [bankFile, setBankFile] = useState(null);
  const [bankData, setBankData] = useState({
    account_holder_name: "",
    account_no: "",
    ifcs_code: "",
    bank_name: "",
    branch_name: "",
    bank_address: "",
  });

  const onBankFileChange = (e) => setBankFile(e.target.files?.[0] || null);

  const saveBankDetails = async () => {
    const cid =
      customerBecomeVendorId || localStorage.getItem("customerBecomeVendorId");
    if (!cid) {
      alert("Customer ID is required. Complete earlier steps first.");
      return;
    }
    const fd = new FormData();
    if (bankFile) fd.append("document", bankFile);
    fd.append("account_holder_name", bankData.account_holder_name || "");
    fd.append("account_no", bankData.account_no || "");
    fd.append("ifcs_code", (bankData.ifcs_code || "").toUpperCase());
    fd.append("bank_name", bankData.bank_name || "");
    fd.append("branch_name", bankData.branch_name || "");
    fd.append("bank_address", bankData.bank_address || "");

    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_API_URL
        }/api/customer-become-vendors/${cid}/bank`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (!response?.data?.ok)
        throw new Error(response?.data?.message || "Save failed");
      alert("Bank details saved successfully.");
      setStep(5);
    } catch (error) {
      console.error("Error saving bank details:", error);
      alert("Failed to save bank details.");
    }
  };

  // Step 5: Outlet
  const [outlet, setOutlet] = useState({
    outlet_name: "",
    manager_name: "",
    manager_mobile: "",
    outlet_phone: "",
    street: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    postalCode: "",
    lat: "",
    lng: "",
  });
  const [outletImage, setOutletImage] = useState(null);

  const handleOutletImageChange = (e) => {
    if (e.target.files && e.target.files[0]) setOutletImage(e.target.files[0]);
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setOutlet((prev) => ({ ...prev, lat: latitude, lng: longitude }));
          alert(
            `Location fetched: Latitude ${latitude}, Longitude ${longitude}`
          );
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to fetch location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const saveOutletAndFinish = async () => {
    const cid =
      customerBecomeVendorId || localStorage.getItem("customerBecomeVendorId");
    if (!cid) {
      alert("Missing customerBecomeVendorId. Complete earlier steps first.");
      return;
    }

    const fd = new FormData();
    fd.append("customerBecomeVendorId", cid);
    fd.append("outlet_name", outlet.outlet_name);
    fd.append("outlet_manager_name", outlet.manager_name);
    fd.append("outlet_contact_no", outlet.manager_mobile);
    fd.append("outlet_phone_no", outlet.outlet_phone);
    fd.append("outlet_location[street]", outlet.street);
    fd.append("outlet_location[city]", outlet.city);
    fd.append("outlet_location[district]", outlet.district);
    fd.append("outlet_location[state]", outlet.state);
    fd.append("outlet_location[country]", outlet.country || "India");
    fd.append("outlet_location[postalCode]", outlet.postalCode);
    if (outlet.lat) fd.append("outlet_coords[lat]", outlet.lat);
    if (outlet.lng) fd.append("outlet_coords[lng]", outlet.lng);
    if (outletImage) fd.append("outlet_nameboard_image", outletImage);

    const r = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/customer-become-vendors/outlet`,
      fd,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (!r?.data?.ok) throw new Error(r?.data?.message || "Save failed");
    alert("Outlet details saved");
    console.log(
      "CBV submit id:",
      customerBecomeVendorId || localStorage.getItem("customerBecomeVendorId")
    );

    try {
  await submitCustomerVendorApplication();    // sets status="submitted"
} catch (e) {
    console.error(e);
  alert(e?.response?.data?.message || e.message || "Submit failed");
   return; // stop if submit failed
 }
localStorage.removeItem("customerBecomeVendorId");
navigate("/customer-become-vendor-success");
  };

  useEffect(() => {
    const id = localStorage.getItem("customerBecomeVendorId");
    if (id) setCustomerBecomeVendorId(id);
  }, []);

  return (
    <div>
      <h4 className="mb-3">Customer Become Vendor Registration</h4>
      <div className="mb-3">
        <strong>Step {step} of 5</strong>
      </div>

      {step === 1 && (
        <div>
          <h5 className="mb-3">Step 1: PAN Card Details</h5>
          <Form.Group className="mb-3">
            <Form.Label>Upload PAN (JPG, JPEG, PNG, PDF)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={onPanUpload}
            />
            {loadingPan && (
              <div className="mt-2">
                <Spinner size="sm" /> Uploading PAN…
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Surname (Last Name)</Form.Label>
              <Form.Control
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>DOB (DD/MM/YYYY)</Form.Label>
              <Form.Control
                value={formData.dob}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, dob: e.target.value }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>PAN Number</Form.Label>
              <Form.Control
                value={formData.panNumber}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    panNumber: e.target.value.toUpperCase(),
                  }))
                }
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="primary" onClick={saveStep1AndNext}>
              Save & Continue
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h5 className="mb-3">Step 2: Aadhaar Details</h5>

          <Form.Group className="mb-3">
            <Form.Label>Upload Aadhaar Front (JPG, JPEG, PNG, PDF)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={onAadhaarFront}
            />
            {loadingAFront && (
              <div className="mt-2">
                <Spinner size="sm" /> Uploading…
              </div>
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Aadhaar Back (JPG, JPEG, PNG, PDF)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={onAadhaarBack}
            />
            {loadingABack && (
              <div className="mt-2">
                <Spinner size="sm" /> Uploading…
              </div>
            )}
          </Form.Group>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                value={formData.firstName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, firstName: e.target.value }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Surname (Last Name)</Form.Label>
              <Form.Control
                value={formData.lastName}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, lastName: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>DOB (DD/MM/YYYY)</Form.Label>
              <Form.Control
                value={formData.dob}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, dob: e.target.value }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Aadhaar Number</Form.Label>
              <Form.Control
                value={formData.aadharNumber}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    aadharNumber: fmtAadhaarUI(e.target.value),
                  }))
                }
              />
            </Col>
          </Row>

          <Form.Group className="mb-2">
            <Form.Label>Street</Form.Label>
            <Form.Control
              value={formData.register_street}
              onChange={(e) =>
                setFormData((p) => ({ ...p, register_street: e.target.value }))
              }
            />
          </Form.Group>

          <Row>
            <Col md={4} className="mb-2">
              <Form.Label>City</Form.Label>
              <Form.Control
                value={formData.register_city}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, register_city: e.target.value }))
                }
              />
            </Col>
            <Col md={4} className="mb-2">
              <Form.Label>State/UT</Form.Label>
              <Form.Control
                value={formData.register_state}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, register_state: e.target.value }))
                }
              />
            </Col>
            <Col md={4} className="mb-3">
              <Form.Label>PIN</Form.Label>
              <Form.Control
                value={formData.register_postalCode}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    register_postalCode: e.target.value,
                  }))
                }
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={saveStep2AndNext}>
              Save & Continue
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h5 className="mb-3">Step 3: GST Details</h5>
          <div className="mb-3">
            <label>Upload GST Certificate (PDF/JPG/PNG)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onGstFileSelect}
            />
            {loadingGST && <div className="mt-2">Saving GST…</div>}
          </div>
          <div className="mb-3">
            <label>GST Number</label>
            <input
              value={formData.gstNumber}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  gstNumber: e.target.value.toUpperCase(),
                }))
              }
            />
          </div>
          <div className="mb-3">
            <label>Legal Name</label>
            <input
              value={formData.gstLegalName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gstLegalName: e.target.value }))
              }
            />
          </div>

          <div className="col-span-1 mt-3 w-full">
            <div className="input-item mb-[8px]">
              <label className="block text-[14px] font-medium text-secondary mb-[8px]">
                Constitution of Business
              </label>
              <Select
                options={constitutionOptions}
                value={
                  constitutionOptions.find(
                    (option) =>
                      option.label === formData.constitution_of_business
                  ) || null
                }
                onChange={(option) =>
                  handleSelectChange(option, {
                    name: "constitution_of_business",
                  })
                }
                placeholder="Select Constitution"
                isSearchable
                className="w-full border rounded-lg"
              />
            </div>
          </div>

          <div className="mt-3">
            <label>Floor No.</label>
            <input
              value={formData.gst_floorNo}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gst_floorNo: e.target.value }))
              }
            />
            <label>Building/Flat No.</label>
            <input
              value={formData.gst_buildingNo}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gst_buildingNo: e.target.value }))
              }
            />
            <label>Road/Street</label>
            <input
              value={formData.gst_street}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gst_street: e.target.value }))
              }
            />
            <label>Locality/Sub-locality</label>
            <input
              value={formData.gst_locality}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gst_locality: e.target.value }))
              }
            />
            <label>District</label>
            <input
              value={formData.gst_district}
              onChange={(e) =>
                setFormData((p) => ({ ...p, gst_district: e.target.value }))
              }
            />
          </div>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={saveGstAndNext}>
              Save & Continue
            </button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h5 className="mb-3">Step 4: Bank Details</h5>

          <Form.Group className="mb-3">
            <Form.Label>
              Upload Cancelled Cheque or Bank Letter (PDF/JPG/PNG)
            </Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={onBankFileChange}
            />
          </Form.Group>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Account Holder Name</Form.Label>
              <Form.Control
                value={bankData.account_holder_name}
                onChange={(e) =>
                  setBankData((p) => ({
                    ...p,
                    account_holder_name: e.target.value,
                  }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Account Number</Form.Label>
              <Form.Control
                value={bankData.account_no}
                onChange={(e) =>
                  setBankData((p) => ({ ...p, account_no: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>IFSC Code</Form.Label>
              <Form.Control
                value={bankData.ifcs_code}
                onChange={(e) =>
                  setBankData((p) => ({
                    ...p,
                    ifcs_code: e.target.value.toUpperCase(),
                  }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Bank Name</Form.Label>
              <Form.Control
                value={bankData.bank_name}
                onChange={(e) =>
                  setBankData((p) => ({ ...p, bank_name: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-3">
              <Form.Label>Branch</Form.Label>
              <Form.Control
                value={bankData.branch_name}
                onChange={(e) =>
                  setBankData((p) => ({ ...p, branch_name: e.target.value }))
                }
              />
            </Col>
            <Col md={6} className="mb-3">
              <Form.Label>Bank Address</Form.Label>
              <Form.Control
                as="textarea"
                value={bankData.bank_address}
                onChange={(e) =>
                  setBankData((p) => ({ ...p, bank_address: e.target.value }))
                }
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={saveBankDetails}>
              Save Bank Details
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h5 className="mb-3">Step 5: Outlet Details</h5>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Outlet Name</Form.Label>
              <Form.Control
                value={outlet.outlet_name}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, outlet_name: e.target.value }))
                }
              />
            </Col>
            <Col md={6}>
              <Form.Label>Manager Name</Form.Label>
              <Form.Control
                value={outlet.manager_name}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, manager_name: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Manager Mobile</Form.Label>
              <Form.Control
                value={outlet.manager_mobile}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, manager_mobile: e.target.value }))
                }
              />
            </Col>
            <Col md={6}>
              <Form.Label>Outlet Phone</Form.Label>
              <Form.Control
                value={outlet.outlet_phone}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, outlet_phone: e.target.value }))
                }
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Label>Address</Form.Label>
              <Form.Control
                className="mb-2"
                placeholder="Street"
                value={outlet.street}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, street: e.target.value }))
                }
              />
              <Row>
                <Col md={4}>
                  <Form.Control
                    className="mb-2"
                    placeholder="City"
                    value={outlet.city}
                    onChange={(e) =>
                      setOutlet((p) => ({ ...p, city: e.target.value }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    className="mb-2"
                    placeholder="District"
                    value={outlet.district}
                    onChange={(e) =>
                      setOutlet((p) => ({ ...p, district: e.target.value }))
                    }
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    className="mb-2"
                    placeholder="State"
                    value={outlet.state}
                    onChange={(e) =>
                      setOutlet((p) => ({ ...p, state: e.target.value }))
                    }
                  />
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Control
                    className="mb-2"
                    placeholder="Country"
                    value={outlet.country}
                    onChange={(e) =>
                      setOutlet((p) => ({ ...p, country: e.target.value }))
                    }
                  />
                </Col>
                <Col md={6}>
                  <Form.Control
                    className="mb-2"
                    placeholder="PIN"
                    value={outlet.postalCode}
                    onChange={(e) =>
                      setOutlet((p) => ({ ...p, postalCode: e.target.value }))
                    }
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Latitude</Form.Label>
              <Form.Control
                value={outlet.lat}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, lat: e.target.value }))
                }
              />
            </Col>
            <Col md={6}>
              <Form.Label>Longitude</Form.Label>
              <Form.Control
                value={outlet.lng}
                onChange={(e) =>
                  setOutlet((p) => ({ ...p, lng: e.target.value }))
                }
              />
            </Col>
          </Row>

          <div className="mb-2">
            <Button variant="secondary" size="sm" onClick={fetchLocation}>
              Use current location
            </Button>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>Outlet Nameboard Image (JPG/PNG)</Form.Label>
            <Form.Control
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleOutletImageChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <button type="button" onClick={saveOutletAndFinish}>
              Save Outlet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
