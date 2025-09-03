import React, { useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

import ProductManager from '../cms/ProductManager.jsx';
import SmartPricing from '../cms/SmartPricing.jsx';
import FlashSaleTool from '../cms/FlashSaleTool.jsx';
import BadgeManager from '../cms/BadgeManager.jsx';
import SuggestionTool from '../cms/SuggestionTool.jsx';
import BulkUpload from '../cms/BulkUpload.jsx';
import CategoryManager from '../cms/CategoryManager.jsx';
import BannerCMS from '../cms/BannerCMS.jsx';
import HomepageCMS from '../cms/HomepageCMS.jsx';
import TestimonialManager from '../cms/TestimonialManager.jsx';
import FAQManager from '../cms/FAQManager.jsx';
import ReturnPolicyManager from '../cms/ReturnPolicyManager.jsx';

const navItems = [
  { key: 'product', label: '🛒 Product Manager', component: <ProductManager /> },
  { key: 'pricing', label: '📈 Smart Pricing', component: <SmartPricing /> },
  { key: 'flash', label: '⚡ Flash Sale Tool', component: <FlashSaleTool /> },
  { key: 'badge', label: '🏷️ Badge Manager', component: <BadgeManager /> },
  { key: 'suggestions', label: '🤝 Smart Suggestions', component: <SuggestionTool /> },
  { key: 'bulk', label: '📁 Bulk Upload', component: <BulkUpload /> },
  { key: 'category', label: '🗂️ Category Manager', component: <CategoryManager /> },
  { key: 'banner', label: '🖼️ Offer Banner CMS', component: <BannerCMS /> },
  { key: 'homepage', label: '🏠 Homepage CMS', component: <HomepageCMS /> },
  { key: 'testimonial', label: '🌟 Testimonial Manager', component: <TestimonialManager /> },
  { key: 'faq', label: '❓ FAQ Manager', component: <FAQManager /> },
  { key: 'return', label: '🔁 Return Policy Manager', component: <ReturnPolicyManager /> },
];

const BBSCARTCMSPage = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (key) => {
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <Container fluid className="py-5 px-3" style={{ background: '#f8f9fa' }}>
      <h2 className="mb-5 text-center text-primary fw-bold">
        🛠️ BBSCART CMS – Multi-Product Retail Manager
      </h2>

      {navItems.map(({ key, label, component }) => (
        <Row
          key={key}
          className="align-items-start mb-4 px-1"
        >
          {/* Left Title */}
          <Col md={3}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body className="p-3">
                <Button
                  variant="outline-primary"
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

          {/* Right Content */}
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

export default BBSCARTCMSPage;
