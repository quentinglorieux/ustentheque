<template>
  <div>
    <button @click="sendEmail">Send Email</button>
  </div>
</template>

<script setup>

const sendEmail = async () => {
  try {
    const response = await $fetch('/api/send-email');
    //console.log(response); // Handle the response data as needed
  } catch (error) {
    console.error(error); // Handle any errors that occur during the request
  }
};
</script>