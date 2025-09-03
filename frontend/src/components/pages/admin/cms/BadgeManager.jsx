// BadgeManager.js
import React, { useState } from 'react';
import { Card, Table, Form, Button, Row, Col, InputGroup } from 'react-bootstrap';

const initialProducts = [
  { id: 1, title: 'Red T-Shirt', badges: { new: true, bestseller: false, limited: false, outOfStock: false } },
  { id: 2, title: 'Wireless Earbuds', badges: { new: false, bestseller: true, limited: true, outOfStock: false } },
  { id: 3, title: 'Office Chair', badges: { new: false, bestseller: false, limited: false, outOfStock: true } },
];

const BadgeManager = () => {
  const [products, setProducts] = useState(initialProducts);
  const [filterText, setFilterText] = useState('');

  const toggleBadge = (productId, badgeType) => {
    const updated = products.map((prod) => {
      if (prod.id === productId) {
        return {
          ...prod,
          badges: {
            ...prod.badges,
            [badgeType]: !prod.badges[badgeType],
          },
        };
      }
      return prod;
    });
    setProducts(updated);
  };

  const handleSearch = (e) => {
    setFilterText(e.target.value);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <Card>
      <Card.Body>
        <Card.Title>🏷️ Product Badge Manager</Card.Title>

        <Row className="mb-3">
          <Col md={6}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search product..."
                value={filterText}
                onChange={handleSearch}
              />
              <InputGroup.Text>🔍</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Product</th>
              <th>New</th>
              <th>Bestseller</th>
              <th>Limited</th>
              <th>Out of Stock</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.title}</td>
                {['new', 'bestseller', 'limited', 'outOfStock'].map((badge) => (
                  <td key={badge} className="text-center">
                    <Form.Check
                      type="switch"
                      id={`badge-${badge}-${product.id}`}
                      checked={product.badges[badge]}
                      onChange={() => toggleBadge(product.id, badge)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>

        <div className="text-muted small">✅ Changes saved in-memory (mock). Backend API call can be added.</div>
      </Card.Body>
    </Card>
  );
};

export default BadgeManager;
