const multer = require("multer");
/**
 * defines the media types supported for the uploaded images files
 */
const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
};

//setting up the path (destination) and the filename for the uploaded files
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(" ").join("_");
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + "." + extension);
    },
});

module.exports = multer({
    storage: storage
}).single("image");