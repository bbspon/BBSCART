import React, { useState } from 'react';
import { Card, Form, Button, Table } from 'react-bootstrap';

const SizeGuideManager = () => {
  const [category, setCategory] = useState('');
  const [chartImage, setChartImage] = useState(null);
  const [tableRows, setTableRows] = useState([]);
  const [newRow, setNewRow] = useState({ label: '', value: '' });

  const handleImageUpload = (e) => {
    setChartImage(URL.createObjectURL(e.target.files[0]));
  };

  const addTableRow = () => {
    if (!newRow.label.trim() || !newRow.value.trim()) return;
    setTableRows([...tableRows, newRow]);
    setNewRow({ label: '', value: '' });
  };

  const handleSubmit = () => {
    const guide = {
      category,
      chartImage,
      table: tableRows,
    };
    console.log('Size Guide:', guide);
    alert('Size guide saved (console log only)');
    // TODO: Save to backend
  };

  return (
    <Card>
      <Card.Header>📏 Size Guide CMS</Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Select Category</Form.Label>
            <Form.Select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select one</option>
              <option value="ring">Ring</option>
              <option value="bangle">Bangle</option>
              <option value="chain">Chain</option>
              <option value="bracelet">Bracelet</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Upload Size Chart Image</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
            {chartImage && (
              <img
                src={chartImage}
                alt="Size Chart"
                className="mt-3"
                style={{ maxHeight: '200px', borderRadius: 8 }}
              />
            )}
          </Form.Group>

          <hr />

          <h6>Add Size Guide Table Rows</h6>
          <div className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="Label (e.g. US Size)"
              value={newRow.label}
              onChange={(e) => setNewRow({ ...newRow, label: e.target.value })}
            />
            <Form.Control
              placeholder="Value (e.g. 7)"
              value={newRow.value}
              onChange={(e) => setNewRow({ ...newRow, value: e.target.value })}
            />
            <Button onClick={addTableRow}>➕</Button>
          </div>

          {tableRows.length > 0 && (
            <Table bordered>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.label}</td>
                    <td>{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <Button variant="success" onClick={handleSubmit}>
            Save Size Guide
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SizeGuideManager;
