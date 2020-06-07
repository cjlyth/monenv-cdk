#!/usr/bin/env node
import "source-map-support/register"
import cdk = require("@aws-cdk/core")
import { MonenvIngestLambdaStack } from "../lib/monenv-ingest-lambda-stack"

export const lambdaApiStackName = "CDKExampleLambdaApiStack"
export const lambdaFunctionName = "CDKExampleWidgetStoreFunction"

const app = new cdk.App()
new MonenvIngestLambdaStack(app, lambdaApiStackName, {
    functionName: lambdaFunctionName,
})
