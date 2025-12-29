const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'bid-strike-images';

export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
    width: number;
    height: number;
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
    if (!CLOUDINARY_CLOUD_NAME) {
        throw new Error('Cloudinary cloud name not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'bid-strike-images');

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
            method: 'POST',
            body: formData,
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Upload failed');
    }

    const data = await response.json();

    return {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
    };
}

export async function uploadMultipleToCloudinary(
    files: File[],
    onProgress?: (completed: number, total: number) => void
): Promise<CloudinaryUploadResult[]> {
    const results: CloudinaryUploadResult[] = [];

    for (let i = 0; i < files.length; i++) {
        const result = await uploadToCloudinary(files[i]);
        results.push(result);
        onProgress?.(i + 1, files.length);
    }

    return results;
}
