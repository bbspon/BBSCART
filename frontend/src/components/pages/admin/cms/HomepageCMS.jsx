// HomepageCMS.js
import React, { useState } from 'react';
import {
  Card, Button, Modal, Form, Row, Col
} from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const sectionTypes = ['Hero Banner', 'Deal Block', 'Category Highlight', 'Testimonials'];

const HomepageCMS = () => {
  const [sections, setSections] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSection, setNewSection] = useState({
    type: '',
    title: '',
    visible: true,
    lang: 'EN',
    geo: 'Global',
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updated = Array.from(sections);
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    setSections(updated);
  };

  const handleAddSection = () => {
    setSections([...sections, { id: Date.now().toString(), ...newSection }]);
    setNewSection({ type: '', title: '', visible: true, lang: 'EN', geo: 'Global' });
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  return (
    <Card>
      <Card.Body>
        <Card.Title>🏗️ Homepage CMS Builder</Card.Title>

        <Button variant="primary" className="mb-3" onClick={() => setShowModal(true)}>➕ Add Section</Button>

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="homepageSections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(dragProps) => (
                      <Card
                        className="mb-3 shadow-sm"
                        {...dragProps.draggableProps}
                        {...dragProps.dragHandleProps}
                        ref={dragProps.innerRef}
                      >
                        <Card.Body>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <h6 className="mb-1">{section.type}</h6>
                              <small className="text-muted">
                                {section.title} | {section.geo} | {section.lang} | {section.visible ? '✅ Visible' : '🚫 Hidden'}
                              </small>
                            </div>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(section.id)}>🗑️</Button>
                          </div>
                        </Card.Body>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Add New Section</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Section Type</Form.Label>
                <Form.Select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                >
                  <option value="">-- Select --</option>
                  {sectionTypes.map((type) => (
                    <option key={type}>{type}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  placeholder="e.g. Featured Deals"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Geo</Form.Label>
                    <Form.Control
                      type="text"
                      value={newSection.geo}
                      onChange={(e) => setNewSection({ ...newSection, geo: e.target.value })}
                      placeholder="e.g. India, Global"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-2">
                    <Form.Label>Language</Form.Label>
                    <Form.Select
                      value={newSection.lang}
                      onChange={(e) => setNewSection({ ...newSection, lang: e.target.value })}
                    >
                      <option value="EN">EN</option>
                      <option value="HI">HI</option>
                      <option value="AR">AR</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Check
                type="switch"
                label="Visible"
                checked={newSection.visible}
                onChange={(e) => setNewSection({ ...newSection, visible: e.target.checked })}
              />
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddSection}>Add Section</Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default HomepageCMS;
