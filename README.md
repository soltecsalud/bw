# Banco W - Simulador Financiero

Aplicación web para simulación de inversiones financieras con diferentes términos de pago y cálculo automático de tasas de interés basado en rangos de fechas.

## 🚀 Tecnologías Utilizadas

### Backend
- **FastAPI** - Framework web moderno y rápido para Python
- **SQLAlchemy** - ORM para Python
- **PostgreSQL** - Base de datos relacional
- **JWT** - Autenticación mediante tokens
- **Pydantic** - Validación de datos
- **Uvicorn** - Servidor ASGI

### Frontend
- **React 18** - Librería de JavaScript para interfaces
- **TypeScript** - Superset de JavaScript con tipado estático
- **React Hook Form** - Manejo de formularios con validación
- **React Router DOM** - Navegación entre páginas
- **Tailwind CSS** - Framework CSS para diseño responsivo
- **Axios** - Cliente HTTP para API requests
- **React Hot Toast** - Notificaciones

## 📋 Requisitos Previos

Asegúrate de tener instalado:

- **Python 3.12+**
- **Node.js 20.19+ o 22.12+**
- **PostgreSQL**
- **npm** (incluido con Node.js)
- **Git**

## 🗄️ Configuración de la Base de Datos

### 1. Crear la base de datos

Abre PostgreSQL 14 (psql o pgAdmin) y ejecuta:
```sql
CREATE DATABASE banco_w;

-- 01_users.sql
CREATE TABLE users (
  id           BIGSERIAL PRIMARY KEY,
  email        CITEXT UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now(); 
  RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- 02_simulations.sql
CREATE TYPE payment_term AS ENUM ('Mensual','Anual');

CREATE TABLE simulations (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount        NUMERIC(14,2) NOT NULL CHECK (amount > 0),
  term          payment_term  NOT NULL,
  start_date    DATE          NOT NULL,
  end_date      DATE          NOT NULL,
  rate_applied  NUMERIC(6,4)  NOT NULL, -- p.ej. 0.1200 = 12%
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  CHECK (end_date >= start_date)
);

CREATE TRIGGER trg_simulations_updated
BEFORE UPDATE ON simulations
FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- Índices útiles
CREATE INDEX idx_simulations_user ON simulations(user_id);
CREATE INDEX idx_simulations_dates ON simulations(start_date, end_date);
```



## 🔧 Instalación y Ejecución

### Backend (FastAPI)
```bash
# 1. Clonar el repositorio
git clone https://github.com/soltecsalud/bw.git
cd banco_w

# 2. Crear entorno virtual de Python
python -m venv .venv

# 3. Activar entorno virtual
# En Windows PowerShell:
.\.venv\Scripts\Activate.ps1

# 4. Instalar dependencias
pip install -r app/requirements.txt
pip install psycopg2-binary
pip install email-validator   

# 5. Configurar variables de entorno
# Crear archivo app/.env con:
DATABASE_URL=postgresql://usuario:password@localhost:5432/banco_w
JWT_SECRET=tu_clave_secreta_super_segura
JWT_ALG=HS256

# 6. Ejecutar el servidor
uvicorn app.main:app --reload
```
Diagrama Bd
https://dbdiagram.io/d/bancoW-68feb640357668b732b155fc
El backend estará disponible en: **http://127.0.0.1:8000**

### Frontend (React + TypeScript)

