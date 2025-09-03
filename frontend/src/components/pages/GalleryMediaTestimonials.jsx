// components/Pages/GalleryMediaTestimonials.jsx
import React, { useState, useEffect } from "react";
import { IoLogoWhatsapp } from "react-icons/io";
import { FaSquareInstagram } from "react-icons/fa6";
import { ImLinkedin } from "react-icons/im";
import { IoLogoYoutube } from "react-icons/io5";
import {
  Card,
  Row,
  Col,
  Button,
  Carousel,
  Container,
  Badge,
} from "react-bootstrap";

const sampleImages = [
  "/img/hero/grocery_banner1.jpg",
  "/img/hero/grocery_banner2.jpg",
  "/img/hero/grocery_banner3.jpg",
];

const testimonials = [
  {
    name: "Reema S.",
    role: "NGO Health Volunteer",
    quote:
      "BBSCART helped us reach 12,000 children in slums. The AI reporting is game-changing.",
    rating: 5,
  },
  {
    name: "Javed M.",
    role: "Delivery Partner",
    quote:
      "I used the free dental plan from my employer via BBSCART — very smooth!",
    rating: 4,
  },
];

const caseStudies = [
  {
    title: "👩‍⚕️ Orphanage Health Drive - March 2025",
    description:
      "With BBSCART's NGO pass system, 800+ children received emergency & dental care in Lucknow, India. Local staff used offline QR codes due to no signal.",
    image: "/media/case/orphanage-drive.png",
    month: "March 2025",
  },
  {
    title: "🏢 Employee Plan Boost - May 2025",
    description:
      "A corporate HR in Dubai used BBSCART to onboard 220 workers in a single dashboard. 93% activated family coverage within 2 weeks.",
    image: "/media/case/employee-plan.png",
    month: "May 2025",
  },
];

const GalleryMediaTestimonials = () => {
  const [selectedMonth, setSelectedMonth] = useState("All");

  const filteredCases =
    selectedMonth === "All"
      ? caseStudies
      : caseStudies.filter((c) => c.month.includes(selectedMonth));

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center text-3xl text-gray-800 text-bold py-3">Gallery  & Testimonials</h2>

      {/* GALLERY */}
    
      <Row className="mb-4">
          <Col md={6}>
          <iframe
            width="100%"
            height="500"
            src="https://www.youtube.com/embed/v99s7Ab0i0o"
            title="BBSCART Demo Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Col>
        <Col md={6}>
          <Carousel>
            {sampleImages.map((src, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className="d-block w-100 rounded p-3"
                  src={src}
                  alt={`slide-${idx}`}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      
      </Row>

    {/* TESTIMONIALS */}
<h2 className="mt-5 mb-3 fw-bold" style={{ fontFamily: "Inter, system-ui" }}>
  💬 What Our Users Say
</h2>
<Row className="mb-4">
  {testimonials.map((t, i) => (
    <Col md={6} key={i} className="mb-4">
      <Card className="shadow-sm border-0 h-100">
        <Card.Body>
          <Card.Title className="fs-5 fw-semibold" style={{ fontFamily: "Inter, system-ui" }}>
            {t.name} <small className="text-muted fs-6">({t.role})</small>
          </Card.Title>
          <Card.Text className="text-secondary fst-italic">“{t.quote}”</Card.Text>
          <div className="mt-2">
            {[...Array(t.rating)].map((_, i) => (
              <span key={i} style={{ color: "#f4c150", fontSize: "1.2rem" }}>★</span>
            ))}
            {[...Array(5 - t.rating)].map((_, i) => (
              <span key={i} style={{ color: "#ccc", fontSize: "1.2rem" }}>☆</span>
            ))}
          </div>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>

{/* CASE STUDIES */}
<h2 className="mt-5 mb-3 fw-bold" style={{ fontFamily: "Inter, system-ui" }}>
  📚 Monthly Case Studies
</h2>
<div className="mb-4 d-flex flex-wrap align-items-center">
  <Button
    variant={selectedMonth === "All" ? "primary" : "outline-primary"}
    onClick={() => setSelectedMonth("All")}
    className="me-2 mb-2 rounded-pill px-4"
  >
    All
  </Button>
  {["March 2025", "May 2025", "July 2025"].map((month) => (
    <Button
      key={month}
      variant={selectedMonth === month ? "primary" : "outline-primary"}
      onClick={() => setSelectedMonth(month)}
      className="me-2 mb-2 rounded-pill px-4"
    >
      {month}
    </Button>
  ))}
</div>
<Row>
  {filteredCases.map((cs, i) => (
    <Col md={6} key={i} className="mb-4">
      <Card className="shadow-sm border-0 h-100">
        <Card.Img
          variant="top"
          src={cs.image}
          alt={cs.title}
          loading="lazy"
          style={{ maxHeight: "200px", objectFit: "cover" }}
        />
        <Card.Body>
          <Card.Title className="fs-5 fw-semibold" style={{ fontFamily: "Inter, system-ui" }}>
            {cs.title}
          </Card.Title>
          <Card.Text className="text-secondary">{cs.description}</Card.Text>
          <Badge bg="info" className="text-uppercase py-1 px-3">
            {cs.month}
          </Badge>
        </Card.Body>
      </Card>
    </Col>
  ))}
</Row>


      {/* SOCIAL MEDIA */}
      <h4>🌐 Join the Conversation</h4>
    <div className="flex justify-center items-center py-4">
  <div className="flex flex-row gap-4 items-center">
    {/* WhatsApp */}
    <a href="https://facebook.com/bbscart" target="_blank" rel="noreferrer">
      <IoLogoWhatsapp style={{ fontSize: "2.5rem", color: "green" }} />
    </a>

    {/* Instagram */}
    <a href="https://instagram.com/bbscart" target="_blank" rel="noreferrer">
      <FaSquareInstagram
        style={{
          fontSize: "2.5rem",
          borderRadius: "15%",
          background: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
        
          padding: "0.2rem",
        }}
      />
    </a>

    {/* LinkedIn */}
    <a href="https://linkedin.com/company/bbscart" target="_blank" rel="noreferrer">
      <ImLinkedin style={{ fontSize: "2.5rem", color: "#0077B5" }} />
    </a>

    {/* YouTube */}
    <a href="https://youtube.com/@bbscart" target="_blank" rel="noreferrer">
      <IoLogoYoutube style={{ fontSize: "2.5rem", color: "red" }} />
    </a>
  </div>
</div>
    </Container>
  );
};

export default GalleryMediaTestimonials;
