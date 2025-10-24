<script setup>
import { ref, onErrorCaptured } from "vue";
const props = defineProps({ type: { type: String, default: "" } });
const hasError = ref(false);
const errorObj = ref(null);

onErrorCaptured((err, instance, info) => {
  console.error("ErrorBoundary caught an error", err, info);
  hasError.value = true;
  errorObj.value = err;
  return false;
});
</script>

<template>
  <div>
    <div v-if="hasError" style="text-align: center; padding: 20px; color: red">
      <h2>Sorry, this page doesn't exist for your {{ props.type }} todos.</h2>
    </div>
    <div v-else>
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
