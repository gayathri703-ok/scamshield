const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function (req, file, cb) {

    const uniqueName =
      Date.now() +
      path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp"
  ];

  if (allowedTypes.includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(new Error("Only image files allowed"), false);

  }

};

const upload = multer({

  storage,

  limits: {
    fileSize: 5 * 1024 * 1024
  },

  fileFilter

});

module.exports = upload;