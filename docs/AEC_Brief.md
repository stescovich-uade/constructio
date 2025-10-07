# BRIEF DE REFERENCIA: INDUSTRIA AEC Y DESARROLLO INMOBILIARIO

## 📋 PROPÓSITO
Documento de referencia para validar y guiar la implementación de Construct.io. Los agentes especializados deben consultar este documento para asegurar que los flujos técnicos reflejen la realidad del sector construcción en Argentina.

---

## 🏗️ CICLO DE VIDA DE UN PROYECTO INMOBILIARIO

### FASE 1: Factibilidad y Concepción
**Duración típica:** 2-4 meses

**Descripción:**
Análisis inicial de oportunidad de inversión, búsqueda de terrenos, estudios preliminares de viabilidad técnica y financiera.

**Actores principales:**
- Desarrollador/Inversor
- Consultor inmobiliario
- Analista de mercado
- Abogado (due diligence)

**Entregables clave:**
- Estudio de factibilidad económica
- Análisis de mercado
- Pre-evaluación de terreno
- Marco regulatorio aplicable

**Validaciones necesarias en Construct.io:**
- [ ] Puede crear proyecto en fase "Factibilidad"
- [ ] Puede asignar roles de Desarrollador, Consultor
- [ ] Puede adjuntar documentos de estudio
- [ ] Puede definir aprobadores para avanzar a siguiente fase

---

### FASE 2: Adquisición del Terreno
**Duración típica:** 2-6 meses

**Actores principales:**
- Desarrollador
- Abogado/Escribano
- Tasador
- Estudio geotécnico
- Agrimensor/Topógrafo

**Entregables clave:**
- Escritura del terreno
- Estudio de suelos
- Levantamiento topográfico
- Certificado de servicios (agua, luz, gas, cloacas)

**Validaciones necesarias:**
- [ ] Puede registrar compra de terreno
- [ ] Puede subir documentación legal
- [ ] Puede asignar tareas a Agrimensor (tenant externo)
- [ ] Puede aprobar/rechazar estudios

---

### FASE 3: Diseño Preliminar / Anteproyecto
**Duración típica:** 2-4 meses

**Actores principales:**
- Arquitecto (diseño)
- Ingeniero estructural (pre-dimensionamiento)
- Desarrollador (aprobaciones)

**Entregables clave:**
- Anteproyecto arquitectónico (plantas, cortes, vistas)
- Memoria descriptiva
- Renders/visualizaciones
- Presupuesto preliminar

**Workstreams típicos:**
- Diseño arquitectónico
- Pre-dimensionamiento estructural
- Renders y visualizaciones

**Validaciones necesarias:**
- [ ] Workstream "Diseño Arquitectónico" asignado a tenant externo (Estudio)
- [ ] Deliverable "Anteproyecto" con aprobación requerida
- [ ] Puede iterar (enviar a revisión → rechazar → reenviar)

---

### FASE 4: Proyecto Ejecutivo / Ingeniería de Detalle
**Duración típica:** 3-6 meses

**Actores principales:**
- Arquitecto (proyecto ejecutivo)
- Ingeniero Estructural
- Ingeniero Electricista
- Ingeniero Sanitario
- Ingeniero HVAC
- Ingeniero en Gas
- Ingeniero en Incendio
- Paisajista (opcional)

**Entregables clave:**
- Planos arquitectónicos ejecutivos
- Planos de estructura
- Planos de instalaciones (eléctricas, sanitarias, gas, HVAC)
- Memoria de cálculo estructural
- Especificaciones técnicas
- Cómputos métricos

**Workstreams típicos (cada uno puede ser un tenant diferente):**
- Proyecto arquitectónico ejecutivo
- Proyecto estructural
- Proyecto eléctrico
- Proyecto sanitario
- Proyecto HVAC
- Proyecto gas
- Proyecto incendio

**Validaciones críticas:**
- [ ] Múltiples workstreams en paralelo
- [ ] Cada workstream asignado a tenant especializado diferente
- [ ] Compatibilización entre disciplinas (alertas si hay conflictos)
- [ ] Todos los deliverables aprobados antes de avanzar fase

---

### FASE 5: Permisos y Aprobaciones
**Duración típica:** 3-12 meses (MUY VARIABLE)

**Actores principales:**
- Gestor municipal / Tramitador
- Arquitecto (firma responsable)
- Ingenieros (firmas responsables)
- Abogado
- Funcionarios municipales
- Entes reguladores (agua, luz, gas)
- Bomberos

**Entregables clave:**
- Permiso de construcción
- Certificado de bomberos
- Factibilidad de servicios
- Certificado impacto ambiental (si aplica)
- Visado colegios profesionales

