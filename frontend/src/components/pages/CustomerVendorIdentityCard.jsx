import React, { useEffect, useState } from "react";
import { Card, Container, Row, Col, Image } from "react-bootstrap";
import QRCode from "react-qr-code";
import axios from "axios";
import { useLocation } from "react-router-dom";

export default function CustomerVendorIdentityCard() {
  const location = useLocation();
  const vendorId = location.state?.vendorId; // received from form submit

  const [data, setData] = useState(null);

  // ==============================
  // FETCH DATA FROM BACKEND
  // ==============================
  useEffect(() => {
    if (!vendorId) return;

    axios
      .get(`http://localhost:5000a/${vendorId}`)
      .then((res) => {
        setData(res.data.data); // backend returns {success, data}
      })
      .catch((err) => {
        console.error("Fetch error:", err);
      });
  }, [vendorId]);

  if (!data) {
    return (
      <div className="text-center mt-5">
        <h3>Loading Vendor Identity Card...</h3>
      </div>
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
            {/* FRONT SIDE */}
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
                  <h4 className="fw-bold mb-0">
                    BBS Customer Become Vendor – ID Card
                  </h4>
                  <small>Digital Identity Card</small>
                </Card.Header>

                <Card.Body className="pt-4 pb-2">
                  <Row className="align-items-center">
                    {/* PROFILE SIDE */}
                    <Col xs={4} className="text-center">
                      <Image
                        src={
                          data.profilePhoto
                            ? `http://localhost:5000/uploads/customer-vendor/${data.profilePhoto}`
                            : "https://cdn.pixabay.com/photo/2017/10/18/21/36/portrait-2865605_960_720.jpg"
                        }
                        roundedCircle
                        className="border border-3 border-primary shadow-sm mb-2"
                        style={{
                          height: "110px",
                          width: "110px",
                          objectFit: "cover",
                        }}
                      />

                      <div className="small text-muted fw-semibold">Vendor</div>
                      <div className="badge bg-info mt-2">{data.vendorId}</div>
                    </Col>

                    {/* DETAILS SIDE */}
                    <Col xs={8}>
                      <Row className="small g-2">
                        <Col xs={5} className="fw-bold text-primary fs-6">
                          Name:
                        </Col>
                        <Col xs={7}>{data.name}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Phone:
                        </Col>
                        <Col xs={7}>{data.phone}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Email:
                        </Col>
                        <Col xs={7}>{data.email}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Address:
                        </Col>
                        <Col xs={7}>{data.address}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Shop Name:
                        </Col>
                        <Col xs={7}>{data.shopName}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Shop Type:
                        </Col>
                        <Col xs={7}>{data.shopType}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          GST:
                        </Col>
                        <Col xs={7}>{data.gst || "N/A"}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Services:
                        </Col>
                        <Col xs={7}>{data.services}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          District:
                        </Col>
                        <Col xs={7}>{data.district}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          City:
                        </Col>
                        <Col xs={7}>{data.city}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          State:
                        </Col>
                        <Col xs={7}>{data.state}</Col>

                        <Col xs={5} className="fw-bold text-secondary">
                          Pincode:
                        </Col>
                        <Col xs={7}>{data.pincode}</Col>
                      </Row>
                    </Col>
                  </Row>

                  <hr className="my-3 border-primary opacity-50" />

                  {/* QR Code Section */}
                  <Row className="text-center">
                    <Col md={12} className="mb-3">
                      <div
                        className="p-3 rounded-4 shadow-sm bg-white"
                        style={{
                          border: "2px dashed #007bf4",
                          display: "inline-block",
                        }}
                      >
                        <QRCode
                          value={`https://bbscart.com/vendor/${data.vendorId}`}
                          size={110}
                        />
                      </div>
                      <div className="small mt-1">
                        Vendor Digital Verification QR
                      </div>
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
                  <h6 className="text-center mb-2 fw-bold">Vendor Benefits</h6>
                  <ul className="mb-0 small px-4">
                    <li>Priority Vendor Support</li>
                    <li>Direct Store Listing</li>
                    <li>Exclusive BBSCART Offers</li>
                    <li>Digital Verification</li>
                    <li>24x7 Access to Vendor Dashboard</li>
                  </ul>
                </Card.Footer>
              </Card>
            </div>

            {/* BACK SIDE */}
            <div className="card-flip-back d-flex flex-column justify-content-center align-items-center text-white p-4">
              <h4 className="fw-bold">BBSCART Vendor Access</h4>
              <p className="text-center small">
                This digital identity verifies you as an authenticated Vendor
                under BBSCART. Use it for verification and onboarding support.
              </p>

              <QRCode
                value={`https://bbscart.com/vendor/${data.vendorId}`}
                size={120}
                className="bg-white p-2 rounded"
              />

              <small className="mt-3 text-light">
                Scan for Vendor Verification
              </small>
            </div>
          </div>
        </div>
      </Container>

      {/* STYLES */}
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

        .card-flip:hover .card-flip-inner {
          transform: rotateY(180deg);
        }
        `}
      </style>
    </>
  );
}
