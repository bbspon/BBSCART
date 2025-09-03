// ReturnPolicyManager.js
import React, { useState } from 'react';
import { Card, Form, Button, Table, Row, Col, Badge } from 'react-bootstrap';

const ReturnPolicyManager = () => {
  const [policies, setPolicies] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    days: '',
    appliesTo: '',
    type: 'Category',
    tags: '',
    active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPolicy = {
      ...form,
      id: Date.now(),
      tags: form.tags.split(',').map((t) => t.trim()),
    };
    setPolicies((prev) => [...prev, newPolicy]);
    setForm({
      title: '',
      description: '',
      days: '',
      appliesTo: '',
      type: 'Category',
      tags: '',
      active: true,
    });
  };

  const handleDelete = (id) => {
    setPolicies(policies.filter((p) => p.id !== id));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>🔁 Return Policy Manager</Card.Title>

        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Days Allowed</Form.Label>
                <Form.Select
                  name="days"
                  value={form.days}
                  onChange={handleChange}
                >
                  <option value="">Select</option>
                  <option>7</option>
                  <option>14</option>
                  <option>30</option>
                  <option>No Return</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group>
                <Form.Label>Applies To</Form.Label>
                <Form.Control
                  type="text"
                  name="appliesTo"
                  value={form.appliesTo}
                  onChange={handleChange}
                  placeholder="e.g. Electronics / SKU123"
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Type</Form.Label>
                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option>Category</option>
                  <option>Product</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Tags (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="Refund Only, Exchange Only"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Check
                type="switch"
                className="mt-4"
                label="Active"
                name="active"
                checked={form.active}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={form.description}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="text-end mb-4">
            <Button type="submit" variant="primary">➕ Add Policy</Button>
          </div>
        </Form>

        <h6>📋 Return Policies</h6>
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Applies To</th>
              <th>Days</th>
              <th>Tags</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr key={p.id}>
                <td>{p.title}</td>
                <td>{p.type}</td>
                <td>{p.appliesTo}</td>
                <td>{p.days}</td>
                <td>
                  {p.tags.map((tag, i) => (
                    <Badge key={i} bg="info" className="me-1">{tag}</Badge>
                  ))}
                </td>
                <td>{p.active ? '✅ Active' : '❌ Inactive'}</td>
                <td>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                  >
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

export default ReturnPolicyManager;
