# 🎥 Cinema Management UI

![Next.js Version](https://img.shields.io/badge/Next.js-15.1.7-blue)
![React Version](https://img.shields.io/badge/React-19.0.0-%2361DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%233178C6)
![Zod](https://img.shields.io/badge/Zod-3.24-%23E67E22)

Interfaz web para sistema de gestión de cine - Technical Kata

## 📌 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Implementación](#-implementación)

## 🌟 Características

- Gestión completa de películas, salas y reservaciones
- Sistema de selección de asientos interactivo
- Validaciones de formulario con Zod
- Tipado estático con TypeScript
- Integración con API backend
- Gestión de estado con React Hooks
- Sistema de notificaciones en tiempo real

## 🛠 Tecnologías

- **Framework:** Next.js 15.1.7
- **Librería Principal:** React 19
- **Lenguaje:** TypeScript 5.x
- **Validación:** Zod 3.24
- **HTTP Client:** Axios 1.7.9

## 📋 Requisitos

- Node.js v20.6.0 o superior
- npm v9.6.7 o superior
- Acceso al backend API (versión compatible)

## ⚙️ Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/[tu-usuario]/kata-movie-web-ui.git

# 2. Navegar al directorio
cd kata-movie-web-ui

# 3. Instalar dependencias
npm install

# 5. Contruir el proyecto e Iniciar servidor
npm run dev
```

## Implementación

- Para crear palículas ve a: http://localhost:4000/movies
- Para crear salas ve a: http://localhost:4000/rooms
- Para hacer una reserva ve a: http://localhost:4000/reservations
- Para ver registros por película ve a: http://localhost:4000/records