// import sgMail from "@sendgrid/mail";

// export default defineEventHandler(async (event) => {
//   try {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);

//     const msg = {
//       to: "quentin.glorieux@gmail.com",
//       from: "bibob.larchant@gmail.com", // Set your verified sender email address
//       subject: "Sending with SendGrid is Fun",
//       text: "and easy to do anywhere, even with Node.js",
//       html: "<strong>and easy to do anywhere, even with Node.js</strong>",
//     };

//     await sgMail.send(msg);

//     return { message: "Email sent successfully" };
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw createError({
//       statusCode: 500,
//       statusMessage: "Failed to send email",
//     });
//   }
// });


