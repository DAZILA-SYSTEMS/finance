const nodemailer = require("nodemailer");

function mailer(message, to, subject) {
  // Create a transporter object using your Gmail account
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAILER_USER,
      pass: process.env.MAILER_PASS, // You should use an App Password for security
    },
  });

  // Define the email message with HTML content
  const mailOptions = {
    from: "contact.techsystems@gmail.com",
    to,
    subject,
    html: message,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent successfully:", info.response);
    }
  });
}

module.exports = mailer;
