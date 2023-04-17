<template>
  <div className="bg-green-200 p-10">
    <h3> myPrime.vue </h3>
    <InputText type="text" v-model="value" />
    <p class="pt-3"> Text: {{ value }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";

const value = ref(null);
</script>
