import nodemailer from 'nodemailer'
import { config } from 'dotenv';
config();



const mailer = (options) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_USER,
            pass: process.env.NODEMAILER_PW
        }
    })

    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: options.to,
        subject: options.subject,
        html: options.text
    }

    transporter.sendMail(mailOptions, function(err, info){
        if(err){
            console.log('ERROR FROM NODEMON>>', err)
        }else{
            console.log('EMAIL SENT SUCCESSFUL')
            //console.log('INFORMATION FROM NODEMON>>', info)
        }
    })
}


export default mailer