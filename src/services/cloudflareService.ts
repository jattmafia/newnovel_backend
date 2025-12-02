import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { config } from '../config/env';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: config.cloudflareR2Endpoint,
    credentials: {
        accessKeyId: config.cloudflareR2AccessKeyId,
        secretAccessKey: config.cloudflareR2SecretAccessKey,
    },
});

export async function uploadProfilePicture(
    file: Express.Multer.File,
    userId: string
): Promise<string> {
    if (!file) {
        throw new Error('No file provided');
    }

    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
    }

    const fileName = `profile-pictures/${userId}-${Date.now()}-${file.originalname}`;

    try {
        const command = new PutObjectCommand({
            Bucket: config.cloudflareR2BucketName,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await s3Client.send(command);
        const imageUrl = `${config.cloudflareR2Endpoint}/${fileName}`;
        console.log(`✓ Profile picture uploaded: ${imageUrl}`);
        return imageUrl;
    } catch (error) {
        console.error('Cloudflare upload error:', error);
        throw new Error('Failed to upload image to Cloudflare');
    }
}
