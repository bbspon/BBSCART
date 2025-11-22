import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Image } from "react-bootstrap";
import QRCode from "react-qr-code";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../../public/img/logo/bbscartLogo.png";

export default function FranchiseCard() {
  const location = useLocation();
  const navigate = useNavigate();

  const franchiseId = location.state?.franchiseId;
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!franchiseId) {
      alert("Missing Franchise ID. Update form first.");
      navigate("/franchise-identity-form");
      return;
    }

    fetchFranchiseData();
  }, [franchiseId]);

  const fetchFranchiseData = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/franchise-identity/${franchiseId}`
      );

      if (res.data?.data) {
        setData(res.data.data);
      } else {
        alert("No Franchise Identity found. Please update form.");
        navigate("/franchise-identity-form");
      }
    } catch (err) {
      console.error(err);
      alert("Unable to load Franchise Identity Card");
    }
  };

  if (!data) {
    return (
      <Container className="text-center mt-5">
        <h4>Loading Franchise Identity Card…</h4>
      </Container>
    );
  }

  // IMAGE PATH FIX
  const profileImgUrl = data.profileImg
    ? `${import.meta.env.VITE_API_URL}${data.profileImg}`
    : logo;

  const signatureUrl = data.signature
    ? `${import.meta.env.VITE_API_URL}${data.signature}`
    : logo;

  return (
    <>
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
                  width: "32rem",
                  borderRadius: "25px",
                  background: "rgba(255, 255, 255, 0.9)",
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
                      <small className="text-muted">
                        Digital Franchise Identity Card
                      </small>
                    </div>
                  </div>
                </Card.Header>

                <Card.Body className="pt-4 pb-2">
                  {/* Profile & Basic Info */}
                  <Row className="align-items-center">
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
                        Franchise
                      </div>
                      <div className="badge bg-info mt-2">
                        {data.franchiseId}
                      </div>
                    </Col>

                    <Col xs={8}>
                      <Row className="small g-2">
                        <Col xs={5} className="fw-bold mb-2 text-primary fs-5">
                          Name:
                        </Col>
                        <Col xs={7} className="fw-bold mb-2 text-primary fs-5">
                          {data.name}
                        </Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Type:
                        </Col>
                        <Col xs={7}>{data.franchiseType}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Address:
                        </Col>
                        <Col xs={7}>{data.address}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Contact:
                        </Col>
                        <Col xs={7}>{data.contactNumber}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Emergency:
                        </Col>
                        <Col xs={7}>{data.emergencyContact}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Services:
                        </Col>
                        <Col xs={7}>{data.services}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Area:
                        </Col>
                        <Col xs={7}>{data.area}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          City:
                        </Col>
                        <Col xs={7}>{data.city}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          District:
                        </Col>
                        <Col xs={7}>{data.district}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          State:
                        </Col>
                        <Col xs={7}>{data.state}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Region:
                        </Col>
                        <Col xs={7}>{data.region}</Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr className="my-3 border-primary opacity-50" />

                  {/* License & Additional Info */}
                  <Row className="g-2 mb-3">
                    <Col xs={6} className="fw-bold text-secondary">
                      Company Name:
                    </Col>
                    <Col xs={6}>{data.companyName}</Col>

                    <Col xs={6} className="fw-bold text-secondary">
                      License Number:
                    </Col>
                    <Col xs={6}>{data.licenseNumber}</Col>

                    <Col xs={6} className="fw-bold text-secondary">
                      Date of Issue:
                    </Col>
                    <Col xs={6}>{data.dateOfIssue}</Col>

                    <Col xs={6} className="fw-bold text-secondary">
                      Expiry Date:
                    </Col>
                    <Col xs={6}>{data.expiryDate}</Col>

                    <Col xs={6} className="fw-bold text-secondary">
                      Languages:
                    </Col>
                    <Col xs={6}>{data.languagesSpoken}</Col>

                    <Col xs={6} className="fw-bold text-secondary">
                      Signature:
                    </Col>
                    <Col xs={6}>
                      <Image
                        src={signatureUrl}
                        style={{
                          height: "40px",
                          objectFit: "contain",
                        }}
                      />
                    </Col>
                  </Row>

                  {/* QR Codes */}
                  <div className="d-flex justify-content-around py-3">
                    <div
                      className="p-3 rounded-4 shadow-sm bg-white"
                      style={{
                        border: "2px dashed #007bf4",
                        display: "inline-block",
                      }}
                    >
                      <QRCode
                        value={`https://bbscart.com/franchise/${data.franchiseId}`}
                        size={110}
                      />
                    </div>

                    <div
                      className="p-3 rounded-4 shadow-sm bg-white"
                      style={{
                        border: "2px dashed #28a745",
                        display: "inline-block",
                      }}
                    >
                      <QRCode
                        value={`https://bbscart.com/org/${data.parentCompanyId}`}
                        size={110}
                      />
                    </div>
                  </div>

                  <h5 className="text-center">Franchise Details</h5>
                  <p className="text-center small text-muted mt-2">
                    Scan to view franchise or parent company info
                  </p>
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
                  <h6 className="text-center mb-2 fw-bold">
                    Services & Benefits
                  </h6>
                  <ul className="mb-0 small px-4">
                    <li>24x7 Emergency Support</li>
                    <li>Franchise Network Access</li>
                    <li>Healthcare Awareness Programs</li>
                    <li>Priority Inventory & Supplies</li>
                    <li>Training & Workshops</li>
                    <li>Digital Record Management</li>
                  </ul>
                </Card.Footer>
              </Card>
            </div>

            {/* ================= BACK SIDE ================= */}
            <div className="card-flip-back d-flex flex-column justify-content-center align-items-center text-white p-4">
              <h4 className="fw-bold">{data.parentCompanyName}</h4>
              <p className="text-center small">
                This digital identity verifies your registration as a franchise
                partner under BBS Health Network.
              </p>

              <QRCode
                value={`https://bbscart.com/franchise/${data.franchiseId}`}
                size={130}
                className="bg-white p-2 rounded"
              />

              <small className="mt-3 text-light">
                Scan for Verification & Access
              </small>
            </div>
          </div>
        </div>
      </Container>

      <style>
        {`
        .card-flip {
          perspective: 1000px;
        }
        .card-flip-inner {
          position: relative;
          width: 32rem;
          transform-style: preserve-3d;
          transition: transform 0.8s;
        }
        .card-flip:hover .card-flip-inner {
          transform: rotateY(180deg);
        }
        .card-flip-front,
        .card-flip-back {
          position: absolute;
          width: 100%;
          backface-visibility: hidden;
          border-radius: 25px;
          overflow: hidden;
        }
        .card-flip-front {
          transform: rotateY(0deg);
        }
        .card-flip-back {
          background: linear-gradient(135deg, #007bff, #00bcd4);
          transform: rotateY(180deg);
        }
        `}
      </style>
    </>
  );
}
