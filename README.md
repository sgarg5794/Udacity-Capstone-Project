# Serverless Daily Notes Application

Serverless notes application where a user can note down their notes about a subject.


## Application Functionality

- [x] **A user needs to authenticate in order to use an application home: Please check screenshots folder**
- [x] **The application allows users to create, update, delete notes items.**
- [x] **The application allows users to upload a notes file.**
- [x] **The application displays items/Notes for a logged in user.**

There is a front end :
The frontend calls the serverless application and the code for frontend is deployed in front end folder .

There is a backend:
The backend is developed using serverless framework .

Code uses async and promises w/o using call backs .

#### Authentication

Authentication in this application, is done using [Auth0](https://auth0.com/).
- https://auth0.com/blog/navigating-rs256-and-jwks/

### Backend

#### Development

In order to run local developments, the following packages are needed:
- [serverless](https://github.com/serverless/serverless)
- [serverless-offline](https://github.com/dherault/serverless-offline)
- [serverless-dynamodb-local](https://github.com/99xt/serverless-dynamodb-local)
- [serverless-s3-local](https://github.com/ar90n/serverless-s3-local)

**Dependency Installation**

We need to configure serverless to access AWS. We can do this by running :

`serverless config credentials --provider aws --key KEY --secret SECRET`

>Where KEY and SECRET are our AWS Key and secret key. 
```bash
npm install -g serverless
npm install -g serverless-offline
serverless plugin install --name serverless-dynamodb-local
serverless plugin install --name serverless-s3-local
```
**Run serverless offline**

```bash
cd backend
npm i
export IS_OFFLINE=true
serverless offline --httpPort 3050 --printOutput
```
Run the following command which will start a dynamoDb and s3 instance locally:
```bash
cd backend
serverless dynamodb install
serverless dynamodb start &
serverless s3 create
serverless s3 start &
```

#### Deployment
Run the following commands to deploy application:

```bash
cd backend
export NODE_OPTIONS=--max_old_space_size=8192
npm install
serverless deploy -v
```

### The Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```bash
cd client
npm install
# To run in local :
export IS_APP_OFFLINE=false
npm run start
```

or, Run Docker :
```bash
docker build -t "$USER/$(basename $PWD)" .
docker run -it --rm -v ${PWD}:/app -p 8081:8081 "$USER/$(basename $PWD)"
```

## Postman API

You can find a Postman collection in this project. Import the collection present in the root path to test the API.

