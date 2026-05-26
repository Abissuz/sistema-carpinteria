import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

// 👇 CAZADOR PWA
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
    
    // 🔥 CLAVE: Indica a Vue que ignore los elementos que empiezan con "ion-"
    app.config.compilerOptions.isCustomElement = (tag) => tag.startsWith('ion-')
    
    app.use(router)
    app.mount('#app')
  }
});