Abre una nueva terminal:
```bash
# 1. Navegar a la carpeta frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Ejecutar la aplicación
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## 📱 Uso de la Aplicación

### 1. Registro de Usuario
- Accede a http://localhost:5173
- Haz clic en "Regístrate aquí"
- Ingresa tu email y contraseña (mínimo 6 caracteres)
- Confirma la contraseña

### 2. Inicio de Sesión
- Ingresa tu email y contraseña
- El sistema te redirigirá automáticamente al simulador

### 3. Crear una Simulación
- **Monto**: Ingresa el valor que deseas invertir (debe ser mayor a 0)
- **Término de pago**: Selecciona "Mensual" o "Anual"
- **Fechas**: Elige el rango de fechas de la inversión
- La **tasa de interés se calcula automáticamente** según las fechas seleccionadas
- Haz clic en "Crear Simulación"

### 4. Gestionar Simulaciones
- **Ver**: Todas tus simulaciones aparecen en la tabla inferior
- **Editar**: Haz clic en "Editar" para modificar una simulación
- **Eliminar**: Haz clic en "Eliminar" (se pedirá confirmación)

### 5. Cerrar Sesión
- Haz clic en "Cerrar Sesión" en la esquina superior derecha

## 🎯 Características Implementadas

✅ **Autenticación y Seguridad**
- Registro de usuarios con contraseña hasheada
- Login con JWT tokens
- Rutas protegidas (requieren autenticación)
- Sesión persistente con localStorage

✅ **Simulador Financiero**
- Cálculo automático de tasa de interés basado en fechas
- Lógica de negocio: tasas diferentes para mismo año vs años distintos
- Validación de formularios en frontend y backend
- CRUD completo de simulaciones

✅ **Interfaz de Usuario**
- Diseño responsivo (funciona desde iPhone 5: 320px)
- Validaciones en tiempo real
- Notificaciones toast para feedback
- Tabla interactiva con opciones de edición/eliminación
- Componentes reutilizables y modulares

✅ **Código de Calidad**
- TypeScript para tipado estático
- Separación de responsabilidades (componentes, services, hooks)
- Manejo robusto de errores
- Código limpio y documentado

## 📊 Estructura del Proyecto
```
banco_w/
├── app/                          # Backend FastAPI
│   ├── api/
│   │   └── routers/
│   │       ├── auth.py          # Endpoints de autenticación
│   │       └── simulations.py   # Endpoints de simulaciones
│   ├── core/
│   │   └── config.py            # Configuración y variables de entorno
│   ├── domain/
│   │   └── rules.py             # Lógica de negocio (cálculo de tasas)
│   ├── infra/
│   │   ├── db.py                # Configuración de base de datos
│   │   └── models.py            # Modelos SQLAlchemy
│   ├── .env                      # Variables de entorno
│   ├── main.py                   # Aplicación principal FastAPI
│   └── requirements.txt          # Dependencias Python
│
├── frontend/                     # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/          # Componentes React
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   ├── SimulatorForm.tsx
│   │   │   ├── SimulationsTable.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pages/               # Páginas principales
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── SimulatorPage.tsx
│   │   ├── services/
│   │   │   └── api.ts           # Cliente Axios configurado
│   │   ├── hooks/
│   │   │   └── useAuth.ts       # Hook personalizado de autenticación
│   │   ├── types/
│   │   │   └── index.ts         # Tipos TypeScript
│   │   ├── App.tsx              # Configuración de rutas
│   │   ├── main.tsx             # Punto de entrada
│   │   └── index.css            # Estilos globales (Tailwind)
│   ├── package.json
│   └── tailwind.config.js
│
├── .venv/                        # Entorno virtual Python
├── README.md                     # Este archivo
├── database_diagram.png          # Diagrama de base de datos
└── database_schema.sql           # Script SQL
```

## 🔐 Endpoints de la API

### Autenticación (No requieren token)

**POST** `/auth/register`
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**POST** `/auth/login`
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

### Simulaciones (Requieren Bearer Token)

**GET** `/simulations`
- Retorna todas las simulaciones del usuario autenticado

**POST** `/simulations`
```json
{
  "amount": 10000,
  "term": "Mensual",
  "start_date": "2025-11-01",
  "end_date": "2026-02-01"
}
```

**PUT** `/simulations/{id}`
```json
{
  "amount": 15000,
  "term": "Anual",
  "start_date": "2025-11-01",
  "end_date": "2026-11-01"
}
```

**DELETE** `/simulations/{id}`
- Elimina la simulación con el ID especificado

## 📖 Documentación de la API

Una vez el backend esté corriendo, puedes acceder a:

- **Swagger UI**: http://127.0.0.1:8000/docs
- **ReDoc**: http://127.0.0.1:8000/redoc

## 🧪 Lógica de Negocio - Cálculo de Tasas

La tasa de interés se calcula automáticamente según las fechas:

- **Mismo año**: Tasa anual del 12% (0.12)
- **Años diferentes**: Tasa anual del 15% (0.15)

La tasa efectiva se calcula según el término de pago:
- **Mensual**: `tasa_anual / 12`
- **Anual**: `tasa_anual`

Ejemplo:
- Fechas: 2025-01-01 a 2025-12-31 (mismo año)
- Término: Mensual
- Tasa aplicada: 12% / 12 = 1% mensual (0.01)

## 🛠️ Tecnologías y Decisiones Técnicas

### Backend
- **FastAPI** fue elegido por su alto rendimiento, validación automática con Pydantic, y generación automática de documentación OpenAPI.
- **SQLAlchemy 2.0** con el estilo declarativo moderno (`Mapped`, `mapped_column`) para mejor tipado y mantenibilidad.
- **JWT** para autenticación stateless, permitiendo escalabilidad horizontal.

### Frontend
- **React + TypeScript** para desarrollo robusto con detección de errores en tiempo de compilación.
- **React Hook Form** reduce re-renders y mejora el rendimiento en formularios complejos.
- **Tailwind CSS** permite desarrollo rápido con diseño consistente y totalmente responsivo.

## 📝 Notas Adicionales

- Las contraseñas se almacenan hasheadas usando bcrypt
- Los tokens JWT expiran (configurar tiempo en `app/core/config.py`)
- La aplicación es totalmente responsiva desde 320px (iPhone 5) hasta desktop
- El diseño sigue principios de Clean Architecture con separación de capas

## 👤 Autor

Desarrollado por: Santiago Erazo
Fecha: Octubre 2025  
Prueba Técnica para: **Banco W - Analista Senior Desarrollo Lab**

## 📄 Licencia

Este proyecto fue desarrollado exclusivamente como prueba técnica para Banco W.