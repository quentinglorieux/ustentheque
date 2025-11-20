<script setup>
import { useCounterStore } from "@/composables/useCounterStore";
const store = useCounterStore();
const count = computed(() => store.count);
</script>

<template>
  <div class="bg-slate-300 p-2 mx-10">
    <h3>myCounter.vue</h3>
    <p>Counter: {{ store.count }}</p>
    <Button @click="store.count += 1" label="Increase" />
  </div>
</template>
