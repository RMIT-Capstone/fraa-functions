const sgMail = require('@sendgrid/mail');
const SENDGRID_API_KEY = require('../../config/SendGridConfig');
const ERROR_MESSAGES = require('../constants/ErrorMessages');

sgMail.setApiKey(SENDGRID_API_KEY);

exports.sendEmail = async (req, res) => {
  const {email, message} = req.body;
  const msgBody = `
    <h4>${message}</h4>
  `;
  const msg = {
    to: email,
    from: 'no.reply.fraa@gmail.com',
    subject: `FRAA sent you a message`,
    html: msgBody
  };
  try {
    await sgMail.send(msg);
    return res.json({success: 'email sent'});
  }
  catch (errorSendEmail) {
    console.error('Something went wrong with send email: ', errorSendEmail);
    return res.json({error: ERROR_MESSAGES.GENERIC_ERROR_MESSAGE});
  }
};

exports.sendOTPToUser = async (email, OTP) => {
  const msgBody = `
    <p>Your OTP Code is: ${OTP}.</p>
  `;
  const msg = {
    to: email,
    from: 'no.reply.fraa@gmail.com',
    subject: `OTP Code`,
    html: msgBody
  };
  try {
    await sgMail.send(msg);
  }
  catch (errorSendEmail) {
    console.error(`Something went wrong with send OTP to user: ${errorSendEmail}`);
  }
};
