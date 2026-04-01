<template>
  <div class="dashboard-container">
    
    <div v-if="deferredPrompt && !yaInstalado" class="banner-pwa">
      <span>📲 Instala nuestra app en tu dispositivo para un acceso rápido y sin conexión.</span>
      <button @click="instalarApp" class="btn-instalar-banner">Instalar Ahora</button>
    </div>

    <header class="header-nav">
      <h2>🔨 Sagrada Familia - Sistema</h2>
      <div style="display: flex; gap: 10px;">
        <button @click="cerrarSesion" class="btn-salir">Cerrar Sesión</button>
      </div>
    </header>

    <div class="tabs">
      <button :class="{ active: vistaActual === 'crear' }" @click="cambiarVista('crear')">Cotización</button>
      <button :class="{ active: vistaActual === 'cobro' }" @click="cambiarVista('cobro')">Cuenta de Cobro</button>
      <button :class="{ active: vistaActual === 'historial' }" @click="cambiarVista('historial')">Historial</button>
      <button :class="{ active: vistaActual === 'ajustes' }" @click="cambiarVista('ajustes')">Ajustes</button>
    </div>

    <main v-if="vistaActual === 'crear'" class="card-formulario">
      <h3>{{ editandoId ? '✏️ Editar Presupuesto Nº ' + cotizacion.numero : 'Crear Nuevo Presupuesto' }}</h3>
      <section class="seccion-form">
        <h4>1. Datos del Cliente</h4>
        <div class="grid-inputs">
          <input v-model="cotizacion.cliente" placeholder="Cliente (Ej: Camilo Santander)" />
          <input v-model="cotizacion.documento" placeholder="Documento / NIT" />
          <input v-model="cotizacion.direccion" placeholder="Dirección (Ej: Monterreale)" />
          <input v-model="cotizacion.torre" placeholder="Torre" />
          <input v-model="cotizacion.apto" placeholder="Apto (Ej: 801)" />
          <input v-model="cotizacion.barrio" placeholder="Barrio" />
          <input v-model="cotizacion.contacto" placeholder="Contacto" />
        </div>
      </section>

      <section class="seccion-form">
        <h4>2. Descripción del Trabajo</h4>
        <div v-for="(item, index) in cotizacion.items" :key="index" class="fila-item">
          <input v-model="item.cantidad" type="number" placeholder="Cant." class="input-cant" />
          <input v-model="item.descripcion" placeholder="Descripción del trabajo..." class="input-desc" />
          <input v-model="item.valor" type="number" placeholder="Valor $" class="input-valor" />
          <button @click="eliminarItem(index)" class="btn-eliminar" v-if="cotizacion.items.length > 1">X</button>
        </div>
        <button @click="agregarItem" class="btn-agregar">+ Agregar otro ítem</button>
      </section>

      <section class="seccion-total">
        <h3>Total Presupuesto: $ {{ formatearMoneda(calcularTotal()) }}</h3>
        <textarea v-model="cotizacion.observaciones" placeholder="OBSERVACIONES..."></textarea>
        
        <div class="acciones-form">
          <button v-if="editandoId" @click="cancelarEdicion" class="btn-cancelar">
            Cancelar Edición
          </button>
          <button @click="procesarCotizacion" class="btn-guardar" :disabled="cargando">
            {{ cargando ? 'Guardando PDF...' : (editandoId ? 'Actualizar Cotización' : 'Generar Cotización') }}
          </button>
        </div>
      </section>
    </main>

    <main v-if="vistaActual === 'cobro'" class="card-formulario">
      <h3>{{ editandoId ? '✏️ Editar Cuenta de Cobro Nº ' + cobro.numero : 'Generar Cuenta de Cobro' }}</h3>
      <section class="seccion-form">
        <div class="grid-inputs-cobro">
          <input v-model="cobro.cliente" placeholder="Nombre de quien debe (Ej: Chistiner Santander)" required />
          <input v-model="cobro.documento" placeholder="Documento" required />
          <input v-model="cobro.nit" placeholder="NIT" required />
          <input v-model="cobro.direccion" placeholder="Dirección del cliente" />
          <input v-model="cobro.fechaCiudad" placeholder="Ciudad y Fecha (Ej: Bogotá 20 de febrero del 2026)" required />
          
          <input v-model="cobro.monto" type="number" placeholder="Monto en números (Ej: 1900000)" required />
          <input v-model="cobro.montoLetras" placeholder="Monto en letras (Se llena solo...)" required readonly />
        </div>
        <textarea v-model="cobro.concepto" placeholder="POR CONCEPTO DE: (Ej: PAGO CONTRATO CUYO OBJETO ES...)" class="textarea-cobro" required></textarea>
        
        <div class="acciones-form">
          <button v-if="editandoId" @click="cancelarEdicion" class="btn-cancelar">
            Cancelar Edición
          </button>
          <button @click="procesarCobro" class="btn-guardar-cobro" :disabled="cargando">
            {{ cargando ? 'Guardando...' : (editandoId ? 'Actualizar Cobro' : 'Generar Cuenta de Cobro') }}
          </button>
        </div>
      </section>
    </main>

    <main v-if="vistaActual === 'historial'" class="card-formulario">
      <div class="header-historial">
        <h3>Explorador de Documentos</h3>
        <input v-model="busqueda" type="text" placeholder="🔍 Buscar por cliente o número..." class="input-buscador" />
      </div>
      
      <div class="tabla-responsive">
        <table class="tabla-historial">
          <thead>
            <tr>
              <th>Tipo / Nº</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="documento in historialFiltrado" :key="documento.id">
              <td class="bold">
                <span :class="documento.tipo === 'cobro' ? 'badge-cobro' : 'badge-cot'">
                  {{ documento.tipo === 'cobro' ? 'COBRO' : 'COT' }}
                </span>
                {{ documento.numero }}
              </td>
              <td>{{ documento.cliente }}</td>
              <td>$ {{ formatearMoneda(documento.total) }}</td>
              <td>{{ documento.fechaCreacionStr || 'N/A' }}</td>
              <td class="acciones-celda">
                <button @click="verDocumento(documento)" class="btn-ver" title="Ver / Descargar">📄</button>
                <button @click="editarDocumento(documento)" class="btn-editar" title="Editar">✏️</button>
                <button @click="eliminarDocumento(documento.id, documento.numero)" class="btn-borrar" title="Eliminar">🗑️</button>
              </td>
            </tr>
            <tr v-if="historialFiltrado.length === 0">
              <td colspan="5" class="text-center">No se encontraron documentos.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <main v-if="vistaActual === 'ajustes'" class="card-formulario">
      <h3>Configuración de Cotizaciones</h3>
      <p style="margin-bottom: 20px; font-size: 14px; color: #555;">
        Estos datos aparecerán automáticamente en las condiciones generales de las nuevas cotizaciones que generes.
      </p>
      <section class="seccion-form">
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <label class="bold">Tiempo de entrega:</label>
          <input v-model="ajustes.tiempoEntrega" />

          <label class="bold mt-10">Condiciones de pago:</label>
          <input v-model="ajustes.condicionesPago" />

          <label class="bold mt-10">Forma de pago (Datos Bancarios):</label>
          <textarea v-model="ajustes.formaPago" rows="3" style="width: 100%; font-family: Arial; padding: 10px;"></textarea>

          <label class="bold mt-10">Garantía:</label>
          <input v-model="ajustes.garantia" />
        </div>
        <button @click="guardarAjustes" class="btn-guardar" :disabled="cargandoAjustes">
          {{ cargandoAjustes ? 'Guardando...' : 'Guardar Ajustes' }}
        </button>
      </section>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { doc, runTransaction, collection, setDoc, updateDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';

// 👇 IMPORTAMOS SWEETALERT2 👇
import Swal from 'sweetalert2';

import { generarPDF, numeroALetras, formatearMoneda } from '../utils/generadorPdf';

const router = useRouter();
const cargando = ref(false);
const vistaActual = ref('crear'); 
const historial = ref([]);
const busqueda = ref(''); 

const editandoId = ref(null);

const deferredPrompt = ref(window.deferredPWA || null);
const yaInstalado = ref(window.matchMedia('(display-mode: standalone)').matches);

const revisarPWA = () => {
  if (window.deferredPWA) {
    deferredPrompt.value = window.deferredPWA;
  }
};

const instalarApp = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt();
    const { outcome } = await deferredPrompt.value.userChoice;
    if (outcome === 'accepted') {
      yaInstalado.value = true;
    }
    deferredPrompt.value = null; 
    window.deferredPWA = null;
  }
};

