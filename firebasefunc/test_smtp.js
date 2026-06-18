const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport('smtps://g6xwov5hqw3xuvdt@ethereal.email:nTXQDHBG1Bb9N44ZaS@smtp.ethereal.email:465');
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});
