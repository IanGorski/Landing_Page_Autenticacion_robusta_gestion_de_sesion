# Guía de Contribución

Este documento define el flujo recomendado para colaborar de forma consistente y mantenible.

## Tabla de Contenido
1. Filosofía
2. Flujo de trabajo (Git / ramas)
3. Commits y mensajes
4. Estilo de código (TS/React/CSS)
5. Formato automático (Prettier)
6. Linting y Type Checking
7. Pruebas (Tests)
8. Accesibilidad (A11y)
9. Performance / Micro‑benchmarks
10. Pull Requests
11. Checklist rápida

---
## 1. Filosofía
- Código simple antes que “clever”.
- Tipos explícitos donde agreguen claridad.
- Componentes pequeños y fáciles de testear.
- Pureza/aislamiento en utilidades para pruebas deterministas.
- Accesibilidad y UX no son “extras” (attributes ARIA, focus management, color contrast razonable).

## 2. Flujo de trabajo (Git / ramas)
- `main` (o `master`): rama estable protegida.
- Crea rama feature: `feat/nombre-corto` o fix: `fix/bug-descriptivo`.
- Rebase interactivo antes de abrir PR para limpiar commits si es necesario.
- Evitar pushes directos a `main`.

## 3. Commits y mensajes
Formato sugerido (inspirado en Conventional Commits):
```
<tipo>(scope?): mensaje en presente

Descripción opcional
```
Tipos comunes: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`, `style`.
Ejemplos:
- `feat(auth): agregar extensión de sesión manual`
- `refactor(auth-form): extraer subcomponente PasswordStrengthMeter`

## 4. Estilo de código (TS/React/CSS)
- Hooks al inicio del componente, no dentro de condicionales.
- Evitar prop drilling excesivo: considerar extraer contexto si crece.
- Prefiere funciones puras (sin efectos secundarios) para lógica.
- Nombres de variables y funciones descriptivos en inglés (excepto textos UI).
- Comentarios: sólo cuando la intención no sea obvia.
- CSS: usar clases semánticas; agrupar variantes con atributos `data-*` si aplica.

## 5. Formato automático (Prettier)
Se integrará Prettier para asegurar consistencia (ancho 100 o 120, comillas simples). Ejecutar:
```
npm run format
```
(Una vez que se agregue el script; ver sección 8 si todavía no existe.)

## 6. Linting y Type Checking
- Lint: `npm run lint` (corre reglas ESLint + TypeScript).
- Fix: `npm run lint:fix`.
- Tipos: `npm run typecheck`.
Commits deberían pasar estas comprobaciones antes del PR.

## 7. Pruebas (Tests)
- Unit + integración: `npm test`.
- Coverage: `npm run test:coverage`.
- Watch: `npm run test:watch`.
Lineamientos:
- Cada bug nuevo → agregar test que lo reproduce antes de arreglarlo.
- Utilidades puras: tests directos sin DOM.
- Componentes: usar Testing Library (no testear implementaciones internas de React).

## 8. Accesibilidad (A11y)
- Verifica roles (`role="alert"`, `aria-live`, labels asociados a inputs).
- Evitar texto sólo por color para significar estado.
- Considerar `prefers-reduced-motion` para animaciones intensas.

## 9. Performance / Micro‑benchmarks
- Sólo medir cuando hay sospecha de hot path.
- Si agregas un micro benchmark usa Vitest y ejecuta varias iteraciones (>=100) para estabilizar mediciones.

## 10. Pull Requests
Checklist sugerida en la descripción:
- [ ] Motivo / problema solucionado
- [ ] Cambios principales
- [ ] Screenshots (si UI)
- [ ] Riesgos / regresiones posibles
- [ ] Tests agregados / actualizados
- [ ] Docs/README actualizados (si aplica)

## 11. Checklist Rápida Antes de PR
- `npm run typecheck` sin errores
- `npm run lint` sin errores críticos
- `npm test` todo en verde
- README u otra documentación al día
- No hay `console.log` sobrantes ni código muerto

---
