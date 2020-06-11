import { PolicyStatement } from "@aws-cdk/aws-iam"
import { Function, Runtime, AssetCode } from "@aws-cdk/aws-lambda"
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core"
import * as s3n from "@aws-cdk/aws-s3-notifications"
import s3 = require("@aws-cdk/aws-s3")
import * as glue from "@aws-cdk/aws-glue"

interface MonenvLogGlueStackProps extends StackProps {
    csvBucketName: string
}

export class MonenvLogGlueStack extends Stack {
    private csvBucket: s3.IBucket

    constructor(scope: Construct, id: string, props: MonenvLogGlueStackProps) {
        super(scope, id, props)

        this.csvBucket = s3.Bucket.fromBucketName(this, "importedCsvBucket", props.csvBucketName)

        const database = new glue.Database(this, "MonenvDatabase", {
            databaseName: "monenv_database",
        })

        const table = new glue.Table(this, "MonenvLogs", {
            database: database,
            tableName: "monenvlogs",
            columns: [
                {
                    name: "rtcDate",
                    type: glue.Schema.DATE,
                },
                {
                    name: "rtcTime",
                    type: glue.Schema.STRING,
                },
                {
                    name: "aX",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "aY",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "aZ",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "gX",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "gY",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "gZ",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "mX",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "mY",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "mZ",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "imu_degC",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "tvoc_ppb",
                    type: glue.Schema.BIG_INT,
                },
                {
                    name: "co2_ppm",
                    type: glue.Schema.BIG_INT,
                },
                {
                    name: "pressure_Pa",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "humidity_%",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "altitude_m",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "temp_degC",
                    type: glue.Schema.DOUBLE,
                },
                {
                    name: "output_Hz",
                    type: glue.Schema.DOUBLE,
                },
            ],
            dataFormat: glue.DataFormat.JSON,
        })
    }
}
