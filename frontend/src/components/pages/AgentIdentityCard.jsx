import React, { useState, useEffect } from "react";
import { Card, Container, Row, Col, Image } from "react-bootstrap";
import QRCode from "react-qr-code";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function AgentIdentityCard() {
  const location = useLocation();
  const agentId = location.state?.agentId;

  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (!agentId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/agent-identity/${agentId}`
        );

        if (res.data?.data) {
          setFormData(res.data.data);
        }
      } catch (err) {
        console.error("Error loading agent identity:", err);
      }
    };

    fetchData();
  }, [agentId]);

  if (!formData) {
    return (
      <Container className="d-flex justify-content-center align-items-center my-5">
        <h4>Loading Identity Card...</h4>
      </Container>
    );
  }

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
            {/* Front Side */}
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
                  <h4 className="fw-bold mb-0">BBS Healthcare Agent Access</h4>
                  <small>Digital Identity Card (Agent Enabled)</small>
                </Card.Header>

                <Card.Body className="pt-4 pb-2">
                  <Row className="align-items-center">
                    <Col xs={4} className="text-center">
                      <Image
                        src={
                          formData.profileImg
                            ? `${import.meta.env.VITE_API_URL}${
                                formData.profileImg
                              }`
                            : "https://via.placeholder.com/110"
                        }
                        roundedCircle
                        className="border border-3 border-primary shadow-sm mb-2"
                        style={{
                          height: "110px",
                          width: "110px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="small text-muted fw-semibold">Agent</div>
                      <div className="badge bg-info mt-2">
                        {formData.agentId}
                      </div>
                    </Col>

                    <Col xs={8}>
                      <Row className="small g-2">
                        <Col xs={5} className="fw-bold mb-2 text-primary fs-5">
                          Name:
                        </Col>
                        <Col xs={7} className="fw-bold mb-2 text-primary fs-5">
                          {formData.name}
                        </Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Address:
                        </Col>
                        <Col xs={7}>{formData.address}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Age:
                        </Col>
                        <Col xs={7}>{formData.age}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Agent Type:
                        </Col>
                        <Col xs={7}>{formData.agentType}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Contact:
                        </Col>
                        <Col xs={7}>{formData.contactNumber}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Emergency:
                        </Col>
                        <Col xs={7}>{formData.emergencyContact}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Allergies:
                        </Col>
                        <Col xs={7}>{formData.allergies}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Organization:
                        </Col>
                        <Col xs={7}>{formData.organizationName}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Services:
                        </Col>
                        <Col xs={7}>{formData.services}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Area:
                        </Col>
                        <Col xs={7}>{formData.area || "N/A"}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          City:
                        </Col>
                        <Col xs={7}>{formData.city || "N/A"}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          District:
                        </Col>
                        <Col xs={7}>{formData.district || "N/A"}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          State:
                        </Col>
                        <Col xs={7}>{formData.state || "N/A"}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Region:
                        </Col>
                        <Col xs={7}>{formData.region || "N/A"}</Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr className="my-3 border-primary opacity-50" />

                  {/* Two QR Codes */}
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
                          value={`https://bbscart.com/health-agent/${formData.agentId}`}
                          size={110}
                        />
                      </div>
                      <div className="small mt-1">Agent Health QR</div>
                    </Col>
                    <Col md={6} className="mb-3">
                      <div
                        className="p-3 rounded-4 shadow-sm bg-white"
                        style={{
                          border: "2px dashed #28a745",
                          display: "inline-block",
                        }}
                      >
                        <QRCode
                          value={`https://bbscart.com/org/${formData.organizationId}`}
                          size={110}
                        />
                      </div>
                      <div className="small mt-1">Organization QR</div>
                    </Col>
                  </Row>

                  <h5 className="text-center mt-3">
                    Agent & Organization Detail
                  </h5>
                  <p className="text-center small text-muted mt-1">
                    Scan QR codes for digital access and verification
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
                  <h6 className="text-center mb-2 fw-bold">Agent Benefits</h6>
                  <ul className="mb-0 small px-4">
                    <li>24x7 Emergency Access</li>
                    <li>Access to Patient Records</li>
                    <li>Priority Hospital Support</li>
                    <li>Verification of Organization Services</li>
                    <li>Exclusive Agent Offers</li>
                    <li>Digital Health & Service Tracking</li>
                  </ul>
                </Card.Footer>
              </Card>
            </div>

            {/* Back Side */}
            <div className="card-flip-back d-flex flex-column justify-content-center align-items-center text-white p-4">
              <h4 className="fw-bold">BBS Healthcare Agent Access</h4>
              <p className="text-center small">
                This digital identity verifies your registration as a healthcare
                agent within the BBS Health Network.
              </p>
              <Row className="justify-content-center mt-2">
                <Col xs={6} className="text-center">
                  <QRCode
                    value={`https://bbscart.com/health-agent/${formData.agentId}`}
                    size={100}
                    className="bg-white p-2 rounded"
                  />
                  <div className="small mt-1">Health QR</div>
                </Col>
                <Col xs={6} className="text-center">
                  <QRCode
                    value={`https://bbscart.com/org/${formData.organizationId}`}
                    size={100}
                    className="bg-white p-2 rounded"
                  />
                  <div className="small mt-1">Organization QR</div>
                </Col>
              </Row>
              <small className="mt-3 text-light">
                Scan for Emergency or Organization Verification
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
