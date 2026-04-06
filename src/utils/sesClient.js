const { SESClient } = require("@aws-sdk/client-ses");
console.log("Access Key:", process.env.AWS_ACCESS_KEY);

const REGION = "ap-south-1";

const sesClient = new SESClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = { sesClient };
// snippet-end:[ses.JavaScript.createclientv3]