import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImages = upload.fields([
    { name: "image", maxCount: 1 }, // For single event image
    { name: "eventGallery", maxCount: 10 }, // For multiple gallery images
]);
