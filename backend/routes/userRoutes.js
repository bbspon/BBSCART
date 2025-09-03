const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { uploadAny } = require('../middleware/upload');
const { auth, adminOnly } = require('../middleware/authMiddleware');

// Create product with image upload
router.post("/", auth, uploadAny, userController.createUser);
// READ: Get all products
router.get('/role', auth, userController.getUserByRole); // Handle role filter first
router.get('/', auth, userController.getAllUsers); // Get all users
router.get('/:id', auth, userController.getUserById);

// Update product with image upload
router.put(
    '/:id',
    auth,
    uploadAny, // Accept up to 5 images
    userController.updateUser
);

// DELETE: Delete a product by ID
router.delete('/:id', auth, userController.deleteUser);

module.exports = router;