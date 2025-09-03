// FAQManager.js
import React, { useState } from 'react';
import { Card, Form, Button, Accordion, Row, Col, Badge } from 'react-bootstrap';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: '',
  });
  const [filterTag, setFilterTag] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFAQ = (e) => {
    e.preventDefault();
    const newFAQ = {
      ...form,
      id: Date.now(),
    };
    setFaqs([...faqs, newFAQ]);
    setForm({ question: '', answer: '', category: '' });
  };

  const handleDelete = (id) => {
    setFaqs(faqs.filter((faq) => faq.id !== id));
  };

  const filteredFaqs = filterTag
    ? faqs.filter((f) => f.category.toLowerCase() === filterTag.toLowerCase())
    : faqs;

  const allTags = [...new Set(faqs.map((f) => f.category).filter(Boolean))];

  return (
    <Card>
      <Card.Body>
        <Card.Title>❓ FAQ Manager</Card.Title>

        <Form onSubmit={handleAddFAQ}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Question</Form.Label>
                <Form.Control
                  type="text"
                  name="question"
                  value={form.question}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Category Tag</Form.Label>
                <Form.Control
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Shipping, Orders, Returns"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Answer</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="answer"
              value={form.answer}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <div className="text-end mb-4">
            <Button type="submit" variant="primary">➕ Add FAQ</Button>
          </div>
        </Form>

        {allTags.length > 0 && (
          <div className="mb-3">
            <strong>Filter by Tag:</strong>{' '}
            <Badge
              pill
              bg={!filterTag ? 'primary' : 'light'}
              text={!filterTag ? 'light' : 'dark'}
              style={{ cursor: 'pointer' }}
              onClick={() => setFilterTag('')}
            >
              All
            </Badge>{' '}
            {allTags.map((tag) => (
              <Badge
                key={tag}
                pill
                bg={filterTag === tag ? 'primary' : 'light'}
                text={filterTag === tag ? 'light' : 'dark'}
                style={{ cursor: 'pointer', marginRight: '5px' }}
                onClick={() => setFilterTag(tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <Accordion>
          {filteredFaqs.map((faq, index) => (
            <Accordion.Item eventKey={String(index)} key={faq.id}>
              <Accordion.Header>{faq.question}</Accordion.Header>
              <Accordion.Body>
                <p>{faq.answer}</p>
                {faq.category && <Badge bg="secondary">{faq.category}</Badge>}
                <div className="text-end mt-2">
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
                  >
                    🗑️ Delete
                  </Button>
                </div>
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </Card.Body>
    </Card>
  );
};

export default FAQManager;
