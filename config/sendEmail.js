const nodemailer = require("nodemailer");
const { configEmail } = require('./secretData');

const myUser = configEmail.myEmail;
const myPassword = configEmail.myPassword;

const transport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: myUser,
      pass: myPassword,
    },
  });

module.exports.sendConfirmationEmail = (name, email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
      from: myUser,
      to: email,
      subject: "Please confirm your account - Champion Shirts",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing.<br/> Please confirm your email by clicking on the following link</p>
          <br/>
          <a href="http://localhost:3005/users/confirm/${confirmationCode}" target="_blank"> Click here</a>
          <p>Or insert the following code ${confirmationCode}`,
    }).catch(err => console.log(err));
  };