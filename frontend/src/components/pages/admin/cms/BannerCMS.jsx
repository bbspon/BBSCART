// BannerCMS.js
import React, { useState } from 'react';
import { Card, Form, Button, Table, Row, Col, Image } from 'react-bootstrap';

const BannerCMS = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({
    title: '',
    desktop: '',
    mobile: '',
    link: '',
    location: 'Homepage',
    expiry: '',
    enabled: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddBanner = (e) => {
    e.preventDefault();
    const newBanner = {
      ...form,
      id: Date.now(),
    };
    setBanners((prev) => [...prev, newBanner]);
    setForm({
      title: '', desktop: '', mobile: '', link: '',
      location: 'Homepage', expiry: '', enabled: true,
    });
  };

  const toggleBanner = (id) => {
    const updated = banners.map((b) =>
      b.id === id ? { ...b, enabled: !b.enabled } : b
    );
    setBanners(updated);
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>🖼️ Offer Banner CMS</Card.Title>

        <Form onSubmit={handleAddBanner}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Banner Title</Form.Label>
                <Form.Control type="text" name="title" value={form.title} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Target Link</Form.Label>
                <Form.Control type="text" name="link" value={form.link} onChange={handleChange} placeholder="/product/123" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Desktop Image URL</Form.Label>
                <Form.Control type="text" name="desktop" value={form.desktop} onChange={handleChange} placeholder="https://..." />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Mobile Image URL</Form.Label>
                <Form.Control type="text" name="mobile" value={form.mobile} onChange={handleChange} placeholder="https://..." />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Show Location</Form.Label>
                <Form.Select name="location" value={form.location} onChange={handleChange}>
                  <option value="Homepage">Homepage</option>
                  <option value="Category">Category Page</option>
                  <option value="Product">Product Page</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control type="date" name="expiry" value={form.expiry} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Check
                type="switch"
                label="Enable Banner"
                name="enabled"
                className="mt-4"
                checked={form.enabled}
                onChange={handleChange}
              />
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="primary" type="submit">➕ Add Banner</Button>
          </div>
        </Form>

        <hr />
        <h6>📋 Existing Banners</h6>
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>Title</th>
              <th>Location</th>
              <th>Desktop</th>
              <th>Mobile</th>
              <th>Expiry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((b) => (
              <tr key={b.id}>
                <td>{b.title}</td>
                <td>{b.location}</td>
                <td>
                  {b.desktop ? <Image src={b.desktop} alt="desktop" thumbnail width={100} /> : '—'}
                </td>
                <td>
                  {b.mobile ? <Image src={b.mobile} alt="mobile" thumbnail width={80} /> : '—'}
                </td>
                <td>{b.expiry || '—'}</td>
                <td>
                  <Form.Check
                    type="switch"
                    checked={b.enabled}
                    onChange={() => toggleBanner(b.id)}
                    label={b.enabled ? 'Live' : 'Hidden'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default BannerCMS;
