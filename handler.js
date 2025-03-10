require('dotenv').config();
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { BlobServiceClient } = require('@azure/storage-blob');
const { PassThrough } = require('stream'); // if needed, but using plain stream events

// Helper to convert stream to buffer
const streamToBuffer = async (stream) => {
	return new Promise((resolve, reject) => {
		const chunks = [];
		stream.on('data', (chunk) => chunks.push(chunk));
		stream.on('error', reject);
		stream.on('end', () => resolve(Buffer.concat(chunks)));
	});
};

module.exports.s3Handler = async (event) => {
	// Create a new S3Client instance inside the handler to allow proper mocking
	const s3 = new S3Client({});
	const record = event.Records[0];
	const srcBucket = record.s3.bucket.name;
	const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

	const params = {
		Bucket: srcBucket,
		Key: srcKey,
	};

	try {
		const data = await s3.send(new GetObjectCommand(params));
		const bodyBuffer = await streamToBuffer(data.Body);

		const AZURE_STORAGE_ACCOUNT = process.env.AZURE_STORAGE_ACCOUNT;
		const AZURE_STORAGE_ACCESS_KEY = process.env.AZURE_STORAGE_ACCESS_KEY;
		const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME;

		const blobServiceClient = BlobServiceClient.fromConnectionString(
			`DefaultEndpointsProtocol=https;AccountName=${AZURE_STORAGE_ACCOUNT};AccountKey=${AZURE_STORAGE_ACCESS_KEY};EndpointSuffix=core.windows.net`
		);

		const containerClient = blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
		const blockBlobClient = containerClient.getBlockBlobClient(srcKey);

		await blockBlobClient.upload(bodyBuffer, bodyBuffer.length);

		console.log(`Successfully copied ${srcKey} from S3 to Azure Blob Storage`);
	} catch (error) {
		console.error(`Error copying ${srcKey} from S3 to Azure Blob Storage:`, error);
		throw error;
	}
};
