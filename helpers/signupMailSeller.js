require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendSignUpEmail(email, merchant) {
  try {
    const smtpEndpoint = "smtp.zoho.eu";

    const port = 465;

    const senderAddress = "WazoDeal <admin@wazodeal.com>";

    var toAddress = email;

    const smtpUsername = "admin@wazodeal.com";

    const smtpPassword = process.env.ZH_API;

    var subject = "Welcome to WazoDeal Merchant Platform";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>      
      <h2>Thank you for Joining the Wazodeal Merchant Family.</h2>
      <h5>Your account has been created successfully!!!.</h5>
   
      <h4>Your Login Details are</h4>

      <p>Your Email : ${merchant.email} </p>
      <p>Your Password : ${merchant.passwordText}</p>
   
<br/>


<p>Login to our merchant platform and start gaining more customers for your business at <a href= "https://seller.wazodeal.com">https://seller.wazodeal.com</a>. </p>
<br/>
<br/>


      <p>Please keep your details secure. <br/> </p>
     <p>If you have any issue with your account, Reach out to us at <a href= "mailto:support@wazodeal.com">support@wazodeal.com</a>. </p>
      
      <p>We Care.</p>
   
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
