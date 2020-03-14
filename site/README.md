# Site - csgotrader.app
It is a React project that was initialized with `create-react-app`.

## Development
For development, use `npm run start` that comes with hot reload. 

## Build and Deploy
AWS CodeBuild does the deployment using the `buildspec.yml` config.
It builds the project, pushes it the S3 then invalidates the CloudFront distribution.