// ProductManager.jsx
import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const ProductManager = () => {
  const [goldRate, setGoldRate] = useState(0); // Assume fetched from backend
  const [form, setForm] = useState({
    productName: '',
    carat: '',
    purity: '',
    weight: '',
    makingCharges: '',
    stoneCharges: '',
    wastage: '',
    gst: '',
    finalPrice: 0,
    stoneType: '',
    stoneWeight: '',
    designCode: '',
    hallmark: '',
  });

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const calculatePrice = () => {
    const weight = parseFloat(form.weight) || 0;
    const making = parseFloat(form.makingCharges) || 0;
    const stone = parseFloat(form.stoneCharges) || 0;
    const wastage = parseFloat(form.wastage) || 0;
    const gst = parseFloat(form.gst) || 0;

    const base = weight * goldRate;
    const totalBeforeTax = base + making + stone + wastage;
    const final = totalBeforeTax + (totalBeforeTax * gst / 100);

    return final.toFixed(2);
  };

  const handleCalculate = () => {
    const price = calculatePrice();
    setForm({ ...form, finalPrice: price });
  };

  useEffect(() => {
    // TODO: Replace with real API call
    setGoldRate(5900); // Simulated daily rate
  }, []);

  return (
    <Card>
      <Card.Header>💍 Product Manager</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Product Name</Form.Label>
            <Form.Control
              value={form.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              placeholder="e.g., Diamond Ring"
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Carat</Form.Label>
                <Form.Control
                  value={form.carat}
                  onChange={(e) => handleChange('carat', e.target.value)}
                  placeholder="e.g., 22K"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Gold Purity</Form.Label>
                <Form.Control
                  value={form.purity}
                  onChange={(e) => handleChange('purity', e.target.value)}
                  placeholder="e.g., 91.6%"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Weight (g)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.weight}
                  onChange={(e) => handleChange('weight', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Making Charges (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.makingCharges}
                  onChange={(e) => handleChange('makingCharges', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stone Charges (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.stoneCharges}
                  onChange={(e) => handleChange('stoneCharges', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Wastage (₹)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.wastage}
                  onChange={(e) => handleChange('wastage', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>GST (%)</Form.Label>
                <Form.Control
                  type="number"
                  value={form.gst}
                  onChange={(e) => handleChange('gst', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Final Price (₹)</Form.Label>
                <InputGroup>
                  <InputGroup.Text>₹</InputGroup.Text>
                  <Form.Control
                    type="text"
                    readOnly
                    value={form.finalPrice}
                  />
                </InputGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stone Type</Form.Label>
                <Form.Control
                  value={form.stoneType}
                  onChange={(e) => handleChange('stoneType', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Stone Weight</Form.Label>
                <Form.Control
                  value={form.stoneWeight}
                  onChange={(e) => handleChange('stoneWeight', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Design Code</Form.Label>
                <Form.Control
                  value={form.designCode}
                  onChange={(e) => handleChange('designCode', e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Hallmark</Form.Label>
            <Form.Control
              value={form.hallmark}
              onChange={(e) => handleChange('hallmark', e.target.value)}
              placeholder="e.g., BIS Certified"
            />
          </Form.Group>

          <Button variant="success" onClick={handleCalculate}>Calculate Price</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductManager;
