import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Image, Button } from "react-bootstrap";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function VendorIdentityCard() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get vendorId from navigation state
  const vendorId = location.state?.vendorId;

  const [cardData, setCardData] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!vendorId) {
      alert("Vendor ID is missing. Please return to the form.");
      navigate("/vendoridentityform");
      return;
    }

    fetchVendorCard();
  }, [vendorId]);

  // ==========================
  //   FETCH DATA FROM BACKEND
  // ==========================
  const fetchVendorCard = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/vendor-identity/${vendorId}`
      );

      if (res.data?.data) {
        setCardData(res.data.data);
      } else {
        alert("No ID card found. Please update card in the form.");
        navigate("/vendoridentityform");
      }
    } catch (error) {
      console.error("Error fetching vendor identity:", error);
      alert("Error fetching vendor identity card");
    }
  };

  if (!cardData) {
    return (
      <Container className="text-center mt-5">
        <h4>Loading Vendor Identity Card…</h4>
      </Container>
    );
  }

  // Extract fields
  const {
    name,
    address,
    age,
    bloodGroup,
    donorId,
    profileImg,
    signature,
    volunteerdonor,
    contactNumber,
    emergencyContact,
    allergies,
    companyName,
    services,
    licenseNumber,
    dateOfIssue,
    expiryDate,
    languages,
    regionalCode,
  } = cardData;

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
      <Row className="justify-content-center mt-4">
        <Col md={6}>
          <div
            className="flip-card"
            onClick={() => setIsFlipped(!isFlipped)}
            style={{
              width: "100%",
              height: "420px",
              perspective: "1000px",
              cursor: "pointer",
            }}
          >
            <div
              className="flip-card-inner"
              style={{
                position: "relative",
                width: "100%",
                height: "100%",
                textAlign: "center",
                transition: "transform 0.8s",
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* =======================
                    FRONT SIDE
              ======================= */}
              <Card
                className="flip-card-front shadow-lg"
                style={{
                  borderRadius: "15px",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  padding: "30px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Image src={logo} width={60} height={60} />
                  <h5 className="fw-bold text-primary">Vendor Identity Card</h5>
                </div>

                <div className="text-center">
                  <Image
                    src={
                      profileImg
                        ? `${import.meta.env.VITE_API_URL}${profileImg}`
                        : logo
                    }
                    roundedCircle
                    width={110}
                    height={110}
                    style={{ border: "3px solid #0dcaf0" }}
                  />
                  <h5 className="mt-3 fw-bold text-dark">{name}</h5>
                </div>

                <div className="mt-3 text-start">
                  <p className="m-0 small">
                    <b>Vendor ID:</b> {vendorId}
                  </p>
                  <p className="m-0 small">
                    <b>Company:</b> {companyName}
                  </p>
                  <p className="m-0 small">
                    <b>Services:</b> {services}
                  </p>
                  <p className="m-0 small">
                    <b>Contact:</b> {contactNumber}
                  </p>
                  <p className="m-0 small">
                    <b>Emergency:</b> {emergencyContact}
                  </p>
                </div>
              </Card>

              {/* =======================
                    BACK SIDE
              ======================= */}
              <Card
                className="flip-card-back shadow-lg"
                style={{
                  borderRadius: "15px",
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  backfaceVisibility: "hidden",
                  padding: "25px",
                  transform: "rotateY(180deg)",
                }}
              >
                <h6 className="fw-bold text-primary mb-3">
                  Additional Details
                </h6>

                <p className="small m-0">
                  <b>Blood Group:</b> {bloodGroup}
                </p>
                <p className="small m-0">
                  <b>Donor Type:</b> {volunteerdonor}
                </p>
                <p className="small m-0">
                  <b>Address:</b> {address}
                </p>
                <p className="small m-0">
                  <b>Age:</b> {age}
                </p>
                <p className="small m-0">
                  <b>Allergies:</b> {allergies}
                </p>

                <hr />

                <p className="small m-0">
                  <b>License No:</b> {licenseNumber}
                </p>
                <p className="small m-0">
                  <b>Date of Issue:</b> {dateOfIssue}
                </p>
                <p className="small m-0">
                  <b>Expiry Date:</b> {expiryDate}
                </p>

                <p className="small m-0 mt-2">
                  <b>Languages:</b> {languages}
                </p>
                <p className="small m-0">
                  <b>Regional Code:</b> {regionalCode}
                </p>

                <div className="mt-3 text-center">
                  <Image
                    src={
                      signature
                        ? `${import.meta.env.VITE_API_URL}${signature}`
                        : logo
                    }
                    width={120}
                    height={50}
                    style={{ objectFit: "contain" }}
                  />
                  <p className="small mt-1">Signature</p>
                </div>
              </Card>
            </div>
          </div>

          <div className="text-center mt-3">
            <Button
              onClick={() => navigate("/vendoridentityform")}
              className="btn btn-outline-primary"
            >
              Edit Identity Card
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
