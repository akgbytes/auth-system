import multer from "multer";
import path from "path";
import { CustomError } from "../utils/CustomError";
import { ResponseStatus } from "../utils/constants";

const storage = multer.diskStorage({
  destination: function (req, res, cb) {
    cb(null, "./public/uploads");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extention = path.extname(file.originalname);
    // avatar-123.png
    cb(null, `${file.fieldname}-${uniqueSuffix}${extention}`);
  },
});

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new CustomError(ResponseStatus.BadRequest, "Only image files are allowed!"));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1000 * 1000,
  },
});
