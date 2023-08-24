const User = require("../models/user.model");
const bcrypt = require("bcrypt");

exports.getLoginPage = (req, res) => {
  res.render("user/login", { error: "" });
};

exports.loginUser = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const { email, password } = req.body;

    // validate thông tin
    if (!email || !password) {
      return res.render("user/login", {
        error: "Bạn thông được để trống thông tin!",
      });
    }

    // kiểm tra email có hợp lệ không
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);
    if (!isValidEmail) {
      return res.render("user/login", { error: "Email không hợp lệ!" });
    }

    // tìm tài khoản trong db
    const user = await User.findOne({ email: email });

    // kiểm tra email và mật khẩu có khớp trong db không
    if (
      user &&
      user.isBlocked === false &&
      bcrypt.compareSync(password, user.password)
    ) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      if (user.role === "admin") {
        return res.redirect("/admin/home");
      } else {
        return res.redirect("/");
      }
    } else {
      return res.render("user/login", {
        error: "Email hoặc mật khẩu không chính xác!",
      });
    }
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getRegisterPage = (req, res) => {
  res.render("user/register", { error: "" });
};

exports.registerUser = async (req, res) => {
  try {
    // lấy thông tin gửi lên
    const { email, name, phone, address, password, confirmPassword } = req.body;
    console.log(req.body);
    // validate thông tin
    if (
      !email ||
      !name ||
      !phone ||
      !address ||
      !password ||
      !confirmPassword
    ) {
      return res.render("user/register", {
        error: "Bạn phải nhập đầy đủ thông tin!",
      });
    }

    // kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);
    if (!isValidEmail) {
      return res.render("user/register", {
        error: "Email không hợp lệ!",
      });
    }

    // kiểm tra email đã tồn tại chưa
    const isExistEmail = await User.findOne({ email: email });
    if (isExistEmail) {
      return res.render("user/register", {
        error: "Email đã tồn tại",
      });
    }

    // kiểm tra 2 mật khẩu khớp nhau
    if (password != confirmPassword) {
      return res.render("user/register", {
        error: "Hai mật khẩu không khớp!",
      });
    }

    // mã hoá mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(password, salt);
    // lưu tài khoản vào db
    const user = new User({
      email: email,
      name: name,
      phone: phone,
      address: address,
      password: hashPassword,
    });
    await user.save();
    return res.render("user/login", { error: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.logout = (req, res) => {
  // Xoá tất cả các session của người dùng
  req.session.destroy();

  // Chuyển hướng người dùng đến trang chủ
  res.redirect("/");
};

exports.getProfile = async (req, res) => {
  try {
    // kiểm tra người dùng đã đăng nhập chưa
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }

    // lấy thông tin người dùng
    const userId = req.session.user._id;
    const infoUser = await User.findById(userId);

    const message = req.flash("success")[0];
    return res.render("user/profile", { infoUser, message });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getChangePassword = (req, res) => {
  // kiểm tra người dùng đã đăng nhập chưa
  if (!req.session.isLoggedIn) {
    return res.redirect("/user/sign-in");
  }
  return res.render("user/change-password", { error: "" });
};

exports.changePassword = async (req, res) => {
  try {
    // kiểm tra người dùng đã đăng nhập chưa
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }

    // lấy thông tin người dùng gửi lên
    const { password, newPassword, confirmNewPassword } = req.body;
    const userId = req.session.user._id;

    const user = await User.findById(userId);

    // kiểm tra mật khẩu cũ có khớp không
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      return res.render("user/change-password", {
        error: "Mật khẩu cũ không khớp",
      });
    }

    // kiểm tra 2 mật khẩu mới có khớp không
    if (newPassword !== confirmNewPassword) {
      return res.render("/user/change-password", {
        error: "Mật khẩu mới và nhập lại mật khẩu mới không khớp",
      });
    }

    // mã hoá mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(newPassword, salt);
    await User.findByIdAndUpdate({ _id: userId }, { password: hashPassword });
    req.flash("success", "Thay đổi mật khẩu thành công");
    return res.redirect("/user/profile");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getChangeInfo = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }
    const userId = req.session.user._id;
    const user = await User.findById(userId);
    return res.render("user/change-Info", { user, error: "" });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.changeInfo = async (req, res) => {
  try {
    if (!req.session.isLoggedIn) {
      return res.redirect("/user/sign-in");
    }
    const { name, phone, address } = req.body;
    const userId = req.session.user._id;
    if (!name) {
      const user = await User.findById(userId);
      return res.render("user/change-info", {
        user,
        error: "Họ và tên không được để trống",
      });
    }

    const updateUser = await User.findByIdAndUpdate(
      { _id: userId },
      { name, phone, address },
      { new: true }
    );
    req.session.user = updateUser;
    req.flash("success", "Thay đổi thông tin thành công");
    return res.redirect("/user/profile");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.getAllUser = async (req, res) => {
  try {
    const users = await User.find();
    const message = req.flash("success")[0];
    return res.render("admin/users", { users, message });
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (user.isBlocked) {
      user.isBlocked = false;
      req.flash("success", "Mở chặn tài khoản người dùng thành công");
    } else {
      user.isBlocked = true;
      req.flash("success", "Chặn tài khoản người dùng thành công");
    }
    await user.save();
    return res.redirect("/admin/users");
  } catch (error) {
    return res.render("partials/user/error", { error: error.message });
  }
};
