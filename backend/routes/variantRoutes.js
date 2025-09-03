const express = require('express');
const router = express.Router();
const variantController = require('../controllers/variantController');

// Variant Routes
router.post('/variants', variantController.createVariant);
router.get('/variants', variantController.getAllVariants);
router.get('/variants/:id', variantController.getVariantById);
router.get('/variants/product/:product_id', variantController.getVariantsByProductId);
router.put('/variants/:id', variantController.updateVariant);
router.delete('/variants/:id', variantController.deleteVariant);

module.exports = router;