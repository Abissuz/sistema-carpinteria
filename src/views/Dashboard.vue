<template>
  <div class="dashboard-container">
    <header class="header-nav">
      <h2>🔨 Sagrada Familia - Sistema</h2>
      <button @click="cerrarSesion" class="btn-salir">Cerrar Sesión</button>
    </header>

    <div class="tabs">
      <button :class="{ active: vistaActual === 'crear' }" @click="vistaActual = 'crear'">Cotización</button>
      <button :class="{ active: vistaActual === 'cobro' }" @click="vistaActual = 'cobro'">Cuenta de Cobro</button>
      <button :class="{ active: vistaActual === 'historial' }" @click="vistaActual = 'historial'">Historial</button>
      <button :class="{ active: vistaActual === 'ajustes' }" @click="vistaActual = 'ajustes'">Ajustes</button>
    </div>

    <main v-if="vistaActual === 'crear'" class="card-formulario">
      <h3>Crear Nuevo Presupuesto</h3>
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
        <button @click="procesarCotizacion" class="btn-guardar" :disabled="cargando">
          {{ cargando ? 'Guardando y Generando PDF...' : 'Generar Cotización' }}
        </button>
      </section>
    </main>

    <main v-if="vistaActual === 'cobro'" class="card-formulario">
      <h3>Generar Cuenta de Cobro</h3>
      <section class="seccion-form">
        <div class="grid-inputs-cobro">
          <input v-model="cobro.cliente" placeholder="Nombre de quien debe (Ej: Chistiner Santander)" required />
          <input v-model="cobro.documento" placeholder="Documento" required />
          <input v-model="cobro.nit" placeholder="NIT" required />
          <input v-model="cobro.direccion" placeholder="Dirección del cliente" />
          <input v-model="cobro.fechaCiudad" placeholder="Ciudad y Fecha (Ej: Bogotá 20 de febrero del 2026)" required />
          
          <input v-model="cobro.monto" type="number" placeholder="Monto en números (Ej: 1900000)" required />
          <input v-model="cobro.montoLetras" placeholder="Monto en letras (Ej: UN MILLON NOVECIENTOS MIL PESOS M/CTE)" required />
        </div>
        <textarea v-model="cobro.concepto" placeholder="POR CONCEPTO DE: (Ej: PAGO CONTRATO CUYO OBJETO ES...)" class="textarea-cobro" required></textarea>
        
        <button @click="procesarCobro" class="btn-guardar-cobro" :disabled="cargando">
          {{ cargando ? 'Generando Cobro...' : 'Generar Cuenta de Cobro' }}
        </button>
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
                <button @click="verDocumento(documento)" class="btn-ver" title="Ver / Descargar">📄 Abrir</button>
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
// --- NUEVAS IMPORTACIONES NATIVAS ---
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { ref, onMounted, computed } from 'vue';
import { doc, runTransaction, collection, setDoc, serverTimestamp, query, orderBy, onSnapshot, deleteDoc, getDoc } from 'firebase/firestore';

// Inicializar fuentes (A prueba de balas para Vite en Producción)
const vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : (pdfFonts.vfs || pdfFonts.default?.vfs || pdfFonts.default?.pdfMake?.vfs);
pdfMake.vfs = vfs;

const router = useRouter();
const cargando = ref(false);
const vistaActual = ref('crear'); 
const historial = ref([]);
const busqueda = ref(''); 

// === AJUSTES ===
const cargandoAjustes = ref(false);
const ajustes = ref({
  tiempoEntrega: '30 dias habiles',
  condicionesPago: '60% al formalizar el pedido, 20% por avance de obra y 20% a la entrega.',
  formaPago: 'Efectivo - Transferencia bancaria. Cta de Ahorros BANCOLOMBIA 669-000015-05 Rafael Jose Pérez Leon.',
  garantia: '02 años por defectos de fabricación. Herrajes 1 mes.'
});

// Buscador Inteligente
const historialFiltrado = computed(() => {
  if (!busqueda.value) return historial.value;
  const termino = busqueda.value.toLowerCase();
  return historial.value.filter(doc => 
    doc.cliente?.toLowerCase().includes(termino) || 
    doc.numero?.toLowerCase().includes(termino)
  );
});

