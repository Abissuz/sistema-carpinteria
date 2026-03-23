import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase' // Importamos tu bóveda

// 👇 1. EL CAZADOR GLOBAL VA AQUÍ AFUERA (Atrapa el evento al instante) 👇
window.deferredPWA = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPWA = e;
  // Disparamos un evento personalizado para avisarle al Dashboard
  window.dispatchEvent(new Event('pwa-lista'));
});

let app;

// 👇 2. FIREBASE Y VUE SIGUEN SU CURSO NORMAL 👇
// Le decimos a Firebase: "Avisa cuando sepas si hay alguien logueado o no"
onAuthStateChanged(auth, (user) => {
  // Solo montamos la aplicación de Vue UNA vez, después de que Firebase responda
  if (!app) {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
});