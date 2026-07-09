# memorias-web Reverse Engineering Progress

Este documento de progreso registra el estado activo, hallazgos e hitos de entrega entre sesiones de IA para el proyecto **memorias-web**.

---

## Current Status
* **Active Phase**: DECOUPLING PRISMA — Decoupled Presentation and Administration Actions
* **Last Updated**: 2026-07-09
* **Overall Progress**: 85% completed (Decoupled main reads, admin config, lists, users, audit logs, reports statistics, and user preferences/credentials)


---

## Session Logs

### Session 23 (2026-07-09)
* **Goal**: Resolver el **Issue #50** (desacoplamiento de Prisma en Server Actions y páginas de administración/auditoría/usuarios/listas/configuración), el **Issue #52** (desacoplamiento de Prisma en reports/statistics) y el **Issue #53** (desacoplamiento de Prisma en preferencias y NextAuth).
* **Accomplished**:
  * **Issue #50 (Servicios y Vistas de Administración)**:
    * Creados 4 nuevos servicios en `src/lib/services/`: `auditService.ts`, `systemSettingsService.ts`, `systemOptionsService.ts` y `adminUserService.ts`.
    * Refactorizadas las vistas administrativas (`admin/audit/page.tsx`, `admin/config/page.tsx`, `admin/lists/page.tsx` y `admin/users/page.tsx`) para consumir exclusivamente dichos servicios.
    * Refactorizados los Server Actions correspondientes (`admin/config/actions.ts`, `admin/lists/actions.ts` y `admin/users/actions.ts`) removiendo todo acceso directo a `@/lib/prisma`.
    * Agregada cobertura de pruebas unitarias exhaustiva para los 4 nuevos servicios de administración en `src/lib/services/__tests__/`.
  * **Issue #52 (Servicio de Estadísticas)**:
    * Creado `src/lib/services/statisticsService.ts` trasladando allí la lógica de agregación de métricas y KPI de producción del laboratorio.
    * Refactorizado `reports/statistics/actions.ts` para delegar completamente en `statisticsService.getStatisticsData`.
    * Creada cobertura de pruebas unitarias para `statisticsService.test.ts`.
  * **Issue #53 (Servicio de Usuario y Preferencias)**:
    * Creado `src/lib/services/userService.ts` para centralizar consultas de mapeo de Member, actualización de preferencias, backdoor de Credentials, JWT cookie updates y el callback `createUser` de registro de NextAuth.
    * Refactorizadas la página de preferencias `preferences/page.tsx`, sus Server Actions `preferences/actions.ts` y la configuración de NextAuth `auth.ts` para usar el nuevo servicio.
    * Creada cobertura de pruebas unitarias para `userService.test.ts`.
  * **Validación**:
    * Confirmada ejecución exitosa de la suite completa de pruebas unitarias con 284/284 tests en verde.
    * Compilación correcta verificada mediante `tsc --noEmit`.
* **Blocked Items**: Ninguno.
* **Next Steps**:
  * Proceder con el **Issue #51** (aislar configuración y branding en Header, Logo, home, y signin).

