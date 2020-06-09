import { LambdaIntegration, MethodLoggingLevel, RestApi } from "@aws-cdk/aws-apigateway"
import { PolicyStatement } from "@aws-cdk/aws-iam"
import { Function, Runtime, AssetCode, Code } from "@aws-cdk/aws-lambda"
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import s3 = require("@aws-cdk/aws-s3")

interface MonenvIngestLambdaStackProps extends StackProps {
    functionName: string
}

export class MonenvIngestLambdaStack extends Stack {
    private restApi: RestApi
    private lambdaFunction: Function
    private csvBucket: s3.Bucket
    private dataLogBucket: s3.Bucket

    constructor(scope: Construct, id: string, props: MonenvIngestLambdaStackProps) {
        super(scope, id, props)

        this.dataLogBucket = new s3.Bucket(this, "dataLogBucket")
        this.csvBucket = new s3.Bucket(this, "csvBucket")

        this.restApi = new RestApi(this, this.stackName + "RestApi", {
            deployOptions: {
                stageName: "beta",
                metricsEnabled: true,
                loggingLevel: MethodLoggingLevel.INFO,
                dataTraceEnabled: true,
            },
        })

        const lambdaPolicy = new PolicyStatement()
        lambdaPolicy.addActions("s3:ListBucket")
        lambdaPolicy.addResources(this.csvBucket.bucketArn)
        lambdaPolicy.addResources(this.dataLogBucket.bucketArn)

        this.lambdaFunction = new Function(this, props.functionName, {
            functionName: props.functionName,
            handler: "handler.handler",
            runtime: Runtime.NODEJS_12_X,
            code: new AssetCode(`./src`),
            memorySize: 512,
            timeout: Duration.seconds(10),
            environment: {
                BUCKET: this.csvBucket.bucketName,
                DATA_LOG_BUCKET: this.dataLogBucket.bucketName,
            },
            initialPolicy: [lambdaPolicy],
        })

        this.restApi.root.addMethod("GET", new LambdaIntegration(this.lambdaFunction, {}))
    }
}
