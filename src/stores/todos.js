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
    // If we have todos in localStorage, use those
    if (todos.value.length > 0) {
      return Promise.resolve();
    }

    // Otherwise fetch initial data from API
    loading.value = true;
    error.value = null;
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos");
      if (!response.ok) {
        throw new Error("Failed to fetch todos");
      }
      const data = await response.json();
      // Add description field since JSONPlaceholder todos don't have it
      todos.value = data.map((todo) => ({
        ...todo,
        description: `Task ${todo.id} details`,
      }));
    } catch (e) {
      error.value = e.message;
      console.error("Failed to fetch initial todos:", e);
      // Fallback to empty array if API fails
      todos.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function addTodo(todo) {
    const tempId = Date.now(); // Temporary ID for optimistic UI
    const newTodo = {
      id: tempId,
      title: todo.title,
      description: todo.description || `Task details`,
      completed: false,
      userId: 1,
    };

    // Optimistically add to local state
    todos.value.push(newTodo);

    // Try to sync with API
    try {
      const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: todo.title,
          completed: false,
          userId: 1,
        }),
      });

      if (!response.ok) {
        console.warn("Failed to sync new todo with API, keeping local version");
      }

      return newTodo;
    } catch (e) {
      console.warn("Network error while syncing todo, keeping local version:", e);
      return newTodo;
    }
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
