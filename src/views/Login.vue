<template>
  <div>
    <h2>Ingreso - Sistema Sagrada Familia</h2>
    <form @submit.prevent="ingresar">
      <input type="email" v-model="email" placeholder="Correo electrónico" required />
      <input type="password" v-model="password" placeholder="Contraseña" required />
      <button type="submit" :disabled="cargando">
        {{ cargando ? 'Validando...' : 'Entrar' }}
      </button>
    </form>
    <p v-if="errorMsg" style="color: red; margin-top: 10px;">{{ errorMsg }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; // Importamos la herramienta de auth que configuraste antes

const email = ref('');
const password = ref('');
const errorMsg = ref('');
const cargando = ref(false);
const router = useRouter();

const ingresar = async () => {
  cargando.value = true;
  errorMsg.value = ''; // Limpiamos errores previos
  
  try {
    // Aquí Firebase hace la magia de ir al servidor y validar
    await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("¡Logueado con éxito papá!");
    
    // Si todo sale bien, el vigilante le abre la puerta y lo manda al inicio
    router.push('/'); 
    
  } catch (error) {
    console.error("Error al ingresar:", error.code);
    // Personalizamos el mensaje si se equivoca
    if (error.code === 'auth/invalid-credential') {
      errorMsg.value = 'Correo o contraseña incorrectos.';
    } else {
      errorMsg.value = 'Ocurrió un error. Verifica tu conexión.';
    }
  } finally {
    cargando.value = false;
  }
};
</script>

<style scoped>
/* Unos estilos súper básicos para que no se vea tan pegado */
form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  max-width: 300px;
}
input, button {
  padding: 10px;
  font-size: 16px;
}
</style>