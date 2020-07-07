import { S3 } from "aws-sdk"
const readline = require("readline")
const stream = require("stream")

const bucketName = process.env.BUCKET!
const dataLogBucketName = process.env.DATA_LOG_BUCKET!
const headerLineStart = "rtcDate"

const {
    StreamManagerClient, ReadMessagesOptions, ExportDefinition,
    KinesisConfig, MessageStreamDefinition, StrategyOnFull,
    ResourceNotFoundException,
} = require('aws-greengrass-core-sdk').StreamManager;
const STREAM_NAME = 'USB0';

const c = new StreamManagerClient();
c.onConnected(async () => {
    // Try deleting the stream (if it exists) so that we have a fresh start
    try {
        await c.deleteMessageStream(STREAM_NAME);
    } catch (e) {
        // Rethrow the error if it wasn't the expected error
        if (!(e instanceof ResourceNotFoundException)) {
            throw e;
        }
    }

    try {

        await c.createMessageStream(
            new MessageStreamDefinition()
                .withName(STREAM_NAME)
                .withStrategyOnFull(StrategyOnFull.OverwriteOldestData),
        );

        // Try reading the 2 messages we just appended and print them out
        console.log(`Successfully read 2 messages: ${
            await c.readMessages(STREAM_NAME,
                new ReadMessagesOptions()
                    .withMinMessageCount(2)
                    .withReadTimeoutMillis(1000))}`);
    } catch {
        c.close();
    }
});




const handler = async function (event: any, context: any) {
    return '';
}

export { handler }
