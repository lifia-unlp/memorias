# memorias-web Reverse Engineering Progress

Este documento de progreso registra el estado activo, hallazgos e hitos de entrega entre sesiones de IA para el proyecto **memorias-web**.

---

## Current Status
* **Active Phase**: Technical Debt Resolution & Code Quality Audit (Issue #28)
* **Last Updated**: 2026-07-08
* **Overall Progress**: 100% completed (Including search page optimization, DRY utilities, ReportBuilderClient decomposition, type safety/selector unification, and technical debt analysis report submission)

---

## Session Logs

### Session 17 (2026-07-08)
* **Goal**: Resolver el análisis de deuda técnica solicitado en el Issue #28, compilar el reporte final, comentarlo en la plataforma y cerrar el issue en GitHub.
* **Accomplished**:
  * Realizado el análisis integral de la deuda técnica remanente y resuelta del monorepo en `/memorias-web`.
  * Redactado el documento de reporte `technical_debt_analysis.md` cubriendo malos olores de código, cohesión y acoplamiento, localización de cambios y el plan de acción ejecutado.
  * Publicado el reporte completo como comentario oficial en el Issue #28 utilizando la interfaz de línea de comandos de GitHub (`gh`).
  * Cerrado el Issue #28 formalmente al haber completado la auditoría de calidad y reportes requeridos.
* **Blocked Items**:
  * Ninguno.
  * Nota: Existen cambios unstaged (untracked/modified) de las sesiones 15 y 16 en el entorno local listos para revisión y posterior commit en la rama de desarrollo correspondiente.
* **Next Steps**:
  * Coordinar con el desarrollador para confirmar la aprobación de los refactorings locales (Issues #31 y #32) y proceder con el commit/push de los archivos modificados a la rama principal.

---

### Session 16 (2026-07-08)
* **Goal**: Modularizar el componente "God Component" de 1,779 líneas `ReportBuilderClient.tsx` (Issue #31).
* **Accomplished**:
  * Extraídos los estados de compilación, peticiones/mutaciones asíncronas, ciclos de vida de GenAI y exportadores de texto a un hook personalizado: `useReportCompiler.ts`.
  * Modularizado el layout en tres componentes independientes de UI:
    * `ReportDashboard.tsx`: Dashboard de carga y lista de configuraciones de reportes.
    * `ReportPreviewCanvas.tsx`: Previsualización de compilación con hojas A4.
    * `ReportBlockEditor.tsx`: Configuración detallada de cada bloque e intereses/tags/años.
  * Reescrito `ReportBuilderClient.tsx` reduciendo su línea de código en un 91.1% (de 1,779 a 157 líneas).
  * Cerrado el Issue #31 en GitHub usando CLI.
  * Verificado tipado (`npx tsc --noEmit`) y pruebas unitarias (`npm run test`) logrando 51/51 aprobadas.
* **Discovered**:
  * Separar la lógica funcional en hooks personalizados desacopla totalmente el estado de la presentación de UI, simplificando el mantenimiento de ambos.

---

### Session 15 (2026-07-08)
* **Goal**: Resolver el Issue #32 sobre tipado estático seguro y reutilización de selectores de entidades en `memorias-web`.
* **Accomplished**:
  * Sincronizado esquema local de Prisma ejecutando `npx prisma generate` para proveer tipado al modelo `SystemSetting`.
  * Eliminados los casteos inseguros `(prisma as any).systemSetting` en controladores, páginas cliente y componentes.
  * Desarrollado el componente genérico de selección de entidades `EntitySelector.tsx`.
  * Refactorizados `MemberSelector.tsx`, `ProjectSelector.tsx`, `PublicationSelector.tsx`, `ScholarshipSelector.tsx` y `ThesisSelector.tsx` para delegar su renderizado al selector genérico unificado.
  * Cerrado el Issue #32 en GitHub mediante CLI y verificado paso exitoso de 51 pruebas con Vitest.

---

### Session 14 (2026-06-23)
* **Goal**: Optimizar la página de búsqueda global pasando filtros en memoria a nivel de base de datos (PostgreSQL) usando Prisma y descomponer la UI de resultados extrayendo componentes modulares (Issue #29).
* **Accomplished**:
  * Descompuesto el diseño de tarjetas de búsqueda en 5 componentes individuales en `src/components/reusable/` (tarjetas de Member, Project, Thesis, Scholarship y Publication) con anotaciones semánticas.
  * Refactorizada la consulta en `src/app/search/page.tsx` para mover la tokenización `AND` de palabras múltiples y conteos directamente al motor de base de datos.
  * Agregada carga dinámica de entorno (`@next/env`) en Playwright para consistencia en pruebas E2E.
  * Verificado paso exitoso de 8/8 pruebas E2E y 51/51 pruebas unitarias.
  * Compilado de producción Next.js exitoso, fusionado cambios en rama `main` y empujado a repositorio.

---

### Session 13 (2026-06-23)
* **Goal**: Analizar deuda técnica en `/memorias-web` (Issue 28), compilar reporte final y crear issues asociados en GitHub para coordinar los refactorings.
* **Accomplished**:
  * Realizado análisis exhaustivo identificando God Components, duplicación de autorización y lógicas de slugs, acoplamientos y el cuello de botella en búsqueda global.
  * Creado el reporte detallado con hoja de ruta priorizada.
  * Registrados 5 issues asociados en GitHub (Issues #29 al #33) con descripciones técnicas y archivos concretos a modificar.
  * Implementado el refactoring de DRY Utilities (**Issue #30**) en la rama `feature/dry-utilities` creando `src/lib/auth-helpers.ts` y `src/lib/slugs.ts`, integrándolos en Server Actions y componentes clientes.
  * Agregadas pruebas para slugs logrando 100% de cobertura y build de producción exitoso.

---

### Session 12 (2026-05-28)
* **Goal**: Mejorar la tarjeta de perfil de Researcher agregando sección de docencia UNLP, enlaces a Google Scholar, ResearchGate y DBLP mediante SVGs customizados, y renombrar la anotación semántica.
* **Accomplished**:
  * Creada sección "Teaching at UNLP" bajo las acreditaciones científicas mostrando cargos y cursos.
  * Diseñados SVGs integrados en línea para logos de Google Scholar, ResearchGate y DBLP.
  * Ajustada la anotación semántica controlada de `Researcher profile card` a `Member Profile Card` en JSX y reglas.
  * Verificado paso exitoso de todas las pruebas y compilación correcta con Turbopack.

---

### Session 11 (2026-05-28)
* **Goal**: Habilitar búsqueda de intereses de investigación y taxonomía ACM en la página de búsqueda global y catálogo de miembros.
* **Accomplished**:
  * Modificada lógica en `src/app/search/page.tsx` y `src/app/members/page.tsx` para evaluar las columnas `interestsInEnglish` e `interestsInSpanish`.
  * Verificado el correcto funcionamiento buscando términos como "Creation".

---

### Session 10 (2026-05-28)
* **Goal**: Implementar selector ACM CCS reutilizable y visualización de rutas taxonómicas en formularios y detalles de CV.
* **Accomplished**:
  * Parseado esquema XML de ACM CCS (10,569 líneas) produciendo datasets optimizados JSON.
  * Desarrollado `AcmCcsSelector.tsx` con soporte de búsqueda jerárquica veloz.
  * Integrado en `MemberForm.tsx` mediante modales de diálogo compactos, mostrando chips taxonómicos formateados.
  * Integrado renderizado de trails en `CvTabs.tsx` y ocultado el input visual de español para no recargar el editor.
  * Verificado que la compilación Next.js resuelve ancestors en menos de 2ms.

---

### Session 9 (2026-05-28)
* **Goal**: Anotar tarjeta de perfil izquierdo semánticamente, mostrar períodos de membresía activo/pasado e implementar selectores de fecha compatibles con Safari globally.
* **Accomplished**:
  * Agregada anotación semántica controlada "Researcher profile card" en JSX.
  * Modificado visualizador de fechas a "Member since [startDate]" o "Member from [startDate] to [endDate]".
  * Resuelto problema de ghost placeholder en inputs de fecha de Safari mediante switching dinámico de input type (`text`/`date`) en MemberForm, ProjectForm, ScholarshipForm y ThesisForm.

---

### Session 8 (2026-05-28)
* **Goal**: Resolver issue #23 de búsquedas por tokens múltiples insensibles a acentos.
* **Accomplished**:
  * Diseñada biblioteca `src/lib/search.ts` para limpieza de diacríticos y comparación lógica `AND`.
  * Aplicada en filtros de catálogo, búsqueda global y selectores de curación de entidades (`MemberSelector`, etc.).
  * Creados tests de regresión unitaria y Playwright E2E.

---

### Session 7 (2026-05-27)
* **Goal**: Implementar filtros de tags para bloques de Reportes, rol `POWER_EDITOR` y generación dinámica de bloques mediante OpenAI GPT-4o-mini.
* **Accomplished**:
  * Agregados filtros de tags a las consultas Prisma mediante scalar arrays `hasSome`.
  * Habilitado selector visual de tags en la UI del Report Builder.
  * Configurado rol de base de datos `POWER_EDITOR` y autorizaciones en Server Actions.
  * Diseñada compilación en doble fase (static -> GenAI) con visualización de loaders y detención manual asíncrona segura.
  * Controlado límite de tokens truncando contextos combinados a un máximo de 15,000 caracteres.

---

### Session 6 (2026-05-25)
* **Goal**: Ejecutar análisis y redactar especificaciones para los módulos G y H (Report Builder y Admin Option Editor).
* **Accomplished**:
  * Analizados Server Actions CRUD de reportes y propiedad de usuario creador.
  * Mapeada UI de edición A4, exportación markdown e impresión.
  * Analizados flujos de activación de usuarios, reasignación transaccional al borrar opciones y logs de auditoría.
  * Publicado el reporte en el Wiki (`Requirements-Specification-Memorias-Web.md`).

---

### Session 5 (2026-05-25)
* **Goal**: Analizar el Módulo C (Gestión de Proyectos y Financiamientos).
* **Accomplished**:
  * Analizados creadores de proyectos, control de duplicados y dependencias referenciales en borrado.
  * Especificados escenarios funcionales, reglas de negocio e integrados al Wiki.

---

### Session 4 (2026-05-25)
* **Goal**: Analizar el Módulo B (Perfiles de Miembros y CV).
* **Accomplished**:
  * Mapeado el catálogo de miembros con toggles para miembros pasados.
  * Analizados flujos de slugs autogenerados e integridad referencial contra eliminación.
  * Documentado en especificaciones del Wiki.

---

### Session 3 (2026-05-25)
* **Goal**: Analizar el Módulo A (Autenticación, Permisos y Preferencias).
* **Accomplished**:
  * Mapeada la lógica de OAuth multiorganización y puerta de desarrollo backend.
  * Definidos roles (ADMIN, EDITOR, USER) y flujos de aprobación.
  * Inicializado el documento general de especificaciones en el Wiki.

---

### Session 2 (2026-05-25)
* **Goal**: Extracción del Modelo de Dominio y Esquema de Base de Datos.
* **Accomplished**:
  * Analizadas entidades, enums, restricciones y cargada información base del Glosario.

---

### Session 1 (2026-05-25)
* **Goal**: Inicializar el entorno e instrucciones de Ingeniería Reversa de Memorias.
* **Accomplished**:
  * Creada estructura de carpetas de soporte `.ai/reverse-engineering`.
  * Enlazadas las reglas de espacio de trabajo (`AGENTS.md`) a las directivas de análisis del monorepo.

---

## Outstanding Questions & Blockers

1. **Question**: We observed `SystemOption` is Compounded Unique on `[listName, value]`. We should verify all distinct option lists in use during Module H.
