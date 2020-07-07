import { S3 } from "aws-sdk"
const readline = require("readline")
const stream = require("stream")

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!
const headerLineStart = "rtcDate"

const handler = async function (event: any, context: any, callback: Function) {
    try {
        callback(null, "Finished")
    } catch (error) {
        callback("Error handling event:", JSON.stringify(event, null, 2))
    }
}

export { handler }
