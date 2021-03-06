import { PolicyStatement } from "@aws-cdk/aws-iam"
import { Function, Runtime, AssetCode } from "@aws-cdk/aws-lambda"
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import * as s3n from "@aws-cdk/aws-s3-notifications"
import s3 = require("@aws-cdk/aws-s3")

interface MonenvIngestLambdaStackProps extends StackProps {
    bucketTriggerLambdaName: string
    sensorLambdaName: string
    csvBucketName: string
}

export class MonenvIngestLambdaStack extends Stack {
    private lambdaFunction: Function
    private csvBucket: s3.Bucket
    private dataLogBucket: s3.Bucket

    constructor(scope: Construct, id: string, props: MonenvIngestLambdaStackProps) {
        super(scope, id, props)

        this.dataLogBucket = new s3.Bucket(this, "dataLogBucket")
        this.csvBucket = new s3.Bucket(this, props.csvBucketName)

        const lambdaReadPolicy = new PolicyStatement()
        lambdaReadPolicy.addActions("s3:ListBucket")
        lambdaReadPolicy.addResources(this.csvBucket.bucketArn)
        lambdaReadPolicy.addResources(this.dataLogBucket.bucketArn)

        const lambdaReadDataLogObjectsPolicy = new PolicyStatement()
        lambdaReadDataLogObjectsPolicy.addActions("s3:GetObject")
        lambdaReadDataLogObjectsPolicy.addResources(`${this.dataLogBucket.bucketArn}/*`)

        const lambdaWriteCSVLogObjectsPolicy = new PolicyStatement()
        lambdaWriteCSVLogObjectsPolicy.addActions("s3:PutObject")
        lambdaWriteCSVLogObjectsPolicy.addResources(`${this.csvBucket.bucketArn}/*`)

        const lambdaAllPolicy = new PolicyStatement()
        lambdaAllPolicy.addActions("s3:*Object")
        lambdaAllPolicy.addResources(this.csvBucket.bucketArn)

        this.lambdaFunction = new Function(this, props.bucketTriggerLambdaName, {
            functionName: props.bucketTriggerLambdaName,
            handler: "handler.handler",
            runtime: Runtime.NODEJS_12_X,
            code: new AssetCode(`./src/ingest-lambda`),
            memorySize: 256,
            timeout: Duration.seconds(5),
            environment: {
                BUCKET: this.csvBucket.bucketName,
                DATA_LOG_BUCKET: this.dataLogBucket.bucketName,
            },
            initialPolicy: [
                lambdaReadPolicy,
                lambdaAllPolicy,
                lambdaReadDataLogObjectsPolicy,
                lambdaWriteCSVLogObjectsPolicy,
            ],
        })
        this.dataLogBucket.addObjectCreatedNotification(
            new s3n.LambdaDestination(this.lambdaFunction),
            { prefix: "dataLog" }
        )

        this.lambdaFunction = new Function(this, props.sensorLambdaName, {
            functionName: props.sensorLambdaName,
            handler: "handler.handler",
            runtime: Runtime.NODEJS_12_X,
            code: new AssetCode(`./src/read-sensors-lambda`),
            memorySize: 256,
            timeout: Duration.seconds(5),
        })
    }
}
