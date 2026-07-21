import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure lazily in the upload function or just wrap it
// to avoid crashing the whole app on boot if env vars are missing.
const getCloudinaryConfig = () => {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are not set');
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Upload a file buffer to Cloudinary under the "contracts" folder.
 * Returns the public URL and public ID.
 */
export async function uploadContractFile(
  fileBuffer: Buffer,
  fileName: string,
  fileType: string
): Promise<{ url: string; publicId: string }> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || "";
  const apiKey = process.env.CLOUDINARY_API_KEY || "";
  const isPlaceholder = !cloudName || !apiKey || apiKey.includes("your_api_key") || cloudName.includes("your_cloud_name");

  if (isPlaceholder) {
    const fs = await import("fs");
    const path = await import("path");
    const uploadDir = path.join(process.cwd(), "public", "uploads", "contracts");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const cleanFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
    const filePath = path.join(uploadDir, cleanFileName);
    fs.writeFileSync(filePath, fileBuffer);

    return {
      url: `/uploads/contracts/${cleanFileName}`,
      publicId: `local_${cleanFileName}`,
    };
  }

  getCloudinaryConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'contracts',
        resource_type: 'auto',
        public_id: `${Date.now()}_${fileName}`,
        filename_override: fileName,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('No result from Cloudinary'));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    const readable = new Readable();
    readable._read = () => {};
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
}
