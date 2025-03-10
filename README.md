# S3 to Azure Sync

This project synchronizes files from an AWS S3 bucket to an Azure Blob Storage container. It uses the Serverless Framework to deploy the necessary AWS Lambda functions and other resources.

## Environment Variables

The following environment variables need to be set for the project to work:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID.
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key.
- `AZURE_STORAGE_ACCOUNT`: Your Azure storage account name.
- `AZURE_STORAGE_ACCESS_KEY`: Your Azure storage account access key.
- `SOURCE_S3_BUCKET`: The name of the source S3 bucket.
- `DESTINATION_AZURE_CONTAINER`: The name of the destination Azure Blob Storage container.

## Prerequisites

- AWS CLI must be installed and configured to the proper account.
- Serverless Framework must be installed globally.

## Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/s3-azure-sync.git
    cd s3-azure-sync
    ```

2. Install the dependencies:
    ```bash
    npm install
    ```

## Deployment

To deploy the project using the Serverless Framework, run the following command:

```bash
serverless deploy
```

This will deploy the necessary AWS Lambda functions and other resources defined in the `serverless.yml` file.

## Usage

Once deployed, the Lambda functions will automatically synchronize files from the specified S3 bucket to the Azure Blob Storage container based on the triggers defined in the `serverless.yml` file.

## AWS CLI Configuration

Ensure that your AWS CLI is configured to the proper account:

```bash
aws configure
```

You will be prompted to enter your AWS access key ID, secret access key, region, and output format.

