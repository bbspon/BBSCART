import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';

const TryOnTogglePanel = () => {
  const [productId, setProductId] = useState('');
  const [isTryOnEnabled, setIsTryOnEnabled] = useState(false);
  const [tryOnPreviewURL, setTryOnPreviewURL] = useState('');

  const handleSubmit = () => {
    console.log({
      productId,
      tryOnEnabled: isTryOnEnabled,
      preview: tryOnPreviewURL,
    });
    alert('Try-On status saved (console log only)');
    // TODO: Save this config via API
  };

  return (
    <Card>
      <Card.Header>🕶️ Try-On Toggle</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Product ID</Form.Label>
            <Form.Control
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID or SKU"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="tryon-switch"
              label="Enable Virtual Try-On"
              checked={isTryOnEnabled}
              onChange={(e) => setIsTryOnEnabled(e.target.checked)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Preview Try-On Video/Model URL</Form.Label>
            <Form.Control
              value={tryOnPreviewURL}
              onChange={(e) => setTryOnPreviewURL(e.target.value)}
              placeholder="https://example.com/tryon-model.glb"
            />
          </Form.Group>

          {tryOnPreviewURL && (
            <div className="ratio ratio-16x9 mb-3">
              <iframe src={tryOnPreviewURL} title="Try-On Preview" allowFullScreen />
            </div>
          )}

          <Button variant="primary" onClick={handleSubmit}>
            Save Try-On Setting
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default TryOnTogglePanel;
