# 🏗️ Construct.io — Proyecto AEC basado en Fork de Plane.so

## 📋 Propósito
Este documento establece las **directrices generales para el desarrollo del sistema Construct.io**, una plataforma de gestión de proyectos **AEC (Arquitectura, Ingeniería y Construcción)** basada en un **fork de [Plane.so](https://github.com/makeplane/plane)**.

El objetivo es **aprovechar la arquitectura existente de Plane.so (single-tenant)** para **acelerar el desarrollo**, adaptándola al **ecosistema multi-tenant AEC**, donde **cada profesional o empresa actúa como un tenant independiente** con su propia estructura, proyectos y colaboradores internos.

---

## ⚙️ Lineamientos Técnicos Generales

### 🔹 Base del proyecto
- El sistema debe partir de un **fork directo del repositorio oficial de Plane.so**.  
- No se debe reescribir desde cero; el foco es **adaptar, extender y especializar**.  
- Mantener la compatibilidad con futuras actualizaciones del core Plane.  
- El **modelo single-tenant actual** ya existe en Plane.so; se trabajará sobre su extensión a **multi-tenant**.

---

## 🧱 Adaptación al Ecosistema AEC

El sistema debe representar el **flujo real de un proyecto inmobiliario o de construcción en Argentina**, dividido por fases (factibilidad, anteproyecto, permisos, licitación, obra, post-venta, etc.).  
Cada fase involucra **actores y empresas especializadas** (arquitectos, ingenieros, constructores, proveedores, gestores, etc.), y **cada tenant** dentro de Construct.io representará a **una empresa o profesional independiente** que puede participar en múltiples proyectos simultáneamente.

---

## 👥 Modelo de Roles y Tenancy

### Estructura conceptual:
- **Tenant = Empresa o profesional independiente.**
- **Usuario = Persona que pertenece a un tenant.**
- **Proyecto = Desarrollo inmobiliario, obra, edificio o emprendimiento.**
- **Tarea = Unidad de trabajo asignable dentro de una fase.**

### Roles base dentro de cada tenant:
| Rol | Descripción | Ejemplo AEC |
|------|--------------|--------------|
| **Administrador** | Gestiona el tenant y los proyectos asociados. | Director de estudio / Gerente de empresa |
| **Líder de proyecto** | Responsable de proyectos asignados. | Arquitecto principal / Jefe de obra |
| **Colaborador** | Ejecuta tareas asignadas internamente. | Dibujante, ingeniero, técnico, administrativo |

---

## 🔄 Flujo de Licitación y Asignación de Tareas

1. El **desarrollador del proyecto** (tenant principal) publica una **licitación interna** o un **pedido de colaboración** dentro de una fase.
2. Otros tenants (empresas o profesionales) pueden **postularse** o **ser invitados**.
3. Una vez adjudicado el trabajo, el tenant adjudicado recibe la tarea dentro de su entorno interno.
4. Dentro de ese tenant, el **Administrador** o **Líder de proyecto** asigna la tarea a un colaborador específico.
5. Todo el ciclo (licitación → adjudicación → ejecución → entrega → aprobación) debe quedar **trazado y auditable** dentro del sistema.

---

## 🧩 Funcionalidades AEC clave a implementar

- **Gestión multi-tenant real**, con independencia de datos y paneles por empresa.
- **Asignación cruzada entre tenants** (colaboraciones externas).
- **Sistema de licitación y adjudicación de tareas** (inspirado en flujos de compra/contratación).
- **Gestión documental centralizada**, con versionado y trazabilidad.
- **Flujos de aprobación** configurables por fase y rol.
- **Integración con herramientas BIM (Revit/AutoCAD) o Drive/SharePoint.**
- **Dashboard de avance por fase y rubro.**
- **Métricas de productividad y costos.**

---

## 🧠 Estructura de Coordinación entre Especialistas

El equipo de desarrollo deberá trabajar **de manera colaborativa y validada** entre los siguientes roles clave:

| Rol | Alias en el equipo | Responsabilidad principal |
|------|--------------------|----------------------------|
| **Database Architect** | `database-architect` | Diseño Django models, workspace isolation, query optimization, y backend API development con workspace-based multi-tenancy para Plane.SO. |
| **Full-Stack Architect** | `fullstack-architect` | Arquitectura Django REST + Next.js, real-time collaboration features, issue management workflows, y patrones de desarrollo para project management platforms. |
| **UI/UX Specialist** | `ui-specialist` | Componentes React colaborativos, kanban boards, real-time UI updates, accessibility, y experiencia de usuario para teams de desarrollo ágil. |
| **Test Specialist** | `test-specialist` | Testing integral Django + React, scenarios de colaboración en tiempo real, workspace isolation testing, y quality assurance para plataformas colaborativas. |
| **DevOps Specialist** | `devops-specialist` | Infrastructure AWS, Docker containers, CI/CD pipelines, WebSocket scaling, y deployment para project management platforms con real-time features. |
| **AEC Specialist** | `aec-specialist` | Workflows arquitectura/ingeniería/construcción, coordination multi-disciplinaria, regulatory compliance, y adaptación de procesos AEC en Plane.SO. |

🔸 **Importante:**  
Todo desarrollador o colaborador que necesite validar decisiones o interpretar requerimientos debe:
1. **Consultar primero con el especialista responsable del área correspondiente.**
2. En caso de duda conceptual o funcional, **elevar la consulta al especialista AEC**.
3. Ningún cambio estructural (modelo, roles, UI o lógica de negocio) debe implementarse sin validación cruzada con los tres roles principales.

---

## 🏗️ Arquitectura esperada

### Backend:
- Basado en Django + PostgreSQL (como en Plane.so).
- Debe extender el modelo existente con:
  - **Identificación de tenant (empresa/profesional).**
  - **Roles jerárquicos internos.**
  - **Referencias cruzadas entre tenants (licitaciones).**

### Frontend:
- React (Next.js o similar).
- UI adaptada a lenguaje AEC: fases, planos, entregables, aprobaciones.
- Debe incluir **paneles personalizables por rol** (arquitecto, ingeniero, contratista, desarrollador).

### Seguridad:
- Autenticación basada en tenant.
- Control de acceso granular (proyecto / fase / tarea).
- Aislamiento de datos entre tenants.
- Cifrado de documentos y logs de auditoría.

---

## 🗂️ Organización del repositorio (sugerida)
/constructio/
├── backend/ # Adaptación de Django (Plane backend)
│ ├── core/ # Multi-tenant logic, models, permissions
│ ├── projects/ # AEC lifecycle management
│ ├── tasks/ # Licitation & task workflows
│ └── integrations/ # Drive, BIM, Revit APIs
│
├── frontend/
│ ├── components/ # AEC UI components
│ ├── pages/ # Dashboard, Licitations, Projects
│ ├── tenants/ # Tenant onboarding & profile
│ └── ui/ # UI system (Tailwind / shadcn)
│
├── docs/
│ ├── AEC_Brief.md
│ ├── API_Specs.md
│ ├── UI_Flow_Diagrams.md
│ └── DB_Model.md
│
└── README.md

---

## 🧩 Colaboración entre equipos

### Responsabilidades principales
- **database-architect** debe aprobar todo cambio en Django models, migraciones PostgreSQL, y workspace isolation patterns
- **fullstack-architect** valida la lógica de workflows (issue lifecycle, sprint management, real-time collaboration)
- **ui-specialist** adapta componentes React, kanban boards, y interfaces colaborativas según las necesidades del project management
- **test-specialist** valida coverage de testing para features colaborativos, workspace isolation, y scenarios multi-usuario
- **devops-specialist** asegura infrastructure scaling, WebSocket performance, y deployment de real-time features
- **aec-specialist** adapta workflows de construcción y procesos multi-disciplinarios a la estructura de Plane.SO

### Flujos de aprobación
- **database-architect** + **fullstack-architect** deben revisar cambios que afecten workspace isolation
- **ui-specialist** + **test-specialist** colaboran en accessibility testing y component behavior
- **devops-specialist** + **database-architect** coordinan optimizations de performance y scaling
- **aec-specialist** consulta con **fullstack-architect** para mapear procesos de construcción a issue workflows

### Sincronización del equipo
- **Reuniones de sincronización semanales** entre todos los especialistas
- **Daily standups** entre database-architect, fullstack-architect, y ui-specialist para features activos
- **Sprint reviews** donde aec-specialist valida que workflows representen procesos reales del sector
- **Architecture review meetings** mensuales para evaluar decisiones técnicas y domain modeling

### Escalación y consultas
- Para **procesos colaborativos de development teams** o **workflows de project management**: consultar al **project-management-specialist**
- Para **procesos específicos del sector construcción**: consultar al **aec-specialist**
- Para **decisiones técnicas críticas**: reunión conjunta de database-architect, fullstack-architect y devops-specialist

---

## 📞 Canales de coordinación sugeridos
- **GitHub Issues**: para tareas técnicas, bugs y backlog funcional.
- **Plane.so original**: referencia para comparar estructura de módulos.
- **Discord/Slack**: canal rápido de validación entre `database-architect`, `fullstack-architect` y `ui-specialist`.
- **Google Drive / Notion**: documentación viva del proyecto.

---

## ✅ Recomendaciones finales
- No reinventar lo que ya está resuelto en Plane.so (gestión de tareas, usuarios, autenticación).  
- Centrar el desarrollo en **flujos de negocio AEC** (licitaciones, roles, documentación, aprobaciones).  
- Mantener código modular y portable para futuras integraciones con BIM y ERP.  
- Validar cada módulo antes de avanzar al siguiente (ciclo incremental).

---

### 📅 Próximos pasos
1. Crear el fork del repositorio oficial de Plane.so.  
2. Configurar entorno local (backend + frontend).  
3. Coordinar kickoff técnico entre los tres especialistas.  
4. Definir modelo multi-tenant con `database-architect`.  
5. Diseñar flujo de licitación con `fullstack-architect`.  
6. Adaptar UI al ecosistema AEC con `ui-specialist`.  

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Autor base:** Equipo AEC Specialist  
**Validar con:** `database-architect`, `fullstack-architect`, `ui-specialist`  
**Repositorio base:** [https://github.com/makeplane/plane](https://github.com/makeplane/plane)

---