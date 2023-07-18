<template>
    <div>
      <button @click="sendEmail">Send Email</button>
    </div>


  </template>
  
  <script setup>
  import sgMail  from "@sendgrid/mail";



async function sendEmail() {
sgMail.setApiKey('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')

const msg = {
  to: 'test@example.com', // Change to your recipient
  from: 'test@example.com', // Change to your verified sender
  subject: 'Sending with SendGrid is Fun',
  text: 'and easy to do anywhere, even with Node.js',
  html: '<strong>and easy to do anywhere, even with Node.js</strong>',
}

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent')
  })
  .catch((error) => {
    console.error(error)
  })
}

  </script>