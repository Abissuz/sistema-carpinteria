<template>
  <div class="dashboard-container">
    
<transition name="slide-fade">
  <div v-if="deferredPrompt && !yaInstalado && !bannerOculto" class="banner-pwa">
    <span>📲 Instala nuestra app en tu dispositivo para un acceso rápido y sin conexión.</span>
    
    <div class="banner-acciones">
      <button @click="instalarApp" class="btn-instalar-banner">Instalar Ahora</button>
      <button @click="cerrarBanner" class="btn-cerrar-banner" aria-label="Cerrar">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  </div>
</transition>

    <header class="header-nav">
  
  <div class="brand">
    <img src="/logo_sagrada.png" alt="Logo" class="logo-header">
    <h2>Sagrada Familia</h2>
  </div>

  <div class="header-actions">
    <button @click="cerrarSesion" class="btn-salir">
      <span class="icono-salir">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
      </span>
      <span class="texto-salir">Cerrar Sesión</span>
    </button>
  </div>
</header>

    <div class="tabs">
      <button :class="{ active: vistaActual === 'crear' }" @click="cambiarVista('crear')">
        <img src="/precio.png" class="icono-tab" alt="Cotización">
        <span class="texto-tab">Cotización</span>
      </button>
      
      <button :class="{ active: vistaActual === 'cobro' }" @click="cambiarVista('cobro')">
        <img src="/cobro.png" class="icono-tab" alt="Cobro">
        <span class="texto-tab">Cuenta de Cobro</span>
      </button>
      
      <button :class="{ active: vistaActual === 'historial' }" @click="cambiarVista('historial')">
        <img src="/historial.png" class="icono-tab" alt="historial">
        <span class="texto-tab">Historial</span>
      </button>
      
      <button :class="{ active: vistaActual === 'ajustes' }" @click="cambiarVista('ajustes')">
        <img src="/ajuste.png" class="icono-tab" alt="ajuste">
        <span class="texto-tab">Ajustes</span>
      </button>
    </div>

    <main v-if="vistaActual === 'crear'" class="card-formulario">
      <h3>{{ editandoId ? '✏️ Editar Presupuesto Nº ' + cotizacion.numero : 'Crear Nuevo Presupuesto' }}</h3>
      <section class="seccion-form">
        <h4>1. Datos del Cliente</h4>
        
        <div class="fila-destacada">
          <div>
            <label>Documento de Identidad *</label>
            <div class="input-group-fused">
              <select v-model="cotizacion.tipoDoc" class="select-fused">
                <option value="CC">C.C.</option>
                <option value="NIT">NIT</option>
                <option value="CE">C.E.</option>
                <option value="PPT">PPT</option>
              </select>
              <input type="text" v-model="cotizacion.documento" @change="buscarCliente('cotizacion')" placeholder="Ej: 10203040..." class="input-fused">
            </div>
          </div>
          
          <div>
            <label>Cliente / Empresa *</label>
            <input v-model="cotizacion.cliente" placeholder="Ej: Camilo Santander" style="width: 100%; box-sizing: border-box;"/>
          </div>
        </div>

        <div class="grid-inputs">
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
        <h3>Total: $ {{ formatearMoneda(calcularTotal()) }}</h3>
        <textarea v-model="cotizacion.observaciones" placeholder="OBSERVACIONES..." class="obse"></textarea>
        
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
        <div class="fila-destacada">
          <div>
            <label>Identificación *</label>
            <div class="input-group-fused">
              <select v-model="cobro.tipoDoc" class="select-fused">
                <option value="NIT">NIT</option>
                <option value="CC">C.C.</option>
                <option value="CE">C.E.</option>
                <option value="PPT">PPT</option>
              </select>
              <input type="text" v-model="cobro.documento" @change="buscarCliente('cobro')" placeholder="Número..." class="input-fused" required>
            </div>
          </div>

          <div>
            <label>Cliente / Empresa *</label>
            <input v-model="cobro.cliente" placeholder="Ej: Chistiner Santander" style="width: 100%; box-sizing: border-box;" required />
          </div>
        </div>

        <div class="grid-inputs-cobro">
          <input v-model="cobro.direccion" placeholder="Dirección del cliente" />
          <input v-model="cobro.fechaCiudad" placeholder="Ciudad y Fecha (Ej: Bogotá 20 de febrero)" required />
          
          <input v-model="cobro.monto" type="number" placeholder="Monto en números (Ej: 1900000)" required />
          <input v-model="cobro.montoLetras" placeholder="Monto en letras (Se llena solo...)" required readonly />
        </div>
        </section>
    </main>

    <main v-if="vistaActual === 'historial'" class="card-formulario">
      <div class="header-historial">
  <input type="text" v-model="busqueda" placeholder="Buscar por cliente o número..." class="input-buscador">
  
  <div class="filtros-tipo">
    <button :class="{ activo: filtroTipo === 'todos' }" @click="filtroTipo = 'todos'">Todos</button>
    <button :class="{ activo: filtroTipo === 'cotizacion' }" @click="filtroTipo = 'cotizacion'">Cotización</button>
    <button :class="{ activo: filtroTipo === 'cobro' }" @click="filtroTipo = 'cobro'">Cobro</button>
  </div>
