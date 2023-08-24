const multer  = require('multer');
var appRoot = require('app-root-path');

// Định nghĩa phương thức lưu trữ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, appRoot + '/src/public/images/products')
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, file.fieldname + '-' + uniqueSuffix)
    }
})

// Định nghĩa filter để chỉ chấp nhận các file ảnh
const imageFilter = function (req, file, cb) {
  // Kiểm tra kiểu tệp tin
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ được tải lên các file ảnh!'), false);
  }
};
  
exports.upload = multer({ storage: storage });