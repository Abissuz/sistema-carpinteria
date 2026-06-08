<template>
  <button @click="isOpen = true" class="floating-btn" title="Información del Proyecto">
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  </button>

  <Transition name="fade">
    <div v-if="isOpen" class="modal-overlay" @click.self="isOpen = false">
      <div class="modal-content">
        
        <button @click="isOpen = false" class="close-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div class="step-container">
          <div v-if="currentStep === 0" class="step">
            <h2 class="title">¡Bienvenido al Sistema!</h2>
            <p class="description">
              Soy <strong>André Mendoza</strong>. Lo que estás viendo es una versión de demostración de una PWA desarrollada para la gestión administrativa de un taller de carpintería real. 
              Organizando los archivos con un sistema de por fechas y numero de documento. 
            </p>
          </div>

          <div v-if="currentStep === 1" class="step">
            <h2 class="title">🚀 Características Técnicas</h2>
            <ul class="tech-list">
              <li><strong>Offline-First:</strong> Arquitectura diseñada para facturar y cotizar sin conexión a internet.</li>
              <li><strong>Sincronización:</strong> Firebase Realtime Database y Auth.</li>
              <li><strong>Frontend:</strong> Construido íntegramente con Vue 3 y Vite.</li>
            </ul>
          </div>

          <div v-if="currentStep === 2" class="step">
            <h2 class="title">🔒 Revisión Segura</h2>
            <p class="description">
              Para proteger la privacidad del cliente y sus finanzas, los datos reales han sido reemplazados. Accede con:
            </p>
            <div class="creds-box">
              <p><strong>Email:</strong> reclutador@demo.com</p>
              <p><strong>Clave:</strong> demo123456</p>
            </div>
          </div>
        </div>

        <div class="navigation">
          <button :disabled="currentStep === 0" @click="currentStep--" class="icon-btn" :class="{ 'disabled-btn': currentStep === 0 }">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </button>
          
          <div class="dots">
            <span v-for="i in 3" :key="i" :class="{ active: currentStep === i-1 }"></span>
          </div>
          
          <button v-if="currentStep < 2" @click="currentStep++" class="icon-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          
          <button v-else @click="isOpen = false" class="finish-btn">¡Comenzar!</button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';

const isOpen = ref(true); // Se abre automáticamente la primera vez
const currentStep = ref(0);
</script>

<style scoped>
/* BOTÓN FLOTANTE */
.floating-btn {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  /* COLORES CARPINTERÍA: Cambia este fondo por tu color principal */
  background-color: #8b5a2b; 
  color: white;
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  cursor: pointer;
  z-index: 999;
  transition: transform 0.2s ease;
}
.floating-btn:hover {
  transform: scale(1.1);
}

/* OVERLAY Y MODAL */
.modal-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: white; 
  padding: 2.5rem 2rem; 
  border-radius: 1rem;
  width: 90%; max-width: 450px; 
  position: relative; 
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* TEXTOS */
/* COLORES CARPINTERÍA: Ajusta el color del texto si lo necesitas */
.title { color: #3e2723; font-size: 1.4rem; margin-bottom: 1rem; font-weight: bold; }
.description { color: #5d4037; line-height: 1.6; font-size: 0.95rem;}
.tech-list { text-align: left; color: #5d4037; font-size: 0.95rem; line-height: 1.8; padding-left: 1rem;}
.creds-box { 
  background: #f5f5f5; padding: 1rem; border-radius: 0.5rem; 
  margin-top: 1.5rem; 
  /* COLORES CARPINTERÍA: Borde del cuadro de credenciales */
  border-left: 5px solid #8b5a2b; 
  text-align: left;
}

/* NAVEGACIÓN Y BOTONES */
.navigation { display: flex; justify-content: space-between; align-items: center; margin-top: 2.5rem; }
.dots span { height: 8px; width: 8px; background: #e0e0e0; border-radius: 50%; display: inline-block; margin: 0 4px; transition: all 0.3s ease;}
/* COLORES CARPINTERÍA: Color del punto activo */
.dots span.active { background: #8b5a2b; width: 24px; border-radius: 4px; }

.icon-btn { 
  background: none; border: none; cursor: pointer; 
  color: #555; display: flex; align-items: center; justify-content: center;
  padding: 0.5rem; border-radius: 50%; transition: background 0.2s;
}
.icon-btn:hover { background: #f0f0f0; }
.disabled-btn { opacity: 0.3; cursor: default; }
.disabled-btn:hover { background: none; }

.close-btn { 
  position: absolute; top: 1rem; right: 1rem; border: none; background: none; 
  color: #999; cursor: pointer; transition: color 0.2s;
}
.close-btn:hover { color: #333; }

.finish-btn { 
  /* COLORES CARPINTERÍA: Botón final */
  background: #8b5a2b; color: white; border: none; 
  padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; font-weight: bold;
}
.finish-btn:hover { background: #6d4622; }

/* ANIMACIÓN DE ENTRADA/SALIDA */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>