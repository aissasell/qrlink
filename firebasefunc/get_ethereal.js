const nodemailer = require('nodemailer');
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return process.exit(1);
    }
    console.log('Ethereal Credentials:');
    console.log(JSON.stringify(account, null, 2));
    console.log(`SMTP_URI: smtps://${account.user}:${account.pass}@smtp.ethereal.email:465`);
});