</div>
      
      <div class="tabla-responsive">
  <table class="tabla-historial">
    <thead>
      <tr>
        <th>Tipo / Nº</th>
        <th>Cliente</th>
        <th class="text-right">Total</th> 
        <th class="text-right">Fecha</th>
        <th class="text-center">Acciones</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="documento in historialFiltrado" :key="documento.id">
        <td data-label="Tipo / Nº" class="bold">
          <span :class="documento.tipo === 'cobro' ? 'badge-cobro' : 'badge-cot'">
            {{ documento.tipo === 'cobro' ? 'COBRO' : 'COT' }}
          </span>
          #{{ documento.numero }}
        </td>
        
        <td data-label="Cliente">{{ documento.cliente }}</td>
        
        <td data-label="Total" class="text-right bold">
          $ {{ formatearMoneda(documento.total) }}
        </td>
        
        <td data-label="Fecha" class="text-right">
          {{ documento.fechaCreacionStr || 'N/A' }}
        </td>
        
        <td data-label="Acciones" class="acciones-celda text-center">
          <button @click="verDocumento(documento)" class="btn-ver" title="Ver / Descargar">📄</button>
          <button @click="editarDocumento(documento)" class="btn-editar" title="Editar">✏️</button>
          <button @click="eliminarDocumento(documento.id, documento.numero)" class="btn-borrar" title="Eliminar">🗑️</button>
        </td>
      </tr>
      <tr v-if="historialFiltrado.length === 0">
        <td colspan="5" class="text-center mensaje-vacio">No se encontraron documentos en el historial.</td>
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
          <textarea v-model="ajustes.formaPago" rows="3" style="width: 100%; font-family: Arial; padding: 10px; box-sizing: border-box;"></textarea>

          <label class="bold mt-10">Garantía:</label>
          <input v-model="ajustes.garantia" />
        </div>
        <div class="acciones-form"></div>
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
import { doc, runTransaction, collection, setDoc, updateDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, getDoc, getDocs, where, limit } from 'firebase/firestore';

// 👇 IMPORTAMOS SWEETALERT2 👇
import Swal from 'sweetalert2';

import { generarPDF, numeroALetras, formatearMoneda } from '../utils/generadorPdf';

const router = useRouter();
const cargando = ref(false);
const vistaActual = ref('crear'); 
const historial = ref([]);
const busqueda = ref(''); 

// 🔥 NUEVO: Variable para saber qué botón de filtro está activo 🔥
const filtroTipo = ref('todos');

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

