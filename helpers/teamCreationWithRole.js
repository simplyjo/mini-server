require("dotenv").config();
const nodemailer = require("nodemailer");

async function sendEmailWithRole(team, store, code) {
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
        <h3>Team Invite By ${team.merchantName} </h3> 
      
        <p> You can now login to WazoDeal Merchant Dashboard with this login details  </p>
        <p>Email : ${team.email}</p> 
        <p>Password : ${code}</p> 
        <br/>
     <h3>Store Info</h3> 
       <p>Store Assigned : ${store[0].storeName}-${store[0].storeId}</p>
       <p>Store Category : ${store[0].category}</p>
       <p>Store Location : ${store[0].storeLocation}</p>
        

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

module.exports = { sendEmailWithRole };
