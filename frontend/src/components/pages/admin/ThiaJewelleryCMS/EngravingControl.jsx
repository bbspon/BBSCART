import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const EngravingControl = () => {
  const [sku, setSku] = useState('');
  const [isEngravingEnabled, setIsEngravingEnabled] = useState(false);
  const [maxChars, setMaxChars] = useState(20);
  const [fontStyle, setFontStyle] = useState('Serif');

  const handleSubmit = () => {
    const engravingSettings = {
      sku,
      enabled: isEngravingEnabled,
      maxCharacters: maxChars,
      font: fontStyle,
    };

    console.log('Engraving Settings:', engravingSettings);
    alert('Engraving option saved (console log only)');
    // TODO: Save this via API to product settings
  };

  return (
    <Card>
      <Card.Header>🔤 Engraving Option</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Product SKU</Form.Label>
            <Form.Control
              placeholder="Enter SKU (e.g., THIA-001)"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              label="Enable Engraving"
              checked={isEngravingEnabled}
              onChange={(e) => setIsEngravingEnabled(e.target.checked)}
            />
          </Form.Group>

          {isEngravingEnabled && (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Max Characters</Form.Label>
                    <Form.Control
                      type="number"
                      value={maxChars}
                      onChange={(e) => setMaxChars(parseInt(e.target.value))}
                      min={1}
                      max={50}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Font Style</Form.Label>
                    <Form.Select
                      value={fontStyle}
                      onChange={(e) => setFontStyle(e.target.value)}
                    >
                      <option value="Serif">Serif</option>
                      <option value="Sans-serif">Sans-serif</option>
                      <option value="Cursive">Cursive</option>
                      <option value="Monospace">Monospace</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label>Preview</Form.Label>
                <div
                  className="p-2 border rounded"
                  style={{ fontFamily: fontStyle }}
                >
                  Example Text: "Forever Yours"
                </div>
              </Form.Group>
            </>
          )}

          <Button variant="primary" onClick={handleSubmit}>
            Save Engraving Setting
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default EngravingControl;
