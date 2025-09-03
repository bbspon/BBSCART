import React, { useState } from 'react';
import { Card, Form, Button } from 'react-bootstrap';

const StoryPageBuilder = () => {
  const [title, setTitle] = useState('');
  const [sections, setSections] = useState([]);
  const [newSection, setNewSection] = useState({ type: 'text', content: '' });

  const handleAddSection = () => {
    if (!newSection.content.trim()) return;
    setSections([...sections, newSection]);
    setNewSection({ type: 'text', content: '' });
  };

  const handleSubmit = () => {
    const storyData = {
      title,
      sections,
    };
    console.log('Story Page:', storyData);
    alert('Story Page saved (console log only)');
    // TODO: Save to backend
  };

  return (
    <Card>
      <Card.Header>📖 Jewellery Story Page Builder</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Story Page Title</Form.Label>
            <Form.Control
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Royal Bridal Collection"
            />
          </Form.Group>

          <Form.Group className="mb-2">
            <Form.Label>Add Section</Form.Label>
            <Form.Select
              value={newSection.type}
              onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
              className="mb-2"
            >
              <option value="text">Text</option>
              <option value="image">Image URL</option>
              <option value="video">Video Embed URL</option>
              <option value="testimonial">Testimonial</option>
              <option value="cta">Call to Action (Button)</option>
            </Form.Select>
            <Form.Control
              as="textarea"
              rows={2}
              value={newSection.content}
              onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
              placeholder="Enter content (e.g., video link or quote)"
            />
            <Button className="mt-2" onClick={handleAddSection}>
              ➕ Add Section
            </Button>
          </Form.Group>

          <hr />

          <h6>🧾 Preview:</h6>
          {sections.length === 0 && <p>No sections added yet.</p>}
          {sections.map((section, index) => (
            <div key={index} className="mb-3">
              <strong>{section.type.toUpperCase()}</strong>
              <div>
                {section.type === 'text' && <p>{section.content}</p>}
                {section.type === 'image' && (
                  <img src={section.content} alt="story-img" className="img-fluid rounded" />
                )}
                {section.type === 'video' && (
                  <div className="ratio ratio-16x9">
                    <iframe src={section.content} title="Story Video" allowFullScreen />
                  </div>
                )}
                {section.type === 'testimonial' && (
                  <blockquote className="blockquote">{section.content}</blockquote>
                )}
                {section.type === 'cta' && (
                  <Button variant="warning" size="sm">{section.content}</Button>
                )}
              </div>
            </div>
          ))}

          <Button variant="success" onClick={handleSubmit}>
            Save Story Page
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default StoryPageBuilder;
