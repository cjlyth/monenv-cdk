# What's this?
This is _a modified_ code sample that uses CDK to:
* Create a Lambda function that can be invoked using a s3 bucket trigger
* Create a CI using CodeSuite that deploys the Lambda+s3 esources using `cdk deploy`


I switched this sample project to github and in the process to use a secret for authentication. 
Make sure you generate a personal access token with appropriate privileges and add it as a secret with a command like this.

```
aws secretsmanager create-secret --name my-github-token --secret-string YOUR_TOKEN_HERE
```

Your access token should have access to the repo and to manage the webhooks. 
The `cdk deploy` command will create a github webhook according to the `trigger` prop for the `GitHubSourceAction` in the [ci-stack](lib/ci-stack.ts).

