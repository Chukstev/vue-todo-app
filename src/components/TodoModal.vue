<script setup>
import { ref, watch } from "vue";
import { PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from "@heroicons/vue/24/outline";

const props = defineProps({ todo: { type: Object, required: true } });
const emits = defineEmits(["close", "delete", "save"]);

const isEditing = ref(false);
const editTitle = ref(props.todo.title);
const editDescription = ref(props.todo.description || "");

watch(
  () => props.todo,
  (newTodo) => {
    editTitle.value = newTodo.title;
    editDescription.value = newTodo.description || "";
  }
);

const handleSave = () => {
  if (!editTitle.value.trim()) return;
  emits("save", {
    id: props.todo.id,
    title: editTitle.value.trim(),
    description: editDescription.value.trim(),
  });
  isEditing.value = false;
};

const handleDelete = () => {
  emits("delete", props.todo.id);
};
</script>

<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Todo Details</h2>
      <p>ID: {{ todo.id }}</p>
      <p>Status: {{ todo.completed ? "Completed" : "Pending" }}</p>
      <div class="edit-field">
        <div v-if="isEditing">
          <div class="input-group">
            <label>
              Title:
              <input type="text" v-model="editTitle" />
            </label>
          </div>
          <div class="input-group">
            <label>
              Description:
              <textarea v-model="editDescription" rows="3"></textarea>
            </label>
          </div>
          <div class="edit-actions">
            <button class="save-btn" @click="handleSave">
              <CheckIcon style="width: 18px; height: 18px" />
            </button>
            <button
              class="cancel-btn"
              @click="
                () => {
                  editTitle = todo.title;
                  editDescription = todo.description || '';
                  isEditing = false;
                }
              "
            >
              <XMarkIcon style="width: 18px; height: 18px" />
            </button>
          </div>
        </div>
        <div v-else>
          <p><strong>Title:</strong> {{ editTitle }}</p>
          <p><strong>Description:</strong> {{ editDescription || "No description provided" }}</p>
        </div>
      </div>
      <div class="buttons">
        <button class="green" @click="isEditing = true">
          <PencilIcon style="width: 18px; height: 18px" />
        </button>
        <button
          class="black"
          @click="
            () => {
              handleDelete();
              emits('close');
            }
          "
        >
          <TrashIcon style="width: 18px; height: 18px" />
        </button>
        <button class="red" @click="() => emits('close')">
          <XMarkIcon style="width: 18px; height: 18px" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-field {
  flex-direction: column;
  align-items: flex-start;
}

.input-group {
  width: 100%;
  margin-bottom: 1rem;
}

textarea {
  font-family: inherit;
  line-height: 1.5;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
  border: none;
  border-radius: 5px;
  box-shadow: 0 0 1px rgb(191, 190, 190);
  resize: vertical;
  min-height: 80px;
}

.edit-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.edit-field > div:not(.edit-actions) {
  width: 100%;
}

/* Text styling */
h2 {
  margin-bottom: 1rem;
  color: #333;
}

p {
  margin-bottom: 0.5rem;
}
</style>
<style scoped>
.modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.4);
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 480px;
}
.buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.input-group {
  margin-bottom: 1rem;
}

.input-group label {
  display: block;
  margin-bottom: 0.5rem;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 1rem;
}

.edit-field {
  margin: 1rem 0;
}
</style>
