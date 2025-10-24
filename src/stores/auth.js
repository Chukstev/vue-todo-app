import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const error = ref(null);
  const loading = ref(false);

  const isAuthenticated = computed(() => !!user.value);

  async function login(email, password) {
    loading.value = true;
    error.value = null;
    try {
      // For demo purposes, we'll use a simple check
      // In a real app, you would validate against a real backend
      if (email === "demo@example.com" && password === "password123") {
        user.value = {
          id: 1,
          email,
          name: "Demo User",
        };
        localStorage.setItem("user", JSON.stringify(user.value));
      } else {
        throw new Error("Invalid credentials");
      }
    } catch (e) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    user.value = null;
    localStorage.removeItem("user");
  }

  // Initialize user from localStorage if exists
  async function init() {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      user.value = JSON.parse(savedUser);
    }
    return Promise.resolve();
  }

  return {
    user,
    error,
    loading,
    isAuthenticated,
    login,
    logout,
    init,
  };
});
