# Reporte de Análisis de Deuda Técnica: `memorias-web`

Este reporte detalla el análisis de la deuda técnica de la aplicación `memorias-web`, enfocándose en la mantenibilidad, legibilidad, bajo acoplamiento y alta cohesión del código, según lo solicitado en el Issue #28.

---

## 1. Malos Olores de Código (Code Smells)

Identificados según la taxonomía de Martin Fowler:

### A. Módulos Gigantes / Componentes de Dios (God Modules / Large Class)
* **`search/page.tsx` (Originalmente ~1,550 líneas)**:
  Este archivo centralizaba la consulta de cinco tablas de la base de datos a memoria, la lógica de filtrado por tokens y el renderizado de tarjetas específicas para cada entidad (`Member`, `Project`, `Thesis`, `Scholarship`, `Publication`). Mezclaba la coordinación de datos con la lógica de presentación.
* **`ReportBuilderClient.tsx` (Originalmente ~1,770 líneas)**:
  Componente cliente que controlaba la configuración de cinco tipos de bloques, persistencia CRUD en servidor, edición inline de markdown, compilación de IA en doble fase y la lógica visual de maquetación del canvas A4.
* **`HeaderClient.tsx` (~630 líneas)**:
  Gestiona drawer de navegación móvil, múltiples anclas de menús desplegables, parseo de sesión y enlaces de navegación del sistema.

### B. Código Duplicado (Duplicated Code)
* **Verificación de Roles Administrativos**:
  La función para forzar privilegios de edición o administración (`ensureEditorOrAdmin` o `verifyEditorOrAdmin`) estaba duplicada en los Server Actions de cinco módulos:
  1. [members/actions.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/app/members/actions.ts)
  2. [projects/actions.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/app/projects/actions.ts)
  3. [scholarships/actions.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/app/scholarships/actions.ts)
  4. [theses/actions.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/app/theses/actions.ts)
  5. [publications/actions.ts](file:///Users/casco/Development/memorias-migration-antigrativy/memorias-web/src/app/publications/actions.ts)
* **Lógica de Generación de Slugs**:
  La lógica de normalización de caracteres, remoción de diacríticos y formato URL-friendly estaba duplicada en múltiples formularios cliente (`MemberForm`, `ProjectForm`, `ThesisForm`, `ScholarshipForm`) y en sus correspondientes Server Actions.
* **Duplicación en Selectores UI**:
  Los diálogos de selección (`MemberSelector`, `ProjectSelector`, `PublicationSelector`, `ScholarshipSelector`, `ThesisSelector`) compartían la misma lógica de inputs de búsqueda, listas de selección, modales y paginado.

### C. Cirugía de Escopeta (Shotgun Surgery)
* Cualquier cambio menor en la normalización de URLs o lógica de slugs requería editar más de una decena de archivos simultáneamente.
* Modificar el comportamiento de la traza de auditoría o de validación de roles obligaba a editar de manera independiente cada conjunto de Server Actions.

### D. Casteos Inseguros (`as any`)
* Uso reiterado de directivas de evasión del compilador sobre el cliente de base de datos (por ejemplo, `(prisma as any).systemSetting`) en componentes y Server Actions. Esto ocultaba la falta de regeneración del cliente local de Prisma.

---

## 2. Cohesión y Acoplamiento (Cohesion & Coupling)

### A. Violación de Separación de Responsabilidades (SoC)
* **Consultas de Base de Datos en Capa de Presentación**:
  Páginas como `search/page.tsx` y `page.tsx` realizaban consultas directas utilizando la instancia global de Prisma sin encapsulamiento en servicios.
* **UI Fuertemente Acoplada a Reglas de Negocio**:
  `ReportBuilderClient.tsx` acoplaba el ciclo de compilación secuencial GenAI con los detalles de renderizado CSS del canvas A4 de previsualización.

### B. Alto Acoplamiento con Prisma
* Ausencia de capas de abstracción en el acceso a datos. Modificar el motor de base de datos o separar componentes a microservicios exigiría reescribir código en las páginas y componentes visuales.

### C. Procesamiento en Memoria (Anti-patrón de Rendimiento)
* La página de búsqueda global realizaba la carga en memoria de todos los registros de la base de datos para filtrarlos mediante JavaScript. Esto causaba un problema grave de escalabilidad y alto consumo de memoria RAM a medida que crecían los registros.

---

## 3. Localización de Cambios (Change Localization)

* **Baja Localización**:
  El mantenimiento o la adición de nuevas propiedades a los modelos de datos implicaba la edición coordinada de esquemas, Server Actions, formularios, componentes de selección visual y vistas de catálogo.
* **Baja Reutilización de Componentes**:
  Al carecer de un controlador genérico de selección de entidades, cualquier cambio estético (por ejemplo, reemplazar checkboxes por chips) requería reescribir cinco componentes independientes.

---

## 4. Plan de Acción de Refactorización

El plan de acción propuesto para subsanar la deuda técnica se estructuró en 4 prioridades, las cuales han sido ejecutadas exitosamente a través de sub-issues dedicados:

1. **Prioridad 1: Optimización de Búsqueda y Descomposición (Issue #29)**
   * *Acción*: Trasladar el filtrado por tokens y conteos a nivel de base de datos PostgreSQL usando Prisma (con operadores lógicos `AND` y coincidencias insensibles a acentos) y modularizar las tarjetas en componentes reutilizables (`src/components/reusable`).
   * *Justificación*: Elimina el cuello de botella crítico de rendimiento y reduce el tamaño de `search/page.tsx`.

2. **Prioridad 2: Centralización de Funciones Comunes (Issue #30)**
   * *Acción*: Crear `src/lib/auth-helpers.ts` para validación de roles y `src/lib/slugs.ts` para normalización de slugs, reemplazando la duplicación en 12+ archivos.
   * *Justificación*: Resuelve la cirugía de escopeta al centralizar lógica propensa a cambios.

3. **Prioridad 3: Descomposición de ReportBuilderClient (Issue #31)**
   * *Acción*: Extraer estados de compilación a `useReportCompiler.ts` y dividir la interfaz en componentes acotados: `ReportDashboard.tsx`, `ReportPreviewCanvas.tsx` y `ReportBlockEditor.tsx`.
   * *Justificación*: Reduce el componente principal en un 91.1% (de 1,779 a 157 líneas), elevando la legibilidad y cohesión de cada parte.

4. **Prioridad 4: Tipado Seguro y Abstracción de Selectores (Issue #32)**
   * *Acción*: Desarrollar un selector genérico reutilizable `EntitySelector.tsx` y regenerar los tipos locales de Prisma para eliminar los casteos `(prisma as any).systemSetting`.
   * *Justificación*: Restaura la seguridad de tipado estático y unifica el mantenimiento del diseño de los selectores.
