import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Image from "react-bootstrap/Image";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function CustomerBecomeVendorForm() {
  const [formData, setFormData] = useState({
    vendorId: "",
    name: "",
    address: "",
    phone: "",
    email: "",
    emergencyContact: "",

    shopName: "",
    shopType: "",
    gst: "",
    services: "",
    district: "",
    city: "",
    state: "",
    pincode: "",

    profilePhoto: "",
    signature: "",
  });

  const [fileInputs, setFileInputs] = useState({
    profilePhoto: null,
    signature: null,
  });

  // =============================
  // Handle Input Changes
  // =============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // =============================
  // Handle File Upload + Preview
  // =============================
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (!files[0]) return;

    const file = files[0];

    setFileInputs((prev) => ({ ...prev, [name]: file }));

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  // =============================
  // Submit to Backend
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();

try {
  const fd = new FormData();

  Object.keys(formData).forEach((key) => {
    fd.append(key, formData[key]);
  });

  Object.keys(fileInputs).forEach((key) => {
    if (fileInputs[key]) fd.append(key, fileInputs[key]);
  });

  const res = await axios.post(
    "http://localhost:5000/api/customer-vendor",
    fd,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  const newVendorId = res.data.vendorId; // ✔ backend returns vendorId

  Swal.fire("Success", "Vendor registration submitted", "success").then(() => {
    navigate("/customer-vendor-id-card", {
      state: { vendorId: newVendorId },
    });
  });
} catch (err) {
  Swal.fire("Error", "Something went wrong", "error");
}

  };

  return (
    <Container
      fluid
      className="p-3"
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e6f7ff 0%, #ffffff 40%, #ccf2ff 100%)",
      }}
    >
      <Row className="justify-content-center">
        <Col md={8}>
          <Card
            className="p-5 border-0 shadow"
            style={{ borderRadius: "20px", background: "#fff" }}
          >
            <div className="d-flex flex-column align-items-center mb-4">
              <Image src={logo} width={80} height={80} className="mb-3" />
              <h3
                style={{
                  background:
                    "linear-gradient(to right, #007bff, #20c997, #007bff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  fontWeight: "bold",
                }}
              >
                Customer Become A Vendor
              </h3>
              <p className="text-muted">
                Update your vendor identification details
              </p>
            </div>

            {/* =============================
                  FORM START
           ============================= */}
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Vendor ID</Form.Label>
                    <Form.Control
                      name="vendorId"
                      value={formData.vendorId}
                      onChange={handleChange}
                      placeholder="Example: VEND001"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Vendor full name"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Address</Form.Label>
                <Form.Control
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Full address"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Emergency Contact</Form.Label>
                <Form.Control
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                />
              </Form.Group>

              {/* BUSINESS DETAILS */}
              <h5 className="fw-bold text-primary mt-4 mb-3">
                Vendor Business Details
              </h5>

              <Form.Group className="mb-4">
                <Form.Label>Shop Name</Form.Label>
                <Form.Control
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Shop Type</Form.Label>
                <Form.Control
                  name="shopType"
                  value={formData.shopType}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>GST Number</Form.Label>
                <Form.Control
                  name="gst"
                  value={formData.gst}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Services</Form.Label>
                <Form.Control
                  name="services"
                  value={formData.services}
                  onChange={handleChange}
                  placeholder="Eg: Grocery, Food Delivery"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>State</Form.Label>
                    <Form.Control
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label>Pincode</Form.Label>
                    <Form.Control
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* UPLOADS */}
              <h5 className="fw-bold text-primary mt-4 mb-3">Uploads</h5>

              <Form.Group className="mb-4">
                <Form.Label>Profile Photo</Form.Label>
                <Form.Control
                  type="file"
                  name="profilePhoto"
                  onChange={handleFileChange}
                />
                {formData.profilePhoto && (
                  <Image
                    src={formData.profilePhoto}
                    width={120}
                    height={120}
                    className="mt-3 rounded shadow"
                  />
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Signature</Form.Label>
                <Form.Control
                  type="file"
                  name="signature"
                  onChange={handleFileChange}
                />
                {formData.signature && (
                  <Image
                    src={formData.signature}
                    width={200}
                    height={60}
                    className="mt-3 shadow"
                  />
                )}
              </Form.Group>

              <Button
                type="submit"
                className="w-100 py-2"
                style={{ fontWeight: "bold", fontSize: "18px" }}
              >
                Update Vendor Card
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
