const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    console.log("Nom original reçu:", file.originalname);
    console.log("Mimetype reçu:", file.mimetype);

    let ext = path.extname(file.originalname);
    if (!ext || ext === "") {
      const mimeTypeMap = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "application/pdf": ".pdf",
      };
      ext = mimeTypeMap[file.mimetype] || ".png"; // Par défaut, ".bin" si inconnu
    }

    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

module.exports = upload;
