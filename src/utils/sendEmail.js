const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const createSendEmailCommand = (toAddress, fromAddress, subject, body) => {
  return new SendEmailCommand({
    Destination: {
      CcAddresses: [],
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: body,
        },
        Text: {
          Charset: "UTF-8",
          Data: body.replace(/<[^>]*>?/gm, ""),
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async (toEmailId, firstName, subject, body) => {
  const sendEmailCommand = createSendEmailCommand(
    toEmailId,
    "manav@devtinders.app",
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

module.exports = { run };