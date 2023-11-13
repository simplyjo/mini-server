require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmail(team, code) {
  try {
    const smtpEndpoint = "smtp.zoho.eu";

    const port = 465;

    const senderAddress = "WazoDeal <admin@wazodeal.com>";

    var toAddress = team.email;

    const smtpUsername = "admin@wazodeal.com";

    const smtpPassword = process.env.ZH_API;

    var subject = "Invitation For Team Member Role";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>
        <h5>Team Invite By ${team.merchantName} </h5> 
        <br/>
        <p> You can now login to WazoDeal Merchant Dashboard with this login details  </p>
        <p>Email : ${team.email}</p> 
        <p>Password : ${code}</p> 
        <br/>
   
        

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
