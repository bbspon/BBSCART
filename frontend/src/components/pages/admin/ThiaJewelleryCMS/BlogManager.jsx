import React, { useState } from 'react';
import { Card, Form, Button, Row, Col } from 'react-bootstrap';

const BlogManager = () => {
  const [title, setTitle] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [content, setContent] = useState('');
  const [publish, setPublish] = useState(false);

  const handleImageUpload = (e) => {
    setCoverImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
    const blogPost = {
      title,
      author,
      tags: tags.split(',').map((t) => t.trim()),
      content,
      publish,
    };
    console.log('Blog Post Data:', blogPost);
    alert('Blog post saved (console log only)');
    // TODO: Send to backend
  };

  return (
    <Card>
      <Card.Header>📝 Jewellery Blog Manager</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Blog Title</Form.Label>
            <Form.Control
              placeholder="e.g., Understanding 22K vs 24K Gold"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Author Name</Form.Label>
                <Form.Control
                  placeholder="e.g., Team Thia"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Tags (comma separated)</Form.Label>
                <Form.Control
                  placeholder="e.g., Gold, Jewellery Guide, Bridal"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Cover Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
            {coverImage && (
              <img src={coverImage} alt="Cover" className="mt-2 rounded" style={{ maxHeight: 180 }} />
            )}
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Blog Content</Form.Label>
            <Form.Control
              as="textarea"
              rows={8}
              placeholder="Write your blog content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Check
              type="switch"
              id="publish-switch"
              label="Publish Immediately"
              checked={publish}
              onChange={(e) => setPublish(e.target.checked)}
            />
          </Form.Group>

          <Button variant="success" onClick={handleSubmit}>
            Save Blog Post
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default BlogManager;
