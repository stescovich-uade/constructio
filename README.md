# 🏗️ Plataforma de Coordinación Técnica de Proyectos

Sistema SaaS para centralizar, versionar y aprobar documentación técnica en proyectos de arquitectura, ingeniería y construcción.

---

## 🎯 Propósito

Resolver la falta de trazabilidad y control de versiones en obra:

> ❗ Evitar construcción con planos desactualizados  
> ❗ Centralizar comunicación técnica  
> ❗ Garantizar una única fuente de verdad  

---

## 🧠 Concepto Clave

> 🔥 El sistema gira alrededor del **THREAD como unidad de control**

Un thread representa un tema técnico específico:


OBRA > ASESOR > NIVEL > TIPOLOGÍA


Ejemplo:

Torre A > Estructura > Piso 3 > Vigas


---

## 🏢 Modelo SaaS

### Estructura


PLATAFORMA
└── EMPRESA
├── USUARIOS
└── PROYECTOS


### Reglas

- Un usuario pertenece a **una sola empresa**
- Si es independiente → se crea empresa automáticamente
- Un proyecto es **multi-empresa**

---

## 🧩 Participación en Proyectos


PROYECTO
└── EMPRESAS
├── Rol
└── Usuarios asignados


### Roles posibles

- ARQUITECTURA
- DDO (Dirección de Obra)
- ASESOR
- DESARROLLADOR

---

## 🧱 Estructura Técnica

- NIVELES (SS, PB, Piso 1, etc.)
- TIPOLOGÍAS (vigas, losas, etc.)
- DISCIPLINAS (estructura, sanitaria, etc.)

✔ Basado en templates  
✔ Editable por proyecto  

---

## 🧵 Thread (núcleo del sistema)

Cada thread contiene:

- Documento principal (1)
- Documentos secundarios (opcionales)
- Versionado lineal
- Comentarios por versión
- RFI vinculados
- Lista de lectores (visibilidad)

---

## 🔁 Versionado


V1 → V2 → V3 → V4


### Reglas

- ❗ Versionado lineal (sin ramas)
- ❗ No existe rollback
- ❗ Solo una versión vigente
- ❗ Versiones anteriores → estado `SUPERADO`

---

## 📌 Estado APTO

- Solo puede existir **un (1) APTO por thread**
- Si ya existe:
  - Se puede reemplazar
  - O crear nueva versión

---

## ✅ Aprobación

> ✔ Siempre es por THREAD completo

Incluye:
- Documento principal
- Documentos secundarios

### Quién aprueba

- Proyecto / Anteproyecto → ARQUITECTURA
- Etapa Ejecutiva → DDO

### Reglas

- Usuarios aprobadores se definen por proyecto
- Se registra:
  - Quién aprobó
  - Cuándo

---

## 🔄 Flujo


BORRADOR
↓
APTO
↓
REVISIÓN
↓
APROBADO → VIGENTE
o
AJUSTES → nueva versión


---

## 💬 Comentarios

- Asociados a versión
- Persistentes (no se borran)
- Tipos:
  - OBSERVACIÓN
  - AJUSTE
  - APROBACIÓN

---

## 🔗 RFI (Request for Information)

Vinculado a cada thread.

Permite:
- Consultas técnicas
- Adjuntar archivos
- Responder antes de nueva versión

---

## 👁️ Visibilidad

Definida por thread:

- Por empresa
- Por usuario

Editable en cualquier momento

---

## 🏷️ Naming

Configurable por proyecto:


[OBRA]-[ASESOR]-[NIVEL]-[TIPOLOGIA]-V[NUM]


- Editable al inicio
- Luego queda bloqueado

---

## 📦 Archivos

Tipos soportados:
- DWG / DWF
- PDF
- Word / Excel
- Imágenes / videos

### Restricciones

- Máximo: **100 MB por archivo**
- No se pueden editar → solo nuevas versiones

---

## 🗂️ Históricos

No se eliminan archivos.

Estados:
- VIGENTE
- SUPERADO

---

## 🔔 Notificaciones

Configurables por usuario:

- In-App
- Email
- WhatsApp (futuro)

Eventos:
- Nuevo APTO
- Aprobación
- Ajustes
- RFI

---

## 🧾 Auditoría

> 🔥 FULL AUDIT LOG

Se registra TODO:

- Subidas
- Aprobaciones
- Cambios
- Accesos relevantes

---

## ⚙️ Storage

- MVP → Supabase Storage
- Futuro → AWS S3 configurable

---

## 🧑‍💻 SUPERADMIN

Panel global de plataforma:

- Empresas
- Proyectos
- Storage
- Billing
- Logs

---

## 🚀 Stack Tecnológico

- Frontend: (a definir)
- Backend: Node.js
- ORM: Prisma
- DB: PostgreSQL
- Storage: Supabase
- Deploy: Vercel

---

## 📁 Estructura del Proyecto (Backend)


/src
├── modules
│ ├── auth
│ ├── users
│ ├── companies
│ ├── projects
│ ├── threads
│ ├── documents
│ ├── rfi
│ ├── notifications
│ └── audit
│
├── core
│ ├── database
│ ├── storage
│ ├── permissions
│ └── utils
│
├── config
└── main.ts


---

## 🧠 Reglas Críticas del Sistema

- ❗ Solo un APTO por thread
- ❗ No editar versiones
- ❗ No rollback
- ❗ Aprobación siempre total
- ❗ Todo se audita
- ❗ Nada se borra → solo SUPERADO

---

## 🎯 Objetivo

Construir una plataforma robusta, clara y adoptable por el mundo real de la construcción, priorizando:

- Simplicidad operativa
- Trazabilidad
- Control técnico real