import nodemailer from 'nodemailer';
import { config } from 'dotenv';
config();

const mailer = (options) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PW,
            },
        });

        const mailOptions = {
            from: process.env.NODEMAILER_USER,
            to: options.to,
            subject: options.subject,
            html: options.text,
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('ERROR FROM NODEMAILER:', err);
                return reject(err); // Reject the promise with the error
            }
            console.log('EMAIL SENT SUCCESSFULLY:', info.response);
            resolve(info); // Resolve the promise with the info
        });
    });
};

export default mailer;