**Validaciones necesarias:**
- [ ] Workstream "Gestión Municipal" con seguimiento de trámites
- [ ] Deliverables con estado "En trámite" / "Aprobado" / "Observado"
- [ ] Alertas de vencimientos de trámites
- [ ] Puede registrar observaciones de organismos

---

### FASE 6: Licitación / Pre-Construcción
**Duración típica:** 1-3 meses

**Actores principales:**
- Desarrollador
- Arquitecto/Director de proyecto
- Gerente de construcción
- Constructoras (oferentes)
- Abogado (contratos)

**Entregables clave:**
- Pliego de especificaciones
- Propuestas de constructoras
- Matriz de evaluación
- Contrato de construcción
- Cronograma de obra

**FLUJO CRÍTICO - LICITACIÓN:**
1. Desarrollador publica licitación (workstream)
2. Constructoras se postulan (tenants externos)
3. Desarrollador evalúa ofertas
4. Se adjudica a una constructora
5. Constructora recibe workstream asignado

**Validaciones necesarias:**
- [ ] Sistema de licitación/tender funcional
- [ ] Múltiples tenants pueden postularse
- [ ] Puede comparar ofertas (precio, plazo)
- [ ] Al adjudicar, workstream se asigna al tenant ganador
- [ ] Otros postulantes notificados de resultado

---

### FASE 7: Construcción / Ejecución de Obra
**Duración típica:** 12-36 meses

**Actores principales:**

**Equipo Desarrollador:**
- Director de Proyecto
- Gerente de Construcción
- Inspector de obra

**Constructora:**
- Jefe de Obra
- Capataces
- Maestros mayores de obras

**Subcontratistas (cada uno puede ser tenant):**
- Estructura (hormigón, encofrados)
- Albañilería
- Electricista
- Plomero
- HVAC
- Ascensores
- Carpintería aluminio
- Carpintería madera
- Herrería
- Pintura
- Revestimientos
- Impermeabilizaciones
- Vidrios
- Incendio
- Portero eléctrico
- Domótica
- Paisajismo

**Proveedores:**
- Corralón
- Hormigonera
- Fábrica de hierros
- Sanitarios y griferías
- Aberturas

**Entregables clave:**
- Informes semanales/mensuales de avance
- Certificados de obra
- Actas de reunión
- Registros fotográficos
- Planos "as-built"
- Ensayos de laboratorio

**Validaciones necesarias:**
- [ ] Constructora (tenant) puede subcontratar workstreams a otros tenants
- [ ] Múltiples subcontratistas trabajando en paralelo
- [ ] Certificados mensuales de avance
- [ ] Puede adjuntar fotos de avance
- [ ] Alertas de retrasos en cronograma

---

### FASE 8: Final de Obra / Pre-entrega
**Duración típica:** 2-4 meses

**Actores principales:**
- Constructora (remates finales)
- Inspector municipal
- Bomberos (habilitación)
- Arquitecto (certificado final)

**Entregables clave:**
- Certificado final de obra
- Conforme a obra (planos as-built)
- Habilitación de bomberos
- Final de obra municipal
- Manuales de uso
- Garantías de equipos

**Validaciones necesarias:**
- [ ] Checklist de pendientes (punch list)
- [ ] Todos los deliverables de obra aprobados
- [ ] Certificados finales subidos
- [ ] No puede pasar a siguiente fase sin todo completo

---

### FASE 9: Entrega y Post-Venta
**Duración típica:** 2-6 meses

**Actores principales:**
- Desarrollador
- Compradores
- Escribano
- Equipo post-venta

**Entregables clave:**
- Acta de entrega de unidad
- Escritura traslativa
- Manual del propietario
- Garantías

**Validaciones necesarias:**
- [ ] Registro de observaciones por unidad
- [ ] Seguimiento de correcciones
- [ ] Gestión de garantías (período 1 año típico)

---

## 👥 MAPEO DE ACTORES Y TENANTS

### Concepto de Tenant en Construct.io

**Tenant = Empresa o profesional independiente**

Ejemplos:
- ABC Desarrollos (Desarrollador) → Tenant
- Estudio Arquitectónico XYZ → Tenant
- Ingeniería DEF → Tenant
- Constructora GHI → Tenant
- Electricista JKL → Tenant
- Corralón MNO → Tenant (proveedor)

**Cada tenant:**
- Tiene sus propios usuarios internos
- Puede participar en múltiples proyectos
- Puede ser contratado (asignado) por otros tenants
- Tiene su propia vista de proyectos donde participa

---

## 🔄 FLUJOS CRÍTICOS A IMPLEMENTAR

### 1. Flujo de Asignación de Workstream