const cargandoAjustes = ref(false);
const ajustes = ref({
  tiempoEntrega: '30 dias habiles',
  condicionesPago: '60% al formalizar el pedido, 20% por avance de obra y 20% a la entrega.',
  formaPago: 'Efectivo - Transferencia bancaria. Cta de Ahorros BANCOLOMBIA 669-000015-05 Rafael Jose Pérez Leon.',
  garantia: '02 años por defectos de fabricación. Herrajes 1 mes.'
});

const historialFiltrado = computed(() => {
  if (!busqueda.value) return historial.value;
  const termino = busqueda.value.toLowerCase();
  return historial.value.filter(doc => 
    doc.cliente?.toLowerCase().includes(termino) || 
    doc.numero?.toLowerCase().includes(termino)
  );
});

// 👇 NUEVA ALERTA PARA ELIMINAR 👇
const eliminarDocumento = async (id, numero) => {
  const result = await Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar el documento ${numero}. Esto no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff4757',
    cancelButtonColor: '#95a5a6',
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar'
  });

  if (result.isConfirmed) {
    try {
      await deleteDoc(doc(db, "documentos_guardados", id));
      Swal.fire('¡Eliminado!', 'El documento ha sido borrado de la base de datos.', 'success');
    } catch (error) {
      console.error("Error al eliminar:", error);
      Swal.fire('Error', 'No se pudo eliminar el documento.', 'error');
    }
  }
};

