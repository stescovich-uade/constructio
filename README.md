# 🏗️ Construct.io

> **Plataforma de Gestión de Proyectos para el sector AEC (Arquitectura, Ingeniería y Construcción)**

Construct.io es un sistema de gestión de proyectos especializado para el sector de construcción y desarrollo inmobiliario, basado en un fork de [Plane.so](https://github.com/makeplane/plane), adaptado específicamente para los flujos de trabajo del ecosistema AEC en Argentina.

---

## 🎯 Propósito

El sector AEC tiene necesidades específicas que las herramientas genéricas de gestión de proyectos no cubren:

- **Multi-tenant real:** Cada empresa/profesional es independiente pero colabora en proyectos compartidos
- **Flujos de licitación:** Sistema de tender/bidding para asignación de trabajos
- **Aprobaciones formales:** Entregables que requieren revisión y aprobación técnica
- **Fases de proyecto:** Ciclo de vida específico (factibilidad → diseño → permisos → construcción → entrega)
- **Gestión documental:** Planos, especificaciones, certificados con versionado y trazabilidad
- **Colaboración cruzada:** Desarrolladores, arquitectos, ingenieros, constructores, proveedores trabajando en conjunto

Construct.io resuelve estos problemas aprovechando la sólida arquitectura de Plane.so y extendiéndola con lógica de negocio específica del sector construcción.

---

## 🏛️ Arquitectura

### Base Tecnológica (heredada de Plane.so)

**Backend:**
- Django 4.2+ con Django REST Framework
- PostgreSQL 14+ (base de datos principal)
- Redis (cache y real-time)
- Celery (background tasks)

**Frontend:**
- Next.js 14 (App Router)
- React 18 con TypeScript
- Tailwind CSS + shadcn/ui
- SWR para data fetching

**DevOps:**
- Docker & Docker Compose
- AWS (ECS, RDS, S3, CloudFront)
- GitHub Actions (CI/CD)

### Extensiones AEC

**Modelos de Dominio:**
```python
# Tenant representa una empresa o profesional independiente
Tenant
  └── Users (empleados/colaboradores internos)
  └── Projects (proyectos donde participa)
  └── TenantCollaborations (relaciones con otros tenants)

# Project representa un desarrollo inmobiliario
Project
  └── Phases (Factibilidad, Diseño, Permisos, Construcción, etc.)
      └── Workstreams (especializaciones asignables a tenants)
          └── Deliverables (entregables con aprobación)
              └── Documents (archivos versionados)
```

**Flujos Clave:**
- Asignación de workstreams a tenants externos
- Licitaciones (tender/bidding process)
- Aprobación/rechazo de deliverables
- Gestión documental con versionado
- Trazabilidad completa de cambios

---

## 🚀 Quick Start

### Prerrequisitos

- Docker & Docker Compose
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+ (o via Docker)
- Redis (o via Docker)

### Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/constructio.git
cd constructio

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones locales

# 3. Iniciar servicios con Docker Compose
docker-compose up -d

# 4. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 5. Crear superusuario
docker-compose exec backend python manage.py createsuperuser

# 6. Cargar datos de ejemplo (opcional)
docker-compose exec backend python manage.py loaddata fixtures/aec_demo.json

# 7. Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend Admin: http://localhost:8000/admin
```

### Desarrollo Local (sin Docker)

```bash
# Backend
cd apiserver
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend (nueva terminal)
cd web
npm install
npm run dev
```

---

## 📁 Estructura del Proyecto

```
constructio/
├── .claude/                      # Configuración Claude Code & agentes
│   ├── master-plan.md           # Plan maestro de desarrollo
│   ├── settings.local.json      # Config Claude Code
│   ├── progress.md              # Log de progreso incremental
│   └── commands/                # Comandos personalizados
│
├── apiserver/                   # Backend Django
│   ├── plane/                   # App principal
│   │   ├── api/                # REST API endpoints
│   │   ├── db/models/          # Modelos Django (AEC extensions)
│   │   ├── aec/                # Lógica de negocio AEC
│   │   └── settings/           # Configuraciones
│   └── requirements.txt
│
├── web/                         # Frontend Next.js
│   ├── app/                    # Next.js 14 App Router
│   ├── components/             # React components
│   │   ├── aec/               # Componentes específicos AEC
│   │   └── ui/                # Design system
│   ├── lib/                   # Utilities & hooks
│   └── package.json
│
├── docs/                        # Documentación
│   ├── AEC_Brief.md            # Referencia industria construcción
│   ├── API.md                  # Documentación API
│   ├── ARCHITECTURE.md         # Arquitectura técnica
│   └── DEPLOYMENT.md           # Guía de deployment
│
├── docker/                      # Dockerfiles & configs
├── nginx/                       # Configuración Nginx
└── docker-compose.yml
```

---

## 🧑‍💻 Desarrollo con Agentes Especializados

Construct.io utiliza un sistema de **agentes especializados** para garantizar calidad y expertise en cada área:

### Agentes Disponibles

| Agente | Responsabilidad | Cuándo usar |
|--------|-----------------|-------------|
| **database-architect** | Diseño de modelos Django, migraciones, queries | Cambios en base de datos, optimización |
| **fullstack-architect** | Arquitectura general, integración frontend-backend | Decisiones arquitectónicas, features complejas |
| **ui-specialist** | Componentes React, UX/UI, accesibilidad | Interfaces, diseño, experiencia de usuario |
| **devops-specialist** | Infraestructura, CI/CD, deployment | Docker, AWS, pipelines, monitoring |
| **test-specialist** | Testing (unit, integration, E2E) | Escribir tests, debugging, QA |
| **aec-specialist** | Validación de flujos AEC, terminología | Validar lógica de negocio construcción |

### Uso con Claude Code

```bash
# Implementar feature completa (coordina múltiples agentes)
/implement Sistema de licitaciones para workstreams

# Revisar código con agentes apropiados
/review backend/plane/db/models/workstream.py

# Debug con agente especializado
/debug Aprobación de deliverable no genera notificación

# Optimizar performance
/optimize Queries de workstreams para proyectos grandes
```

**Ver más:** [`.claude/commands/`](.claude/commands/)

---

## 🏗️ Conceptos Clave AEC

### Tenant (Empresa/Profesional)

Cada organización del ecosistema es un **tenant independiente**:
- ABC Desarrollos (desarrollador)
- Estudio Arquitectónico XYZ (arquitecto)
- Ingeniería DEF (ingeniero)
- Constructora GHI (constructor)
- Electricista JKL (subcontratista)

Cada tenant tiene sus propios usuarios, proyectos y configuraciones, pero puede colaborar con otros tenants.

### Project (Proyecto Inmobiliario)

Representa un desarrollo inmobiliario completo. Tiene:
- **Phases:** Etapas del proyecto (Factibilidad, Diseño, Permisos, Construcción, etc.)
- **Owner Tenant:** El desarrollador que "posee" el proyecto
- **Collaborating Tenants:** Empresas que participan en el proyecto

### Workstream (Especialización de Trabajo)

Unidad de trabajo asignable a un tenant externo:
- "Proyecto Estructural" → asignado a Ingeniería DEF
- "Instalación Eléctrica" → licitación abierta a electricistas
- "Gestión Municipal" → asignado a Gestor ABC

### Deliverable (Entregable)

Output de un workstream que requiere aprobación:
- Planos estructurales (v1, v2, v3...)
- Memoria de cálculo
- Certificado de obra mensual

Estados: Draft → Submitted → Under Review → Approved / Rejected

### Tender (Licitación)

Proceso de selección de tenant para un workstream:
1. Desarrollador publica licitación
2. Múltiples tenants postulan (bids)
3. Desarrollador evalúa y adjudica
4. Workstream se asigna al ganador

---

## 📚 Documentación

- **[AEC Brief](docs/AEC_Brief.md):** Referencia completa de flujos de construcción
- **[Master Plan](.claude/master-plan.md):** Lineamientos técnicos y arquitectura
- **[API Documentation](docs/API.md):** Endpoints REST y ejemplos
- **[Architecture Guide](docs/ARCHITECTURE.md):** Decisiones técnicas y patrones
- **[Deployment Guide](docs/DEPLOYMENT.md):** Guía de despliegue a producción

---

## 🧪 Testing

```bash
# Backend tests
cd apiserver
pytest --cov=plane --cov-report=html

# Frontend tests
cd web
npm run test

# E2E tests (Playwright)
cd web
npm run test:e2e

# Linting
npm run lint
python manage.py check
```

**Cobertura objetivo:** >85% (unit + integration)

---

## 🚢 Deployment

### Staging

```bash
git push origin develop
# GitHub Actions despliega automáticamente a staging
```

### Production

```bash
git push origin main
# Requiere aprobación manual en GitHub Actions
```

**Ver:** [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🤝 Contribución

### Workflow

1. **Fork** el repositorio
2. **Crear branch** desde `develop`: `git checkout -b feature/nueva-funcionalidad`
3. **Implementar** siguiendo los estándares del proyecto
4. **Testear** (cobertura >85%)
5. **Commit** siguiendo [Conventional Commits](https://www.conventionalcommits.org/)
6. **Push** y crear **Pull Request** a `develop`

### Estándares de Código

**Backend (Python/Django):**
- PEP 8 (black formatter)
- Type hints (Python 3.11+)
- Docstrings en funciones públicas
- Tests con pytest

**Frontend (TypeScript/React):**
- ESLint + Prettier
- TypeScript strict mode
- Componentes funcionales con hooks
- Tests con Jest + RTL

### Commits

```bash
# Formato: <type>(<scope>): <subject>

feat(workstream): add tender bidding process
fix(deliverable): resolve approval notification bug
docs(aec): update phase transition documentation
test(tenant): add collaboration tests
```

**Tipos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## 🐛 Reportar Issues

Usar [GitHub Issues](https://github.com/tu-org/constructio/issues) con template:

```markdown
### Descripción
[Descripción clara del problema]

### Pasos para Reproducir
1. Ir a...
2. Hacer click en...
3. Ver error...

### Comportamiento Esperado
[Qué debería pasar]

### Comportamiento Actual
[Qué está pasando]

### Contexto
- Tenant: [tipo de empresa]
- Fase: [fase del proyecto]
- Browser/OS: [si aplica]

### Screenshots
[Si es posible]
```

---

## 📄 Licencia

Este proyecto está bajo licencia **[AGPL-3.0](LICENSE)** (heredada de Plane.so).

El código base de Plane.so está licenciado bajo AGPL-3.0 por [Plane.so](https://github.com/makeplane/plane).

Las extensiones AEC específicas de Construct.io están bajo la misma licencia.

---

## 🙏 Agradecimientos

- **[Plane.so](https://plane.so)** - Por la excelente base arquitectónica
- Comunidad AEC Argentina - Por feedback y validación de flujos
- Desarrolladores y contribuidores del proyecto

---

## 📞 Contacto

- **Documentación:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/tu-org/constructio/issues)
- **Discussions:** [GitHub Discussions](https://github.com/tu-org/constructio/discussions)

---

## 🗺️ Roadmap

### ✅ Fase 1: MVP Base (Q4 2025)
- [x] Fork y setup inicial
- [ ] Modelo multi-tenant básico
- [ ] Gestión de fases de proyecto
- [ ] Asignación de workstreams
- [ ] Aprobación de deliverables
- [ ] Gestión documental básica

### 🚧 Fase 2: Licitaciones (Q1 2026)
- [ ] Sistema de tender/bidding
- [ ] Comparación de propuestas
- [ ] Adjudicación automática
- [ ] Notificaciones de licitaciones

### 🔮 Fase 3: Avanzado (Q2 2026)
- [ ] Integración con AutoCAD/Revit (BIM)
- [ ] Métricas y analytics avanzados
- [ ] Mobile app (iOS/Android)
- [ ] Integración con ERP construcción

### 🌟 Fase 4: Escalamiento (Q3 2026)
- [ ] WhatsApp Business API
- [ ] Gestión de certificados y facturación
- [ ] Marketplace de proveedores
- [ ] IA para estimación de costos

---

**Versión:** 0.1.0-alpha  
**Basado en:** Plane.so v0.17  
**Última actualización:** Octubre 2025