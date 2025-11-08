const router = require("express").Router();
const { requestReturn } = require("../controllers/ReturnController");
router.post("/orders/:orderId/returns", requestReturn);
module.exports = router;
