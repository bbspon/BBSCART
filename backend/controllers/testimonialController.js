const Testimonial = require("../models/testimonial");

// GET
exports.getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .lean();
    res.json({ testimonials });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST (JSON only for now)
exports.addTestimonial = async (req, res) => {
  try {
    const {
      name,
      email,
      productId, // from frontend
      title,
      comment, // from frontend
      rating,
      verified,
    } = req.body;

    const doc = await Testimonial.create({
      name,
      email,
      product: productId, // map to "product"
      title,
      message: comment, // map to "message"
      rating: Number(rating),
      verified: !!verified,
      media: [], // leave empty for now
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE unchanged
exports.deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: "Testimonial deleted" });
  } catch (err) {
    res.status(404).json({ error: "Not found" });
  }
};
