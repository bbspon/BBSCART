import React, { useEffect, useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Image,
  Form,
  Button,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function VendorIdentityCardForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    vendorId: "", // Vendor enters manually
    name: "",
    address: "",
    age: "",
    bloodGroup: "",
    donorId: "",
    profileImg: "",
    volunteerdonor: "",
    contactNumber: "",
    emergencyContact: "",
    allergies: "",
    companyName: "",
    services: "",
    licenseNumber: "",
    dateOfIssue: "",
    expiryDate: "",
    languages: "",
    regionalCode: "",
    signature: "",
  });

  const [profilePreview, setProfilePreview] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);

  // ----------------------------
  // Fetch data (Only when vendor Id is typed)
  // ----------------------------
  const fetchVendorIdentity = async (manualVendorId) => {
    if (!manualVendorId) return;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendor-identity/${manualVendorId}`
      );

      if (res.data.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.data, // Load backend data
          vendorId: manualVendorId,
        }));

        if (res.data.data.profileImg) {
          setProfilePreview(
            `${import.meta.env.VITE_API_URL}${res.data.data.profileImg}`
          );
        }
        if (res.data.data.signature) {
          setSignaturePreview(
            `${import.meta.env.VITE_API_URL}${res.data.data.signature}`
          );
        }
      }
    } catch (error) {
      console.error("Error fetching vendor identity:", error);
    }
  };

  // ----------------------------
  // Handle Input Change
  // ----------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    // When vendorId is typed → auto-fetch details
    if (name === "vendorId" && value.length > 3) {
      fetchVendorIdentity(value);
    }
  };

  // ----------------------------
  // Handle Photo Upload
  // ----------------------------
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, profileImgFile: file }));
    }
  };

  // ----------------------------
  // Handle Signature Upload
  // ----------------------------
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSignaturePreview(URL.createObjectURL(file));
      setFormData((prev) => ({ ...prev, signatureFile: file }));
    }
  };

  // ----------------------------
  // Submit Form → PUT API
  // ----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.vendorId) {
      Swal.fire("Missing Vendor ID", "Please enter Vendor ID", "error");
      return;
    }

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "profileImgFile" && key !== "signatureFile") {
          payload.append(key, formData[key]);
        }
      });

      if (formData.profileImgFile) {
        payload.append("profileImg", formData.profileImgFile);
      }
      if (formData.signatureFile) {
        payload.append("signature", formData.signatureFile);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/vendor-identity/${
          formData.vendorId
        }`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "Vendor identity card updated!",
        confirmButtonColor: "#0dcaf0",
      }).then(() => {
navigate("/vendorcard", { state: { vendorId: formData.vendorId } });
      });
    } catch (error) {
      console.error("Error updating vendor identity:", error);
      Swal.fire("Error", "Unable to update identity card", "error");
    }
  };

  return (
    <Container
      fluid
      className="p-3"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #b2ebf2 100%)",
      }}
    >
      <Row className="justify-content-center align-items-end m-2">
        <Col md={8}>
          <Card
            className="p-5 shadow-sm border-0"
            style={{
              borderRadius: "15px",
              background: "#ffffff",
              boxShadow: "0 8px 20px rgba(0, 123, 255, 0.1)",
            }}
          >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4 border-bottom pb-3">
              <Image src={logo} width={70} height={70} />
              <h2
                className="fw-bold text-uppercase text-center"
                style={{
                  fontSize: "22px",
                  letterSpacing: "1px",
                  background: "linear-gradient(to right, #5462e0, #20c997)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                BBS GLOBAL HEALTH ACCESS
              </h2>
            </div>

            {/* Profile */}
            <div className="text-center mb-3">
              <Image
                src={profilePreview || logo}
                roundedCircle
                width={100}
                height={100}
                className="shadow-sm"
                style={{ border: "3px solid #0dcaf0" }}
              />
              <h5 className="mt-2 fw-bold" style={{ color: "#0d6efd" }}>
                Update Identity Card
              </h5>
              <p className="text-muted small">
                Enter Vendor ID to load details
              </p>
            </div>

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              {/* Vendor ID */}
              <Form.Group>
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Vendor ID (Manual)
                </Form.Label>
                <Form.Control
                  type="text"
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleChange}
                  className="form-control-sm"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>

              {/* Personal Info */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Age
                    </Form.Label>
                    <Form.Control
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Address */}
              <Form.Group className="mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Address
                </Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Blood + Donor */}
              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Blood Group
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Donor Type
                    </Form.Label>
                    <Form.Select
                      name="volunteerdonor"
                      value={formData.volunteerdonor}
                      onChange={handleChange}
                      className="form-control-sm"
                    >
                      <option value="">Select</option>
                      <option>Blood Donor</option>
                      <option>Organ Donor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Contact */}
              <Form.Group className="mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Contact Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Emergency */}
              <Form.Group className="mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Emergency Contact
                </Form.Label>
                <Form.Control
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Allergies */}
              <Form.Group className="mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Allergies
                </Form.Label>
                <Form.Control
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* Vendor Details */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Services
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="services"
                      value={formData.services}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* License */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      License Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Date of Issue
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Expiry Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Languages + Code */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Languages Spoken
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="languages"
                      value={formData.languages}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Regional Code / License Type
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="regionalCode"
                      value={formData.regionalCode}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Upload */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Upload Photo
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Upload Signature
                    </Form.Label>
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-grid mt-4">
                <Button
                  type="submit"
                  className="py-1 fw-bold"
                  style={{
                    borderRadius: "10px",
                    background: "linear-gradient(to right, #0dcaf0, #198754)",
                    border: "none",
                  }}
                >
                  Update Info
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
