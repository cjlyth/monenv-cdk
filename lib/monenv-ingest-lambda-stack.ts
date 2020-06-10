import { PolicyStatement } from "@aws-cdk/aws-iam"
import { Function, Runtime, AssetCode } from "@aws-cdk/aws-lambda"
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import * as s3n from "@aws-cdk/aws-s3-notifications"
import s3 = require("@aws-cdk/aws-s3")

interface MonenvIngestLambdaStackProps extends StackProps {
    functionName: string
}

export class MonenvIngestLambdaStack extends Stack {
    private lambdaFunction: Function
    private csvBucket: s3.Bucket
    private dataLogBucket: s3.Bucket

    constructor(scope: Construct, id: string, props: MonenvIngestLambdaStackProps) {
        super(scope, id, props)

        this.dataLogBucket = new s3.Bucket(this, "dataLogBucket")
        this.csvBucket = new s3.Bucket(this, "csvBucket")

        const lambdaReadPolicy = new PolicyStatement()
        lambdaReadPolicy.addActions("s3:ListBucket")
        lambdaReadPolicy.addResources(this.csvBucket.bucketArn)
        lambdaReadPolicy.addResources(this.dataLogBucket.bucketArn)

        const lambdaAllPolicy = new PolicyStatement()
        lambdaAllPolicy.addActions("s3:*Object")
        lambdaAllPolicy.addResources(this.csvBucket.bucketArn)

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
            initialPolicy: [lambdaReadPolicy, lambdaAllPolicy],
        })
        this.dataLogBucket.addObjectCreatedNotification(
            new s3n.LambdaDestination(this.lambdaFunction),
            { prefix: "dataLog" }
        )
    }
}
