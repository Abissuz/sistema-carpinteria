import { createRouter, createWebHistory } from 'vue-router';
import { auth } from '../firebase'; // Importamos a Firebase para que el vigilante le pregunte
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue'; // Importamos la nueva pantalla

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true } // Etiqueta de seguridad
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// El vigilante REAL conectado a Firebase
router.beforeEach((to, from, next) => {
  const requiereAutenticacion = to.matched.some(record => record.meta.requiresAuth);
  const usuarioLogueado = auth.currentUser; // Le preguntamos a Firebase: "¿Hay alguien adentro?"

  if (requiereAutenticacion && !usuarioLogueado) {
    // Si la ruta es privada y no hay nadie logueado, pa' fuera
    next('/login');
  } else if (!requiereAutenticacion && usuarioLogueado && to.path === '/login') {
    // Si ya está logueado e intenta ir al login, lo devolvemos a su panel
    next('/');
  } else {
    // Si todo está en orden, pase adelante
    next();
  }
});

export default router;