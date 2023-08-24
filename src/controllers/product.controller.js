const Product = require("../models/product.model");
const Category = require("../models/category.model");

exports.getProductPage = async (req, res) => {
  // lấy số danh mục mỗi trang
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;

  // lấy số trang
  const page = req.query.page ? parseInt(req.query.page) : 1;

  // vị trí bắt đầu lấy sản phẩm trong đb
  const skip = (page - 1) * limit;

  // lấy tổng số danh mục
  const count = await Product.count();

  // tổng số trang
  const totalPages = Math.ceil(count / limit);

  const products = await Product.find()
    .skip(skip)
    .limit(limit)
    .populate("category")
    .exec();
  console.log(products);
  const message = req.flash("success")[0];
  return res.render("admin/product", {
    currentPage: page,
    totalPages: totalPages,
    limit: limit,
    products,
    message,
  });
};

exports.getAddProduct = async (req, res) => {
  // lấy danh mục sản phẩm
  const category = await Category.find();

  return res.render("admin/add-product", { category, error: "" });
};

exports.addProduct = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const { name, price, description, countInStock, category } = req.body;

    const categories = await Category.find();

    // Kiểm tra nếu không có tệp tin nào được tải lên
    if (!req.file) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Vui lòng chọn một tệp tin ảnh để tải lên",
      });
    }
    const image = req.file.filename;

    // validate thông tin
    if (
      !name ||
      !price ||
      !description ||
      !countInStock ||
      !category ||
      !image
    ) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Thông tin không được để trống",
      });
    }

    // Kiểm tra kiểu tệp tin
    if (!req.file.mimetype.startsWith("image/")) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Chỉ được tải lên các file ảnh!",
      });
    }
    // kiểm tra tên sản phẩm
    const isExistProduct = await Product.findOne({ name: name });
    if (isExistProduct) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Tên sản phẩm đã tồn tại",
      });
    }

    // kiểm tra giá sản phẩm > 0
    if (price < 0) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Giá sản phẩm phải lớn hơn 0",
      });
    }

    // kiểm tra số lượng sản phẩm > 0
    if (countInStock < 0) {
      return res.render("admin/add-product", {
        category: categories,
        error: "Số lượng sản phẩm phải lớn hơn 0",
      });
    }

    // tạo sản phẩm mới
    const newProduct = new Product({
      name,
      price,
      description,
      countInStock,
      category,
      image,
    });

    await newProduct.save();
    req.flash("success", "Tạo sản phẩm thành công");
    return res.redirect("/admin/product");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getEditProduct = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const productId = req.params.id;

    const product = await Product.findById(productId);

    const categories = await Category.find();
    return res.render("admin/edit-product", { product, categories, error: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.editProduct = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const productId = req.params.id;
    const { name, price, description, countInStock, category } = req.body;
    const categories = await Category.find();

    // tìm danh mục trong db
    const product = await Product.findById(productId);
    if (!product) {
      return res.render("error", { error: "Không tìm thấy danh mục sản phẩm" });
    }

    if (req.file && !req.file.mimetype.startsWith("image/")) {
      return res.render("admin/edit-product", {
        product,
        categories,
        error: "Chỉ được tải lên các file ảnh!",
      });
    }

    const image = req.file ? req.file.filename : product.image;

    // kiểm tra tên sản phẩm
    const isExistProduct = await Product.findOne({
      name,
      _id: { $ne: productId },
    });
    if (isExistProduct) {
      return res.render("admin/edit-product", {
        product,
        categories,
        error: "Tên sản phẩm đã tồn tại",
      });
    }

    // kiểm tra giá sản phẩm > 0
    if (price < 0) {
      return res.render("admin/edit-product", {
        product,
        categories,
        error: "Giá sản phẩm phải lớn hơn 0",
      });
    }

    // kiểm tra số lượng sản phẩm > 0
    if (countInStock < 0) {
      return res.render("admin/edit-product", {
        product,
        categories,
        error: "Số lượng sản phẩm phải lớn hơn 0",
      });
    }

    await Product.findByIdAndUpdate(
      { _id: productId },
      {
        name,
        price,
        countInStock,
        description,
        image,
        category,
      }
    );
    req.flash("success", "Cập nhật sản phẩm thành công");
    return res.redirect("/admin/product");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    await Product.findByIdAndDelete({ _id: productId });
    req.flash("success", "Xoá sản phẩm thành công");
    return res.redirect("/admin/product");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getDetailsProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    res.render("user/details", { product });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { quantity = 1, productId } = req.body;

    // kiểm tra số lượng < số lượng tồn kho
    const product = await Product.findById(productId);
    if (quantity > product.countInStock) {
      res.flash("error", "Số lượng tồn kho không đủ");
      res.redirect("/product");
    }

    if (!req.session.cart) {
      req.session.cart = [];
    }

    const existingCartItem = req.session.cart.find((item) => {
      return item.productId == productId;
    });

    if (!existingCartItem) {
      const newCartItem = {
        productId: productId,
        name: product.name,
        image: product.image,
        description: product.description,
        price: product.price,
        quantity: parseInt(quantity),
      };
      req.session.cart.push(newCartItem);
    } else {
      existingCartItem.quantity =
        parseInt(existingCartItem.quantity) + parseInt(quantity);
    }
    return res.redirect("/");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.removeProductFromCart = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log(productId);

    req.session.cart = req.session.cart.filter(
      (item) => item.productId !== productId
    );
    return res.redirect("/");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }
    const products = req.session.cart;
    return res.render("user/cart", { products });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getProductPageUser = async (req, res) => {
  try {
    const { type, name, min, max } = req.query;
    const categories = await Category.find();
    let products = [];

    if (!type && !name && !min && !max) {
      products = await Product.find();
    }

    if (type) {
      const category = await Category.findOne({ name: { $regex: type } });
      products = await Product.find({ category: category._id });
    }

    if (name) {
      products = await Product.find({
        name: { $regex: name, $options: "i" },
      });
    }

    if (min && max) {
      products = await Product.find({ price: { $gt: min, $lt: max } });
    }

    if (min && !max) {
      products = await Product.find({ price: { $gt: min } });
    }

    if (!min && max) {
      products = await Product.find({ price: { $lt: max } });
    }

    if (products.length === 0) {
      return res.render("user/products", {
        products,
        categories,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.render("user/products", {
      products,
      categories,
      message: "",
    });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.search = async (req, res) => {
  try {
    const name = req.query.name;

    const products = await Product.find({
      name: { $regex: name, $options: "i" },
    });

    if (products.length === 0) {
      return res.render("user/search", {
        products,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.render("user/search", { products, message: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};
