const sgMail = require("@sendgrid/mail");

export default async function (req, res) {
  try {
    console.log('hello')

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: "quentin.glorieux@gmail.com",
      from: "bibob.larchant@gmail.com", // Set your verified sender email address
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };

    await sgMail.send(msg);

    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Failed to send email" });
  }
}
