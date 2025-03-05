import multer from "multer";

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImages = upload.fields([
    { name: "image", maxCount: 1 }, // For single event image
    { name: "eventGalleryFile", maxCount: 10 },
    { name: "certificateImage", maxCount: 1 },
    { name: "artWorkGallery", maxCount: 100 },
    //{ name: "eventGallery", maxCount: 10 }, // For multiple gallery images
]);
