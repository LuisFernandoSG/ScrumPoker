# ♠ PokerScrum - Planning Poker en Tiempo Real

Una aplicación web moderna, rápida y colaborativa de **Planning Poker** (estimación ágil de tareas e historias de usuario), diseñada para equipos remotos y presenciales, similar a *planningpokeronline.com*.

---

## 🚀 Características Principales

- **Sin registros ni contraseñas:** Entra solo con tu nombre. Se recuerda en el navegador (`localStorage`).
- **Salas independientes:** Códigos cortos únicos de 6 caracteres (ej. `/sala/ABC123`) con botón para copiar enlace de invitación directo.
- **Mesa de Poker interactiva:**
  - Diseño con tema oscuro (`#020617`) y elegantes acentos en azul y cian.
  - Distribución inteligente de participantes alrededor de la mesa (arriba, abajo, izquierda, derecha).
  - 3 estados visuales de cartas:
    - *Gris punteada:* Aún pensando / no ha votado.
    - *Dorso azul estampado:* Voto emitido (valor incógnito protegido).
    - *Frente revelado:* Número visible tras el revelado con animación 3D de volteo.
- **Voto 100% incógnito y seguro:**
  - El servidor **nunca** transmite los votos de los demás participantes a los clientes antes de revelar. Solo informa si ya votaron o no, impidiendo que nadie descubra votos inspeccionando la consola de red.
- **Barajas Configurables y Plantillas Ágiles:**
  - *Secuencial (1 al 13):* `1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, ?`
  - *Fibonacci Estándar:* `0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?`
  - *Scrum / Fibonacci Modificado:* `0, 0.5, 1, 2, 3, 5, 8, 13, 20, 40, 100, ?`
  - *Tallas de Camiseta (T-Shirt):* `XS, S, M, L, XL, XXL, ?`
  - *Potencias de 2 (Binario):* `1, 2, 4, 8, 16, 32, 64, ?`
  - *Personalizada:* El anfitrión puede escribir cualquier lista de valores separados por coma (números, texto o emojis como `☕`).
- **Soporte para Red Local (LAN / Wi-Fi):**
  - Servidores configurados en `0.0.0.0` para que cualquier miembro del equipo conectado al mismo Wi-Fi o red local pueda ingresar desde su teléfono móvil o laptop sin necesidad de internet ni despliegue externo.
  - Detección automática de la IP LAN (ej. `http://192.168.68.110:5173`) con botón dedicado para copiar el enlace de invitación LAN directamente.
- **Cálculo de estadísticas instantáneo:**
  - **Promedio** exacto con 1 decimal (en barajas numéricas, los votos con `?` no alteran el promedio).
  - **Moda** (el voto o talla más votada), **Mínimo** y **Máximo**.
  - Si se vota con tallas cualitativas (T-Shirt), destaca la Moda y conteo de votos sin errores.
  - ¡Celebración con **confetti animado** si hay consenso unánime!
- **Sincronización en tiempo real:**
  - Sockets bidireccionales con Socket.IO.
  - El anfitrión define la tarea/historia en curso en tiempo real.
  - Reconexión inteligente: si recargas la página, mantienes tu voto y rol sin duplicarte en la mesa.
  - Transferencia automática de anfitrión si este se desconecta.
  - Limpieza automática de salas inactivas en memoria.
- **Efectos de sonido sutiles:** Mediante Web Audio API nativa (sin descargas de archivos mp3 pesados) con botón para silenciar.
- **Totalmente responsive:** Optimizado para smartphones, tablets y pantallas de escritorio.

---

## 📁 Estructura del Proyecto

