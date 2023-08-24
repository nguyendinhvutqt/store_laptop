const Category = require("../models/category.model");

exports.getCategory = async (req, res) => {
  try {
    // lấy số danh mục mỗi trang
    const limit = req.query.limit ? parseInt(req.query.limit) : 2;

    // lấy số trang
    const page = req.query.page ? parseInt(req.query.page) : 1;

    // vị trí bắt đầu lấy sản phẩm trong đb
    const skip = (page - 1) * limit;

    // lấy tổng số danh mục
    const count = await Category.count();

    // tổng số trang
    const totalPages = Math.ceil(count / limit);

    const categories = await Category.find().skip(skip).limit(limit).exec();
    const message = req.flash("success")[0];
    return res.render("admin/category", {
      currentPage: page,
      totalPages: totalPages,
      limit: limit,
      categories: categories,
      message,
    });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getAddCategory = async (req, res) => {
  return res.render("admin/add-category", { error: "" });
};

exports.addCategory = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const { name } = req.body;

    // validate thông tin
    if (!name) {
      return res.render("admin/add-category", {
        error: "Thông tin không được để trống!",
      });
    }

    // kiểm tra tên danh mục đã tồn tại chưa
    const isExistCategory = await Category.findOne({ name });
    if (isExistCategory) {
      return res.render("admin/add-category", {
        error: "Tên danh mục đã tồn tại",
      });
    }

    // tạo danh mục mới
    const category = new Category({ name: name });
    await category.save();
    req.flash("success", "Tạo mới danh mục sản phẩm thành công");
    return res.redirect("/admin/category");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getEditCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId);
    return res.render("admin/edit-category", { category, error: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.editCategory = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const { name } = req.body;
    const categoryId = req.params.id;

    // tìm danh mục trong db
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.render("error", { error: "Không tìm thấy danh mục sản phẩm" });
    }

    // kiểm tra tên danh mục tồn tại chưa
    const isExistCategory = await Category.findOne({
      name,
      _id: { $ne: categoryId },
    });
    if (isExistCategory) {
      return res.render("admin/edit-category", {
        category,
        error: "Tên danh mục đã tồn tại",
      });
    }

    category.name = name;
    await category.save();
    req.flash("success", "Cập nhật danh mục sản phẩm thành công");
    return res.redirect("/admin/category");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.delCategory = async (req, res) => {
  try {
    // lấy id danh mục
    const categoryId = req.params.id;
    console.log(categoryId);

    // kiểm tra danh mục có tồn tại không
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.render("error", { error: "Không tìm thấy danh mục" });
    }

    await Category.findByIdAndDelete({ _id: categoryId });
    req.flash("success", "Xoá danh mục sản phẩm thành công");
    return res.redirect("/admin/category");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};
