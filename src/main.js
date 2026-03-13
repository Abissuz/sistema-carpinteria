import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase' // Importamos tu bóveda

let app;

// Le decimos a Firebase: "Avisa cuando sepas si hay alguien logueado o no"
onAuthStateChanged(auth, (user) => {
  // Solo montamos la aplicación de Vue UNA vez, después de que Firebase responda
  if (!app) {
    app = createApp(App)
    app.use(router)
    app.mount('#app')
  }
});