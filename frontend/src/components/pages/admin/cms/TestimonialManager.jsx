// TestimonialManager.js
import React, { useState } from 'react';
import { Card, Form, Button, Table, Row, Col, Image } from 'react-bootstrap';

const TestimonialManager = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState({
    name: '',
    city: '',
    product: '',
    text: '',
    photo: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = { ...form, id: Date.now() };
    setTestimonials((prev) => [...prev, newEntry]);
    setForm({ name: '', city: '', product: '', text: '', photo: '' });
  };

  const handleDelete = (id) => {
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>🌟 Testimonial Manager</Card.Title>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>City</Form.Label>
                <Form.Control
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="product"
                  value={form.product}
                  onChange={handleChange}
                  placeholder="Product name or SKU"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Photo URL (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  name="photo"
                  value={form.photo}
                  onChange={handleChange}
                  placeholder="https://..."
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Review Text</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="text"
              value={form.text}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="text-end">
            <Button type="submit" variant="primary">➕ Add Testimonial</Button>
          </div>
        </Form>

        <hr />
        <h6>📋 Customer Testimonials</h6>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Photo</th>
              <th>Name</th>
              <th>City</th>
              <th>Product</th>
              <th>Review</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {testimonials.map((t) => (
              <tr key={t.id}>
                <td>{t.photo ? <Image src={t.photo} alt="user" width={60} rounded /> : '—'}</td>
                <td>{t.name}</td>
                <td>{t.city}</td>
                <td>{t.product || '—'}</td>
                <td>{t.text}</td>
                <td>
                  <Button variant="outline-danger" size="sm" onClick={() => handleDelete(t.id)}>
                    🗑️ Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default TestimonialManager;
