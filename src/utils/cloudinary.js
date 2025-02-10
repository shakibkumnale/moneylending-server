import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import fs from "fs"

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
console.log(process.env.CLOUDINARY_CLOUD_NAME);
console.log(process.env.CLOUDINARY_API_KEY);
console.log(process.env.CLOUDINARY_API_SECRET);

export const uploadOnCloudinary = async (buffer, filename) => {
    try {
        const result = await cloudinary.v2.uploader.upload_stream({
            resource_type: 'image',
            public_id: filename,
            folder: 'avatars'
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                return null;
            }
            return result;
        }).end(buffer);
        return result;
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
};