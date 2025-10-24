import { createRouter, createWebHistory } from "vue-router";
import TodoApp from "@/components/TodoApp.vue";
import LoginView from "@/components/LoginView.vue";
import { useAuthStore } from "@/stores/auth";

const routes = [
  {
    path: "/",
    redirect: "/todos",
  },
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/todos",
    component: TodoApp,
    meta: { requiresAuth: true },
  },
  {
    path: "/todos/pending",
    component: TodoApp,
    meta: { requiresAuth: true },
  },
  {
    path: "/todos/completed",
    component: TodoApp,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }
  }

  if (to.path === "/login" && authStore.isAuthenticated) {
    next("/todos");
    return;
  }

  next();
});

export default router;