const editarDocumento = (docGuardado) => {
  editandoId.value = docGuardado.id; 
  if (docGuardado.tipo === 'cotizacion') {
    cotizacion.value = JSON.parse(JSON.stringify(docGuardado)); 
    vistaActual.value = 'crear'; 
  } else if (docGuardado.tipo === 'cobro') {
    cobro.value = JSON.parse(JSON.stringify(docGuardado));
    cobro.value.monto = docGuardado.total; 
    vistaActual.value = 'cobro';
  }
};

const cancelarEdicion = () => {
  editandoId.value = null; 
  cotizacion.value = JSON.parse(JSON.stringify(cotizacionBase));
  cobro.value = JSON.parse(JSON.stringify(cobroBase));
  vistaActual.value = 'historial';
};

// 👇 NUEVA ALERTA PARA CAMBIO DE PESTAÑA 👇
const cambiarVista = async (nuevaVista) => {
  if (editandoId.value && nuevaVista !== vistaActual.value) {
    const result = await Swal.fire({
      title: 'Edición en curso',
      text: "Si cambias de pestaña se perderán los cambios no guardados. ¿Deseas salir?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3498db',
      cancelButtonColor: '#95a5a6',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Quedarme aquí'
    });

    if (result.isConfirmed) {
      cancelarEdicion();
      vistaActual.value = nuevaVista;
    }
  } else {
    vistaActual.value = nuevaVista;
  }
};

const verDocumento = (docGuardado) => {
  generarPDF(docGuardado.tipo, docGuardado, ajustes.value);
};

const numeroGenerado = ref('0000-00');
const fechaImpresion = ref('');
const cotizacionBase = { cliente: '', documento: '', nit: '', direccion: '', torre: '', apto: '', barrio: '', contacto: '', observaciones: '', items: [{ cantidad: 1, descripcion: '', valor: null }] };
const cotizacion = ref(JSON.parse(JSON.stringify(cotizacionBase)));

const numeroCobroGenerado = ref('0');
const cobroBase = { cliente: '', documento: '', nit: '', direccion: '', fechaCiudad: `Bogotá, ${new Date().toLocaleDateString()}`, monto: null, montoLetras: '', concepto: '' };
const cobro = ref(JSON.parse(JSON.stringify(cobroBase)));

watch(() => cobro.value.monto, (nuevoMonto) => {
  if (nuevoMonto && nuevoMonto > 0) {
    cobro.value.montoLetras = numeroALetras(nuevoMonto);
  } else {
    cobro.value.montoLetras = '';
  }
});

