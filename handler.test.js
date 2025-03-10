const { Readable } = require('stream');
const { BlobServiceClient } = require('@azure/storage-blob');
const { s3Handler } = require('./handler');

// Remove any AWS environment variables that might trigger a real call
delete process.env.AWS_ACCESS_KEY_ID;
delete process.env.AWS_SECRET_ACCESS_KEY;
delete process.env.AWS_SESSION_TOKEN;

// Ensure proper mocking of new S3 client
jest.mock('@aws-sdk/client-s3', () => {
	const originalModule = jest.requireActual('@aws-sdk/client-s3');
	return {
		...originalModule,
		S3Client: jest.fn(),
		GetObjectCommand: jest.fn(),
	};
});

// Helper to create a readable stream from a Buffer
const createReadableStreamFromBuffer = (buffer) => {
	const stream = new Readable();
	stream.push(buffer);
	stream.push(null);
	return stream;
};

describe('s3Handler', () => {
	let sendMock;
	const { S3Client } = require('@aws-sdk/client-s3');

	beforeEach(() => {
		process.env.AZURE_STORAGE_ACCOUNT = 'fakeaccount';
		process.env.AZURE_STORAGE_ACCESS_KEY = 'fakekey';
		process.env.AZURE_CONTAINER_NAME = 'fakecontainer';
		sendMock = jest.fn();
		S3Client.mockImplementation(() => ({ send: sendMock }));
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

	it('should copy object from S3 to Azure Blob Storage', async () => {
		const fakeBuffer = Buffer.from('fake data');
		sendMock.mockResolvedValue({
			Body: createReadableStreamFromBuffer(fakeBuffer),
		});

		const mockUpload = jest.fn().mockResolvedValue({});
		BlobServiceClient.fromConnectionString = jest.fn().mockReturnValue({
			getContainerClient: jest.fn().mockReturnValue({
				getBlockBlobClient: jest.fn().mockReturnValue({
					upload: mockUpload,
				}),
			}),
		});

		const event = {
			Records: [
				{
					s3: {
						bucket: { name: 'fakebucket' },
						object: { key: 'fakekey' },
					},
				},
			],
		};

		await s3Handler(event);
		expect(mockUpload).toHaveBeenCalledWith(fakeBuffer, fakeBuffer.length);
		console.log(`Successfully copied fakekey from S3 to Azure Blob Storage`);
	});

	it('should handle errors during copy', async () => {
		const mockError = new Error('S3 getObject error');
		sendMock.mockRejectedValue(mockError);

		const event = {
			Records: [
				{
					s3: {
						bucket: { name: 'fakebucket' },
						object: { key: 'fakekey' },
					},
				},
			],
		};

		await expect(s3Handler(event)).rejects.toThrow('S3 getObject error');
		console.error(`Error copying fakekey from S3 to Azure Blob Storage:`, mockError);
	});
});
