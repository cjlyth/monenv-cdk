#!/usr/bin/env node
import "source-map-support/register"
import cdk = require("@aws-cdk/core")
import { MonenvIngestLambdaStack } from "../lib/monenv-ingest-lambda-stack"
import { MonenvLogGlueStack } from "../lib/monenv-log-glue-stack"

export const lambdaApiStackName = "MonenvIngestLambdaStack"
export const lambdaFunctionName = "MonenvIngestLambdaFunction"
export const sensorLambdaFunctionName = "MonenvSensorLambdaFunction"
export const csvBucketName = "csvBucket"

const app = new cdk.App()
const lambdaStack = new MonenvIngestLambdaStack(app, lambdaApiStackName, {
    bucketTriggerLambdaName: lambdaFunctionName,
    sensorLambdaName: sensorLambdaFunctionName,
    csvBucketName: csvBucketName,
})