const agregarItem = () => cotizacion.value.items.push({ cantidad: 1, descripcion: '', valor: null });
const eliminarItem = (index) => cotizacion.value.items.splice(index, 1);
const calcularTotal = () => cotizacion.value.items.reduce((total, item) => total + (item.valor || 0), 0);
const obtenerFechaActual = () => { const f = new Date(); return `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`; };

onMounted(async () => {
  window.addEventListener('pwa-lista', revisarPWA);
  revisarPWA();

  const q = query(collection(db, "documentos_guardados"), orderBy("fechaCreacion", "desc"));
  onSnapshot(q, (querySnapshot) => {
    const dataTemp = [];
    querySnapshot.forEach((doc) => { dataTemp.push({ id: doc.id, ...doc.data() }); });
    historial.value = dataTemp;
  });

  try {
    const docAjustes = await getDoc(doc(db, "configuracion", "general"));
    if (docAjustes.exists()) { ajustes.value = docAjustes.data(); }
  } catch(e) { console.error("Error al cargar ajustes:", e); }
});

onUnmounted(() => {
  window.removeEventListener('pwa-lista', revisarPWA);
});

// 👇 NUEVA ALERTA DE AJUSTES 👇
const guardarAjustes = async () => {
  cargandoAjustes.value = true;
  try {
    await setDoc(doc(db, "configuracion", "general"), ajustes.value);
    Swal.fire({
      title: '¡Actualizado!',
      text: 'Los ajustes se guardaron correctamente.',
      icon: 'success',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (error) { 
    console.error(error); 
    Swal.fire('Error', 'No se pudieron guardar los ajustes.', 'error');
  }
  cargandoAjustes.value = false;
};

const procesarCotizacion = async () => {
  if (!cotizacion.value.cliente) {
    return Swal.fire('Faltan datos', 'Por favor, ingresa el nombre del cliente.', 'warning');
  }
  
  cargando.value = true;
  try {
    let numeroFinal = '';

    if (!editandoId.value) {
      const fecha = new Date();
      const periodoId = `${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getFullYear()).slice(-2)}`; 
      const correlativoRef = doc(db, "correlativos", periodoId);
      let nuevoNumero = 1;

      await runTransaction(db, async (transaction) => {
        const correlativoDoc = await transaction.get(correlativoRef);
        if (!correlativoDoc.exists()) { transaction.set(correlativoRef, { ultimoNumero: 1 }); } 
        else { nuevoNumero = correlativoDoc.data().ultimoNumero + 1; transaction.update(correlativoRef, { ultimoNumero: nuevoNumero }); }
      });
      numeroFinal = `${periodoId}-${String(nuevoNumero).padStart(2, '0')}`;
    } else {
      numeroFinal = cotizacion.value.numero; 
    }
    
    const datosCompletos = {
      tipo: 'cotizacion',
      numero: numeroFinal,
      cliente: cotizacion.value.cliente,
      documento: cotizacion.value.documento,
      direccion: cotizacion.value.direccion,
      torre: cotizacion.value.torre,
      apto: cotizacion.value.apto,
      barrio: cotizacion.value.barrio,
      contacto: cotizacion.value.contacto,
      observaciones: cotizacion.value.observaciones,
      items: cotizacion.value.items,
      total: calcularTotal(),
      fechaCreacionStr: editandoId.value ? cotizacion.value.fechaCreacionStr : obtenerFechaActual(),
      fechaCreacion: editandoId.value ? cotizacion.value.fechaCreacion : serverTimestamp(),
    };

    if (editandoId.value) {
      await updateDoc(doc(db, "documentos_guardados", editandoId.value), datosCompletos);
    } else {
      await setDoc(doc(collection(db, "documentos_guardados"), `COT-${numeroFinal}`), datosCompletos);
    }
    
    generarPDF('cotizacion', datosCompletos, ajustes.value);
    
    // Alerta de éxito cortita y amigable
    Swal.fire({
      title: '¡Listo!',
      text: 'Cotización procesada con éxito.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    cancelarEdicion();
  } catch (error) { 
    console.error(error); 
    Swal.fire('Error', 'Hubo un problema al guardar la cotización.', 'error');
  }
  cargando.value = false;
};

const procesarCobro = async () => {
  if (!cobro.value.cliente || !cobro.value.monto) {
    return Swal.fire('Faltan datos', 'Asegúrate de llenar el cliente y el monto.', 'warning');
  }

  cargando.value = true;
  try {
    let numeroFinal = '';

    if (!editandoId.value) {
      const correlativoRef = doc(db, "correlativos", "cuentas_cobro");
      let nuevoNumero = 1;

      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(correlativoRef);
        if (!docSnap.exists()) { transaction.set(correlativoRef, { ultimoNumero: 1 }); } 
        else { nuevoNumero = docSnap.data().ultimoNumero + 1; transaction.update(correlativoRef, { ultimoNumero: nuevoNumero }); }
      });
      numeroFinal = String(nuevoNumero);
    } else {
      numeroFinal = cobro.value.numero; 
    }
    
    const datosCompletosCobro = {
      tipo: 'cobro',
      numero: numeroFinal,
      cliente: cobro.value.cliente,
      documento: cobro.value.documento,
      nit: cobro.value.nit,
      direccion: cobro.value.direccion,
      fechaCiudad: cobro.value.fechaCiudad,
      montoLetras: cobro.value.montoLetras,
      concepto: cobro.value.concepto,
      total: cobro.value.monto,
      fechaCreacionStr: editandoId.value ? cobro.value.fechaCreacionStr : obtenerFechaActual(),
      fechaCreacion: editandoId.value ? cobro.value.fechaCreacion : serverTimestamp(),
    };

    if (editandoId.value) {
      await updateDoc(doc(db, "documentos_guardados", editandoId.value), datosCompletosCobro);
    } else {
      await setDoc(doc(collection(db, "documentos_guardados"), `COB-${numeroFinal}`), datosCompletosCobro);
    }
    
    generarPDF('cobro', datosCompletosCobro, ajustes.value);
    
    Swal.fire({
      title: '¡Listo!',
      text: 'Cuenta de cobro procesada con éxito.',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });

    cancelarEdicion();
  } catch (error) { 
    console.error(error); 
    Swal.fire('Error', 'Hubo un problema al guardar el cobro.', 'error');
  }
  cargando.value = false;
};

const cerrarSesion = async () => { await signOut(auth); router.push('/login'); };
</script>

<style scoped>
/* ESTILOS WEB PRINCIPALES */
:global(body) {
  background-color: #f4f1ea; 
  color: #2c3e50;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container { 
  max-width: 900px; 
  margin: 30px auto; 
  padding: 0 20px; 
}

/* BANNER PWA */
.banner-pwa {
  background: linear-gradient(135deg, #2c3e50, #34495e);
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  animation: slideDown 0.5s ease-out;
}

.banner-pwa span { font-weight: 500; font-size: 15px; }

.btn-instalar-banner {
  background: #2ed573; color: white; border: none; padding: 10px 20px;
  border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;
  transition: 0.2s; white-space: nowrap; margin-left: 15px;
}
.btn-instalar-banner:hover { background: #26b962; transform: scale(1.05); }

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

.header-nav { 
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; background: white; padding: 15px 25px;
  border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.header-nav h2 { margin: 0; color: #8b4513; font-weight: 800; }

.btn-salir { 
  background: #ff4757; color: white; border: none; padding: 10px 20px; 
  border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; 
}
.btn-salir:hover { background: #ff6b81; transform: scale(1.05); }

.tabs { display: flex; gap: 5px; margin-bottom: -10px; position: relative; z-index: 1; padding: 0 10px; }
.tabs button { 
  padding: 15px 25px; border: none; background: #e2dcd0; color: #666; 
  cursor: pointer; border-radius: 12px 12px 0 0; font-weight: bold; 
  font-size: 15px; transition: 0.3s; 
}
.tabs button:hover { background: #d4ccb9; }
.tabs button.active { 
  background: white; color: #d35400; box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}

.card-formulario { 
  background: white; padding: 35px; border-radius: 12px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; z-index: 2; 
}
.card-formulario h3 { margin-top: 0; color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 25px; }

.seccion-form { margin-bottom: 30px; }
.seccion-form h4 { color: #8b4513; margin-bottom: 15px; }
.grid-inputs, .grid-inputs-cobro { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; }

input, textarea { 
  padding: 12px 15px; border: 1.5px solid #dcdde1; border-radius: 8px; 
  font-family: inherit; font-size: 15px; background-color: #fafafa; 
  color: #2c3e50; cursor: text !important; caret-color: #d35400; color-scheme: light;
}

input:focus, textarea:focus { 
  border-color: #d35400; background-color: white !important; outline: none; 
  box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1); color: #2c3e50 !important; 
}

input[readonly] { background-color: #e2dcd0; color: #7f8c8d; cursor: not-allowed !important; border-color: #dcdde1; }
input[readonly]:focus { border-color: #dcdde1; box-shadow: none; }

.textarea-cobro { width: 100%; height: 100px; margin-top: 15px; resize: vertical; }

.fila-item { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
.input-cant { width: 80px; } .input-desc { flex-grow: 1; } .input-valor { width: 140px; }

.btn-agregar, .btn-eliminar { color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-agregar { background: #2ed573; margin-top: 10px;} .btn-agregar:hover { background: #26b962; }
.btn-eliminar { background: #ff6b81; padding: 10px 15px; } .btn-eliminar:hover { background: #ff4757; }

/* NUEVOS ESTILOS DE EDICIÓN */
.acciones-form { display: flex; gap: 15px; margin-top: 25px; }

.btn-guardar, .btn-guardar-cobro { 
  color: white; border: none; padding: 18px 20px; border-radius: 8px; 
  cursor: pointer; flex-grow: 1; font-size: 18px; font-weight: bold; transition: 0.3s; 
}
.btn-guardar { background: linear-gradient(135deg, #d35400, #e67e22); box-shadow: 0 4px 15px rgba(211, 84, 0, 0.3); } 
.btn-guardar:hover { background: linear-gradient(135deg, #e67e22, #d35400); transform: translateY(-2px); }
.btn-guardar-cobro { background: linear-gradient(135deg, #27ae60, #2ecc71); box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3); }
.btn-guardar-cobro:hover { background: linear-gradient(135deg, #2ecc71, #27ae60); transform: translateY(-2px); }
.btn-guardar:disabled, .btn-guardar-cobro:disabled { background: #bdc3c7; cursor: not-allowed; transform: none; box-shadow: none; }

.btn-cancelar { 
  background: #95a5a6; color: white; border: none; padding: 18px 20px; border-radius: 8px; 
  cursor: pointer; width: auto; font-size: 16px; font-weight: bold; transition: 0.3s; 
}
.btn-cancelar:hover { background: #7f8c8d; }

.mt-10 { margin-top: 10px; }
.seccion-total h3 { font-size: 24px; color: #d35400; text-align: right; margin-bottom: 15px; border: none; }

.header-historial { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px; }
.input-buscador { width: 100%; padding: 15px; border: 2px solid #e2dcd0; border-radius: 10px; font-size: 16px; outline: none; transition: 0.3s; background: white; }
.input-buscador:focus { border-color: #d35400; box-shadow: 0 0 10px rgba(211, 84, 0, 0.1); }

.tabla-responsive { overflow-x: auto; margin-top: 10px; border-radius: 8px; border: 1px solid #e2dcd0; }
.tabla-historial { width: 100%; border-collapse: collapse; background: white; }
.tabla-historial th, .tabla-historial td { border-bottom: 1px solid #e2dcd0; padding: 15px; text-align: left; }
.tabla-historial th { background: #f8f6f2; color: #8b4513; font-weight: bold; }
.tabla-historial tr:hover { background: #fafafa; }

.badge-cot { background: #1e90ff; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 8px; font-weight: bold; }
.badge-cobro { background: #2ed573; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; margin-right: 8px; font-weight: bold; }

.acciones-celda { display: flex; gap: 8px; }
.btn-ver { background: #f39c12; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; transition: 0.2s;}
.btn-borrar { background: #ff4757; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: 0.2s;}
.btn-editar { background: #3498db; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; transition: 0.2s;}

.btn-ver:hover { background: #e67e22; transform: translateY(-1px); }
.btn-borrar:hover { background: #ff6b81; transform: translateY(-1px); }
.btn-editar:hover { background: #2980b9; transform: translateY(-1px); }
</style>