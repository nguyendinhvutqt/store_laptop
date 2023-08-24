const User = require("../models/user.model");
const Order = require("../models/order.model");

exports.getOrderProducts = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }
    if (!req.session.cart) {
      return res.redirect("/");
    }
    const user = await User.findById(req.session.user._id);
    const products = req.session.cart;
    return res.render("user/payment", { user, products, error: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.orderProducts = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    if (!name || !phone || !address) {
      const user = await User.findById(req.session.user._id);
      return res.render("user/payment", {
        user,
        error: "Bạn phải điền đầy đủ thông tin",
      });
    }
    let totalAmount = 0;
    const products = req.session.cart;
    products.forEach((product) => {
      totalAmount += product.price * product.quantity;
    });
    const newOrder = new Order({
      user: req.session.user._id,
      shippingAddress: {
        name,
        phone,
        address,
      },
      products,
      totalAmount,
      paymentMethod: "Tại nhà",
    });
    await newOrder.save();
    req.session.cart = [];
    return res.redirect("/success");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find();
    const message = req.flash("success")[0];
    return res.render("admin/orders", { orders, message });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getOrderDetailsAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    const orders = await Order.findById(orderId);
    return res.render("admin/order-details", { orders });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.orderBrowsingAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate({ _id: orderId }, { status: "Đang giao" });
    req.flash("success", "Xác nhận đơn hàng thành công");
    return res.redirect("/admin/orders");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.cancelOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate({ _id: orderId }, { status: "Đã huỷ" });
    req.flash("success", "Huỷ đơn hàng thành công");
    return res.redirect("/admin/orders");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.successOrderAdmin = async (req, res) => {
  try {
    const orderId = req.params.id;
    await Order.findByIdAndUpdate({ _id: orderId }, { status: "Đã Giao" });
    req.flash("success", "Đơn hàng đã được giao thành công");
    return res.redirect("/admin/orders");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};