// Eliminar Documento
const eliminarDocumento = async (id, numero) => {
  const confirmar = confirm(`¿Estás seguro de eliminar el documento ${numero}?`);
  if (confirmar) {
    try {
      await deleteDoc(doc(db, "documentos_guardados", id));
      alert("Documento eliminado con éxito.");
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  }
};

// ==========================================
// EL NUEVO MOTOR DE PDF NATIVO (NIVEL ENTERPRISE)
// ==========================================
const generarPDF = (tipo, datos) => {
  const estilos = {
    header: { fontSize: 16, bold: true, alignment: 'center' },
    subheader: { fontSize: 12, bold: true, alignment: 'center', margin: [0, 0, 0, 15] },
    tableHeader: { bold: true, fontSize: 10, color: 'white', fillColor: '#cc0000', alignment: 'center', margin: [2, 2, 2, 2] },
    textoBold: { bold: true, fontSize: 10 },
    textoNormal: { fontSize: 10 },
    textoPequeno: { fontSize: 9 }
  };

  let documentDefinition = {};

  if (tipo === 'cotizacion') {
    // 1. Armar las filas de los ítems
    const filasItems = [
      [{ text: 'CANT.', style: 'tableHeader' }, { text: 'DESCRIPCION', style: 'tableHeader' }, { text: 'VALOR TOTAL', style: 'tableHeader' }]
    ];
    
    // Si la factura tiene items, los agregamos
    if(datos.items && datos.items.length > 0) {
      datos.items.forEach(item => {
        filasItems.push([
          { text: item.cantidad?.toString() || '1', alignment: 'center', style: 'textoBold' }, 
          { text: item.descripcion || '', style: 'textoNormal' }, 
          { text: '$ ' + formatearMoneda(item.valor), alignment: 'right', style: 'textoNormal' }
        ]);
      });
    }

    // Completar hasta 8 filas para que se vea como el formato original
    const faltantes = 8 - (datos.items?.length || 0);
    for(let i=0; i < faltantes; i++) {
      filasItems.push(['', '', { text: '$ 0.00', alignment: 'right', style: 'textoNormal' }]);
    }

    // 2. Construir el documento
    documentDefinition = {
      content: [
        { text: 'CARPINTERIA SAGRADA FAMILIA', style: 'header' },
        { text: 'RAFAEL JOSE PEREZ LEON', style: 'subheader' },
        
        // Bloque Fecha y Número
        {
          columns: [
            { width: '*', text: '' }, // Espacio en blanco a la izquierda
            {
              width: 'auto',
              table: {
                body: [
                  [{ text: 'Fecha:', style: 'tableHeader' }, { text: datos.fechaCreacionStr || '', alignment: 'center', style: 'textoBold' }],
                  [{ text: 'Cotizacion Nº', style: 'tableHeader' }, { text: datos.numero || '', alignment: 'center', style: 'textoBold' }]
                ]
              }
            }
          ],
          margin: [0, 0, 0, 15]
        },

        // Tabla Cliente (Rediseñada a 6 columnas para el bloque Barrio)
        {
          table: {
            widths: ['15%', '15%', '15%', '20%', '15%', '20%'],
            body: [
              [
                { text: 'Cliente:', style: 'tableHeader' }, 
                { text: datos.cliente || '', style: 'textoBold', colSpan: 3 }, 
                {}, 
                {}, 
                { text: 'Documento:', style: 'tableHeader' }, 
                { text: datos.documento || '', style: 'textoBold' }
              ],
              [
                { text: 'Direccion:', style: 'tableHeader' }, 
                { text: datos.direccion || '', style: 'textoBold', colSpan: 3 }, 
                {}, 
                {}, 
                { text: 'Torre:', style: 'tableHeader' }, 
                { text: datos.torre || '', style: 'textoBold' }
              ],
              [
                { text: 'Apto:', style: 'tableHeader' }, 
                { text: datos.apto || '', style: 'textoBold' }, 
                { text: 'Barrio:', style: 'tableHeader' }, // ¡Aquí está la magia roja!
                { text: datos.barrio || '', style: 'textoBold' }, 
                { text: 'Contacto:', style: 'tableHeader' }, 
                { text: datos.contacto || '', style: 'textoBold' }
              ]
            ]
          },
          margin: [0, 0, 0, 10]
        },

        // Tabla Items
        {
          table: { widths: ['10%', '65%', '25%'], body: filasItems },
          margin: [0, 0, 0, 10]
        },

        // Total
        {
          table: {
            widths: ['75%', '25%'],
            body: [
              [{ text: 'TOTAL:', style: 'tableHeader', alignment: 'right' }, { text: '$ ' + formatearMoneda(datos.total), alignment: 'right', bold: true, color: '#cc0000' }]
            ]
          },
          margin: [0, 0, 0, 15]
        },

        // Condiciones
        { text: 'OBSERVACIONES: ' + (datos.observaciones || ''), color: '#cc0000', bold: true, italic: true, fontSize: 10, margin: [0, 0, 0, 5] },
        { text: '"PRESUPUESTO NO INCLUYE IVA, NI RETENCIONES" INCLUYE TRANSPORTE E INSTALACION.', style: 'textoBold', margin: [0, 0, 0, 5] },
        { text: 'CONDICIONES GENERALES:', style: 'textoBold', decoration: 'underline', margin: [0, 0, 0, 5] },
        {
          ul: [
            { text: [{ text: 'Tiempo de entrega: ', bold: true }, ajustes.value.tiempoEntrega] },
            { text: [{ text: 'Condiciones de pago: ', bold: true }, ajustes.value.condicionesPago] },
            { text: [{ text: 'Forma de pago: ', bold: true }, ajustes.value.formaPago] },
            { text: [{ text: 'Garantía: ', bold: true }, ajustes.value.garantia] }
          ],
          style: 'textoPequeno'
        }
      ],
      styles: estilos
    };

  } else {
    // --- DISEÑO PARA CUENTA DE COBRO ---
    documentDefinition = {
      defaultStyle: {
        fontSize: 12, 
        lineHeight: 1.2
      },
      content: [
        { text: datos.fechaCiudad || '', alignment: 'right', margin: [0, 0, 0, 50] },
        { text: 'CUENTA DE COBRO', fontSize: 14, bold: true, alignment: 'center', margin: [0, 0, 0, 30] },
        
        { text: (datos.cliente || '').toUpperCase(), alignment: 'center' },
        // Corrección de documento/documeto aplicada aquí:
        datos.documento ? { text: 'CE ' + (datos.documento || '').toUpperCase(), alignment: 'center' } : '',
        datos.nit ? { text: 'NIT. ' + datos.nit, alignment: 'center' } : '',
        { text: (datos.direccion || '').toUpperCase(), alignment: 'center', margin: [0, 0, 0, 30] },

        { text: 'DEBE A:', alignment: 'center', bold: true, margin: [0, 0, 0, 10] },
        { text: 'RAFAEL JOSÉ PÉREZ LEÓN', alignment: 'center' },
        { text: 'PASAPORTE: 112472838', alignment: 'center', margin: [0, 0, 0, 30] },

        { text: 'LA SUMA DE:', alignment: 'center', bold: true, margin: [0, 0, 0, 10] },
        { text: `${(datos.montoLetras || '').toUpperCase()} ($ ${formatearMoneda(datos.total)})`, alignment: 'center', margin: [0, 0, 0, 30] },

        { text: 'POR CONCEPTO DE:', alignment: 'center', bold: true, margin: [0, 0, 0, 15] },
        { text: (datos.concepto || '').toUpperCase(), alignment: 'justify', margin: [0, 0, 0, 50] },

        // PAGO DE SERVICIOS separado perfectamente
        {
          columns: [
            { text: 'PAGO DE SERVICIOS', bold: true, width: 'auto' },
            { text: `$ ${formatearMoneda(datos.total)}`, bold: true, width: '*', margin: [30, 0, 0, 0] }
          ],
          margin: [0, 0, 0, 60]
        },

        // Firmas / Footer
        { text: (datos.cliente || '').toUpperCase(), bold: true },
        datos.documento ? { text: 'CE ' + (datos.documento || '').toUpperCase(), bold: true } : '',
        datos.nit ? { text: 'NIT. ' + datos.nit, bold: true } : '',
        { text: (datos.direccion || '').toUpperCase(), bold: true, margin: [0, 0, 0, 70] },

        // AQUÍ IRÁ LA IMAGEN DE LA FIRMA LUEGO SI LA TIENES
        { text: 'RAFAEL JOSE PÉREZ LEÓN', bold: true },
        { text: 'PASAPORTE 112472838', bold: true }
      ],
      styles: estilos
    };
  }

  // Ordenamos la creación y descarga limpia
  pdfMake.createPdf(documentDefinition).download(`${tipo === 'cotizacion' ? 'Cotizacion' : 'Cobro'}_${datos.numero}.pdf`);
  cargando.value = false;
};

// Generar PDF para Previsualizar/Descargar desde el historial
const verDocumento = (docGuardado) => {
  generarPDF(docGuardado.tipo, docGuardado);
};

// Variables
const numeroGenerado = ref('0000-00');
const fechaImpresion = ref('');
const cotizacionBase = { cliente: '', documento: '', nit: '', direccion: '', torre: '', apto: '', barrio: '', contacto: '', observaciones: '', items: [{ cantidad: 1, descripcion: '', valor: null }] };
const cotizacion = ref(JSON.parse(JSON.stringify(cotizacionBase)));

const numeroCobroGenerado = ref('0');
const cobroBase = { cliente: '', documento: '', nit: '', direccion: '', fechaCiudad: `Bogotá, ${new Date().toLocaleDateString()}`, monto: null, montoLetras: '', concepto: '' };
const cobro = ref(JSON.parse(JSON.stringify(cobroBase)));

// Funciones Auxiliares
const agregarItem = () => cotizacion.value.items.push({ cantidad: 1, descripcion: '', valor: null });
const eliminarItem = (index) => cotizacion.value.items.splice(index, 1);
const calcularTotal = () => cotizacion.value.items.reduce((total, item) => total + (item.valor || 0), 0);
const formatearMoneda = (valor) => valor ? Number(valor).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00';
const obtenerFechaActual = () => { const f = new Date(); return `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`; };

// Cargar Datos Iniciales
onMounted(async () => {
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

const guardarAjustes = async () => {
  cargandoAjustes.value = true;
  try {
    await setDoc(doc(db, "configuracion", "general"), ajustes.value);
    alert("¡Ajustes actualizados correctamente!");
  } catch (error) { console.error(error); }
  cargandoAjustes.value = false;
};

// Guardar Cotización (¡AHORA GUARDA LOS ÍTEMS COMPLETOS!)
const procesarCotizacion = async () => {
  if (!cotizacion.value.cliente) return alert("Ingresa el cliente.");
  cargando.value = true;
  try {
    const fecha = new Date();
    const periodoId = `${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getFullYear()).slice(-2)}`; 
    const correlativoRef = doc(db, "correlativos", periodoId);
    let nuevoNumero = 1;

    await runTransaction(db, async (transaction) => {
      const correlativoDoc = await transaction.get(correlativoRef);
      if (!correlativoDoc.exists()) { transaction.set(correlativoRef, { ultimoNumero: 1 }); } 
      else { nuevoNumero = correlativoDoc.data().ultimoNumero + 1; transaction.update(correlativoRef, { ultimoNumero: nuevoNumero }); }
    });

    numeroGenerado.value = `${periodoId}-${String(nuevoNumero).padStart(2, '0')}`;
    
    // Armamos el objeto con ABSOLUTAMENTE TODO para Firebase
    const datosCompletos = {
      tipo: 'cotizacion',
      numero: numeroGenerado.value,
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
      fechaCreacionStr: obtenerFechaActual(),
      fechaCreacion: serverTimestamp(),
    };

    await setDoc(doc(collection(db, "documentos_guardados"), `COT-${numeroGenerado.value}`), datosCompletos);
    generarPDF('cotizacion', datosCompletos);
  } catch (error) { console.error(error); alert("Error al guardar."); cargando.value = false; }
};

// Guardar Cuenta de Cobro (¡GUARDA COMPLETO!)
const procesarCobro = async () => {
  if (!cobro.value.cliente || !cobro.value.monto) return alert("Llena los campos requeridos.");
  cargando.value = true;
  try {
    const correlativoRef = doc(db, "correlativos", "cuentas_cobro");
    let nuevoNumero = 1;

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(correlativoRef);
      if (!docSnap.exists()) { transaction.set(correlativoRef, { ultimoNumero: 1 }); } 
      else { nuevoNumero = docSnap.data().ultimoNumero + 1; transaction.update(correlativoRef, { ultimoNumero: nuevoNumero }); }
    });

    numeroCobroGenerado.value = String(nuevoNumero);
    
    const datosCompletosCobro = {
      tipo: 'cobro',
      numero: numeroCobroGenerado.value,
      cliente: cobro.value.cliente,
      documento: cobro.value.documento,
      nit: cobro.value.nit,
      direccion: cobro.value.direccion,
      fechaCiudad: cobro.value.fechaCiudad,
      montoLetras: cobro.value.montoLetras,
      concepto: cobro.value.concepto,
      total: cobro.value.monto,
      fechaCreacionStr: obtenerFechaActual(),
      fechaCreacion: serverTimestamp(),
    };

    await setDoc(doc(collection(db, "documentos_guardados"), `COB-${numeroCobroGenerado.value}`), datosCompletosCobro);
    generarPDF('cobro', datosCompletosCobro);
    cobro.value = JSON.parse(JSON.stringify(cobroBase)); 
  } catch (error) { console.error(error); alert("Error al guardar cobro."); cargando.value = false; }
};

const cerrarSesion = async () => { await signOut(auth); router.push('/login'); };
</script>

<style scoped>
/* ESTILOS WEB PRINCIPALES - DISEÑO MODERNO "CARPINTERÍA PREMIUM" */
:global(body) {
  background-color: #f4f1ea; /* Fondo cálido tipo madera clara/crema */
  color: #2c3e50;
  margin: 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.dashboard-container { 
  max-width: 900px; 
  margin: 30px auto; 
  padding: 0 20px; 
}

.header-nav { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 30px; 
  background: white;
  padding: 15px 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
}

.header-nav h2 { margin: 0; color: #8b4513; font-weight: 800; }

.btn-salir { 
  background: #ff4757; color: white; border: none; padding: 10px 20px; 
  border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; 
}
.btn-salir:hover { background: #ff6b81; transform: scale(1.05); }

/* Pestañas (Tabs) */
.tabs { display: flex; gap: 5px; margin-bottom: -10px; position: relative; z-index: 1; padding: 0 10px; }
.tabs button { 
  padding: 15px 25px; border: none; background: #e2dcd0; color: #666; 
  cursor: pointer; border-radius: 12px 12px 0 0; font-weight: bold; 
  font-size: 15px; transition: 0.3s; 
}
.tabs button:hover { background: #d4ccb9; }
.tabs button.active { 
  background: white; color: #d35400; /* Color madera/naranja */
  box-shadow: 0 -4px 10px rgba(0,0,0,0.05);
}

/* Tarjetas Principales */
.card-formulario { 
  background: white; padding: 35px; border-radius: 12px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.08); position: relative; z-index: 2; 
}
.card-formulario h3 { margin-top: 0; color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 15px; margin-bottom: 25px; }

/* Inputs y Formularios */
.seccion-form { margin-bottom: 30px; }
.seccion-form h4 { color: #8b4513; margin-bottom: 15px; }
.grid-inputs, .grid-inputs-cobro { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; }

input, textarea { 
  padding: 12px 15px; border: 1.5px solid #dcdde1; border-radius: 8px; 
  font-family: inherit; font-size: 15px; transition: 0.3s; background: #fafafa; color: #2c3e50;
}
input:focus, textarea:focus { 
  border-color: #d35400; background: white; outline: none; box-shadow: 0 0 0 3px rgba(211, 84, 0, 0.1); 
}
.textarea-cobro { width: 100%; height: 100px; margin-top: 15px; resize: vertical; }

/* Items Cotización */
.fila-item { display: flex; gap: 10px; margin-bottom: 12px; align-items: center; }
.input-cant { width: 80px; } .input-desc { flex-grow: 1; } .input-valor { width: 140px; }

/* Botones de acción */
.btn-agregar, .btn-eliminar { color: white; border: none; padding: 10px 15px; border-radius: 8px; cursor: pointer; font-weight: bold; transition: 0.2s; }
.btn-agregar { background: #2ed573; margin-top: 10px;} .btn-agregar:hover { background: #26b962; }
.btn-eliminar { background: #ff6b81; padding: 10px 15px; } .btn-eliminar:hover { background: #ff4757; }

.btn-guardar, .btn-guardar-cobro { 
  color: white; border: none; padding: 18px 20px; border-radius: 8px; 
  cursor: pointer; width: 100%; font-size: 18px; font-weight: bold; margin-top: 25px; transition: 0.3s; 
}
.btn-guardar { background: linear-gradient(135deg, #d35400, #e67e22); box-shadow: 0 4px 15px rgba(211, 84, 0, 0.3); } 
.btn-guardar:hover { background: linear-gradient(135deg, #e67e22, #d35400); transform: translateY(-2px); }
.btn-guardar-cobro { background: linear-gradient(135deg, #27ae60, #2ecc71); box-shadow: 0 4px 15px rgba(39, 174, 96, 0.3); }
.btn-guardar-cobro:hover { background: linear-gradient(135deg, #2ecc71, #27ae60); transform: translateY(-2px); }
.btn-guardar:disabled, .btn-guardar-cobro:disabled { background: #bdc3c7; cursor: not-allowed; transform: none; box-shadow: none; }

.mt-10 { margin-top: 10px; }
.seccion-total h3 { font-size: 24px; color: #d35400; text-align: right; margin-bottom: 15px; border: none; }

/* Historial */
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
.btn-ver:hover { background: #e67e22; transform: translateY(-1px); }
.btn-borrar:hover { background: #ff6b81; transform: translateY(-1px); }
</style>