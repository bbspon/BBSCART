import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

import GoldRateModule from '../ThiaJewelleryCMS/GoldRateModule.jsx';
import ProductManager from '../ThiaJewelleryCMS/ProductManager.jsx';
import MediaUploader from '../ThiaJewelleryCMS/MediaUploader.jsx';
import CollectionManager from '../ThiaJewelleryCMS/CollectionManager.jsx';
import TryOnTogglePanel from '../ThiaJewelleryCMS/TryOnTogglePanel.jsx';
import StoryPageBuilder from '../ThiaJewelleryCMS/StoryPageBuilder.jsx';
import SizeGuideManager from '../ThiaJewelleryCMS/SizeGuideManager.jsx';
import EngravingControl from '../ThiaJewelleryCMS/EngravingControl.jsx';
import BlogCMS from '../ThiaJewelleryCMS/BlogManager.jsx'; // Optional future module

const navItems = [
  { key: 'gold-rate', label: '📊 Gold Rate Module', component: <GoldRateModule /> },
  { key: 'product-manager', label: '🛒 Product Manager', component: <ProductManager /> },
  { key: 'media-upload', label: '🖼️ Media Upload', component: <MediaUploader /> },
  { key: 'collection-manager', label: '🎀 Collection Creator', component: <CollectionManager /> },
  { key: 'tryon-toggle', label: '👓 Try-On Toggle', component: <TryOnTogglePanel /> },
  { key: 'story-pages', label: '📖 Jewellery Story Pages', component: <StoryPageBuilder /> },
  { key: 'size-guide', label: '📏 Size Guide CMS', component: <SizeGuideManager /> },
  { key: 'engraving', label: '🔤 Engraving Option', component: <EngravingControl /> },
  { key: 'blog-cms', label: '📝 Jewellery Blog', component: <BlogCMS /> },
];

const ThiaJewelleryCMS = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Container fluid className="py-5 px-3" style={{ backgroundColor: '#f8f9fa' }}>
      <h2 className="mb-5 text-center text-primary fw-bold">
        💎 THIAWORLD CMS – Jewellery Management System
      </h2>

      {navItems.map(({ key, label, component }) => (
        <Row key={key} className="align-items-start mb-4 px-1">
          {/* Left Side: Button */}
          <Col md={3}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-3">
                <Button
                  variant="outline-dark"
                  className="w-100 text-start fw-semibold d-flex justify-content-between align-items-center"
                  onClick={() => toggleItem(key)}
                  style={{ fontSize: '1rem' }}
                >
                  {label}
                  <span className="ms-2">{openItems[key] ? '➖' : '➕'}</span>
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Side: Component Display */}
          <Col md={9}>
            {openItems[key] && (
              <Card className="shadow-sm border rounded-3">
                <Card.Body className="p-4 bg-white" style={{ minHeight: '300px' }}>
                  {component}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      ))}
    </Container>
  );
};

export default ThiaJewelleryCMS;
