const userRouter = require("./user.routes");
const shopRouter = require("./shop.routes");
const adminRouter = require("./admin.routes");
const { authAdmin } = require("../middleware/auth");

const routes = (app) => {
  // Đặt middleware để truyền biến currentUser cho tất cả các view
  app.use((req, res, next) => {
    res.locals.currentUser = req.session.user;
    res.locals.currentPage = req.path;
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.message = req.session.message;
    res.locals.cart = req.session.cart;
    next();
  });

  // route user
  app.use("/user", userRouter);

  // route admin
  app.use("/admin", authAdmin, adminRouter);

  // route shop
  app.use("/", shopRouter);
};

module.exports = routes;