// 🔥 ACTUALIZADO: Computed property con doble validación (Texto + Tipo) 🔥
const historialFiltrado = computed(() => {
  return historial.value.filter(doc => {
    
    // A) Validación 1: ¿Coincide con la barra de búsqueda?
    const termino = busqueda.value.toLowerCase();
    const coincideTexto = !termino || 
                          doc.cliente?.toLowerCase().includes(termino) || 
                          doc.numero?.toString().toLowerCase().includes(termino);
    
    // B) Validación 2: ¿Coincide con el botón seleccionado?
    const coincideTipo = filtroTipo.value === 'todos' || doc.tipo === filtroTipo.value;

    return coincideTexto && coincideTipo;
  });
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

// 🔥 NUEVO: Agregamos tipoDoc a las bases 🔥
const cotizacionBase = { tipoDoc: 'CC', cliente: '', documento: '', nit: '', direccion: '', torre: '', apto: '', barrio: '', contacto: '', observaciones: '', items: [{ cantidad: 1, descripcion: '', valor: null }] };
const cotizacion = ref(JSON.parse(JSON.stringify(cotizacionBase)));

const numeroCobroGenerado = ref('0');
const cobroBase = { tipoDoc: 'NIT', cliente: '', documento: '', nit: '', direccion: '', fechaCiudad: `Bogotá, ${new Date().toLocaleDateString()}`, monto: null, montoLetras: '', concepto: '' };
const cobro = ref(JSON.parse(JSON.stringify(cobroBase)));

// 🔥 NUEVO: Función para autocompletar clientes buscando en Firestore 🔥
const buscarCliente = async (tipoVista) => {
  const docBuscar = tipoVista === 'cotizacion' ? cotizacion.value.documento : cobro.value.documento;
  if (!docBuscar || docBuscar.length < 5) return; 

  try {
    const q = query(collection(db, "documentos_guardados"), where("documento", "==", docBuscar), limit(1));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const datosAnteriores = querySnapshot.docs[0].data();
      
      if (tipoVista === 'cotizacion') {
        cotizacion.value.cliente = datosAnteriores.cliente || '';
        cotizacion.value.direccion = datosAnteriores.direccion || '';
        cotizacion.value.torre = datosAnteriores.torre || '';
        cotizacion.value.apto = datosAnteriores.apto || '';
        cotizacion.value.barrio = datosAnteriores.barrio || '';
        cotizacion.value.contacto = datosAnteriores.contacto || '';
        if(datosAnteriores.tipoDoc) cotizacion.value.tipoDoc = datosAnteriores.tipoDoc;
      } else {
        cobro.value.cliente = datosAnteriores.cliente || '';
        cobro.value.direccion = datosAnteriores.direccion || '';
        if(datosAnteriores.tipoDoc) cobro.value.tipoDoc = datosAnteriores.tipoDoc;
      }

      const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer: 3000, timerProgressBar: true });
      Toast.fire({ icon: "success", title: "Datos del cliente autocompletados" });
    }
  } catch (error) {
    console.error("Error buscando cliente:", error);
  }
};

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

const bannerOculto = ref(false);

