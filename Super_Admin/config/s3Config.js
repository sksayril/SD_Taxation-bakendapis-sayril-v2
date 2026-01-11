const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// Configure AWS S3 Client (v3)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// S3 configuration
const s3Config = {
  bucket: process.env.AWS_S3_BUCKET_NAME,
  region: process.env.AWS_REGION || 'us-east-1',
  acl: 'public-read', // Make uploaded files publicly readable
  folder: 'company-logos' // Folder within S3 bucket
};

// Function to generate unique filename
const generateFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `logo_${timestamp}_${randomString}.${extension}`;
};

// Function to upload file to S3
const uploadToS3 = async (file, folder = 'company-logos') => {
  try {
    const fileName = generateFileName(file.originalname);
    const key = `${folder}/${fileName}`;
    
    const uploadParams = {
      Bucket: s3Config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: s3Config.acl
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);
    
    // Construct the URL manually (AWS SDK v3 doesn't return Location in PutObjectCommand)
    const region = s3Config.region;
    const url = `https://${s3Config.bucket}.s3.${region}.amazonaws.com/${key}`;
    
    return {
      success: true,
      url: url,
      key: key,
      fileName: fileName
    };
  } catch (error) {
    console.error('S3 upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to delete file from S3
const deleteFromS3 = async (key) => {
  try {
    const deleteParams = {
      Bucket: s3Config.bucket,
      Key: key
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return { success: true };
  } catch (error) {
    console.error('S3 delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  s3Client, // Export s3Client for backward compatibility if needed
  s3Config,
  uploadToS3,
  deleteFromS3,
  generateFileName
};
