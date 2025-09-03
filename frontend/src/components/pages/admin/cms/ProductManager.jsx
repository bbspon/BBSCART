// ProductManager.js
import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, InputGroup } from 'react-bootstrap';

const ProductManager = () => {
  const [product, setProduct] = useState({
    title: '',
    description: '',
    sku: '',
    tags: '',
    price: '',
    offerPrice: '',
    stock: '',
    status: 'Live',
    category: '',
    subcategory: '',
    attributes: '',
    weight: '',
    city: '',
    country: '',
    returnDays: '',
    flags: {
      bestseller: false,
      new: false,
      limited: false,
      outOfStock: false
    },
    images: [],
    video: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('flag_')) {
      const key = name.replace('flag_', '');
      setProduct((prev) => ({
        ...prev,
        flags: {
          ...prev.flags,
          [key]: checked
        }
      }));
    } else {
      setProduct((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProduct((prev) => ({ ...prev, images: files }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Product Data:', product);
    alert('✅ Product Saved!');
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>Add / Edit Product</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="title">
                <Form.Label>Product Title</Form.Label>
                <Form.Control type="text" name="title" value={product.title} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="sku">
                <Form.Label>SKU</Form.Label>
                <Form.Control type="text" name="sku" value={product.sku} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={product.description} onChange={handleChange} />
          </Form.Group>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group controlId="price">
                <Form.Label>Base Price (₹)</Form.Label>
                <Form.Control type="number" name="price" value={product.price} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="offerPrice">
                <Form.Label>Offer Price (₹)</Form.Label>
                <Form.Control type="number" name="offerPrice" value={product.offerPrice} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="stock">
                <Form.Label>Stock</Form.Label>
                <Form.Control type="number" name="stock" value={product.stock} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="category">
                <Form.Label>Category</Form.Label>
                <Form.Control type="text" name="category" value={product.category} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="subcategory">
                <Form.Label>Subcategory</Form.Label>
                <Form.Control type="text" name="subcategory" value={product.subcategory} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="attributes">
                <Form.Label>Attributes (Color, Size)</Form.Label>
                <Form.Control type="text" name="attributes" value={product.attributes} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="weight">
                <Form.Label>Shipping Weight (kg)</Form.Label>
                <Form.Control type="text" name="weight" value={product.weight} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group controlId="returnDays">
                <Form.Label>Return Days</Form.Label>
                <Form.Control type="number" name="returnDays" value={product.returnDays} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="city">
                <Form.Label>Visible in City</Form.Label>
                <Form.Control type="text" name="city" value={product.city} onChange={handleChange} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="country">
                <Form.Label>Country</Form.Label>
                <Form.Control type="text" name="country" value={product.country} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Product Flags</Form.Label>
                <div className="d-flex gap-3 flex-wrap">
                  {['bestseller', 'new', 'limited', 'outOfStock'].map((flag) => (
                    <Form.Check
                      key={flag}
                      label={flag}
                      name={`flag_${flag}`}
                      checked={product.flags[flag]}
                      onChange={handleChange}
                    />
                  ))}
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Product Images (max 5)</Form.Label>
                <Form.Control type="file" multiple onChange={handleImageUpload} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Video URL / Link</Form.Label>
                <Form.Control type="text" name="video" value={product.video} onChange={handleChange} />
              </Form.Group>
            </Col>
          </Row>

          <div className="text-end">
            <Button variant="primary" type="submit">💾 Save Product</Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default ProductManager;
