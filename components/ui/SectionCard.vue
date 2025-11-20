<template>
  <div class="card section-card" :class="{ 'section-card--flush': !padded }">
    <div
      v-if="title || hasTitleSlot || hasActionsSlot"
      class="section-card__header flex align-items-center justify-content-between gap-3 flex-wrap mb-4"
    >
      <div class="section-card__title">
        <slot name="title">
          <h3 v-if="title" class="m-0">{{ title }}</h3>
        </slot>
      </div>
      <div v-if="hasActionsSlot" class="section-card__actions">
        <slot name="actions" />
      </div>
    </div>
    <div :class="{ 'section-card__body': bodyPadding }">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  padded: {
    type: Boolean,
    default: true,
  },
  bodyPadding: {
    type: Boolean,
    default: true,
  },
});

const slots = useSlots();
const hasTitleSlot = computed(() => Boolean(slots?.title));
const hasActionsSlot = computed(() => Boolean(slots?.actions));
</script>

<style scoped>
.section-card {
  width: 100%;
}

.section-card--flush {
  padding: 0;
}

.section-card__title h3 {
  font-size: 1.5rem;
  font-weight: 600;
}

.section-card__actions :deep(> *) {
  display: inline-flex;
}

.section-card__body {
  width: 100%;
}
</style>
