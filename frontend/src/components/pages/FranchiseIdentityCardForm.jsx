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

export default function FranchiseIdentityCardForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "Annie Smith",
    address: "123 Green Park, Mumbai",
    age: 32,
    franchiseId: "FRAN2025-0002",
    profileImg: "",
    profileImgFile: null,

    franchiseType: "Healthcare Franchise",
    contactNumber: "+91 98765 43210",
    emergencyContact: "none",
    allergies: "none",

    parentCompanyId: "ORG1234",
    parentCompanyName: "HealthCare Plus",
    services: "Blood Donation, Organ Donation Awareness",

    area: "",
    city: "",
    district: "",
    state: "",
    region: "",

    companyName: "",
    licenseNumber: "",
    dateOfIssue: "",
    expiryDate: "",
    languagesSpoken: "",

    signature: "",
    signatureFile: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, profileImgFile: file }));

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({ ...prev, profileImg: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData((prev) => ({ ...prev, signatureFile: file }));

    const reader = new FileReader();
    reader.onload = () =>
      setFormData((prev) => ({ ...prev, signature: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "profileImgFile" && key !== "signatureFile") {
          fd.append(key, formData[key]);
        }
      });

      if (formData.profileImgFile) {
        fd.append("profileImg", formData.profileImgFile);
      }

      if (formData.signatureFile) {
        fd.append("signature", formData.signatureFile);
      }

      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/franchise-identity/${
          formData.franchiseId
        }`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Franchise identity updated successfully!",
        confirmButtonColor: "#0dcaf0",
      }).then(() => {
        navigate("/franchise-card", {
          state: { franchiseId: formData.franchiseId },
        });
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Unable to update Franchise identity", "error");
    }
  };

  return (
    <Container
      fluid
      className="p-3"
      style={{
        minHeight: "100vh",
        width: "100%",
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
                  display: "inline-block",
                }}
              >
                BBS GLOBAL HEALTH ACCESS
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
                Update Franchise Identity Card
              </h5>
              <p className="text-muted small">
                Keep your franchise details up to date
              </p>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Personal / Franchise Info */}
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Franchise Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Franchise Type
                    </Form.Label>
                    <Form.Select
                      name="franchiseType"
                      value={formData.franchiseType}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    >
                      <option>Healthcare Franchise</option>
                      <option>Wellness Franchise</option>
                      <option>Diagnostic Franchise</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

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
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
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
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
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
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Allergies / Notes
                </Form.Label>
                <Form.Control
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="form-control-sm"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>

              {/* Parent Company Info */}
              <Row className="g-2 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Parent Company ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="parentCompanyId"
                      value={formData.parentCompanyId}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Parent Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="parentCompanyName"
                      value={formData.parentCompanyName}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
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
                  className="form-control-sm"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>

              {/* Territory Info */}
              <h6 className="mt-3 fw-bold" style={{ color: "#0d6efd" }}>
                Territory / Region Info
              </h6>
              <Row className="g-2 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Area</Form.Label>
                    <Form.Control
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      District
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Region / Zone
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Upload Photo */}
              <Form.Group className="mb-2 text-start mt-2">
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
                  className="form-control-sm mt-1"
                />
              </Form.Group>
              {/* Professional / License Info */}
              <h6 className="mt-3 fw-bold" style={{ color: "#0d6efd" }}>
                Professional / License Info
              </h6>
              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Company Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      License / Registration Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Date of Issue (YYYY-MM-DD)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfIssue"
                      value={formData.dateOfIssue}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Expiry Date (YYYY-MM-DD)
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="form-control-sm"
                      style={{ borderRadius: "8px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold small">
                  Languages spoken
                </Form.Label>
                <Form.Control
                  type="text"
                  name="languagesSpoken"
                  value={formData.languagesSpoken}
                  onChange={handleChange}
                  className="form-control-sm"
                  placeholder="e.g., English, Hindi"
                  style={{ borderRadius: "8px" }}
                />
              </Form.Group>

              <Form.Group className="mb-2 text-start mt-2">
                <Form.Label
                  className="fw-semibold small"
                  style={{ color: "#0d6efd" }}
                >
                  Signature
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        setFormData((prev) => ({
                          ...prev,
                          signature: reader.result,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="form-control-sm mt-1"
                />
                {formData.signature && (
                  <div className="mt-2">
                    <img
                      src={formData.signature}
                      alt="Signature Preview"
                      style={{ width: "150px", border: "1px solid #0dcaf0" }}
                    />
                  </div>
                )}
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
                  Update Franchise Info
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
