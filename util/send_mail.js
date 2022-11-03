const nodemailer = require('nodemailer')
const inlineCss = require('nodemailer-juice')
const sharedUrl = require('./sharedUrl')

let transporter = nodemailer.createTransport({
    host: "smtp.libero.it",
    port: 465,
    secure: true,
    auth: {
      user: process.env.USER_MAIL,
      pass: process.env.PASSWORD_MAIL
    }
})
module.exports.send_mail = function(user) {
    const {name, email } = user
    const linkUrl = sharedUrl.getUrl()
    let mex = `<div>Hello <b>${name}</b>,<br> please click on button below to activate your account <br><button><a href="${linkUrl}">ACTIVATE</a></button><br><br>Thanks <br> Bye</div>`
    transporter.use('compile', inlineCss())
    let info = transporter.sendMail({
        from: `Mountain Peaks <${process.env.USER_MAIL}>`,
        to: email, // Test email address
        subject: "Mountains Peaks activation",
        // text: `Hello ${name}, please click on link below`,
        html: mex,
    }, err => {
        return {message: "Not sent"}
            
    })
    return info
}

