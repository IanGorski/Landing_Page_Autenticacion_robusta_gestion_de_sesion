## 🙏 Agradecimientos

Imágenes utilizadas en la demo cortesía de [Unsplash - @thecreativeidea](https://unsplash.com/es/@thecreativeidea).

<div align="center">

# Auth Landing Demo (React + Vite)

[![TypeScript Strict](https://img.shields.io/badge/TypeScript-strict-blue?logo=typescript)](tsconfig.json)
[![No Legacy JSX](https://img.shields.io/badge/Legacy%20JSX-removed-success)](#) 
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-lightgrey?logo=github)](.github/workflows/ci.yml)

Interfaz moderna de autenticación con efectos glass / gradientes, gestión de sesión simulada, fuerza de contraseña, historial persistido y duración configurable de sesión.

</div>

---

## 🌐 Despliegue en Vercel

Puedes probar la demo en producción aquí:

[https://landing-page-autenticacion-robusta.vercel.app/](https://landing-page-autenticacion-robusta.vercel.app/)

---

## ✨ Características principales

- UI moderna (glassmorphism, gradientes, sombras suaves, dark mode persistente)
- Registro + Login con validaciones básicas y hashing SHA‑256 (demo, no producción)
- Simulación de sesión con expiración y botón de extensión
- Duración de sesión configurable (5–60 min) persistida en `localStorage`
- Historial de inicios (últimos 5) persistido en `localStorage`
- Barra y criterios de fortaleza de contraseña (6+, 10+, mayúscula, número, símbolo)
- Avatar dinámico con iniciales y color derivado por hash
- Advertencia visual (pulse) últimos 30s + beep + vibración al expirar
- Accesibilidad: `aria-label`, `role="alert"`, contraste razonable, animaciones degradables

## 🗂 Estructura del proyecto

```
├─ index.html
├─ package.json
├─ vite.config.js
├─ .gitignore
├─ README.md
├─ src/
│  ├─ main.tsx              # Entrada Vite/React (TypeScript)
│  ├─ App.tsx               # Monta AuthLayout
│  ├─ App.css (si aplica)
│  ├─ index.css             # Reset/base global
│  ├─ auth.css              # Estilos globales auth + layout + dark mode
│  ├─ components/
│  │  ├─ AuthLayout.tsx     # Layout general, toggle de tema, panel ilustración + formulario
│  │  ├─ IllustrationPanel.tsx
│  │  ├─ AuthForm.tsx       # Lógica principal de auth + sesión (ahora TypeScript)
│  │  ├─ AuthForm.css       # Estilos extraídos de inline (historial, criterios, countdown, etc.)
│  ├─ assets/               # Imágenes / vectores (si usados)
│  ├─ NetworkBackground.tsx # decoraciones/efectos (Three.js) tipado
│  ├─ global.d.ts           # Declaraciones de módulos estáticos
│  ├─ tsconfig.json         # Configuración TypeScript
│  ├─ (sin archivos .jsx legacy)
```

## 🔧 Lógica clave

### Estado y almacenamiento
- `localStorage`:
	- `auth-last-mode`: último modo (login/register)
	- `auth-demo-history`: historial de inicios (array)
	- `auth-session-duration`: duración deseada futura
	- `pref-theme`: tema claro/oscuro
- `sessionStorage`:
	- `auth-demo-session`: payload de sesión activa (username, email, timestamps)

### Sesión
- Al iniciar sesión se crea `payload = { username, email, ts, expiresAt, duration }`.
- Temporizador (`setInterval`) recalcula `remainingMs` cada segundo.
- Si `remainingMs <= 30s` → clase `countdown-warning`.
- Al llegar a 0: se limpia sesión, se notifica y dispara beep + vibración.

### Fuerza de contraseña
Se evalúan 5 criterios y se asigna etiqueta: Muy débil → Excelente.

### Avatar
Color generado con hash de la cadena (`Math.imul` → hue HSL) y letras iniciales (máx 2).

## 🛠 Tecnologías utilizadas

| Área | Elección |
|------|----------|
| Bundler Dev | Vite |
| Framework UI | React 18+ (hooks) |
| Estilos | CSS modularizado (`auth.css`, `AuthForm.css`) |
| Persistencia simple | localStorage / sessionStorage |
| Hashing demo | Web Crypto API (SHA-256) |
| Audio | Web Audio API (beep expiración) |
| Vibración | `navigator.vibrate` (fallback silencioso) |

## 🚀 Inicio rápido

```bash
npm install
npm run dev
```
Abrir: `http://localhost:5173` (puerto Vite por defecto).

## 📂 Scripts (package.json)

| Script | Descripción |
|--------|------------|
| `dev`  | Arranca servidor desarrollo Vite con HMR |
| `build`| Compila a producción (directorio `dist/`) |
| `preview` | Sirve build para verificación |
| `lint` | Lint de código (ESLint + TS) |
| `lint:fix` | Lint con auto-fix |
| `typecheck` | Chequeo estricto de tipos (sin emitir) |
| `test` | Ejecuta tests una vez |
| `test:watch` | Modo watch de Vitest |
| `test:coverage` | Tests con cobertura |
| `format` | Formatea el código con Prettier |
| `format:check` | Verifica formato sin escribir |

## 🔐 Nota de seguridad
Este proyecto es una DEMO. No usar tal cual en producción:
- No hay backend real ni protección contra ataques.
- Hashing se hace client-side solo como ejemplo.
- No hay verificación de throttling / rate limit / CSRF / etc.

## ♿ Accesibilidad
- Uso de `aria-label`, `role="alert"`, y semántica en listas de historial.
- Contador es textual (compatible con lectores de pantalla); se podría ampliar con `role="timer"`.
- Animaciones moderadas; se puede añadir consulta a `prefers-reduced-motion` para desactivar más.

## 🧪 Estructura lógica de `AuthForm.tsx`

Pseudoflujo:
1. Carga estados persistidos (modo, historial, duración).
2. Render condicional: si hay sesión → vista de sesión; si no → formulario.
3. Form submit:
	 - Registro: guarda usuario en memoria (array `registered`).
	 - Login: valida, crea sesión y actualiza historial.
4. Efecto de sesión: countdown + expiración + advertencia.
5. Efecto persistencia: historial / duración / modo.

---

4. Archivos migrados `.jsx` → `.tsx`: `main`, `App`, `AuthLayout`, `IllustrationPanel`, `NetworkBackground`, `AuthForm`.
	- `SessionPayload` (sesión activa)
	- `HistoryItem` (entrada historial)
	- `StatusMsg` (toasts de estado)
	- `Criteria` y `PwStrength` (fortaleza contraseña)
6. Reemplazo de estilos inline críticos por clases en `AuthForm.css` para reducir ruido y cumplir linters.
7. Ajustes de accesibilidad: `aria-invalid` ahora usa strings `'true'|'false'`.
8. Eliminación de archivos `.jsx` obsoletos tras verificación visual.
### Cambios notables de diseño / código
- Eliminación de lógica placeholder y reinstalación completa del JSX de sesión y formulario dentro de `AuthForm.tsx`.
- Extracción de estilos de contadores, avatar y barras de progreso a clases reutilizables (`countdown-pill`, `form-avatar`, `pw-bar`, etc.).
- Tipado del temporizador de sesión y guardas para evitar accesos nulos.

### Ventajas inmediatas obtenidas
- Detección temprana de errores en handlers (`onSubmit`, `handleChange`).
- Mayor claridad en shape de objetos persistidos en `localStorage/sessionStorage`.
- Refactors futuros (ej. agregar roles, claims, multi‑factor) serán más seguros.

### Próximos pasos sugeridos (si se continúa)
- Añadir pruebas unitarias (Vitest + Testing Library) para lógica de expiración y cálculo de fortaleza.
- Generar tipos derivados (ej. unión para `mode`: `'login' | 'register'`).
- Integrar ESLint + TypeScript rules para consistencia adicional.
- Implementar lazy splitting si se escala la UI.

### Ejecución ahora
```bash
npm install
npm run dev
```

---

## 🗑 Backups ignorados
Se añadieron patrones a `.gitignore` para ocultar los archivos `*_backup_*.jsx/.css` u otros temporales.

## 📄 Licencia

Uso libre. 

---
