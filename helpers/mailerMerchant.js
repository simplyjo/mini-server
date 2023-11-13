require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmail(email, code) {
  try {
    const smtpEndpoint = "smtp.zoho.eu";

    const port = 465;

    const senderAddress = "WazoDeal <admin@wazodeal.com>";

    var toAddress = email;

    const smtpUsername = "admin@wazodeal.com";

    const smtpPassword = process.env.ZH_API;

    var subject = "Verify your email";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>
      
        <p>Thank you for signing up on WazoDeal</p> 
        <p>Click the link below to complete your registration and activate your account</p> 
        <a href="https://seller.wazodeal.com/verify-email?email=${email}&code=${code}">https://seller.wazodeal.com/verify-email?email=${email}&code=${code}</a> 
      </body>
    </html>`;

    // Create the SMTP transport.
    let transporter = nodemailer.createTransport({
      host: smtpEndpoint,
      port: port,
      secure: true, // true for 465, false for other ports
      auth: {
        user: smtpUsername,
        pass: smtpPassword,
      },
    });

    // Specify the fields in the email.
    let mailOptions = {
      from: senderAddress,
      to: toAddress,
      subject: subject,
      html: body_html,
    };

    let info = await transporter.sendMail(mailOptions);
    return { error: false };
  } catch (error) {
    console.error("send-email-error", error);
    return {
      error: true,
      message: "Cannot send email",
    };
  }
}

module.exports = { sendEmail };
