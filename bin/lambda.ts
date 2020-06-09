#!/usr/bin/env node
import "source-map-support/register"
import cdk = require("@aws-cdk/core")
import { MonenvIngestLambdaStack } from "../lib/monenv-ingest-lambda-stack"

export const lambdaApiStackName = "MonenvIngestLambdaStack"
export const lambdaFunctionName = "MonenvIngestLambdaFunction"

const app = new cdk.App()
new MonenvIngestLambdaStack(app, lambdaApiStackName, {
    functionName: lambdaFunctionName,
})