```
Desarrollador crea Workstream "Proyecto Estructural"
    ↓
Busca Tenant "Ingeniería DEF"
    ↓
Envía invitación (con scope, presupuesto, plazo)
    ↓
Ingeniería DEF recibe notificación
    ↓
Acepta/Rechaza
    ↓
Si acepta: Workstream aparece en su panel
    ↓
Ingeniería DEF asigna internamente a su ingeniero
    ↓
Ingeniero trabaja en deliverables
    ↓
Envía deliverable (ej: Planos Estructurales)
    ↓
Desarrollador revisa
    ↓
Aprueba/Rechaza con comentarios
    ↓
Si rechaza: vuelta a Ingeniería DEF
    ↓
Si aprueba: Deliverable cerrado
```

**Validaciones técnicas:**
- [ ] Workstream puede estar en estado "Pending Assignment"
- [ ] Invitación crea TenantCollaboration (pending)
- [ ] Al aceptar, cambia a "active"
- [ ] Workstream cambia a "Assigned"
- [ ] Tenant asignado ve workstream en su dashboard

### 2. Flujo de Licitación (Tender)

```
Desarrollador crea Tender para workstream
    ↓
Publica pliego de licitación
    ↓
Múltiples Constructoras (tenants) se postulan
    ↓
Envían propuesta (monto, plazo, experiencia)
    ↓
Desarrollador evalúa ofertas
    ↓
Adjudica a una Constructora
    ↓
Workstream se asigna al ganador
    ↓
Otros postulantes notificados (rechazados)
```

**Validaciones técnicas:**
- [ ] TenderProcess model con estado publicado/cerrado
- [ ] TenderBid model para cada postulación
- [ ] Puede comparar múltiples bids
- [ ] Al adjudicar, crea TenantCollaboration
- [ ] Workstream se asigna automáticamente

### 3. Flujo de Aprobación de Deliverable

```
Tenant externo trabaja en deliverable
    ↓
Marca como "Listo para entregar"
    ↓
Notificación al tenant contratante
    ↓
Revisor descarga/visualiza entregable
    ↓
Aprueba con/sin observaciones
    ↓
Si tiene observaciones menores: Aprueba con condiciones
    ↓
Si requiere cambios: Rechaza con comentarios
    ↓
Tenant externo corrige
    ↓
Re-envía (nueva versión)
    ↓
Se repite ciclo hasta aprobación final
```

**Validaciones técnicas:**
- [ ] Deliverable con estados: Draft / Submitted / Under Review / Approved / Rejected
- [ ] Versionado de archivos (v1, v2, v3...)
- [ ] Comentarios y observaciones registradas
- [ ] Notificaciones automáticas en cada cambio de estado
- [ ] History log de todas las revisiones

---

## 📄 GESTIÓN DOCUMENTAL

### Tipos de Documentos por Fase

**Factibilidad:**
- Estudios de mercado (PDF)
- Análisis financiero (Excel)
- Fotos del terreno (JPG)

**Diseño:**
- Planos DWG/DXF (AutoCAD)
- Modelos BIM (Revit - RVT)
- Renders (JPG/PNG)
- Memoria descriptiva (PDF/Word)

**Proyecto Ejecutivo:**
- Planos por especialidad (DWG/PDF)
- Cálculos estructurales (PDF)
- Especificaciones técnicas (PDF/Word)
- Planillas de computo (Excel)

**Construcción:**
- Certificados de obra (PDF)
- Fotos de avance (JPG)
- Informes de inspección (PDF)
- Ensayos de laboratorio (PDF)
- Planos as-built (DWG/PDF)

**Validaciones necesarias:**
- [ ] Versionado automático
- [ ] Puede comparar versiones (diff)
- [ ] Permisos por tenant (quién puede ver qué)
- [ ] Watermarks en PDFs para seguridad
- [ ] Búsqueda por nombre, tipo, fase, tenant

---

## 🔐 PERMISOS Y ROLES

### Matriz de Permisos por Rol

| Rol | Ver Proyecto | Crear Workstream | Asignar Tenant | Aprobar Deliverable | Ver Finanzas |
|-----|--------------|------------------|----------------|---------------------|--------------|
| **Desarrollador Admin** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Project Manager** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Director Técnico** | ✅ | ✅ | ⚠️ Requiere aprobación | ✅ | ❌ |
| **Inspector** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **Tenant Externo Admin** | ⚠️ Solo workstreams asignados | ❌ | ❌ | ❌ | ❌ |
| **Tenant Colaborador** | ⚠️ Solo sus tareas | ❌ | ❌ | ❌ | ❌ |

