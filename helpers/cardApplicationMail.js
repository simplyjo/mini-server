require("dotenv").config();
const nodemailer = require("nodemailer");

async function cardApplicationEmail(email, code) {
  try {
    const smtpEndpoint = "smtp.zoho.eu";

    const port = 465;

    const senderAddress = "WazoDeal <admin@wazodeal.com>";

    var toAddress = email;

    const smtpUsername = "admin@wazodeal.com";

    const smtpPassword = process.env.ZH_API;

    var subject = "Your Card Application Received Successfully";

    // The body of the email for recipients
    var body_html = `<!DOCTYPE> 
    <html>
      <body>      
      <h2>Congratulations!</h2>
      <h5> You have been approved for the WazoDeal discount card.</h5>
   
      <h4>Your Account is eligible to benefit from our numerous customer loyalty offers such as</h4>
   
   
     <p> Your new card allows you to earn from different merchants. Remember to activate and use your card as soon as you get it so you can start earning lots of Wazopoints and enjoying amazing offers right away.</p>
      <p>Plus, you get #500 naira in Wazopoints. Think of it as one more way to earn Wazopoints even faster, and redeem points even sooner.</p>
    
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

module.exports = { cardApplicationEmail };
