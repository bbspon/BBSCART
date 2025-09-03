// SmartPricing.js
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const SmartPricing = () => {
  const [form, setForm] = useState({
    mode: 'percentage', // or 'fixed'
    value: '',
    roundOff: true,
    marginFromCost: false,
    filterCategory: '',
    filterTag: '',
    applyToOutOfStock: false
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Pricing Rules:', form);
    alert('✅ Smart Pricing Applied (Mock)');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>📈 Smart Pricing Tool</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Pricing Mode</Form.Label>
                <Form.Select name="mode" value={form.mode} onChange={handleChange}>
                  <option value="percentage">Increase by %</option>
                  <option value="fixed">Increase by ₹</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Value</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    name="value"
                    value={form.value}
                    onChange={handleChange}
                    placeholder={form.mode === 'percentage' ? 'e.g. 10%' : 'e.g. ₹50'}
                  />
                  <InputGroup.Text>{form.mode === 'percentage' ? '%' : '₹'}</InputGroup.Text>
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Check
                type="checkbox"
                name="roundOff"
                label="Round off to 9/99"
                checked={form.roundOff}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="checkbox"
                name="marginFromCost"
                label="Apply Margin on Cost Price"
                checked={form.marginFromCost}
                onChange={handleChange}
              />
            </Col>
            <Col md={4}>
              <Form.Check
                type="checkbox"
                name="applyToOutOfStock"
                label="Include Out-of-Stock Items"
                checked={form.applyToOutOfStock}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <Form.Control
                  type="text"
                  name="filterCategory"
                  value={form.filterCategory}
                  onChange={handleChange}
                  placeholder="e.g. Electronics"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Filter by Tag</Form.Label>
                <Form.Control
                  type="text"
                  name="filterTag"
                  value={form.filterTag}
                  onChange={handleChange}
                  placeholder="e.g. summer-sale"
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="primary" type="submit">
              🚀 Apply Pricing
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SmartPricing;
