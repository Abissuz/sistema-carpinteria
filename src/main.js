import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'

// 🔥 REGISTRO DEL SERVICE WORKER 🔥
import { registerSW } from 'virtual:pwa-register'
registerSW({ immediate: true })

// 👇 1. EL CAZADOR GLOBAL VA AQUÍ AFUERA (Atrapa el evento al instante) 👇
window.deferredPWA = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.deferredPWA = e;
  window.dispatchEvent(new Event('pwa-lista'));
});

let app;

onAuthStateChanged(auth, (user) => {
  if (!app) {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
});