const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const subcategoryController = require('../controllers/subcategoryController');
const { authUser } = require('../middleware/authMiddleware');

// Category Routes
router.post('/categories', authUser, categoryController.createCategory);
router.get('/categories', authUser, categoryController.getAllCategories);
router.get('/categories/nearbyseller',authUser, categoryController.getNearbySellerCategories);
router.get('/categories/seller/:sellerId', categoryController.getCategoryBySellerId);
router.get('/categories/:id', authUser, categoryController.getCategoryById);
router.put('/categories/:id', authUser, categoryController.updateCategory);
router.delete('/categories/:id', authUser, categoryController.deleteCategory);

// Subcategory Routes
router.post('/subcategories', authUser, subcategoryController.createSubcategory);
router.get('/subcategories', authUser, subcategoryController.getAllSubcategories);
router.get('/subcategories/:id', authUser, subcategoryController.getSubcategoryById);
router.get('/subcategories/seller/:sellerId', authUser, subcategoryController.getSubcategoryBySellerId);
router.put('/subcategories/:id', authUser, subcategoryController.updateSubcategory);
router.delete('/subcategories/:id', authUser, subcategoryController.deleteSubcategory);

module.exports = router;
