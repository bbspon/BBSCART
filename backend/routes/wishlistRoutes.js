const express = require("express");
const router = express.Router();
const wishlistController = require("../controllers/wishlistController");
const { auth, authUser } = require('../middleware/authMiddleware');

router.post('/add', authUser, wishlistController.addToWishlist);
router.delete('/remove/:productId', authUser, wishlistController.removeFromWishlist);
router.get('/', authUser, wishlistController.getWishlist);

module.exports = router;
