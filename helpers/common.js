const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
const { fromEnv } = require("@aws-sdk/credential-provider-env");

const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: fromEnv(),
});

const common = {
  checkAge: (dob) => {
    const my_dob = new Date(dob);
    const today = new Date();
    const max_dob = new Date(today.getFullYear() - 15, today.getMonth(), today.getDate());
    return max_dob.getTime() > my_dob.getTime();
  },

  isValidMongoId: (id) => {
    const objectIdPattern = /^[0-9a-fA-F]{24}$/;
    return objectIdPattern.test(id);
  },

  sendEmail: async (emailCreds) => {
    try {
      const params = {
        Source: process.env.VERIFIED_SENDER_EMAIL?.trim(),
        Destination: {
          ToAddresses: [emailCreds?.reciverEmail],
        },
        Message: {
          Subject: {
            Data: `Regarding your connection Request to ${emailCreds?.requestedPersonName}`,
          },
          Body: {
            Html: {
              Data: `<p>Hello, <b>${emailCreds?.recieverName}!</b></p><br/><p>We are writing to inform you that your connection request to <b>${emailCreds?.requestedPersonName}</b> has been <b>${emailCreds?.requestStatus}</b>.</p><br /><p>Thanks for using Meet n Greet powered by <b>Ujjwal Industries Ltd</b>.</p>`,
            },
          },
        },
      };

      const command = new SendEmailCommand(params);
      await sesClient.send(command);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  },
};

module.exports = common;
