const express = require("express");
const router = express.Router();
const Product = require("../models/product.model");
const {
  getDetailsProduct,
  addToCart,
  removeProductFromCart,
  getCart,
  getProductPageUser,
  search,
} = require("../controllers/product.controller");
const {
  getOrderProducts,
  orderProducts,
} = require("../controllers/order.controller");

router.get("/", async (req, res) => {
  const numberOfProducts = 8;
  const newProducts = await Product.find().limit(3).sort({ createdAt: "desc" });
  const products = await Product.aggregate([
    { $sample: { size: numberOfProducts } },
  ]);
  res.render("user/home", { newProducts, products });
});

router.get("/products", getProductPageUser);
router.get("/product/:id", getDetailsProduct);
router.post("/add-to-cart/", addToCart);
router.get("/remove-product-from-cart/:id", removeProductFromCart);
router.get("/cart", getCart);
router.get("/order", getOrderProducts);
router.post("/order", orderProducts);
router.get("/search", search);
router.get("/success", (req, res) => {
  return res.render("user/success");
});

module.exports = router;