### Session 20 (2026-07-08)
* **Goal**: Resolver los issues de cobertura y refactorización del análisis de deuda: **Issue #41** (cobertura), **Issue #43** (extraer servicios de lectura), **Issue #42** (dependencia circular de PublicationForm), **Issue #44** (descomponer useReportCompiler), **Issue #45** (descomponer TagsCurationClient), **Issue #46** (centralizar mappers FormData), **Issue #47** (ciclos de imports ReportBuilder) e **Issue #48** (Prisma directo en AutoTagger).
* **Accomplished**:
  * **Issue #41 (Pruebas unitarias de cobertura)**:
    * Creados tests unitarios para `useReportCompiler` (31 tests), `reports/actions` (25 tests), `search/page` (21 tests) y `TagsCurationClient` (14 tests).
    * Habilitada la exportación de helpers en `search/page.tsx` para pruebas independientes.
    * Solucionados problemas de mocks y de zona horaria en las aserciones de rango de fechas de reportes.
    * Commiteado y pusheado, cerrando el issue #41 con éxito.
  * **Issue #43 (Servicios de Lectura)**:
    * Creados 3 nuevos servicios de lectura y persistencia en `src/lib/services/`: `searchService.ts`, `tagService.ts` y `reportService.ts`.
    * Refactorizada la página de búsqueda `src/app/search/page.tsx` para delegar la query de PostgreSQL a `searchService.search`.
    * Refactorizada la página de tags `src/app/tags/[tag]/page.tsx` para delegar la carga a `tagService.getItemsByTag`.
    * Simplificados los server actions `src/app/reports/actions.ts` y `src/app/admin/tags/actions.ts` delegando en `reportService` y `tagService` respectivamente.
    * Redireccionado `src/lib/tags.ts` a `tagService` para lecturas unificadas.
    * Creado `src/lib/tags-sanitize.ts` sin dependencias para romper imports circulares transitivos en tests unitarios.
    * Creados tests unitarios para los 3 nuevos servicios: `searchService.test.ts`, `tagService.test.ts` y `reportService.test.ts`.
    * Validada la suite completa de Vitest con 205 tests unitarios aprobados en verde (100% éxito).
  * **Issue #42 (Dependencia circular en PublicationForm)**:
    * Creado `src/app/publications/publicationFields.ts` con la constante `BIBTEX_FIELDS_MAP`.
    * Importada dicha constante en `PublicationForm.tsx` y `usePublicationForm.ts`, resolviendo el ciclo local de imports detectado.
    * Confirmada ejecución exitosa de la suite completa de pruebas unitarias (205 tests aprobados).
  * **Issue #44 (Descomposición de useReportCompiler)**:
    * Creado `src/app/reports/builder/hooks/useReportBlocks.ts` para encapsular la mutación y administración del estado de los bloques de reporte.
    * Creado `src/app/reports/builder/hooks/useSavedReports.ts` para delegar la persistencia de reportes (CRUD y viewStates).
    * Reducido y refactorizado `src/app/reports/builder/useReportCompiler.ts` para actuar como el orquestador principal que une ambos subhooks y maneja la compilación y orquestación GenAI.
    * Creados tests unitarios para ambos subhooks en `hooks/__tests__/` alcanzando 216 tests unitarios aprobados en verde (100% éxito).
  * **Issue #45 (Descomposición de TagsCurationClient)**:
    * Creado el hook personalizado `src/app/admin/tags/useTagsCuration.ts` para encapsular los estados de modal y notificaciones, así como los handlers de renombrado, borrado, combinación y adición.
    * Creados subcomponentes independientes bajo `src/app/admin/tags/components/`: `TagsCurationHeader.tsx`, `TagsCurationStats.tsx`, `TagsCurationAutoTaggerPanel.tsx` y `TagsCurationTable.tsx`.
    * Reducido `TagsCurationClient.tsx` a un ensamblador puro que compone los subcomponentes y utiliza `useTagsCuration`.
    * Creados tests unitarios para el hook `useTagsCuration.test.ts` (4 tests) logrando 220 tests unitarios totales aprobados en verde (100% éxito).
  * **Issue #46 (Centralización de mappers FormData)**:
    * Creado `src/lib/mappers.ts` centralizando todos los conversores genéricos de `FormData` y mappers específicos de Member, Project, Thesis y Scholarship.
    * Refactorizados los Server Actions correspondientes para eliminar la extracción y normalización redundante, delegando el parseo directamente al mapper.
    * Creados tests unitarios dedicados para los mappers en `src/lib/__tests__/mappers.test.ts` (7 tests) logrando 227 tests unitarios totales aprobados en verde (100% éxito).
  * **Issue #47 (Resolución de ciclos de imports en Report Builder)**:
    * Creado `types.ts` centralizando `Block` y `InitData`. Eliminado el acoplamiento directo entre hooks y componentes.
  * **Issue #48 (Desacoplamiento de Prisma en AutoTagger de admin/tags)**:
    * Añadidos métodos `getAutoTaggerQueue` y `updateEntityTags` a `tagService.ts`.
    * Removido el acceso a Prisma directo en `admin/tags/actions.ts`.
    * Añadidos 3 tests unitarios nuevos en `tagService.test.ts` validando el comportamiento de AutoTagger (230 tests totales en verde).
