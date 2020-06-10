import { GitHubSourceAction, CodeBuildAction } from "@aws-cdk/aws-codepipeline-actions"
import { PolicyStatement } from "@aws-cdk/aws-iam"
import { Construct, Stack, StackProps, SecretValue } from "@aws-cdk/core"
import { PipelineProject, LinuxBuildImage } from "@aws-cdk/aws-codebuild"
import { Artifact, Pipeline } from "@aws-cdk/aws-codepipeline"
import { lambdaApiStackName, lambdaFunctionName } from "../bin/lambda"

interface CIStackProps extends StackProps {
    repositoryName: string
}

export class CIStack extends Stack {
    constructor(scope: Construct, name: string, props: CIStackProps) {
        super(scope, name, props)

        const pipeline = new Pipeline(this, "MonenvPipeline", {})

        const sourceOutput = new Artifact("SourceOutput")
        const sourceAction = new GitHubSourceAction({
            actionName: "GitHubAction",
            repo: "monenv-cdk",
            owner: "cjlyth",
            oauthToken: SecretValue.secretsManager("my-github-token"),
            output: sourceOutput,
        })
        pipeline.addStage({
            stageName: "Source",
            actions: [sourceAction],
        })
        this.createBuildStage(pipeline, sourceOutput)
    }

    private createBuildStage(pipeline: Pipeline, sourceOutput: Artifact) {
        const project = new PipelineProject(this, `MonenvBuildProject`, {
            environment: {
                buildImage: LinuxBuildImage.STANDARD_3_0,
            },
        })

        const cdkDeployPolicy = new PolicyStatement()
        cdkDeployPolicy.addActions(
            "cloudformation:GetTemplate",
            "cloudformation:CreateChangeSet",
            "cloudformation:DescribeChangeSet",
            "cloudformation:ExecuteChangeSet",
            "cloudformation:DescribeStackEvents",
            "cloudformation:DeleteChangeSet",
            "cloudformation:DescribeStacks",
            "cloudformation:DeleteStack",
            "s3:*Object",
            "s3:ListBucket",
            "s3:getBucketLocation",
            "lambda:UpdateFunctionCode",
            "lambda:GetFunction",
            "lambda:CreateFunction",
            "lambda:DeleteFunction",
            "lambda:GetFunctionConfiguration",
            "lambda:UpdateFunctionConfiguration",
            "lambda:AddPermission",
            "lambda:RemovePermission"
        )
        cdkDeployPolicy.addResources(
            this.formatArn({
                service: "cloudformation",
                resource: "stack",
                resourceName: "CDKToolkit/*",
            }),
            this.formatArn({
                service: "cloudformation",
                resource: "stack",
                resourceName: `${lambdaApiStackName}/*`,
            }),
            this.formatArn({
                service: "lambda",
                resource: "function",
                sep: ":",
                resourceName: lambdaFunctionName,
            }),
            this.formatArn({
                service: "lambda",
                resource: "function",
                sep: ":",
                resourceName: `${lambdaApiStackName}-BucketNotificationsHandler-*`,
            }),
            "arn:aws:s3:::cdktoolkit-stagingbucket-*"
        )
        const editOrCreateLambdaDependencies = new PolicyStatement()
        editOrCreateLambdaDependencies.addActions(
            "iam:GetRole",
            "iam:ListRolePolicies",
            "iam:GetRolePolicy",
            "iam:PassRole",
            "iam:CreateRole",
            "iam:AttachRolePolicy",
            "iam:PutRolePolicy",
            "s3:CreateBucket",
            "s3:PutBucketTagging",
        )
        editOrCreateLambdaDependencies.addResources("*")
        project.addToRolePolicy(cdkDeployPolicy)
        project.addToRolePolicy(editOrCreateLambdaDependencies)

        const buildOutput = new Artifact(`BuildOutput`)
        const buildAction = new CodeBuildAction({
            actionName: `Build`,
            project,
            input: sourceOutput,
            outputs: [buildOutput],
        })

        pipeline.addStage({
            stageName: "build",
            actions: [buildAction],
        })

        return buildOutput
    }
}
