# 🪚 Sistema de Gestión para Carpintería (PWA)

Una Aplicación Web Progresiva (PWA) desarrollada para digitalizar y optimizar los procesos administrativos, de inventario y facturación de un taller de carpintería real. 

🔗 **[Ver Demostración en Vivo](AQUI_TU_LINK_LARGO_DE_VERCEL)**

> **⚠️ Nota sobre la Demo:** Para proteger la privacidad y los datos financieros del negocio real, este enlace apunta a un entorno de demostración con una base de datos aislada e información anonimizada.
> 
> **Credenciales de acceso para evaluación:**
> * **Email:** reclutador@demo.com
> * **Contraseña:** demo123456

## 🚀 ¿Por qué se construyó?
El objetivo principal fue eliminar la dependencia del papel y optimizar el flujo de trabajo del taller. Permite generar presupuestos, gestionar el cobro a clientes y mantener un registro estructurado de las operaciones diarias de manera rápida y accesible desde cualquier dispositivo.

## ✨ Características Principales
* **Arquitectura Offline-First:** Capacidad de generar facturas y operar sin conexión a internet, sincronizando los datos automáticamente al recuperar la señal.
* **Generación de PDFs:** Creación dinámica de cotizaciones y recibos de cobro listos para imprimir o enviar al cliente.
* **Gestión de Sesiones:** Autenticación segura para restringir el acceso a la información financiera.

  Al crear un Pdf, te permitira ver una previsualizacion, en la que puedes asegurarte de que el formato y los datos son corretos. Al cerrar la pestaña, veras un pequeño popup que pregunta si guardaras el archivo o no, para que puedas seguir editando, en caso de guardarlo, se registrara en la bdd usando el sistema de ordenamiento y se descargara de forma automatica. 

## 🛠️ Stack Tecnológico
* **Frontend:** Vue 3, Vite.
* **Backend & Base de Datos:** Firebase (Auth, Firestore, Realtime Database).
* **Despliegue:** Vercel.
