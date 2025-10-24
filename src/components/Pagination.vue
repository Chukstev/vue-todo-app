<script setup>
import { computed } from "vue";

const props = defineProps({
  totalTodos: { type: Number, required: true },
  todosPerPage: { type: Number, required: true },
  currentPage: { type: Number, required: true },
});
const emit = defineEmits(["page-change"]);

const pages = computed(() => {
  const out = [];
  for (let i = 1; i <= Math.ceil(props.totalTodos / props.todosPerPage); i++) out.push(i);
  return out;
});

const setPage = (p) => emit("page-change", p);
</script>

<template>
  <div class="pagination">
    <button
      v-for="page in pages"
      :key="page"
      @click="setPage(page)"
      :class="{ active: page === currentPage }"
    >
      {{ page }}
    </button>
  </div>
</template>

<style scoped>
.pagination button.active {
  font-weight: bold;
}
</style>
