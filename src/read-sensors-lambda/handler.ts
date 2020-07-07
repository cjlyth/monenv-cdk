import { S3 } from "aws-sdk"
const readline = require("readline")
const stream = require("stream")

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!
const headerLineStart = "rtcDate"

const {
    StreamManagerClient, ReadMessagesOptions, MessageStreamDefinition, StrategyOnFull,
    ResourceNotFoundException,
} = require('aws-greengrass-core-sdk').StreamManager;
const STREAM_NAME = 'USB0';


function greengrassHandler(){
    console.log('TODO: implement the sensor read in JS');
}



setInterval(greengrassHandler, 5000);


const handler = async function (event: any, context: any) {
    return '';
}

export { handler }
