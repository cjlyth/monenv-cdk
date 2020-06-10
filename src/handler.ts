import { S3 } from "aws-sdk"

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!

// From https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html
const handler = async function (event: any, context: any, callback: Function) {
    const S3Client = new S3()
    try {
        console.log("LogS3DataEvents")
        
        for (let record of event.Records) {
            const srcBucket = record.s3.bucket.name;
            // Keys can have + instead of spaces and other non-ascii
            const srcKey    = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
            try {
                const params = {
                    Bucket: srcBucket,
                    Key: srcKey
                };
                var dataLog = await S3Client.getObject(params).promise();
                console.log('dataLog: ', dataLog);
            } catch (error) {
                console.log(error);
                return;
            }  
        }

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
