import React, { useState } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';

const GoldRateModule = () => {
  const [goldRate, setGoldRate] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (!goldRate || goldRate <= 0) {
      setMessage('⚠️ Please enter a valid gold rate.');
      return;
    }

    // TODO: Integrate with backend API
    console.log(`Updated Gold Rate: ₹${goldRate}`);
    setMessage(`✅ Gold rate updated to ₹${goldRate}`);
  };

  return (
    <Card>
      <Card.Header>📈 Gold Rate Module</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Enter Gold Rate (per gram in ₹)</Form.Label>
            <InputGroup>
              <InputGroup.Text>₹</InputGroup.Text>
              <Form.Control
                type="number"
                value={goldRate}
                onChange={(e) => setGoldRate(e.target.value)}
                placeholder="e.g., 5950"
              />
            </InputGroup>
          </Form.Group>

          <Button variant="primary" onClick={handleSubmit}>
            Update Gold Rate
          </Button>

          {message && <p className="mt-3">{message}</p>}
        </Form>
      </Card.Body>
    </Card>
  );
};

export default GoldRateModule;
