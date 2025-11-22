import React, { useState } from "react";
import {
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
  Image,
} from "react-bootstrap";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function AgentCardForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    agentId: "AGENT001", // manually typed / auto-filled later

    // Personal Info
    name: "John Doe",
    address: "123 Green Street",
    age: 29,
    contactNumber: "+91 98765 43210",
    emergencyContact: "+91 91234 56789",
    bloodGroup: "A+",
    volunteerdonor: "Yes",
    allergies: "None",

    profileImg: "",
    profileImgFile: null,

    signature: "",
    signatureFile: null,

    // Agent Info
    agentType: "Healthcare Agent",
    organizationId: "BBS-HC-001",
    organizationName: "BBS Global Health Access",
    services: "OPD, Health Plans, Beneficiary Support",

    // Territory Info
    area: "Anna Nagar",
    city: "Chennai",
    district: "Chennai",
    state: "Tamil Nadu",
    region: "South",

    // Professional / License Info
    companyName: "BBS Healthcare",
    licenseNumber: "HC-AGT-2025-0001",
    dateOfIssue: "2025-01-01",
    expiryDate: "2026-01-01",
    languagesSpoken: "English, Tamil",
  });

  // Handle Inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Photo Upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      profileImgFile: file,
    }));

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({ ...prev, profileImg: reader.result }));
    reader.readAsDataURL(file);
  };

  // Handle Signature Upload
  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      signatureFile: file,
    }));

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({ ...prev, signature: reader.result }));
    reader.readAsDataURL(file);
  };

  // Submit to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.agentId) {
      Swal.fire("Error", "Agent ID is required", "error");
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

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/agent-identity/${
          formData.agentId
        }`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      Swal.fire({
        icon: "success",
        title: "Agent Card Updated!",
        text: "Agent Identity Card updated successfully.",
        confirmButtonColor: "#0dcaf0",
      }).then(() => {
        navigate("/agent-card", { state: { agentId: formData.agentId } });
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unable to update agent card", "error");
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
      <Row className="justify-content-center">
        <Col md={10}>
          <Card
            className="p-5 shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
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
                BBS GLOBAL HEALTH ACCESS – AGENT CARD
              </h2>
            </div>

            <div className="text-center mb-3">
              <Image
                src={formData.profileImg || logo}
                roundedCircle
                width={100}
                height={100}
                className="shadow-sm"
                style={{ border: "3px solid #0dcaf0" }}
              />
              <h5 className="mt-2 fw-bold" style={{ color: "#0d6efd" }}>
                Update Agent Identity
              </h5>
              <p className="text-muted small">
                Keep your ID card information accurate.
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Agent ID */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Agent ID</Form.Label>
                <Form.Control
                  type="text"
                  name="agentId"
                  value={formData.agentId}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Name */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Address */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">Address</Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Contact */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">
                  Contact Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Emergency Contact */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">
                  Emergency Contact
                </Form.Label>
                <Form.Control
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Upload Photo */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">
                  Upload Profile Photo
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  className="form-control-sm"
                  onChange={handlePhotoChange}
                />
              </Form.Group>

              {/* Upload Signature */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small">
                  Upload Signature
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  className="form-control-sm"
                  onChange={handleSignatureChange}
                />
              </Form.Group>

              <div className="d-grid mt-3">
                <Button
                  type="submit"
                  className="py-1 fw-bold small"
                  style={{
                    borderRadius: "10px",
                    background: "linear-gradient(to right, #0dcaf0, #198754)",
                    border: "none",
                  }}
                >
                  Update Agent Card
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
