const nodemailer = require('nodemailer');
const sendEmail = (subject, note, email) => {

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.USER,
            pass: process.env.PASS
        }
    });

    const mailOptions = {
        from: {
            name: "FUTA Fleet Monitor",
            address: 'iroegbu.dg@gmail.com'
        },
        to: `${email}`,
        subject: `${subject}`,
        text: `${note}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent to ${email} with res code ${info.response}`.cyan.bold);
        }
    });

}
module.exports = sendEmail