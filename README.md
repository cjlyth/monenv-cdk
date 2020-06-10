# What's this?
This is _a modified_ code sample that uses CDK to:
* Create a Lambda function that can be invoked using a lambda trigger
* Create a CI using CodeSuite that deploys the Lambda+s3 esources using `cdk deploy`


I switched this project to github and in the process to use a secret for authentication. 
Make sure you generate a personal access token with appropriate privileges and add it as a secret with a command like this.
```
aws secretsmanager create-secret --name my-github-token --secret-string YOUR_TOKEN_HERE
```

# How do I start using it?
* Ensure you've followed the [guide to Getting Started to AWS CDK](https://docs.aws.amazon.com/cdk/latest/guide/getting_started.html), and you have CDK installed, and the AWS SDK installed and credentials configured. 
* [Bootstrap your AWS environment](https://docs.aws.amazon.com/cdk/latest/guide/serverless_example.html#serverless_example_deploy_and_test)
* Create a CodeCommit repository. See [this documentation](https://docs.aws.amazon.com/codecommit/latest/userguide/how-to-create-repository.html) for help.
* Place the contents of this folder inside it
* Set the repository name in the `repositoryName` prop in `bin/ci.ts`.
* Build the stack with `npm run build`
* Deploy the CI stack with `cdk deploy`
* `Todo` summarize permissions
    * If you'd like to deploy just the Lambda+ApiGateway stack, you can do so with `cdk deploy -a "npx ts-node bin/lambda.ts"`