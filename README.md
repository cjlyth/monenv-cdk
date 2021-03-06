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


## Application Design

### Lambda 

#### Read Sensor Lambda

_GOTCHA_

I didn't [follow the instructions](https://github.com/aws/aws-greengrass-core-sdk-js/) on setting up my raspberry pi!
```
uname -m
curl https://nodejs.org/dist/v12.18.2/node-v12.18.2-linux-armv7l.tar.xz -o node-v12.18.2-linux-armv7l.tar.xz
tar xavf node-v12.18.2-linux-armv7l.tar.xz
sudo mv node-v12.18.2-linux-armv7l /opt/node-v12
rm node-v12.18.2-linux-armv7l.tar.xz
sudo cp /opt/node-v12/bin/node /usr/local/bin/nodejs12.x


```


This lambda is designed to be deployed to the greengrass group. 
In my case it's a raspberry pi which has my sensor setup plugged in. 
In order to use a lambda with greengrass, it has to be published and a static reference has to be used in greengrass.

The recommended way to manage this is with a lambda version alias. 
In my case, the `PRODUCTION` alias will be used.
The development process is something like this:

1. Change handler code in this project
2. push changes to github
3. wait for CI to complete
4. publish new version of the lambda 
    ```
    aws lambda publish-version --function-name MonenvSensorLambdaFunction
    ```
5. update the version alias (replace the version in the command below with the output from the command above)
    ```
    aws lambda update-alias  --function-name MonenvSensorLambdaFunction \
      --name PRODUCTION --function-version 1
    ``` 
6. redeploy the greengrass group. For this you can list the group info and just reuse the `id` and `version` in the following command.
    ```
    aws greengrass create-deployment \
        --deployment-type NewDeployment \
        --group-id fb69a061-0ac0-4766-a2c6-3df02ffebc9a \
        --group-version d24928b0-ac88-4829-8bdb-d39e17bdbf3e
    ```


## Useful notes

### Cleaning up S3

During development I often destroy the environment during the periods I am not working on this project. 
This orphans s3 buckets so I use this script to clean up the buckets.
_This script is destructive_

```bash
aws s3 ls | cut -f3 -d' ' | grep monenv | xargs -I{} aws s3 rb s3://{} --force 

```

_I occasionally run into issues when editing the stack where resources get orphaned. 
 I need to determine why this is happening and how to prevent it._