* **Blocked Items**: Ninguno.
* **Next Steps**:
  * Proceder con el **Issue #49** (desacoplamiento de Prisma en páginas servidor de catálogo/detalle/formularios).

### Session 21 (2026-07-08)
* **Goal**: Revisar específicamente el estado de separación por capas respecto del acceso directo a Prisma/BD desde la capa de presentación de `memorias-web`.
* **Accomplished**:
  * Releídas las reglas globales, plan y progreso del proyecto.
  * Clasificados los imports/uso de Prisma por capa, excluyendo tests:
    * 8 servicios en `src/lib/services/` usan Prisma de forma esperada.
    * 3 módulos utilitarios en `src/lib/` usan Prisma (`audit.ts`, `config.ts`, `notifications.ts`).
    * 6 Server Actions aún usan Prisma directamente (`admin/config`, `admin/lists`, `admin/tags`, `admin/users`, `preferences`, `reports/statistics`).
    * 27 páginas `src/app/**/page.tsx` aún usan Prisma directamente, principalmente catálogos, detalle, edición y administración.
    * 2 componentes servidor (`Header.tsx`, `Logo.tsx`) aún usan Prisma para configuración/logo.
  * Confirmado que los refactors recientes sí mejoraron capas en rutas clave: `search/page.tsx`, `tags/[tag]/page.tsx` y `reports/actions.ts` delegan actualmente en `searchService`, `tagService` y `reportService`.
  * Creados issues adicionales para cubrir todos los grupos de separación por capas pendientes:
    * #50 administración/auditoría/usuarios/listas/configuración.
    * #51 configuración pública y branding (`Header`, `Logo`, home, signin).
    * #52 estadísticas de reportes.
    * #53 preferencias, usuario autenticado y activación.
  * Publicado comentario en el Issue #28 mencionando el mapa completo #48–#53 como seguimiento de separación por capas.
* **Blocked Items**: Ninguno.
* **Next Steps**:
  * Usar el mapa #48–#53 para resolver de forma incremental todos los accesos a Prisma fuera de servicios.
  * Tras resolverlos, repetir el barrido `rg` de imports a `@/lib/prisma` excluyendo tests para confirmar que sólo `src/lib/services`, utilidades explícitas y la infraestructura aceptada acceden a BD.

### Session 19 (2026-07-08)
* **Goal**: Analizar la deuda técnica actual de `/memorias-web` enfocada en mantenibilidad, legibilidad, bajo acoplamiento y alta cohesión.
* **Accomplished**:
  * Releídas las reglas globales, el plan y el progreso del proyecto de ingeniería inversa antes de analizar el código.
  * Inspeccionada la estructura actual de `memorias-web/src`, tamaños de módulos, imports a Prisma, cobertura de pruebas existente y ciclos de dependencias locales.
  * Confirmado que varios puntos históricos de deuda fueron mitigados: helpers de autorización/slugs, servicios de escritura para entidades principales, selectores reutilizables, componentes de búsqueda y descomposición parcial de Header/Report Builder/forms.
  * Identificada deuda remanente concreta: hook grande `useReportCompiler.ts`, componente `TagsCurationClient.tsx` todavía extenso, ciclo `PublicationForm.tsx` <-> `usePublicationForm.ts`, Server Actions con mapeo `FormData` duplicado, páginas servidor con Prisma directo y cobertura insuficiente para módulos complejos de reportes/tags/search.
  * Reabierto el Issue #28 en GitHub porque no se considera resuelto.
  * Creados issues de seguimiento #41–#46 para la deuda pendiente: cobertura de pruebas, ciclo de publicaciones, servicios de lectura, descomposición de `useReportCompiler`, descomposición de `TagsCurationClient` y mappers `FormData`.
  * Publicado comentario en el Issue #28 referenciando #41–#46 y firmado con `C`.
  * Revisada la respuesta posterior de AG en el Issue #28 y verificado el árbol actual: #41–#46 fueron implementados parcialmente/completamente y `npm run test` pasó con 227/227 tests.
  * Identificada deuda remanente nueva tras la implementación: ciclos de imports en Report Builder, Prisma directo en el flujo AutoTagger de `admin/tags/actions.ts` y Prisma directo remanente en páginas servidor de catálogo/detalle.
  * Creados issues #47, #48 y #49 con labels `technical debt` y `memorias-web`.
  * Respondido en el Issue #28 argumentando que se deja abierto hasta resolver o descartar #47–#49.
