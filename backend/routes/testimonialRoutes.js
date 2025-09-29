// routes/testimonial.routes.js
const express = require("express");
const {
  getTestimonials,
  addTestimonial,
  deleteTestimonial,
}=require("../controllers/testimonialController");

const router = express.Router();

// GET all testimonials
router.get("/", getTestimonials);

// POST add new testimonial
router.post("/", addTestimonial);

// DELETE testimonial by ID
router.delete("/:id", deleteTestimonial);


module.exports = router;
