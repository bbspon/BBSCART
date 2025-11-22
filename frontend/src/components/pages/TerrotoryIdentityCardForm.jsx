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
import axios from "axios"; // ADDED
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function TerrotoryIdentityCardForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    // Territory Primary ID – REQUIRED for backend
    territoryId: "TH001", // You can change this manually anytime

    // Personal Info
    name: "Annie Smith",
    age: 32,
    bloodGroup: "O+",
    profileImg:
      "https://cdn.pixabay.com/photo/2017/10/18/21/36/portrait-2865605_960_720.jpg",
    profileImgFile: null,
    contactNumber: "+91 98765 43210",
    emergencyContact: "+91 91234 56789",
    allergies: "None",

    // Vendor / Employee Info
    companyName: "HealthCare Plus",
    vendorId: "VEND1234",
    employeeName: "Annie Smith",
    title: "Territory Manager",
    licenseNumber: "IRDAI-2025-001",
    licenseIssueDate: "2025-01-01",
    licenseExpiryDate: "2026-12-31",
    validityPeriod: "2025-01-01 to 2026-12-31",
    employeeStatus: "Active",
    assignedManager: "John Doe",
    authorizedProducts: "Health, Life",
    badgeVersion: "V1.0",
    nfcBarcode: "",
    shortVerificationURL: "https://verify.example.com/VEND1234",
    languagePreference: "English",
    officeBranch: "Mumbai Central",
    issuingAuthority: "BBS Global Health Access",
    lastBackgroundVerification: "2025-05-15",

    // Territory Info
    area: "",
    city: "",
    district: "",
    state: "",
    region: "",
    territoryCode: "MUM-CENTRAL",
    geoCode: "MC-001",
    geoBoundRules: "Valid only within Mumbai districts",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // UPDATED – supports file upload + preview
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

  // UPDATED: Backend API Integration
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.territoryId) {
      Swal.fire("Error", "Territory ID is required", "error");
      return;
    }

    try {
      const payload = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key !== "profileImgFile") {
          payload.append(key, formData[key]);
        }
      });

      if (formData.profileImgFile) {
        payload.append("profileImg", formData.profileImgFile);
      }

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/territory-identity/${
          formData.territoryId
        }`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Territory Identity Card updated successfully",
        confirmButtonColor: "#0dcaf0",
      }).then(() => {
        navigate("/territorycard", {
          state: { territoryId: formData.territoryId },
        });
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update identity card", "error");
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
        <Col md={10}>
          <Card
            className="p-5 shadow-sm border-0"
            style={{
              borderRadius: "15px",
              background: "#ffffff",
              boxShadow: "0 8px 20px rgba(0,123,255,0.1)",
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
                src={formData.profileImg}
                roundedCircle
                width={100}
                height={100}
                className="shadow-sm"
                style={{ border: "3px solid #0dcaf0" }}
              />
              <h5 className="mt-2 fw-bold" style={{ color: "#0d6efd" }}>
                Update Identity Card
              </h5>
              <p className="text-muted small">Keep your details up to date</p>
            </div>

            <Form onSubmit={handleSubmit}>
              {/* Personal Info */}
              <Row className="g-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label
                      className="fw-semibold small"
                      style={{ color: "#0d6efd" }}
                    >
                      Full Name
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

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
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
                    <Form.Label className="fw-semibold small">
                      Donor Type
                    </Form.Label>
                    <Form.Select
                      name="volunteerdonor"
                      value={formData.volunteerdonor}
                      onChange={handleChange}
                      className="form-control-sm"
                    >
                      <option>Blood Donor</option>
                      <option>Organ Donor</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
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
                </Col>
                <Col md={6}>
                  <Form.Group>
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
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold small">Allergies</Form.Label>
                <Form.Control
                  type="text"
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Vendor / Employee Info */}
              <h6 className="mt-3 fw-bold" style={{ color: "#0d6efd" }}>
                Vendor / Employee Info
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
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Vendor / Employee ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Employee Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Title / Role
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      License / Registration #
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Date of Issue
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="licenseIssueDate"
                      value={formData.licenseIssueDate}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Expiry Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="licenseExpiryDate"
                      value={formData.licenseExpiryDate}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Primary Contact
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Employee Status
                    </Form.Label>
                    <Form.Select
                      name="employeeStatus"
                      value={formData.employeeStatus}
                      onChange={handleChange}
                      className="form-control-sm"
                    >
                      <option>Active</option>
                      <option>Suspended</option>
                      <option>Pending</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold small">
                  Assigned Manager
                </Form.Label>
                <Form.Control
                  type="text"
                  name="assignedManager"
                  value={formData.assignedManager}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold small">
                  Authorized Products
                </Form.Label>
                <Form.Control
                  type="text"
                  name="authorizedProducts"
                  value={formData.authorizedProducts}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Territory Info */}
              <h6 className="mt-3 fw-bold" style={{ color: "#0d6efd" }}>
                Territory / Region Info
              </h6>
              <Row className="g-2 mt-2">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Area</Form.Label>
                    <Form.Control
                      type="text"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
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
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">State</Form.Label>
                    <Form.Control
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-2 mt-2">
                <Col md={4}>
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
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Territory Code
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="territoryCode"
                      value={formData.territoryCode}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Geo Code
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="geoCode"
                      value={formData.geoCode}
                      onChange={handleChange}
                      className="form-control-sm"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-2">
                <Form.Label className="fw-semibold small">
                  Geo-bound Rules
                </Form.Label>
                <Form.Control
                  type="text"
                  name="geoBoundRules"
                  value={formData.geoBoundRules}
                  onChange={handleChange}
                  className="form-control-sm"
                />
              </Form.Group>

              {/* Upload Photo */}
              <Form.Group className="mb-2 text-start mt-2">
                <Form.Label className="fw-semibold small">
                  Upload Photo
                </Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="form-control-sm mt-1"
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
