import { S3 } from "aws-sdk"
const readline = require("readline")
const stream = require("stream")

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!
const headerLineStart = "rtcDate"

const handler = async function (event: any, context: any, callback: Function) {
    const S3Client = new S3()
    const createWriteStream = (Bucket: string, Key: string) => {
        const writeStream = new stream.PassThrough()
        const uploadPromise = S3Client.upload({
            Bucket,
            Key,
            Body: writeStream,
        }).promise()
        return { writeStream, uploadPromise }
    }
    try {
        for (let record of event.Records) {
            const srcBucket = record.s3.bucket.name
            // Keys can have + instead of spaces and other non-ascii
            const srcKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "))
            try {
                const params = {
                    Bucket: srcBucket,
                    Key: srcKey,
                }
                var dataLog = await S3Client.getObject(params).promise()
                if (!dataLog || !dataLog.Body) {
                    continue
                }
                const s3ReadStream = S3Client.getObject(params).createReadStream()
                var readlineStream = readline.createInterface({
                    input: s3ReadStream,
                    terminal: false,
                })
                const { writeStream, uploadPromise } = createWriteStream(bucketName, srcKey)
                await new Promise((resolve, reject) => {
                    let hasHeader = false
                    readlineStream.on("line", function (line: string) {
                        if (line.startsWith(headerLineStart)) {
                            hasHeader = true
                        }
                        if (hasHeader) {
                            writeStream.write(`${line}\n`)
                        }
                    })
                    readlineStream.on("error", () => {
                        reject(`Error reading the lines from ${srcKey}`)
                    })
                    readlineStream.on("close", function () {
                        writeStream.end()
                        resolve()
                    })
                })
                await uploadPromise
            } catch (error) {
                console.error(error)
            }
        }
        callback(null, "Finished")
    } catch (error) {
        callback("Error handling event:", JSON.stringify(event, null, 2))
    }
}

export { handler }
