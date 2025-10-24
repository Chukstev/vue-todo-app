<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useTodosStore } from "@/stores/todos";
import { useAuthStore } from "@/stores/auth";
import Pagination from "./Pagination.vue";
import TodoModal from "./TodoModal.vue";
import LoadingSpinner from "./LoadingSpinner.vue";
import ErrorBoundary from "./ErrorBoundary.vue";
import Trash from "./Trash.vue";
// heroicons (outline)
import {
  PlusIcon,
  EyeIcon,
  TrashIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/vue/24/outline";

const store = useTodosStore();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};
const newTitle = ref("");
const selectedTodo = ref(null);
const searchTerm = ref("");

const filteredResults = computed(() => {
  const term = searchTerm.value.toLowerCase().trim();
  return store.todos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(term) || todo.description.toLowerCase().includes(term)
  );
});
onMounted(() => {
  if (!store.todos.length) store.fetchTodos();
});

const currentView = computed(() => {
  const p = route.path || "";
  if (p.includes("/pending")) return "pending";
  if (p.includes("/completed")) return "completed";
  return "all";
});

const filteredTodos = computed(() => {
  const base = filteredResults.value;
  if (currentView.value === "pending") return base.filter((t) => !t.completed);
  if (currentView.value === "completed") return base.filter((t) => t.completed);
  return base;
});

const currentTodoPage = computed(() => {
  const last = store.currentPage * store.itemsPerPage;
  const first = last - store.itemsPerPage;
  return filteredTodos.value.slice(first, last);
});

const setCurrentPage = (p) => (store.currentPage = p);
</script>

<template>
  <div>
    <main class="Todo-list">
      <section class="input-container">
        <div class="user-menu">
          <div class="user-info">
            <UserCircleIcon class="user-icon" style="width: 24px; height: 24px" />
            <span>{{ authStore.user?.email }}</span>
          </div>
          <button class="logout-btn" @click="handleLogout">
            <ArrowRightOnRectangleIcon style="width: 20px; height: 20px" />
            Logout
          </button>
        </div>
        <nav class="navbar">
          <input
            v-model="searchTerm"
            type="search"
            placeholder="Search todos by title or description..."
          />
        </nav>
        <h1 style="font-size: 3rem">Todo List</h1>
        <div aria-live="polite" style="margin-bottom: 10px; font-size: 1.5rem">
          {{ filteredTodos.length }} todos {{ searchTerm.trim() ? "found" : "remaining" }}
        </div>
        <div>
          <label for="new-todo">Add a new todo: </label>
          <br />
          <input
            id="new-todo"
            v-model="newTitle"
            type="text"
            placeholder="Enter new todo"
            class="add-todo"
          />
          <button
            class="addTodo"
            @click="
              () => {
                if (newTitle.trim()) {
                  store.addTodo({
                    title: newTitle.trim(),
                    description: '',
                  });
                  newTitle = '';
                }
              }
            "
          >
            <PlusIcon style="width: 18px; height: 18px" />
          </button>
        </div>
      </section>

      <section class="navigation" style="margin-bottom: 20px">
        <div class="nav-links">
          <button :class="{ active: currentView === 'all' }" @click="router.push('/todos')">
            All
          </button>
          <button
            :class="{ active: currentView === 'pending' }"
            @click="router.push('/todos/pending')"
          >
            Pending
          </button>
          <button
            :class="{ active: currentView === 'completed' }"
            @click="router.push('/todos/completed')"
          >
            Completed
          </button>
        </div>
        <LoadingSpinner v-if="store.loading" />
        <p v-if="store.error">{{ store.error }}</p>
        <p
          v-if="!store.loading && filteredTodos.length === 0"
          style="color: red; margin-block: 20px; font-size: 2rem; text-align: center; width: 100%"
        >
          No todos found
        </p>

        <ErrorBoundary type="main">
          <ul style="list-style-type: none; padding: 0">
            <li v-for="todo in currentTodoPage" :key="todo.id" style="margin: 10px 0">
              <label style="display: flex; align-items: center">
                <input
                  type="checkbox"
                  :checked="todo.completed"
                  @change="() => store.toggleTodo(todo.id)"
                />
                <span :style="{ marginLeft: '8px', opacity: todo.completed ? '70%' : '100%' }">{{
                  todo.title
                }}</span>
              </label>
              <div class="vd">
                <button
                  class="view-btn"
                  @click="
                    () => {
                      selectedTodo = todo;
                    }
                  "
                  aria-label="View"
                >
                  <EyeIcon style="width: 18px; height: 18px" />
                </button>
                <button
                  class="del-btn"
                  @click="() => store.deleteTodo(todo.id)"
                  :aria-label="`Delete ${todo.title}`"
                >
                  <TrashIcon style="width: 18px; height: 18px" />
                </button>
              </div>
            </li>
          </ul>
        </ErrorBoundary>

        <Pagination
          :totalTodos="filteredTodos.length"
          :todosPerPage="store.itemsPerPage"
          :currentPage="store.currentPage"
          @page-change="setCurrentPage"
        />
      </section>
    </main>

    <TodoModal
      v-if="selectedTodo"
      :todo="selectedTodo"
      @close="selectedTodo = null"
      @delete="
        (id) => {
          store.deleteTodo(id);
          selectedTodo = null;
        }
      "
      @save="
        (payload) => {
          store.updateTodo(payload.id, payload);
        }
      "
    />
    <Trash />
  </div>
</template>

<style scoped>
.user-menu {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin-bottom: 1rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #333;
}

.user-icon {
  color: #666;
}

.logout-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  color: red;
  transform: scale(1.05);
}
.nav-links button {
  margin-right: 8px;
  padding: 6px 10px;
  border-radius: 4px;
}
.nav-links button.active {
  background: black;
  color: white;
}
.vd {
  display: inline-flex;
  gap: 8px;
  margin-left: 12px;
}
.pagination {
  margin-top: 12px;
}
.pagination button {
  margin-right: 6px;
}
</style>