* **Blocked Items**:
  * No se pudo verificar el Wiki/Shared Domain Glossary porque `memorias-wiki` no está presente dentro del workspace sandbox actual.
* **Next Steps**:
  * Si se decide actuar sobre la deuda, priorizar pruebas para `useReportCompiler`, `TagsCurationClient`, `search/page.tsx` y `reports/actions.ts` antes de refactorizar, cumpliendo la regla de cobertura.
  * Extraer constantes/configuración pura de publicaciones para eliminar el ciclo de imports.
  * Separar queries/read services y componentes de vista en search/report/tag pages para mejorar localización de cambios.

### Session 18 (2026-07-08)
* **Goal**: Resolver el **Issue #40** — Desacoplar el acceso a la base de datos (Prisma) de los Server Actions mediante la creación de una capa de servicios.
* **Accomplished**:
  * Creados 5 servicios bajo `src/lib/services/`: `memberService.ts`, `projectService.ts`, `publicationService.ts`, `scholarshipService.ts`, `thesisService.ts`.
  * Cada servicio encapsula: validaciones de entrada (campos requeridos), control de duplicados de título con flag `ignoreDuplicateCheck`, verificación de slugs únicos, construcción de relaciones `connect`/`set` de Prisma, e integridad referencial antes de borrado (memberService, projectService).
  * Creadas suites de pruebas unitarias en `src/lib/services/__tests__/` para los 5 servicios, con mocks de Prisma vía Vitest.
  * Refactorizados los 5 Server Actions (`members/actions.ts`, `projects/actions.ts`, `publications/actions.ts`, `scholarships/actions.ts`, `theses/actions.ts`) para delegar la persistencia a los servicios, manteniendo responsabilidades propias del Server Action: extracción de `FormData`, autorización (`ensureEditorOrAdmin`), logging de auditoría (`logAction`) y revalidación de caché Next.js (`revalidatePath`).
  * Verificado build exitoso (`npm run build`) y 91 pruebas unitarias aprobadas (`npm run test`).
  * Commit `13ce485` publicado en `main`, Issue #40 comentado y cerrado formalmente.
* **Blocked Items**: Ninguno.
* **Next Steps**: Todos los issues de deuda técnica se encuentran cerrados. El módulo `memorias-web` está libre de deuda técnica pendiente en las categorías identificadas.

---

