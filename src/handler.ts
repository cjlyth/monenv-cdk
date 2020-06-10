import { S3 } from "aws-sdk"

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!

// From https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html
const handler = async function (event: any, context: any, callback: Function) {
    const S3Client = new S3()
    try {
        console.log("LogS3DataEvents")
        console.log("Received event:", JSON.stringify(event, null, 2))
        callback(null, "Finished")
        // const data = await S3Client.listObjectsV2({ Bucket: bucketName }).promise()
        // const dataLogObjects = await S3Client.listObjectsV2({
        //     Bucket: dataLogBucketName,
        // }).promise()
        // var body = {
        //     widgets: data.Contents!.map(function (e) {
        //         return e.Key
        //     }),
        //     dataLogs: dataLogObjects.Contents!.map(function (e) {
        //         return e.Key
        //     }),
        //     time: new Date().toISOString(),
        // }
    } catch (error) {
        console.log("Error handling event:", JSON.stringify(event, null, 2))
        callback(error)
    }
}

export { handler }
