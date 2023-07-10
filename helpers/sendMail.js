const nodemailer = require('nodemailer');
const { SMTP_MAIL, SMTP_PASSWORD } = process.env;

const sendMail = async (email, mailSubject, content) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                type: 'PLAIN',
                user: SMTP_MAIL,
                pass: SMTP_PASSWORD
            }
        });

        const mailOptions = {
            from: SMTP_MAIL,
            to: email,
            subject: mailSubject,
            html: content
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email envoyé avec succès!', info.response);
            }
        });
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = sendMail;
