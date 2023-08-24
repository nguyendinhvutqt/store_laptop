const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/uploadImage");

const {
  getCategory,
  getAddCategory,
  addCategory,
  getEditCategory,
  editCategory,
  delCategory,
} = require("../controllers/category.controller");

const {
  getProductPage,
  getAddProduct,
  addProduct,
  getEditProduct,
  editProduct,
  deleteProduct,
} = require("../controllers/product.controller");

const {
  getOrdersAdmin,
  getOrderDetailsAdmin,
  orderBrowsingAdmin,
  cancelOrderAdmin,
  successOrderAdmin,
} = require("../controllers/order.controller");

const { getAllUser, blockUser } = require("../controllers/user.controller");

// home route
router.get("/home", (req, res) => {
  res.render("admin/home");
});

// category route
router.get("/category", getCategory);
router
  .get("/category/add-category", getAddCategory)
  .post("/category/add-category", addCategory);
router
  .get("/category/edit-category/:id", getEditCategory)
  .post("/category/edit-category/:id", editCategory);
router.get("/category/delete-category/:id", delCategory);

// product route
router.get("/product", getProductPage);
router
  .get("/product/add-product", getAddProduct)
  .post("/product/add-product", upload.single("image"), addProduct);
router
  .get("/product/edit-product/:id", getEditProduct)
  .post("/product/edit-product/:id", upload.single("image"), editProduct);
router.get("/product/delete-product/:id", deleteProduct);

// order route
router.get("/orders", getOrdersAdmin, getOrderDetailsAdmin);
router.get("/order-details/:id", getOrderDetailsAdmin);
router.post("/order-browsing/:id", orderBrowsingAdmin);
router.post("/cancel-order/:id", cancelOrderAdmin);
router.post("/success-order/:id", successOrderAdmin);

// user route
router.get("/users", getAllUser);
router.get("/block/:id", blockUser);

module.exports = router;
