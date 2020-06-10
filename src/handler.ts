import { S3 } from "aws-sdk"
var readline = require('readline');
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
                if (!dataLog || !dataLog.Body) {
                    continue;
                }
                    
                
                const s3ReadStream = S3Client.getObject(params).createReadStream();
                var readlineStream = readline.createInterface({input: s3ReadStream, terminal: false});
                
                await new Promise((resolve, reject) => {
                    let lines = 0;
                    readlineStream.on('line', function (line: string) {
                        //Do whatever you need with the line
                        console.log(`line: ${line}`);
                        lines++;
                    });
                    readlineStream.on('error', () => {
                        console.log('error');
                    });
                    readlineStream.on('close', function () {
                        // TODO: write file?
                        //In this example I'll just print to the log the total number of lines:        
                        console.log(`${srcKey} has ${lines} lines`);
                        resolve();
                    });
                });
                
                // console.log('dataLog: ', dataLog.Body.toString('ascii'));
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
