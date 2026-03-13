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
      <h3>Historial de Documentos</h3>
      <div class="tabla-responsive">
        <table class="tabla-historial">
          <thead>
            <tr>
              <th>Tipo / Nº</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="doc in historial" :key="doc.id">
              <td class="bold">
                <span :class="doc.tipo === 'cobro' ? 'badge-cobro' : 'badge-cot'">{{ doc.tipo === 'cobro' ? 'COBRO' : 'COT' }}</span>
                {{ doc.numero }}
              </td>
              <td>{{ doc.cliente }}</td>
              <td>$ {{ formatearMoneda(doc.total) }}</td>
              <td>{{ doc.fechaCreacionStr || 'N/A' }}</td>
            </tr>
            <tr v-if="historial.length === 0">
              <td colspan="4" class="text-center">No hay documentos guardados todavía.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div class="pdf-wrapper">
      <div id="pdf-content" class="pdf-template">
        <div class="pdf-header">
          <div class="logo-box">
            <img src="/logo_sagrada.png" alt="Logo Sagrada Familia" class="img-logo" />
          </div>
          <div class="title-box">
            <h3>CARPINTERIA SAGRADA FAMILIA</h3>
            <h3>RAFAEL JOSE PEREZ LEON</h3>
          </div>
          <div class="date-box">
            <table class="table-info">
              <tbody>
                <tr><td class="bg-red">Fecha:</td><td class="text-center bold">{{ fechaImpresion }}</td></tr>
                <tr><td class="bg-red">Cotizacion<br>Nº</td><td class="text-center bold" style="font-size: 16px;">{{ numeroGenerado }}</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <table class="table-client">
          <tbody>
            <tr>
              <td class="bg-red w-15">Cliente:</td><td class="bold w-50">{{ cotizacionImpresion.cliente }}</td>
              <td class="bg-red w-15">Documento:</td><td class="bold w-20">{{ cotizacionImpresion.documento }}</td>
            </tr>
            <tr>
              <td class="bg-red w-15">Direccion:</td><td class="bold w-50">{{ cotizacionImpresion.direccion }}</td>
              <td class="bg-red w-15">Torre:</td><td class="bold w-20">{{ cotizacionImpresion.torre }}</td>
            </tr>
            <tr>
              <td class="bg-red w-15">Apto:</td>
              <td class="bold w-50 p-0">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="width: 25%; border: none; padding-left: 5px;">{{ cotizacionImpresion.apto }}</td>
                    <td class="bg-red text-center" style="width: 25%; border-top: none; border-bottom: none; border-right: 2px solid black; border-left: 2px solid black;">Barrio:</td>
                    <td style="width: 50%; border: none; padding-left: 5px;">{{ cotizacionImpresion.barrio }}</td>
                  </tr>
                </table>
              </td>
              <td class="bg-red w-15">Contacto:</td><td class="bold w-20">{{ cotizacionImpresion.contacto }}</td>
            </tr>
          </tbody>
        </table>

        <table class="table-items">
          <thead>
            <tr>
              <th class="w-10 text-red">CANT.</th>
              <th class="w-70 text-red">DESCRIPCION</th>
              <th class="w-20 text-red">VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, i) in cotizacionImpresion.items" :key="i">
              <td class="text-center bold">{{ item.cantidad }}</td>
              <td>{{ item.descripcion }}</td>
              <td class="text-right">$ {{ formatearMoneda(item.valor) }}</td>
            </tr>
            <tr v-for="n in (8 - (cotizacionImpresion.items?.length || 0))" :key="'empty-'+n">
              <td></td><td></td><td class="text-right">$ 0.00</td>
            </tr>
          </tbody>
        </table>

        <div class="total-box">
          <table style="width: 100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td class="w-80 text-right bg-red bold text-white" style="border: 2px solid black; padding: 5px;">TOTAL:</td>
                <td class="w-20 text-right bold text-red" style="border: 2px solid black; padding: 5px;">$ {{ formatearMoneda(cotizacionImpresion.total || calcularTotal()) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="condiciones-box">
          <p class="text-red bold italic">OBSERVACIONES: {{ cotizacionImpresion.observaciones }}</p>
          <p class="bold">"PRESUPUESTO NO INCLUYE IVA, NI RETENCIONES" INCLUYE TRANSPORTE E INSTALACION.</p>
          <p class="bold underline">CONDICIONES GENERALES:</p>
          <ul class="lista-condiciones">
            <li><span class="bold">Tiempo de entrega:</span> 30 dias habiles</li>
            <li><span class="bold">Condiciones de pago:</span> 60% al formalizar el pedido, 20% por avance de obra y 20% a la entrega.</li>
            <li><span class="bold">Forma de pago:</span> Efectivo - Transferencia bancaria. Cta de Ahorros BANCOLOMBIA 669-000015-05 Rafael Jose Pérez Leon.</li>
            <li><span class="bold">Garantía:</span> 02 años por defectos de fabricación. Herrajes 1 mes.</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="pdf-wrapper">
      <div id="pdf-content-cobro" class="pdf-template-cobro">
        
        <div class="texto-derecha mb-40">
          <p>{{ cobroImpresion.fechaCiudad }}</p>
        </div>

        <h2 class="titulo-centrado bold mb-20">CUENTA DE COBRO</h2>

        <div class="texto-centrado mb-30">
          <p class="uppercase">{{ cobroImpresion.cliente }}</p>
          <p class="uppercase">{{ cobroImpresion.documento }}</p>
          <p class="uppercase" v-if="cobroImpresion.nit">NIT. {{ cobroImpresion.nit }}</p>
          <p class="uppercase">{{ cobroImpresion.direccion }}</p>
        </div>

        <div class="texto-centrado mb-30">
          <p class="bold mb-10">DEBE A:</p>
          <p class="uppercase">RAFAEL JOSÉ PÉREZ LEÓN</p>
          <p class="uppercase">PASAPORTE: 112472838</p>
        </div>

        <div class="texto-centrado mb-30">
          <p class="bold mb-10">LA SUMA DE:</p>
          <p class="uppercase">{{ cobroImpresion.montoLetras }} ($ {{ formatearMoneda(cobroImpresion.monto) }})</p>
        </div>

        <div class="texto-centrado mb-10">
          <p class="bold">POR CONCEPTO DE:</p>
        </div>
        <div class="mb-40">
          <p class="texto-justificado uppercase">{{ cobroImpresion.concepto }}</p>
        </div>
        
        <div class="texto-izquierda mb-40">
          <p class="bold">PAGO DE SERVICIOS &nbsp;&nbsp;&nbsp;&nbsp; $ {{ formatearMoneda(cobroImpresion.monto) }}</p>
        </div>

        <div class="footer-cobro-izq">
          <div class="mb-40">
            <p class="bold uppercase">{{ cobroImpresion.cliente }}</p>
            <p class="uppercase">{{ cobroImpresion.documento }}</p>
            <p class="uppercase" v-if="cobroImpresion.nit">NIT. {{ cobroImpresion.nit }}</p>
            <p class="uppercase">{{ cobroImpresion.direccion }}</p>
          </div>
          
          <div class="firma-rafael-izq mt-60">
            <p class="bold uppercase">RAFAEL JOSE PÉREZ LEÓN</p>
            <p class="uppercase">PASAPORTE 112472838</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, runTransaction, collection, setDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import html2pdf from 'html2pdf.js';

const router = useRouter();
const cargando = ref(false);
const vistaActual = ref('crear'); 
const historial = ref([]); 

// Variables Cotización
const numeroGenerado = ref('0000-00');
const fechaImpresion = ref('');
const cotizacionBase = { cliente: '', documento: '', nit: '', direccion: '', torre: '', apto: '', barrio: '', contacto: '', observaciones: '', items: [{ cantidad: 1, descripcion: '', valor: null }] };
const cotizacion = ref(JSON.parse(JSON.stringify(cotizacionBase)));
const cotizacionImpresion = ref(JSON.parse(JSON.stringify(cotizacionBase)));

// Variables Cuenta de Cobro
const numeroCobroGenerado = ref('0');
const cobroBase = { cliente: '', documento: '', nit: '', direccion: '', fechaCiudad: `Bogotá, ${new Date().toLocaleDateString()}`, monto: null, montoLetras: '', concepto: '' };
const cobro = ref(JSON.parse(JSON.stringify(cobroBase)));
const cobroImpresion = ref(JSON.parse(JSON.stringify(cobroBase)));

// Funciones Auxiliares
const agregarItem = () => cotizacion.value.items.push({ cantidad: 1, descripcion: '', valor: null });
const eliminarItem = (index) => cotizacion.value.items.splice(index, 1);
const calcularTotal = () => cotizacion.value.items.reduce((total, item) => total + (item.valor || 0), 0);
const formatearMoneda = (valor) => valor ? Number(valor).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00';
const obtenerFechaActual = () => { const f = new Date(); return `${f.getDate()}/${f.getMonth() + 1}/${f.getFullYear()}`; };

// Cargar Historial Unificado
onMounted(() => {
  const q = query(collection(db, "documentos_guardados"), orderBy("fechaCreacion", "desc"));
  onSnapshot(q, (querySnapshot) => {
    const dataTemp = [];
    querySnapshot.forEach((doc) => {
      dataTemp.push({ id: doc.id, ...doc.data() });
    });
    historial.value = dataTemp;
  });
});

// Guardar Cotización
const procesarCotizacion = async () => {
  if (!cotizacion.value.cliente) return alert("Ingresa el cliente.");
  cargando.value = true;
  try {
    const fecha = new Date();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = String(fecha.getFullYear()).slice(-2);
    const periodoId = `${mes}${anio}`; 

    const correlativoRef = doc(db, "correlativos", periodoId);
    let nuevoNumero = 1;

    await runTransaction(db, async (transaction) => {
      const correlativoDoc = await transaction.get(correlativoRef);
      if (!correlativoDoc.exists()) { transaction.set(correlativoRef, { ultimoNumero: 1 }); } 
      else { nuevoNumero = correlativoDoc.data().ultimoNumero + 1; transaction.update(correlativoRef, { ultimoNumero: nuevoNumero }); }
    });

    numeroGenerado.value = `${periodoId}-${String(nuevoNumero).padStart(2, '0')}`;
    fechaImpresion.value = obtenerFechaActual();
    cotizacionImpresion.value = JSON.parse(JSON.stringify(cotizacion.value)); 

    await setDoc(doc(collection(db, "documentos_guardados"), `COT-${numeroGenerado.value}`), {
      tipo: 'cotizacion',
      numero: numeroGenerado.value,
      cliente: cotizacion.value.cliente,
      total: calcularTotal(),
      fechaCreacionStr: fechaImpresion.value,
      fechaCreacion: serverTimestamp(),
    });

    generarPDF('pdf-content', `Cotizacion_${numeroGenerado.value}.pdf`);
  } catch (error) { console.error(error); alert("Error al guardar."); cargando.value = false; }
};

// Guardar Cuenta de Cobro (Correlativo simple 1, 2, 3...)
const procesarCobro = async () => {
  if (!cobro.value.cliente || !cobro.value.monto) return alert("Llena los campos requeridos.");
  cargando.value = true;
  
  try {
    const correlativoCobroRef = doc(db, "correlativos", "cuentas_cobro");
    let nuevoNumero = 1;

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(correlativoCobroRef);
      if (!docSnap.exists()) { transaction.set(correlativoCobroRef, { ultimoNumero: 1 }); } 
      else { nuevoNumero = docSnap.data().ultimoNumero + 1; transaction.update(correlativoCobroRef, { ultimoNumero: nuevoNumero }); }
    });

    numeroCobroGenerado.value = String(nuevoNumero);
    cobroImpresion.value = JSON.parse(JSON.stringify(cobro.value)); 

    await setDoc(doc(collection(db, "documentos_guardados"), `COB-${numeroCobroGenerado.value}`), {
      tipo: 'cobro',
      numero: numeroCobroGenerado.value,
      cliente: cobro.value.cliente,
      total: cobro.value.monto,
      fechaCreacionStr: obtenerFechaActual(),
      fechaCreacion: serverTimestamp(),
    });

    generarPDF('pdf-content-cobro', `Cuenta_Cobro_${numeroCobroGenerado.value}.pdf`, () => {
      cobro.value = JSON.parse(JSON.stringify(cobroBase)); 
    });
  } catch (error) { console.error(error); alert("Error al guardar cobro."); cargando.value = false; }
};

