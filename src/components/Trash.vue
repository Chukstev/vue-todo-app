<script setup>
import { ref } from "vue";
import { useTodosStore } from "@/stores/todos";
import { TrashIcon, XMarkIcon } from "@heroicons/vue/24/outline";

const store = useTodosStore();
const open = ref(false);

const toggle = () => (open.value = !open.value);

const handleRestore = async (id) => {
  await store.restoreTodo(id);
};

const confirmOpen = ref(false);
const confirmTarget = ref(null);

const openConfirm = (id) => {
  const item = store.deletedTodos.find((t) => t.id === id);
  confirmTarget.value = item || { id };
  confirmOpen.value = true;
};

const cancelConfirm = () => {
  confirmTarget.value = null;
  confirmOpen.value = false;
};

const confirmDelete = async () => {
  if (!confirmTarget.value) return;
  await store.permanentlyDeleteTodo(confirmTarget.value.id);
  confirmTarget.value = null;
  confirmOpen.value = false;
};
</script>

<template>
  <div>
    <button class="trash-button" @click="toggle" aria-label="Open trash">
      <TrashIcon style="width: 20px; height: 20px" />
      <span v-if="store.deletedTodos.length" class="badge">{{ store.deletedTodos.length }}</span>
    </button>

    <div v-if="open" class="trash-modal" role="dialog" aria-modal="true">
      <div class="trash-panel">
        <div class="trash-header">
          <h3>Trash ({{ store.deletedTodos.length }})</h3>
          <button class="close" @click="toggle">
            <XMarkIcon style="width: 18px; height: 18px" />
          </button>
        </div>

        <!-- Confirm delete modal (inline inside trash panel) -->
        <div v-if="confirmOpen" class="confirm-overlay">
          <div class="confirm-box">
            <p>
              Are you sure you want to permanently delete "{{ confirmTarget?.title || "" }}"? This
              cannot be undone.
            </p>
            <div class="confirm-actions">
              <button class="cancel" @click="cancelConfirm">Cancel</button>
              <button class="perma" @click="confirmDelete">Delete</button>
            </div>
          </div>
        </div>

        <div class="trash-list">
          <p v-if="!store.deletedTodos.length">Trash is empty</p>
          <ul v-else>
            <li v-for="t in store.deletedTodos" :key="t.id" class="trash-item">
              <div class="title">{{ t.title }}</div>
              <div class="actions">
                <button class="restore" @click="handleRestore(t.id)">Restore</button>
                <button class="perma" @click="openConfirm(t.id)">Delete</button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.trash-button {
  position: fixed;
  right: 18px;
  bottom: 18px;
  background: #111827;
  color: white;
  border: none;
  border-radius: 999px;
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: red;
  color: white;
  border-radius: 999px;
  padding: 2px 6px;
  font-size: 12px;
}
.trash-modal {
  position: fixed;
  right: 18px;
  bottom: 72px;
  z-index: 1200;
}
.trash-panel {
  width: 320px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 12px;
}
.confirm-overlay {
  position: relative;
  margin-bottom: 8px;
}
.confirm-box {
  background: #fff7f7;
  border: 1px solid #fecaca;
  padding: 10px;
  border-radius: 6px;
}
.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
}
.confirm-actions .cancel {
  background: transparent;
  border: 1px solid #ccc;
  padding: 6px 10px;
  border-radius: 4px;
}
.confirm-actions .perma {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 4px;
}
.trash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.trash-list {
  max-height: 360px;
  overflow: auto;
  margin-top: 8px;
}
.trash-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}
.title {
  flex: 1;
  margin-right: 8px;
}
.actions button {
  margin-left: 6px;
}
.actions .perma {
  background: #ef4444;
  color: white;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
}
.actions .restore {
  background: #10b981;
  color: white;
  border: none;
  padding: 6px 8px;
  border-radius: 4px;
}
.close {
  background: transparent;
  border: none;
}
</style>
