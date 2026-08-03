import { createRouter, createWebHistory } from 'vue-router'
import public_routes                      from './public'
import private_routes                     from './private'
import { useAuthStore }                   from '@/stores/auth'

const routes = [...public_routes, ...private_routes]

import { createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

// Navigation Guard global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated; // supondo que exista

  // Se a rota exigir autenticação
  if (to.meta.requiresAuth && !isAuthenticated) {
    const auth = useAuthStore()
    auth.logout()

    this.$toast.error('Acesso não autorizado.')
    
    next('/'); // redireciona para login
    
  } else {
    next();
  }
});

export default router
