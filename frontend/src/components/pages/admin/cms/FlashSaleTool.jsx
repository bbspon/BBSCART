// FlashSaleTool.js
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const FlashSaleTool = () => {
  const [flashSale, setFlashSale] = useState({
    title: '',
    startTime: '',
    endTime: '',
    badgeLabel: '🔥 Flash Sale',
    linkTarget: '',
    cityTarget: '',
    showOnMobile: true,
    showOnDesktop: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFlashSale((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Flash Sale Config:', flashSale);
    alert('⚡ Flash Sale Scheduled!');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>⚡ Flash Sale Manager</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Sale Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={flashSale.title}
                  onChange={handleChange}
                  placeholder="e.g. Midnight Madness"
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Badge Label</Form.Label>
                <Form.Control
                  type="text"
                  name="badgeLabel"
                  value={flashSale.badgeLabel}
                  onChange={handleChange}
                  placeholder="e.g. 🔥 Flash Sale"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Start Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="startTime"
                  value={flashSale.startTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>End Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="endTime"
                  value={flashSale.endTime}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Link Target</Form.Label>
                <Form.Control
                  type="text"
                  name="linkTarget"
                  value={flashSale.linkTarget}
                  onChange={handleChange}
                  placeholder="e.g. /collections/flash-deals"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>City Target (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="cityTarget"
                  value={flashSale.cityTarget}
                  onChange={handleChange}
                  placeholder="e.g. Delhi, Mumbai"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Show on Mobile"
                name="showOnMobile"
                checked={flashSale.showOnMobile}
                onChange={handleChange}
              />
            </Col>
            <Col md={6}>
              <Form.Check
                type="checkbox"
                label="Show on Desktop"
                name="showOnDesktop"
                checked={flashSale.showOnDesktop}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="success" type="submit">
              ✅ Schedule Flash Sale
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FlashSaleTool;
