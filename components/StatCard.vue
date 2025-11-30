<template>
  <div class="card mb-0">
    <div class="flex justify-content-between mb-3">
      <div>
        <span class="block text-600 font-medium mb-3">{{ title }}</span>
        <div class="text-900 font-medium text-xl">{{ value }}</div>
      </div>
      <div 
        class="flex align-items-center justify-content-center border-round" 
        :class="`bg-${color}-100`"
        style="width: 2.5rem; height: 2.5rem"
      >
        <i :class="`pi ${icon} text-${color}-500 text-xl`"></i>
      </div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'blue'
  }
});
</script>