**Validaciones técnicas:**
- [ ] Role-based access control (RBAC) implementado
- [ ] Permisos a nivel proyecto, fase, workstream
- [ ] Tenants externos solo ven lo asignado a ellos
- [ ] Audit log de todos los accesos

---

## ⚠️ CASOS ESPECIALES

### 1. Subcontratación en Cadena

```
Desarrollador → Constructora (Tenant A)
                    ↓
        Constructora subcontrata Electricista (Tenant B)
                    ↓
        Electricista subcontrata ayudante (Tenant C)
```

**Validaciones necesarias:**
- [ ] Tenant A puede crear sub-workstreams
- [ ] Tenant B ve solo su alcance
- [ ] Desarrollador ve toda la cadena
- [ ] Trazabilidad completa

### 2. Cambios Durante Construcción

```
Arquitecto envía plano modificado durante obra
    ↓
Debe aprobarse por desarrollador
    ↓
Si se aprueba: notificar a constructora
    ↓
Constructora evalúa impacto (adicional)
    ↓
Genera pedido de adicional
    ↓
Desarrollador aprueba/rechaza adicional
```

**Validaciones necesarias:**
- [ ] Sistema de change orders
- [ ] Impacto en cronograma y costo
- [ ] Aprobaciones requeridas
- [ ] Documentación de cambios

### 3. Múltiples Proyectos Simultáneos

Un arquitecto puede estar trabajando en:
- Proyecto A (Fase Anteproyecto)
- Proyecto B (Fase Proyecto Ejecutivo)
- Proyecto C (Fase Construcción - inspección)

**Validaciones necesarias:**
- [ ] Dashboard consolidado multi-proyecto
- [ ] Filtros por estado, urgencia
- [ ] Notificaciones priorizadas
- [ ] Time tracking por proyecto

---

## 🚨 ALERTAS Y NOTIFICACIONES

### Eventos que Generan Notificación

**Inmediatas (Email + In-app):**
- Asignación de workstream
- Deliverable enviado para aprobación
- Deliverable rechazado con observaciones
- Licitación adjudicada
- Plazo próximo a vencer (3 días)

**Diarias (Resumen):**
- Tareas pendientes de revisión
- Workstreams sin avance hace >7 días

**Semanales:**
- Resumen de proyecto
- Certificados pendientes
- Documentos sin aprobar

**Validaciones técnicas:**
- [ ] Sistema de notificaciones configurable
- [ ] Preferencias por usuario
- [ ] No spam (consolidar notificaciones)
- [ ] Click en notificación lleva a contexto

---

## 📊 MÉTRICAS Y KPIs

### Dashboard Desarrollador

**Métricas clave:**
- % de avance del proyecto global
- % de avance por fase
- Workstreams en riesgo (atrasados)
- Costo real vs. presupuestado
- Deliverables pendientes de aprobación
- Tenants con mejor performance (tiempo, calidad)

### Dashboard Tenant Externo

**Métricas clave:**
- Mis workstreams activos
- Deliverables pendientes de enviar
- Deliverables en revisión
- Tasa de aprobación (primera vez)
- Rating promedio recibido

**Validaciones técnicas:**
- [ ] Gráficos con Chart.js o Recharts
- [ ] Exportable a PDF/Excel
- [ ] Filtros por fecha, proyecto, tenant
- [ ] Actualización en tiempo real

---

## 🔧 INTEGRACIONES FUTURAS

### Prioridad Alta
- **BIM (Revit/AutoCAD):** Importar planos, detectar cambios
- **Google Drive/Dropbox:** Sincronización de archivos
- **WhatsApp Business API:** Notificaciones y alertas

### Prioridad Media
- **ERP Construcción:** Integrar con sistemas de gestión de obra
- **Contabilidad:** Certificados → facturas
- **Geolocalización:** Tracking de equipos en obra

### Prioridad Baja
- **Drones:** Fotos aéreas de avance
- **IoT Sensores:** Monitoreo de obra en tiempo real

---

## ✅ VALIDACIÓN FINAL

### Checklist de Implementación por Fase

Antes de considerar una fase "completa", verificar:

- [ ] Todos los actores pueden ser representados como tenants
- [ ] Todos los workstreams típicos pueden crearse
- [ ] Todos los deliverables pueden ser entregados y aprobados
- [ ] Permisos correctos por rol
- [ ] Notificaciones funcionando
- [ ] Documentación se puede adjuntar y versionar
- [ ] Flujo de aprobación/rechazo funciona
- [ ] Puede avanzar a siguiente fase solo si está completa

---

**Versión:** 1.0  
**Fecha:** Octubre 2025  
**Mantenido por:** aec-specialist  
**Para consultas de implementación:** Consultar con fullstack-architect y database-architect