```text
pokerscrum/
├── package.json               # Configuración raíz monorepo / workspaces y script 'dev'
├── README.md                  # Documentación completa y guía de despliegue
│
├── server/                    # Backend en Node.js + Express + Socket.IO
│   ├── package.json           # Dependencias del servidor (express, socket.io, cors)
│   ├── index.js               # Servidor HTTP, WebSockets y sanitización de seguridad
│   └── roomsManager.js        # Gestor de salas en memoria, lógica de votos y promedios
│
└── client/                    # Frontend en React + Vite + Tailwind CSS
    ├── index.html             # HTML con fuentes Google Fonts (Plus Jakarta Sans)
    ├── package.json           # Dependencias del cliente (react, socket.io-client, lucide, confetti)
    ├── vite.config.js         # Proxy para /socket.io y puerto 5173
    ├── tailwind.config.js     # Paleta de colores dark mode y animaciones
    ├── postcss.config.js      # Procesamiento CSS
    └── src/
        ├── main.jsx           # Punto de entrada de React
        ├── App.jsx            # Enrutador ligero SPA (Home / Sala)
        ├── index.css          # Estilos globales, 3D flip card y mesa de poker
        ├── services/
        │   └── socket.js      # Conexión Socket.IO y persistencia de sesión
        ├── utils/
        │   └── audio.js       # Sintetizador de efectos de sonido Web Audio API
        ├── components/
        │   ├── Header.jsx           # Barra superior con link de invitación y estado
        │   ├── PokerTable.jsx       # Mesa central con distribución de participantes
        │   ├── ParticipantCard.jsx  # Carta de jugador con animación 3D de giro
        │   ├── VotingDeck.jsx       # Baraja inferior seleccionable (1-13, ?)
        │   ├── VotingStats.jsx      # Estadísticas (Promedio, Moda, Min, Max, Confetti)
        │   ├── TaskEditor.jsx       # Campo de tarea sincronizado en tiempo real
        │   └── JoinModal.jsx        # Modal para invitados que entran por link directo
        └── pages/
            ├── Home.jsx             # Pantalla de bienvenida (Crear o Unirse)
            └── Room.jsx             # Experiencia completa de la sala de votación
```

---

## 💻 Instrucciones para Correrlo en Local

### Prerrequisitos
- **Node.js** v18 o superior instalado en tu sistema.
- **npm** (o pnpm / yarn).

### Pasos

1. **Instalar dependencias:**
   Ejecuta en la raíz del proyecto:
   ```bash
   npm install
   ```
   *(Este comando instalará automáticamente todas las dependencias del servidor y del cliente gracias a los workspaces).*

2. **Iniciar la aplicación con un solo comando:**
   ```bash
   npm run dev
   ```

   Verás en la consola:
   - Backend corriendo en `http://localhost:4000`
   - Frontend disponible en `http://localhost:5173`

3. **Abrir en tu navegador:**
   - Abre `http://localhost:5173` en tu navegador.
   - Escribe tu nombre y haz clic en **"Crear nueva sala"**.
   - Para probar la experiencia colaborativa, abre una **ventana de incógnito** o una pestaña nueva con el enlace copiado e ingresa con otro nombre.

---

## 🌐 Cómo Desplegarlo Gratis en Producción

Dado que el servidor Express está preparado para servir los archivos estáticos de Vite (`client/dist`), puedes desplegar todo el proyecto como un único servicio Node.js.

### Opción 1: Render (Recomendada - 100% Gratis)
1. Sube tu código a un repositorio de **GitHub** o **GitLab**.
2. Entra en [Render.com](https://render.com) y crea un **New Web Service**.
3. Conecta tu repositorio.
4. Configura los parámetros:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `NODE_ENV=production npm run start`
5. Añade una variable de entorno:
   - `NODE_ENV`: `production`
6. Haz clic en **Create Web Service**. ¡Listo! Tendrás una URL pública `https://tu-app.onrender.com` con WebSockets activos.

### Opción 2: Railway
1. Entra a [Railway.app](https://railway.app) y haz clic en **Deploy from GitHub repo**.
2. Railway detectará automáticamente el archivo `package.json`.
3. Añade la variable de entorno:
   - `NODE_ENV`: `production`
4. En **Settings** -> **Networking**, genera un dominio público.

### Opción 3: Servidor VPS propio (Ubuntu / Debian con Nginx y PM2)
1. Clona el repositorio en tu VPS:
   ```bash
   git clone <tu-repo> && cd pokerscrum
   npm install
   npm run build
   ```
2. Inicia el servidor con **PM2**:
   ```bash
   NODE_ENV=production pm2 start server/index.js --name "pokerscrum"
   ```
3. Configura Nginx como reverse proxy hacia `http://127.0.0.1:4000` con soporte para WebSockets (`Upgrade` y `Connection "upgrade"`).
