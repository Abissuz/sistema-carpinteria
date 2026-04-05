<template>
  <div class="login-wrapper">
    <div class="login-card">
      
      <img src="/logo_sagrada.png" class="logoLogin" alt="Logo Sagrada Familia" />
      
      <div class="login-header">
        <h2>Sagrada Familia</h2>
        <p>Sistema de Gestión</p>
      </div>

      <form @submit.prevent="ingresar" class="login-form">
        <div class="input-group">
          <label>Correo Electrónico</label>
          <input type="email" v-model="email" placeholder="ejemplo@correo.com" required />
        </div>

        <div class="input-group">
          <label>Contraseña</label>
          <div class="input-wrapper">
            <input 
              :type="mostrarClave ? 'text' : 'password'" 
              v-model="password" 
              placeholder="••••••••" 
              required 
            />
            <button 
              type="button" 
              class="btn-ojo" 
              @click="mostrarClave = !mostrarClave"
              title="Mostrar/Ocultar contraseña"
            >
              {{ mostrarClave ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>

        <button type="submit" class="btn-entrar" :disabled="cargando">
          {{ cargando ? 'Validando...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <div v-if="errorMsg" class="error-mensaje">
        ⚠️ {{ errorMsg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

const email = ref('');
const password = ref('');
const mostrarClave = ref(false); // Variable para controlar el ojito
const errorMsg = ref('');
const cargando = ref(false);
const router = useRouter();

const ingresar = async () => {
  cargando.value = true;
  errorMsg.value = ''; 
  
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push('/'); 
  } catch (error) {
    console.error("Error al ingresar:", error.code);
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
/* ========================
   ESTILOS GENERALES
======================== */
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f4f1ea; /* Mismo fondo del Dashboard */
  padding: 20px;
  box-sizing: border-box;
}

.login-card {
  background: white;
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08);
}

/* ========================
   LOGO Y ENCABEZADO
======================== */
.logoLogin {
  width: 120px; 
  height: auto;
  margin-bottom: 15px; 
  display: block;
  margin-left: auto;
  margin-right: auto; 
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  color: #8b4513;
  margin: 0 0 5px 0;
  font-size: 24px;
}

.login-header p {
  color: #7f8c8d;
  margin: 0;
  font-size: 14px;
}

/* ========================
   FORMULARIO E INPUTS
======================== */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
}

input {
  padding: 12px 15px;
  border: 1.5px solid #dcdde1;
  border-radius: 8px;
  font-size: 15px;
  background-color: #fafafa;
  color: #2c3e50;
  transition: 0.3s;
  outline: none;
  box-sizing: border-box;
  width: 100%;
}

input:focus {
  border-color: #d35400;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1);
}

/* ========================
   INPUT DE CONTRASEÑA (OJITO)
======================== */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.input-wrapper input {
  padding-right: 45px; /* Espacio para que el texto no choque con el botón */
}

.btn-ojo {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  transition: 0.2s;
  box-shadow: none; /* Quitamos sombras extrañas */
}

.btn-ojo:hover {
  opacity: 1;
  transform: scale(1.1);
  background: none;
}

/* ========================
   BOTÓN DE ENTRAR
======================== */
.btn-entrar {
  background: linear-gradient(135deg, #d35400, #e67e22);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: 0.3s;
  margin-top: 10px;
  box-shadow: 0 4px 15px rgba(211, 84, 0, 0.2);
  width: 100%;
}

.btn-entrar:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(211, 84, 0, 0.3);
}

.btn-entrar:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* ========================
   MENSAJE DE ERROR
======================== */
.error-mensaje {
  margin-top: 20px;
  padding: 10px;
  background-color: #ffefef;
  color: #e74c3c;
  border-left: 4px solid #e74c3c;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
}
</style>