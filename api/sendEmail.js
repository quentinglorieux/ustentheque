const sgMail = require("@sendgrid/mail");

export default async (req, res) => {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//   const { email, subject, message } = req.body;

  const msg = {
    to: "quentin.glorieux@gmail.com",
    from: "bibob.larchant@gmail.com", // Set your verified sender email address
    subject: "Sending with SendGrid is Fun",
    text: "and easy to do anywhere, even with Node.js",
  };

  try {
    await sgMail.send(msg);
    res.status(200).send("Email sent successfully");
  } catch (error) {
    res.status(500).send("Failed to send email");
  }
};
