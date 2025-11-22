import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Image } from "react-bootstrap";
import QRCode from "react-qr-code";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function TerritoryCard() {
  const location = useLocation();
  const navigate = useNavigate();

  const territoryId = location.state?.territoryId; // RECEIVED FROM FORM
  const [formData, setFormData] = useState(null);

  // ============================
  //      Fetch Territory Card
  // ============================
  useEffect(() => {
    if (!territoryId) {
      alert("Missing Territory ID. Please update Identity Form.");
      navigate("/terrotory-identity-form");
      return;
    }

    fetchTerritoryDetails();
  }, [territoryId]);

  const fetchTerritoryDetails = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/territory-identity/${territoryId}`
      );

      if (res.data?.data) {
        setFormData(res.data.data);
      } else {
        alert("No identity card found. Please update form first.");
        navigate("/terrotory-identity-form");
      }
    } catch (err) {
      console.error(err);
      alert("Error loading identity card");
    }
  };

  if (!formData) {
    return (
      <Container className="text-center mt-5">
        <h4>Loading Territory Identity Card…</h4>
      </Container>
    );
  }

  // IMAGE FIX
  const profileImgUrl = formData.profileImg
    ? `${import.meta.env.VITE_API_URL}${formData.profileImg}`
    : logo;

  const signatureUrl = formData.signatureImg
    ? `${import.meta.env.VITE_API_URL}${formData.signatureImg}`
    : logo;

  return (
    <Container
      fluid
      className="d-flex justify-content-center align-items-center h-100 bg-light my-5"
      style={{
        background:
          "linear-gradient(135deg, #e0f7fa 0%, #ffffff 50%, #e3f2fd 100%)",
      }}
    >
      <div className="card-flip">
        <div className="card-flip-inner">
          {/* ================= FRONT SIDE ================= */}
          <div className="card-flip-front">
            <Card
              className="shadow-lg border-0 p-3"
              style={{
                width: "36rem",
                borderRadius: "25px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
              }}
            >
              <Card.Header
                className="text-white text-center py-3"
                style={{
                  borderRadius: "20px 20px 0 0",
                  background:
                    "linear-gradient(90deg, #007bff 0%, #00bcd4 100%)",
                }}
              >
                <div className="d-flex align-items-center bg-white p-2 rounded">
                  <Image src={logo} width={70} height={70} className="me-3" />

                  <div className="text-center flex-grow-1">
                    <h4
                      className="fw-bold text-uppercase mb-0"
                      style={{
                        fontSize: "22px",
                        letterSpacing: "1px",
                        background:
                          "linear-gradient(90deg, #007bff 0%, #00bcd4 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      BBS Global Health Access
                    </h4>
                    <small className="text-muted">Digital Territory Card</small>
                  </div>
                </div>
              </Card.Header>

              <Card.Body className="pt-4 pb-2">
                <Row className="align-items-center">
                  {/* Profile Image */}
                  <Col xs={4} className="text-center">
                    <Image
                      src={profileImgUrl}
                      roundedCircle
                      className="border border-3 border-primary shadow-sm mb-2"
                      style={{
                        height: "110px",
                        width: "110px",
                        objectFit: "cover",
                      }}
                    />
                    <div className="small text-muted fw-semibold">
                      {formData.title || "Territory Head"}
                    </div>
                    <div className="badge bg-info mt-2">{territoryId}</div>
                  </Col>

                  {/* Info */}
                  <Col xs={8}>
                    <Row className="small g-2">
                      <Col xs={5} className="fw-bold mb-2 text-primary fs-6">
                        Name:
                      </Col>
                      <Col xs={7}>{formData.name}</Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Office Branch:
                      </Col>
                      <Col xs={7}>{formData.officeBranch}</Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Territory:
                      </Col>
                      <Col xs={7}>
                        {formData.territoryCode} / {formData.geoCode}
                      </Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Manager:
                      </Col>
                      <Col xs={7}>{formData.assignedManager}</Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        License:
                      </Col>
                      <Col xs={7}>{formData.licenseNumber}</Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Validity:
                      </Col>
                      <Col xs={7}>
                        {formData.licenseIssueDate} —{" "}
                        {formData.licenseExpiryDate}
                      </Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Languages:
                      </Col>
                      <Col xs={7}>{formData.languagePreference}</Col>

                      <Col xs={5} className="fw-bold text-secondary">
                        Contact:
                      </Col>
                      <Col xs={7}>{formData.contactNumber}</Col>
                    </Row>
                  </Col>
                </Row>

                <hr className="my-3 border-primary opacity-50" />

                {/* QR Codes */}
                <Row className="text-center">
                  <Col md={6} className="mb-3">
                    <div
                      className="p-3 rounded-4 shadow-sm bg-white"
                      style={{
                        border: "2px dashed #007bf4",
                        display: "inline-block",
                      }}
                    >
                      <QRCode
                        value={
                          formData.shortVerificationURL ||
                          "https://bbs.health/verify"
                        }
                        size={110}
                      />
                    </div>
                    <div className="small mt-1">Verification QR</div>
                  </Col>

                  <Col md={6} className="mb-3">
                    <div
                      className="p-3 rounded-4 shadow-sm bg-white"
                      style={{
                        border: "2px dashed #28a745",
                        display: "inline-block",
                      }}
                    >
                      <QRCode value={formData.nfcBarcode || "N/A"} size={110} />
                    </div>
                    <div className="small mt-1">NFC / Geo QR</div>
                  </Col>
                </Row>
              </Card.Body>

              <Card.Footer
                className="text-white py-3"
                style={{
                  background:
                    "linear-gradient(90deg, #007bff 0%, #00bcd4 100%)",
                  borderBottomLeftRadius: "20px",
                  borderBottomRightRadius: "20px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-0 fw-bold">
                      {formData.issuingAuthority}
                    </h6>
                    <small>Authorized Signature</small>
                  </div>

                  <Image
                    src={signatureUrl}
                    alt="Signature"
                    style={{ height: "40px", objectFit: "contain" }}
                  />
                </div>
              </Card.Footer>
            </Card>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div className="card-flip-back d-flex flex-column justify-content-center align-items-center text-white p-4">
            <h4 className="fw-bold">Territory Boundaries & Access</h4>
            <p className="text-center small">
              This digital ID verifies territory authorization under the BBS
              Global Health Network.
            </p>

            <Row className="justify-content-center mt-2">
              <Col xs={6} className="text-center">
                <QRCode
                  value={formData.shortVerificationURL || ""}
                  size={100}
                  className="bg-white p-2 rounded"
                />
                <div className="small mt-1">Verification QR</div>
              </Col>

              <Col xs={6} className="text-center">
                <QRCode
                  value={formData.nfcBarcode || ""}
                  size={100}
                  className="bg-white p-2 rounded"
                />
                <div className="small mt-1">NFC / Geo QR</div>
              </Col>
            </Row>

            <small className="mt-3 text-light">
              Scan for Verification or Access Rules
            </small>
          </div>
        </div>
      </div>

      {/* Flip Animation */}
      <style>{`
        .card-flip { perspective: 1000px; }
        .card-flip-inner {
          position: relative;
          width: 36rem;
          transform-style: preserve-3d;
          transition: transform 0.8s;
        }
        .card-flip:hover .card-flip-inner { transform: rotateY(180deg); }
        .card-flip-front, .card-flip-back {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
          border-radius: 25px;
          overflow: hidden;
        }
        .card-flip-front { transform: rotateY(0deg); }
        .card-flip-back {
          background: linear-gradient(135deg, #007bff, #00bcd4);
          transform: rotateY(180deg);
        }
      `}</style>
    </Container>
  );
}
