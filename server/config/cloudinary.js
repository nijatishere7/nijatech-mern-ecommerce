// Packages
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "nijatech_uploads",
    format: async (req, file) => {
      const extension = file.mimetype.split("/")[1];
      return ["jpg", "png", "jpeg"].includes(extension) ? extension : "jpg";
    },
    public_id: (req, file) => `avatar-${Date.now()}`,
  },
});

const upload = multer({ storage: storage });

export default upload;
