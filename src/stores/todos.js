import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

export const useTodosStore = defineStore("todos", () => {
  const todos = ref(JSON.parse(localStorage.getItem("todos") || "[]"));
  const currentPage = ref(1);
  const itemsPerPage = ref(10);
  const loading = ref(false);
  const error = ref(null);
  const searchTerm = ref("");
  const deletedTodos = ref(JSON.parse(localStorage.getItem("deletedTodos") || "[]"));

  // Save todos to localStorage whenever they change
  watch(
    todos,
    (newTodos) => {
      localStorage.setItem("todos", JSON.stringify(newTodos));
    },
    { deep: true }
  );

  // Save deletedTodos to localStorage whenever they change
  watch(
    deletedTodos,
    (newDeletedTodos) => {
      localStorage.setItem("deletedTodos", JSON.stringify(newDeletedTodos));
    },
    { deep: true }
  );

  // Reset page when search term changes
  watch(searchTerm, () => {
    currentPage.value = 1;
  });

  const filtered = computed(() => {
    if (!searchTerm.value.trim()) return todos.value;
    const term = searchTerm.value.toLowerCase().trim();
    return todos.value.filter(
      (todo) =>
        todo.title.toLowerCase().includes(term) || todo.description.toLowerCase().includes(term)
    );
  });

  const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage.value));

  const paginatedTodos = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filtered.value.slice(start, end);
  });

  async function fetchTodos() {
    // No need to fetch - todos are already loaded from localStorage
    return Promise.resolve();
  }

  async function addTodo(todo) {
    const newTodo = {
      id: Date.now(), // Use timestamp as unique ID
      title: todo.title,
      description: todo.description || `Task details`,
      completed: false,
      userId: 1,
    };
    todos.value.push(newTodo);
    return Promise.resolve(newTodo);
  }

  async function deleteTodo(id) {
    const index = todos.value.findIndex((todo) => todo.id === id);
    if (index !== -1) {
      // move to trash
      const [removed] = todos.value.splice(index, 1);
      deletedTodos.value.unshift({ ...removed, deletedAt: new Date().toISOString() });

      // Adjust current page if we're on the last page and it's now empty
      if (currentPage.value > 1 && paginatedTodos.value.length === 0) {
        currentPage.value--;
      }
    }
    return Promise.resolve();
  }

  // Restore a todo from the trash back into the main list
  async function restoreTodo(id) {
    const index = deletedTodos.value.findIndex((t) => t.id === id);
    if (index === -1) return;

    const [restored] = deletedTodos.value.splice(index, 1);
    todos.value.unshift(restored);
    return Promise.resolve();
  }

  // Permanently remove a todo from trash
  async function permanentlyDeleteTodo(id) {
    const index = deletedTodos.value.findIndex((t) => t.id === id);
    if (index !== -1) {
      deletedTodos.value.splice(index, 1);
    }
    return Promise.resolve();
  }

  async function toggleTodo(id) {
    const todo = todos.value.find((todo) => todo.id === id);
    if (todo) {
      todo.completed = !todo.completed;
    }
    return Promise.resolve();
  }

  async function updateTodo(id, updates) {
    const todo = todos.value.find((todo) => todo.id === id);
    if (todo) {
      Object.assign(todo, {
        ...updates,
        description: updates.description || todo.description,
      });
    }
    return Promise.resolve();
  }

  function setPage(page) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page;
    }
  }

  return {
    todos,
    currentPage,
    itemsPerPage,
    totalPages,
    paginatedTodos,
    filtered,
    loading,
    error,
    searchTerm,
    deletedTodos,
    fetchTodos,
    addTodo,
    deleteTodo,
    restoreTodo,
    permanentlyDeleteTodo,
    toggleTodo,
    updateTodo,
    setPage,
  };
});
