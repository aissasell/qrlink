const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport('smtp://g6xwov5hqw3xuvdt@ethereal.email:nTXQDHBG1Bb9N44ZaS@smtp.ethereal.email:587');
transporter.verify(function (error, success) {
  if (error) {
    console.log("Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
  process.exit(0);
});
