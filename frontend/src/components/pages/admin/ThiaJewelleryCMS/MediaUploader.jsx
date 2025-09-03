// MediaUploader.jsx
import React, { useState } from 'react';
import { Card, Button, Form } from 'react-bootstrap';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const MediaUploader = () => {
  const [images, setImages] = useState([]);
  const [videoURL, setVideoURL] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(images);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setImages(reordered);
  };

  const removeImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  return (
    <Card>
      <Card.Header>🖼️ Media Upload (Images + Video)</Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Upload Product Images (multiple)</Form.Label>
          <Form.Control type="file" multiple accept="image/*" onChange={handleImageUpload} />
        </Form.Group>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images" direction="horizontal">
            {(provided) => (
              <div
                className="d-flex flex-wrap gap-3"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {images.map((img, index) => (
                  <Draggable key={img.id} draggableId={img.id} index={index}>
                    {(provided) => (
                      <div
                        className="position-relative"
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <img
                          src={img.preview}
                          alt="preview"
                          width={120}
                          height={120}
                          style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #ccc' }}
                        />
                        <Button
                          size="sm"
                          variant="danger"
                          className="position-absolute top-0 end-0"
                          onClick={() => removeImage(img.id)}
                        >
                          ×
                        </Button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <hr className="my-4" />

        <Form.Group className="mb-3">
          <Form.Label>Video URL (YouTube/Vimeo)</Form.Label>
          <Form.Control
            type="text"
            value={videoURL}
            onChange={(e) => setVideoURL(e.target.value)}
            placeholder="https://www.youtube.com/embed/..."
          />
        </Form.Group>

        {videoURL && (
          <div className="ratio ratio-16x9">
            <iframe src={videoURL} title="Product Video" allowFullScreen />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MediaUploader;
