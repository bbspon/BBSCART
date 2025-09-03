    // CategoryManager.js
    import React, { useState } from 'react';
    import { Card, Form, Button, Table, Row, Col } from 'react-bootstrap';
    
    const initialCategories = [
      {
        id: 1,
        name: 'Electronics',
        icon: '📱',
        banner: '',
        description: 'Phones, gadgets and devices',
        sortOrder: 1,
        slug: 'electronics',
        seoTitle: 'Buy Electronics Online',
        metaDesc: 'Best electronics collection',
        subcategories: ['Mobiles', 'Tablets', 'Accessories']
      },
      {
        id: 2,
        name: 'Fashion',
        icon: '👗',
        banner: '',
        description: 'Men and Women clothing',
        sortOrder: 2,
        slug: 'fashion',
        seoTitle: 'Trendy Fashion Deals',
        metaDesc: 'Buy latest clothing and styles',
        subcategories: ['Men', 'Women', 'Kids']
      }
    ];
    
    const CategoryManager = () => {
      const [categories, setCategories] = useState(initialCategories);
      const [form, setForm] = useState({
        name: '',
        icon: '',
        banner: '',
        description: '',
        sortOrder: '',
        slug: '',
        seoTitle: '',
        metaDesc: '',
        subcategories: ''
      });
    
      const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
      };
    
      const handleAddCategory = (e) => {
        e.preventDefault();
    
        const newCategory = {
          id: categories.length + 1,
          ...form,
          subcategories: form.subcategories.split(',').map((s) => s.trim())
        };
    
        setCategories([...categories, newCategory]);
        setForm({
          name: '', icon: '', banner: '', description: '',
          sortOrder: '', slug: '', seoTitle: '', metaDesc: '', subcategories: ''
        });
      };
    
      return (
        <Card>
          <Card.Body>
            <Card.Title>🗂️ Category Manager</Card.Title>
    
            <Form onSubmit={handleAddCategory} className="mb-4">
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Category Name</Form.Label>
                    <Form.Control type="text" name="name" value={form.name} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Icon</Form.Label>
                    <Form.Control type="text" name="icon" value={form.icon} onChange={handleChange} placeholder="📱" />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sort Order</Form.Label>
                    <Form.Control type="number" name="sortOrder" value={form.sortOrder} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
    
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Banner Image URL</Form.Label>
                    <Form.Control type="text" name="banner" value={form.banner} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" name="description" value={form.description} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
    
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Slug (URL)</Form.Label>
                    <Form.Control type="text" name="slug" value={form.slug} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>SEO Title</Form.Label>
                    <Form.Control type="text" name="seoTitle" value={form.seoTitle} onChange={handleChange} />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Meta Description</Form.Label>
                    <Form.Control type="text" name="metaDesc" value={form.metaDesc} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>
    
              <Form.Group className="mb-3">
                <Form.Label>Subcategories (comma-separated)</Form.Label>
                <Form.Control type="text" name="subcategories" value={form.subcategories} onChange={handleChange} />
              </Form.Group>
    
              <div className="text-end">
                <Button type="submit" variant="primary">➕ Add Category</Button>
              </div>
            </Form>
    
            <h6>📋 Category List</h6>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Icon</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Sort</th>
                  <th>Subcategories</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id}>
                    <td>{cat.icon}</td>
                    <td>{cat.name}</td>
                    <td>{cat.slug}</td>
                    <td>{cat.sortOrder}</td>
                    <td>{cat.subcategories.join(', ')}</td>
                    <td>{cat.description}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
    
            <div className="text-muted small">📝 Edit/Delete functionality can be added in future.</div>
          </Card.Body>
        </Card>
      );
    };
    
    export default CategoryManager;
    