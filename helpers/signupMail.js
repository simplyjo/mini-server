require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendSignUpEmail(email, code) {
  try {
    const smtpEndpoint = "smtp.zoho.eu";

    const port = 465;

    const senderAddress = "WazoDeal <admin@wazodeal.com>";

    var toAddress = email;

    const smtpUsername = "admin@wazodeal.com";

    const smtpPassword = process.env.ZH_API;

    var subject = "We've Being Waiting For You";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>      
      <h2>Thank you for signing up on Wazodeal Discount Platform.</h2>
      <h5>Your account has been created successfully!!!.</h5>
   
      <h4>Your Account is eligible to benefit from our numerous customer loyalty offers such as</h4>
   
      <ul>
      <li><p>Daily discounts and deals</p></li>
      <li><p>Free purchase points</p></li>
      <li><p>A free virtual discount card</p></li>
      <li><p>Ability to redeem your aggregated points</p></li>
      </ul>
      
   
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

module.exports = { sendSignUpEmail };
