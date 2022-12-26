const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");



router.post("/newProduct", productController.createProduct);
router.get("/getProduct", productController.getProduct);
router.patch("/:id/updateProduct", productController.updateProduct);
router.delete("/:id/deleteProduct", productController.deleteProduct);

module.exports = router;