const cerrarBanner = () => {
  bannerOculto.value = true;
};

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
    
    // 🔥 NUEVO: Guardamos el tipoDoc en la base de datos 🔥
    const datosCompletos = {
      tipo: 'cotizacion',
      tipoDoc: cotizacion.value.tipoDoc, 
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
    
    // 🔥 NUEVO: Guardamos el tipoDoc en la base de datos 🔥
    const datosCompletosCobro = {
      tipo: 'cobro',
      tipoDoc: cobro.value.tipoDoc,
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
:global(html), :global(body) {
  background-color: #f4f1ea; 
  min-height: 100vh; 
  color: #2c3e50;
  margin: 0;
  padding: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  box-sizing: border-box;
}

:global(#app) {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-container { 
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
}

/* Mantiene el botón de instalar y la X juntos a la derecha */
.banner-acciones {
  display: flex;
  align-items: center;
  gap: 15px; 
}

/* =========================================
   ANIMACIONES DEL BANNER (VUE TRANSITION)
   ========================================= */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.2s ease-out; 
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}

/* BANNER PWA */
.banner-pwa {
  position: fixed;
    z-index: 3;
    top: 1%;
    background: linear-gradient(135deg, #2c3e50, #34495e);
    color: white;
    padding: 15px 20px;
    border-radius: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.banner-pwa span { font-weight: 500; font-size: 15px; }

.btn-instalar-banner {
  background: #2ed573; color: white; border: none; padding: 10px 20px;
  border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 14px;
  transition: 0.2s; white-space: nowrap; margin-left: 15px;
}
.btn-instalar-banner:hover { background: #26b962; transform: scale(1.05); }

.btn-cerrar-banner{
      background-color: transparent;
    border: none;
}

/* Contenedor principal del Header */
.header-nav { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  background: white; 
  width: 90%;
  padding: 15px 25px;
  border-radius: 12px; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  box-sizing: border-box;
}

/* El grupo del Logo y el Título */
.brand {
  display: flex;
  align-items: center;
  gap: 15px; 
}

.logo-header {
  height: 70px; 
  width: auto;
  object-fit: contain;
}

.brand h2 { 
  margin: 0; 
  color: #8b4513; 
  font-weight: 800; 
  font-size: 22px;
}

/* Estilo del botón en computadoras (Muestra ícono y texto) */
.btn-salir { 
  display: flex;
  align-items: center;
  gap: 8px; 
  background: #ff4757; 
  color: white; 
  border: none; 
  padding: 10px 20px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-weight: bold; 
  transition: 0.3s; 
}

.icono-salir {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-salir:hover { background: #ff6b81; transform: scale(1.05); }

.tabs { display: flex; gap: 5px; margin-bottom: -10px; position: relative; z-index: 1; padding: 0 10px; 
  align-items: center;
  justify-content: center;
}
.obse{
      width: 100%;
    height: auto;
    box-sizing: border-box;
}
.tabs button { 
  padding: 15px 25px; border: none; background: #e2dcd0; color: #666; 
  cursor: pointer; border-radius: 12px 12px 0 0; font-weight: bold; 
  font-size: 15px; transition: 0.3s; 
  align-items: center;
  justify-content: center;
  display: flex;
}
.tabs button:hover { background: #d4ccb9; }
.tabs button.active { 
  background: white; color: #d35400;
}
.icono-tab {
  width: 30px;
  height: auto;
  display: none; 
  transition: filter 0.3s ease;
}
.card-formulario { 
    background: white;
    padding: 35px;
    width: 65%;
    min-width: 455px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 2;
    box-sizing: border-box;
}
.card-formulario h3 { margin-top: 0; color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 25px; }

.seccion-form { margin-bottom: 30px; }
.seccion-form h4 { color: #8b4513; margin-bottom: 15px; }
.grid-inputs, .grid-inputs-cobro { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; }

/* =========================================
   ESTILOS DE INPUTS GENERALES
   ========================================= */
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

/* =========================================
   INPUTS FUSIONADOS (TIPO DOC + NUMERO)
   ========================================= */

/* 🔥 NUEVA DISTRIBUCIÓN DE ESPACIO 🔥 */
.fila-destacada {
  display: grid;
  /* 1.2 partes para el documento, 2 partes para el nombre del cliente */
  grid-template-columns: 1.2fr 2fr; 
  gap: 15px;
  margin-bottom: 15px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #7f8c8d;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.input-group-fused {
  display: flex;
  align-items: stretch;
  width: 100%;
}

.select-fused {
  padding: 12px 10px;
  border: 1.5px solid #dcdde1;
  border-right: none; 
  border-radius: 8px 0 0 8px; 
  font-family: inherit;
  font-size: 14px;
  
  /* 🔥 EL NUEVO ESTILO ELEGANTE 🔥 */
  background-color: #fdfcf9; /* Fondo más clarito */
  color: #d35400; /* Texto naranja corporativo */
  font-weight: 800; /* Letra más gordita */
  cursor: pointer;
  outline: none;
  min-width: 85px; /* Un poco más ancho */
  
  /* ESTO QUITA EL ESTILO FEO DE WINDOWS/MAC */
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  
  /* DIBUJAMOS NUESTRA PROPIA FLECHA NARANJA SVG */
  background-image: url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d35400' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center; /* Ubicamos la flecha a la derecha */
  background-size: 14px;
  padding-right: 30px; /* Hacemos espacio para que el texto no pise la flecha */
}

.input-fused {
  flex-grow: 1; 
  border-radius: 0 8px 8px 0; 
}

.select-fused:focus,
.input-fused:focus {
  border-color: #d35400;
}
.input-fused:focus {
  border-left: 1.5px solid #d35400; 
}

/* Que se apilen uno sobre otro si están en el celular */
@media (max-width: 784px) {
  .fila-destacada {
    grid-template-columns: 1fr;
  }
}

.textarea-cobro { width: 100%; height: 100px; margin-top: 15px; resize: vertical; }
.text-P0{
  box-sizing: border-box;
}
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

.header-historial { display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;}
.input-buscador { width: 100%; padding: 15px; border: 2px solid #e2dcd0; border-radius: 10px; font-size: 16px; outline: none; transition: 0.3s; background: white; box-sizing: border-box;}
.input-buscador:focus { border-color: #d35400; box-shadow: 0 0 10px rgba(211, 84, 0, 0.1); }

/* =========================================
   FILTROS DEL HISTORIAL (NUEVO)
   ========================================= */
.filtros-tipo {
  display: flex;
  gap: 10px;
  overflow-x: auto; 
  padding-bottom: 5px; 
}

.filtros-tipo button {
  padding: 8px 18px;
  border: 1.5px solid #e2dcd0;
  background: white;
  color: #7f8c8d;
  border-radius: 20px; 
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap; 
}

.filtros-tipo button:hover {
  background: #f8f6f2;
}

.filtros-tipo button.activo {
  background: #d35400; 
  color: white;
  border-color: #d35400;
  box-shadow: 0 4px 10px rgba(211, 84, 0, 0.2);
}

/* =========================================
   ESTILOS DE TABLA (COMPUTADORA / BASE)
   ========================================= */
.tabla-responsive { 
  overflow-x: auto; 
  margin-top: 20px; 
  border-radius: 12px; 
  border: 1px solid #e2dcd0; 
  box-shadow: 0 4px 15px rgba(0,0,0,0.02); 
}

.tabla-historial { 
  width: 100%; 
  border-collapse: collapse; 
  background: white; 
}

.tabla-historial th, 
.tabla-historial td { 
  border-bottom: 1px solid #f0f0f0; 
  padding: 18px 20px; 
  text-align: left; 
  font-size: 15px;
}

/* Evitamos que el texto se rompa en múltiples líneas en columnas clave */
.tabla-historial td:nth-child(1),
.tabla-historial td:nth-child(3),
.tabla-historial td:nth-child(4),
.tabla-historial td.acciones-celda {
  white-space: nowrap; 
}

.tabla-historial th { 
  background: #fdfcf9; 
  color: #8b4513; 
  font-weight: 700; 
  text-transform: uppercase; 
  font-size: 12px;
  letter-spacing: 0.5px;
}

.tabla-historial tr { transition: background-color 0.2s; }
.tabla-historial tbody tr:hover { background: #fafafa; }

/* CLASES DE UTILIDAD PARA ALINEACIÓN TABLA */
.text-right { text-align: right !important; }
.text-center { text-align: center !important; }
.bold { font-weight: 600; }
.mensaje-vacio { padding: 40px; color: #7f8c8d; font-style: italic; }

.badge-cot { background: #1e90ff; color: white; padding: 5px 10px; border-radius: 20px; font-size: 10px; margin-right: 10px; font-weight: bold; letter-spacing: 0.5px; }
.badge-cobro { background: #2ed573; color: white; padding: 5px 10px; border-radius: 20px; font-size: 10px; margin-right: 10px; font-weight: bold; letter-spacing: 0.5px; }

/* 🔥 CORRECCIÓN: Botones de Acción (Sin romper el borde) 🔥 */
.acciones-celda { 
  text-align: center; 
  white-space: nowrap; 
}

.btn-ver, .btn-editar, .btn-borrar {
  background: #f4f1ea; 
  color: #2c3e50; 
  border: 1px solid #e2dcd0; 
  padding: 8px; 
  border-radius: 8px; 
  cursor: pointer; 
  font-size: 16px; 
  transition: all 0.2s ease; 
  display: inline-flex; 
  align-items: center; 
  justify-content: center; 
  width: 38px; 
  height: 38px;
  margin: 0 4px; /* Separación horizontal en lugar de gap */
  vertical-align: middle;
}

.btn-ver:hover { background: #3498db; color: white; border-color: #3498db; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(52, 152, 219, 0.2); }
.btn-editar:hover { background: #f39c12; color: white; border-color: #f39c12; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(243, 156, 18, 0.2); }
.btn-borrar:hover { background: #ff4757; color: white; border-color: #ff4757; transform: translateY(-2px); box-shadow: 0 4px 8px rgba(255, 71, 87, 0.2); }

/* 🔥 AJUSTE PARA TABLETS Y PANTALLAS MEDIANAS (Entre 785px y 1024px) 🔥 */
@media (max-width: 1024px) {
  .card-formulario {
    width: 95%; 
    min-width: unset; 
    padding: 25px 20px; 
  }

  .header-nav {
    width: 95%; 
  }
}

  @media (max-width: 784px) {
  .fila-item { 
    display: flex; 
    flex-wrap: wrap; 
    gap: 10px; 
    margin-bottom: 15px; 
    align-items: center; 
    background: #fdfcf9; 
  padding: 12px; 
  border-radius: 8px;
  border: 1px solid #e2dcd0;
  }

  /* --- PRIMERA LÍNEA --- */
  .input-cant { 
    order: 1; 
    width: 70px; 
  } 
  
  .input-valor {
    order: 2; 
    flex-grow: 1; 
    width: auto;
  }

  .btn-eliminar {
    order: 3; 
  }

  /* --- SEGUNDA LÍNEA --- */
  .input-desc { 
    order: 4; 
    width: 100%; 
    margin-top: 5px; 
  } 
  
  /* 🔥 CONVERSIÓN DE TABLA A TARJETAS PARA CELULARES 🔥 */
  .tabla-responsive { border: none; background: transparent; box-shadow: none; }
  .tabla-historial thead { display: none; }
  .tabla-historial, .tabla-historial tbody, .tabla-historial tr, .tabla-historial td { display: block; width: 100%; box-sizing: border-box; }
  
  .tabla-historial tr {
    background: white; margin-bottom: 15px; border-radius: 12px; border: 1px solid #e2dcd0; box-shadow: 0 4px 10px rgba(0,0,0,0.03); padding: 10px 15px;
  }
  
  .tabla-historial td {
    display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f0f0f0; padding: 10px 0; text-align: right;
  }
  
  .tabla-historial td:last-child {
    border-bottom: none; padding-bottom: 0; justify-content: center;
  }
  
  .tabla-historial td::before {
    content: attr(data-label); font-weight: bold; color: #8b4513; text-transform: uppercase; font-size: 11px; text-align: left;
  }
}

@media (max-width: 580px) {
  .card-formulario {
    min-width: unset;
    width: 95%;
    box-sizing: border-box;
  }

  .texto-salir {
    display: none; 
  }
  
  .btn-salir {
    padding: 10px 12px; 
  }

.header-nav {
    width: 100%;
    box-sizing: border-box;
}

  /* 🔥 OPCIÓN 2: BARRA INFERIOR ESTILO APP NATIVA 🔥 */
    .tabs {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: #fff;
        border: solid 1px #c0c0c0d1;
        border-radius: 20px 20px 0 0;
        margin: 0;
        box-sizing: border-box;
        padding: 5px;
        gap: 2px;
        z-index: 1000;
        display: flex;
        justify-content: space-between;
    }

  .tabs button {
    flex: 1; 
    white-space: nowrap; 
    border: none;
    background: #FFF;
    color: #b4b1b1bf;
    cursor: pointer;
    font-weight: bold;
    font-size: 15px;
    transition: 0.3s;
    align-items: center;
    justify-content: center;
    display: flex;
  }

.tabs button.active .icono-tab {
  filter: invert(48%) sepia(89%) saturate(1900%) hue-rotate(1deg) brightness(98%) contrast(101%);
  transition: filter 0.3s ease;
}

.tabs button.active:nth-child(3) .icono-tab,
.tabs button.active:nth-child(4) .icono-tab {
  filter: invert(48%) sepia(89%) saturate(1900%) hue-rotate(1deg) brightness(130%) contrast(101%); 
}

  .dashboard-container {
    padding-bottom: 70px;
  }
  
  .tabs .texto-tab {
    display: none; 
  }
  
  .icono-tab {
    display: block;
    filter: invert(0%) opacity(60%);
  }

  .tabs button {
    padding: 10px;
  }
}
@media (max-width: 390px) {
  .brand h2{
    display: none;
  }
}
</style>