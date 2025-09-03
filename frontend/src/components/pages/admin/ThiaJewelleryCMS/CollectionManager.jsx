// CollectionManager.jsx
import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, ListGroup, InputGroup } from 'react-bootstrap';

const dummyProducts = [
  { id: 'p1', name: 'Diamond Necklace' },
  { id: 'p2', name: 'Gold Bangle' },
  { id: 'p3', name: 'Men’s Chain' },
  { id: 'p4', name: 'Bridal Set' },
];

const CollectionManager = () => {
  const [collectionName, setCollectionName] = useState('');
  const [bannerImage, setBannerImage] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredProducts = dummyProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.find((p) => p.id === product.id)
        ? prev.filter((p) => p.id !== product.id)
        : [...prev, product]
    );
  };

  const handleBannerUpload = (e) => {
    setBannerImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
    console.log({
      collectionName,
      description,
      selectedProductIds: selectedProducts.map((p) => p.id),
    });
    alert('Collection saved (console log only)');
    // TODO: Send to backend
  };

  return (
    <Card>
      <Card.Header>📂 Collection Creator</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Collection Name</Form.Label>
            <Form.Control
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              placeholder="e.g., Bridal Jewellery"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Collection Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Banner Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleBannerUpload} />
            {bannerImage && <img src={bannerImage} alt="banner" height="100" className="mt-2" />}
          </Form.Group>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label>Select Products</Form.Label>
            <InputGroup className="mb-2">
              <Form.Control
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <ListGroup>
              {filteredProducts.map((product) => (
                <ListGroup.Item
                  key={product.id}
                  action
                  active={selectedProducts.find((p) => p.id === product.id)}
                  onClick={() => toggleProduct(product)}
                >
                  {product.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Form.Group>

          <Button variant="success" onClick={handleSubmit}>Save Collection</Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default CollectionManager;