### Session 17 (2026-07-08)
* **Goal**: Analizar la deuda técnica de `/memorias-web` (Issue #28), consolidar los cambios locales, crear nuevos issues para puntos remanentes y resolverlos todos: modularizar `TagsCurationClient.tsx` (Issue #37), descomponer `HeaderClient.tsx` (Issue #36), modularizar `MemberForm.tsx` / `PublicationForm.tsx` (Issue #38) y modularizar `ThesisForm.tsx` / `ScholarshipForm.tsx` / `ProjectForm.tsx` (Issue #39).
* **Accomplished**:
  * Elaborado y guardado el reporte `technical_debt_analysis.md` cubriendo las observaciones de calidad.
  * Publicado el reporte en el Issue #28 y cerrado el issue formalmente en GitHub.
  * Realizado commit (`81e9405`) y push de los refactorings anteriores (descomposición de `ReportBuilderClient` y selectores genéricos con tipado estático seguro).
  * Creados los nuevos issues de deuda técnica: #36 (HeaderClient), #37 (TagsCurationClient), #38 (FormsPrincipales), #39 (FormsRestantes) y #40 (ServerActions).
  * Resuelto el **Issue #37** (Modularización de `TagsCurationClient.tsx`):
    * Creado el hook personalizado `useAutoTagger.ts` para aislar los estados, progreso y lógica de batch AI del Auto-Tagger.
    * Creado el componente `TagActionDialogs.tsx` para agrupar todos los modales e interfaces de diálogos CRUD de taxonomías.
    * Reescrita la estructura de maquetación en `TagsCurationClient.tsx`, delegando toda la lógica de diálogos y AI, reduciendo su extensión y acoplamiento.
  * Resuelto el **Issue #36** (Descomposición de `HeaderClient.tsx`):
    * Creado el componente `HeaderSearchInput.tsx` para unificar el buscador del header tanto en pantallas desktop como en pantallas mobile.
    * Creados los componentes dropdown de barra de navegación `ReportsDropdown`, `AdminDropdown` y `UserDropdown` en `HeaderDropdownMenu.tsx`.
    * Creado el componente lateral móvil `MobileNavigationDrawer.tsx` conteniendo la navegación y Drawer de visualización mobile.
    * Refactorizado `HeaderClient.tsx` para servir exclusivamente como plantilla contenedora de layout delegando el comportamiento a los nuevos subcomponentes.
  * Resuelto el **Issue #38** (Modularización de `MemberForm.tsx` y `PublicationForm.tsx` con test coverage):
    * **MemberForm:** Extraído el hook `useMemberForm.ts` para encapsular estados, generación automática de slugs y persistencia, y creado `AcmCcsSection.tsx` para aislar las clasificaciones taxonómicas de ACM.
    * **PublicationForm:** Extraído el hook `usePublicationForm.ts` para agrupar la lógica de importación CrossRef/BibTeX y persistencia, y creado `PublicationWizard.tsx` para los flujos de configuración previos a la edición.
    * Removido código muerto de filtros que ya es manejado internamente por los selectores reutilizables unificados.
    * Creadas las suites de pruebas unitarias unitarias `MemberForm.test.tsx` y `PublicationForm.test.tsx`.
  * Resuelto el **Issue #39** (Modularización de los formularios restantes con test coverage):
    * **ThesisForm:** Extraído el hook `useThesisForm.ts` para aislar lógica del formulario y persistencia, y creada la suite de pruebas unitarias `ThesisForm.test.tsx`.
    * **ScholarshipForm:** Extraído el hook `useScholarshipForm.ts` para aislar la lógica del formulario, y creada la suite de pruebas unitarias `ScholarshipForm.test.tsx`.
    * **ProjectForm:** Extraído el hook `useProjectForm.ts` para aislar la lógica de estado y guardado, y creada la suite de pruebas unitarias `ProjectForm.test.tsx`.
    * Removido código muerto e inputs de búsqueda duplicados de los tres formularios.
  * Agregada la directiva de seguridad de ejecución y escape de comandos, y la regla de requerimiento de cobertura de pruebas unitarias al archivo global `AGENTS.md` (commit `b4906d1`).
  * Verificada la correcta compilación y el paso de las 77 pruebas unitarias de Vitest con 100% de éxito.
  * Realizado commit (`2d4b18b`) y push de los formularios restantes modularizados y sus suites de pruebas, comentando y cerrando formalmente el **Issue #39** en GitHub.
* **Blocked Items**:
  * Ninguno.
* **Next Steps**:
  * Proceder con el **Issue #40** para desacoplar el acceso a la base de datos (Prisma) de los Server Actions del frontend.

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
