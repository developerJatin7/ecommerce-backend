import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            return null;
        }

        const response = await cloudinary.uploader.upload(
            localFilePath,
            {
                resource_type: "auto"
            }
        );

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {
        if (localFilePath && fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        console.log("Error uploading file to Cloudinary:", error);
        return null;
    }
};

const deleteFromCloudinary = async (publicIdOrUrl) => {
    try {
        if (!publicIdOrUrl) {
            return null;
        }

        let publicId = publicIdOrUrl;

        if (publicIdOrUrl.includes("cloudinary.com")) {
            const urlParts = publicIdOrUrl.split("/");
            const uploadIndex = urlParts.indexOf("upload");

            if (uploadIndex !== -1) {
                publicId = urlParts
                    .slice(uploadIndex + 1)
                    .join("/");

                publicId = publicId.replace(/^v\d+\//, "");
                publicId = publicId.replace(/\.[^.]+$/, "");
            }
        }

        return await cloudinary.uploader.destroy(
            publicId,
            {
                resource_type: "image"
            }
        );

    } catch (error) {
        console.log("Error deleting file from Cloudinary:", error);
        return null;
    }
};

export {
    uploadOnCloudinary,
    deleteFromCloudinary
};