// Función genérica para exportar el PDF
const generarPDF = (idElemento, nombreArchivo, callback) => {
  const elemento = document.getElementById(idElemento);
  const opciones = {
    margin:       [20, 20, 20, 20],
    filename:     nombreArchivo,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, windowWidth: 800, width: 800 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opciones).from(elemento).save().then(() => {
    cargando.value = false;
    if(callback) callback();
  });
};

const cerrarSesion = async () => { await signOut(auth); router.push('/login'); };
</script>

<style scoped>
/* ESTILOS WEB */
.dashboard-container { max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial; }
.header-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.btn-salir { background: #ff4757; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
.tabs { display: flex; gap: 10px; margin-bottom: 0; }
.tabs button { padding: 12px 20px; border: none; background: #ddd; cursor: pointer; border-radius: 8px 8px 0 0; font-weight: bold; transition: 0.3s; }
.tabs button.active { background: #1e90ff; color: white; }
.card-formulario { background: #f9f9f9; padding: 20px; border-radius: 0 8px 8px 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
.seccion-form { margin-bottom: 25px; }
.grid-inputs, .grid-inputs-cobro { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
input, textarea { padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-family: Arial; }
.textarea-cobro { width: 100%; height: 80px; margin-top: 10px; resize: vertical; }
.fila-item { display: flex; gap: 10px; margin-bottom: 10px; }
.input-cant { width: 60px; } .input-desc { flex-grow: 1; } .input-valor { width: 120px; }
.btn-agregar, .btn-eliminar { color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.btn-agregar { background: #2ed573; } .btn-eliminar { background: #ff6b81; }
.btn-guardar, .btn-guardar-cobro { color: white; border: none; padding: 15px 20px; border-radius: 4px; cursor: pointer; width: 100%; font-size: 16px; font-weight: bold; margin-top: 15px; }
.btn-guardar { background: #1e90ff; } .btn-guardar-cobro { background: #2ed573; }
.btn-guardar:disabled, .btn-guardar-cobro:disabled { background: #ccc; }

/* Historial */
.tabla-responsive { overflow-x: auto; margin-top: 15px; }
.tabla-historial { width: 100%; border-collapse: collapse; background: white; }
.tabla-historial th, .tabla-historial td { border: 1px solid #ddd; padding: 10px; text-align: left; }
.tabla-historial th { background: #f1f1f1; }
.badge-cot { background: #1e90ff; color: white; padding: 3px 6px; border-radius: 4px; font-size: 11px; margin-right: 5px; }
.badge-cobro { background: #2ed573; color: white; padding: 3px 6px; border-radius: 4px; font-size: 11px; margin-right: 5px; }

/* ======================================================== */
/* ESTILOS EXACTOS PDF: COTIZACIÓN (Oculto)                 */
/* ======================================================== */
.pdf-wrapper { position: absolute; top: -10000px; left: 0; width: 800px; }
.pdf-template { width: 800px; background: white; color: black; font-family: Arial, sans-serif; padding: 15px; box-sizing: border-box; }
.bold { font-weight: bold; } .italic { font-style: italic; } .underline { text-decoration: underline; }
.text-center { text-align: center; } .text-right { text-align: right; }
.text-red { color: red; } .text-white { color: white; } .bg-red { background-color: red; color: white; padding: 2px 5px; }
.pdf-header { display: flex; justify-content: space-between; margin-bottom: 10px; align-items: center; }
.logo-box, .date-box { width: 25%; } .title-box { width: 50%; text-align: center; font-style: italic; }
.table-info, .table-client, .table-items { border-collapse: collapse; width: 100%; border: 3px solid black; margin-bottom: 10px; }
.table-info td, .table-client td, .table-items th { border: 2px solid black; padding: 3px 5px; }
.table-items td { border: 1px solid black; padding: 5px; height: 25px; }
.w-10{width:10%} .w-15{width:15%} .w-20{width:20%} .w-50{width:50%} .w-70{width:70%} .w-80{width:80%}
.condiciones-box { font-size: 11px; margin-top: 10px; }
.img-logo { max-width: 100%; max-height: 80px; display: block; margin: 0 auto; }
.p-0 { padding: 0 !important; }
/* ======================================================== */
/* ESTILOS EXACTOS PDF: CUENTA DE COBRO (Oculto)            */
/* ======================================================== */
.pdf-template-cobro {
  width: 800px; background: white; color: black; font-family: 'Times New Roman', serif; 
  padding: 60px; box-sizing: border-box; font-size: 16px; line-height: 1.5;
}
.pdf-template-cobro p { margin: 0; }
.texto-derecha { text-align: right; }
.texto-centrado { text-align: center; }
.texto-izquierda { text-align: left; }
.texto-justificado { text-align: justify; }
.uppercase { text-transform: uppercase; }
.bold { font-weight: bold; }

/* Espaciadores */
.mb-10 { margin-bottom: 10px; }
.mb-20 { margin-bottom: 20px; }
.mb-30 { margin-bottom: 30px; }
.mb-40 { margin-bottom: 40px; }
.mt-60 { margin-top: 80px; } /* Este es el gran espacio para la firma */

.titulo-centrado { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 30px; color: black; }

/* Pie de página a la izquierda */
.footer-cobro-izq {
  text-align: left;
  margin-top: 60px;
}
.firma-rafael-izq {
  /* Aquí no hay línea arriba, solo el texto alineado */
  text-align: left;
}
</style>