<script setup>
const count = useState('counter', () => 0);
</script>

<template>
  <div class="bg-slate-300 p-2 mx-10">
    <h3>myCounter.vue</h3>
    <p>Counter: {{ count }}</p>
    <Button @click="count++" label="Increase" />
  </div>
</template>
