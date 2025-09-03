// SuggestionTool.js
import React, { useState } from 'react';
import { Card, Form, Row, Col, Button, Badge } from 'react-bootstrap';

const mockProducts = [
  { id: 101, name: 'Wireless Mouse' },
  { id: 102, name: 'Gaming Keyboard' },
  { id: 103, name: 'Laptop Stand' },
  { id: 104, name: 'Noise Cancelling Headphones' },
  { id: 105, name: 'Portable SSD' },
];

const SuggestionTool = () => {
  const [mainProduct, setMainProduct] = useState('');
  const [related, setRelated] = useState([]);
  const [bundle, setBundle] = useState([]);
  const [selected, setSelected] = useState('');

  const handleAdd = (type) => {
    const item = mockProducts.find((p) => p.id === parseInt(selected));
    if (!item) return;

    if (type === 'related') {
      if (!related.find((p) => p.id === item.id)) {
        setRelated([...related, item]);
      }
    } else {
      if (!bundle.find((p) => p.id === item.id)) {
        setBundle([...bundle, item]);
      }
    }

    setSelected('');
  };

  const removeItem = (id, type) => {
    if (type === 'related') {
      setRelated(related.filter((p) => p.id !== id));
    } else {
      setBundle(bundle.filter((p) => p.id !== id));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Suggestions saved:', { mainProduct, related, bundle });
    alert('✅ Product Suggestions Linked');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>🤝 Product Suggestion Tool</Card.Title>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Main Product (ID or Name)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. iPhone 14"
                  value={mainProduct}
                  onChange={(e) => setMainProduct(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="align-items-end mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Select a Product to Link</Form.Label>
                <Form.Select value={selected} onChange={(e) => setSelected(e.target.value)}>
                  <option value="">-- Choose a product --</option>
                  {mockProducts.map((prod) => (
                    <option key={prod.id} value={prod.id}>{prod.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Button variant="outline-primary" onClick={() => handleAdd('related')}>+ Add to Related</Button>
            </Col>
            <Col md={3}>
              <Button variant="outline-success" onClick={() => handleAdd('bundle')}>+ Add to Frequently Bought</Button>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <h6>🧩 Related Products:</h6>
              {related.length === 0 && <p className="text-muted">No related products yet.</p>}
              {related.map((p) => (
                <Badge key={p.id} bg="primary" className="me-2 mb-2">
                  {p.name} <span style={{ cursor: 'pointer' }} onClick={() => removeItem(p.id, 'related')}>✖</span>
                </Badge>
              ))}
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <h6>📦 Frequently Bought Together:</h6>
              {bundle.length === 0 && <p className="text-muted">No bundles added yet.</p>}
              {bundle.map((p) => (
                <Badge key={p.id} bg="success" className="me-2 mb-2">
                  {p.name} <span style={{ cursor: 'pointer' }} onClick={() => removeItem(p.id, 'bundle')}>✖</span>
                </Badge>
              ))}
            </Col>
          </Row>

          <div className="text-end">
            <Button type="submit" variant="primary">💾 Save Suggestions</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SuggestionTool;
