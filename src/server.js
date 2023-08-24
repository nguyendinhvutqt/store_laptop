const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const session = require("express-session");

require("dotenv").config();

const ConnectDB = require("./configs/db/ConnectDB");
const routes = require("./routes/index");

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SECRET_KEY_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Sử dụng flash
app.use(flash());

// cấu hình ejs
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// kết nối đến mongodb
ConnectDB(process.env.CONNECTION_STRING);

// tạo routes
routes(app);

app.listen(port, () => {
  console.log("listening on port " + port);
});
