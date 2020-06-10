# What's this?

This project is based on the [aws samples repo](https://github.com/aws-samples/aws-cdk-examples/tree/master/typescript/lambda-api-ci).

There are two stacks included here
* `CIStack` creates the CI/CD infrastructure using GitHub, CodePipeline, and CodeBuild
* `MonenvIngestLambdaStack` creates the infrastructure to run the lambda. This includes the s3 buckets for the processing steps

## Secrets

I switched the sample project to github and in the process to use a secret for authentication. 
Make sure you generate a personal access token in GutHub with appropriate privileges .
Your access token should have access to the repo and to manage the webhooks. 
The `cdk deploy` command will create a github webhook according to the `trigger` prop for the `GitHubSourceAction` in the [ci-stack](lib/ci-stack.ts).


Once you have your personal access token, add it as a secret with a command like this. 
_Make sure you use the same name or update the code accordingly_

```
aws secretsmanager create-secret --name my-github-token --secret-string YOUR_TOKEN_HERE
```

## What's really going on here

When you run `cdk deploy`, the toolchain follows roughly this process. 

1. read metadata from `cdk.json`
2. process `bin/ci.ts`
3. process `lib/ci-stack.ts`
4. generate CloudFormation template for the loaded CDK constructs 
5. deploy CloudFormation template

Once that's done, you can start editing the Lambda stack or code and deploy changes with `git push`.
When you push your changes to GitHub, the webhook that was created with the `cdk deploy` triggers the AWS CodePipeline which follows roughly this process.

1. Check the project out from GitHub
2. Start CodeBuild based on `buildspec.yml` 
3. process `bin/lambda.ts`
4. process `lib/monenv-ingest-lambda-stack.ts`
5. generate CloudFormation template for the loaded CDK constructs 
6. deploy CloudFormation template

You should now have a running system. 
Upload a log file to the dataLogs bucket and check the csvBucket which should soon have the processed files.


_I occasionally run into issues when editing the stack where resources get orphaned. 
 I need to determine why this is happening and how to prevent it._