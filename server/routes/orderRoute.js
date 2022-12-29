const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");


router.post("/newOrder", orderController.createOrder);
router.get("/getOrders", orderController.getOrders);
router.patch("/:id/mark-markShipped", orderController.markShipped);

module.exports = router;