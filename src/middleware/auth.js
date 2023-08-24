exports.authAdmin = (req, res, next) => {
  if (req.session.isLoggedIn && req.session.user.role === "admin") {
    next();
  } else {
    return res.redirect("/");
  }
};
