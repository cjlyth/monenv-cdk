import { S3 } from "aws-sdk"

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!

// From https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html
const handler = async function (event: any, context: any) {
    const S3Client = new S3()

    try {
        var method = event.httpMethod

        if (method === "GET") {
            if (event.path === "/") {
                const data = await S3Client.listObjectsV2({ Bucket: bucketName }).promise()
                const dataLogObjects = await S3Client.listObjectsV2({
                    Bucket: dataLogBucketName,
                }).promise()
                var body = {
                    widgets: data.Contents!.map(function (e) {
                        return e.Key
                    }),
                    dataLogs: dataLogObjects.Contents!.map(function (e) {
                        return e.Key
                    }),
                    time: new Date().toISOString(),
                }
                return {
                    statusCode: 200,
                    headers: {},
                    body: JSON.stringify(body),
                }
            }
        }

        // We only accept GET for now
        return {
            statusCode: 400,
            headers: {},
            body: "We only accept GET /",
        }
    } catch (error) {
        const body = error.stack || JSON.stringify(error, null, 2)
        return {
            statusCode: 400,
            headers: {},
            body: JSON.stringify(body),
        }
    }
}

export { handler }
