const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<h1>Hello from DevTinder!</h1>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "Hello from DevTinder!",
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: "DevTinder Test Email",
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

// src/utils/sendEmail.js
const run = async (toEmailId, firstName, subject, body) => {
  const sendEmailCommand = createSendEmailCommand(
    "manav157sh@gmail.com",
    "manav@devtinders.app", // Your verified sender
    subject,
    body
  );

  try {
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    console.error(caught);
    throw caught;
  }
};

// snippet-end:[ses.JavaScript.email.sendEmailV3]
module.exports = { run };