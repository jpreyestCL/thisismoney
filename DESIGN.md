---
name: This is Money
description: Interfaz de campo clara para una aventura voxel de supervivencia y economía.
colors:
  field-ink: "oklch(96% 0.012 110)"
  field-muted: "oklch(76% 0.018 220)"
  night-panel: "oklch(19% 0.025 235 / 0.94)"
  night-panel-soft: "oklch(25% 0.028 230 / 0.84)"
  action-lime: "oklch(78% 0.19 132)"
  action-ink: "oklch(20% 0.04 132)"
  warning-amber: "oklch(75% 0.17 72)"
  danger-red: "oklch(66% 0.2 28)"
  info-sky: "oklch(76% 0.12 224)"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(52px, 8vw, 94px)"
    fontWeight: 900
    lineHeight: 0.84
    letterSpacing: "-0.065em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.action-lime}"
    textColor: "{colors.action-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.night-panel-soft}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
    height: "48px"
  hud-panel:
    backgroundColor: "{colors.night-panel}"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.sm}"
    padding: "8px 10px"
---

# Design System: This is Money

## Overview

**Creative North Star: "El kit de campo voxel"**

La interfaz se comporta como un conjunto de instrumentos que acompaña la exploración. El mundo 3D ocupa el escenario y cada panel aparece para responder una pregunta concreta: qué tengo, qué hago ahora o qué puedo usar aquí. La expresión voxel vive en el ritmo cuadrado, los rótulos monoespaciados y la respuesta táctil de los botones, no en copiar la interfaz de otro juego.

La densidad aumenta con la experiencia. El inicio explica el ciclo en tres pasos, el HUD muestra la meta actual y la guía guarda la profundidad. Se rechazan el manual de teclas como bienvenida, el neón decorativo, los gradientes de texto y los paneles con el mismo peso.

**Key Characteristics:**

- Jerarquía clara y orientada a acciones.
- Paneles oscuros sólidos que conservan legibilidad sobre el mundo.
- Verde lima reservado para selección y acción principal.
- Etiquetas técnicas monoespaciadas combinadas con texto de sistema legible.
- Ayuda contextual antes que memorización.

## Colors

La paleta mezcla neutrales azul petróleo con un verde de herramienta, un ámbar de riesgo y un celeste informativo.

### Primary

- **Action Lime** (`oklch(78% 0.19 132)`): acciones principales, selección activa y progreso exitoso.

### Secondary

- **Warning Amber** (`oklch(75% 0.17 72)`): economía riesgosa, récords y alertas no críticas.
- **Info Sky** (`oklch(76% 0.12 224)`): foco visible, papá y ayuda informativa.

### Neutral

- **Field Ink** (`oklch(96% 0.012 110)`): texto principal, nunca blanco puro.
- **Field Muted** (`oklch(76% 0.018 220)`): texto secundario y metadatos.
- **Night Panel** (`oklch(19% 0.025 235 / 0.94)`): HUD y superficies de decisión.
- **Night Panel Soft** (`oklch(25% 0.028 230 / 0.84)`): opciones secundarias y contenido agrupado.

**The One Tool Rule.** El verde lima indica que algo puede elegirse o ejecutarse. No se usa como decoración.

## Typography

**Display Font:** Inter con respaldo de sistema
**Body Font:** Inter con respaldo de sistema
**Label/Mono Font:** SFMono Regular o Consolas

**Character:** Una sola familia mantiene la interfaz familiar y rápida. El monoespaciado se limita a teclas, valores y pequeños rótulos de instrumento.

### Hierarchy

- **Display** (900, 52 a 94 px, 0.84): título del juego exclusivamente.
- **Headline** (800, 24 px, 1.1): títulos de guía y pantallas.
- **Title** (750, 16 px, 1.25): secciones y acciones.
- **Body** (400, 16 px, 1.55): explicación con un máximo de 68 caracteres por línea.
- **Label** (800, 11 px, 0.1 em, mayúsculas): estado, tecla y categoría.

**The Read Once Rule.** Una frase de interfaz debe entenderse en una lectura; si necesita dos, se divide o se mueve a la guía.

## Elevation

El sistema usa capas tonales y bordes suaves. Las sombras profundas se reservan para la guía y pantallas que bloquean temporalmente el juego. El HUD permanece casi plano para no separarse visualmente del mundo.

### Shadow Vocabulary

- **Button press** (`0 5px 0 oklch(42% 0.11 132)`): volumen físico de la acción primaria.
- **Overlay depth** (`0 28px 90px oklch(5% 0.02 235 / 0.65)`): guía y diálogos de alto nivel.

**The Flat in Play Rule.** Durante la partida, la profundidad proviene de contraste y borde; las sombras grandes no compiten con la escena 3D.

## Components

### Buttons

- **Shape:** rectangular táctil con radio pequeño de 6 px.
- **Primary:** Action Lime, texto Action Ink, 12 por 24 px y altura mínima de 48 px.
- **Hover / Focus:** elevación vertical breve y foco celeste de 3 px.
- **Secondary:** Night Panel Soft con borde neutral y texto Field Ink.

### Cards / Containers

- **Corner Style:** 6 px en información de juego y 16 px solo en diálogos grandes.
- **Background:** Night Panel o Night Panel Soft.
- **Shadow Strategy:** plano durante la partida, elevado en overlays.
- **Border:** una línea neutral translúcida.
- **Internal Padding:** 8 a 14 px en HUD, 20 a 40 px en guía.

### Inputs / Fields

- **Style:** fondo azul petróleo, borde de una línea y radio de 6 px.
- **Focus:** contorno Info Sky de 3 px, sin depender solo del color del borde.
- **Error / Disabled:** texto explícito junto con rojo o menor opacidad.

### Navigation

La guía usa pestañas verticales en escritorio y una fila horizontal desplazable en móvil. La sección activa combina fondo tonal, texto lima y estado ARIA seleccionado.

### Context Prompt

Una tecla compacta precede una sola acción escrita en lenguaje directo. Solo aparece cuando existe una acción inmediata o cuando el modo construcción está activo.

## Do's and Don'ts

### Do:

- **Do** mostrar una sola meta principal en `#objective`.
- **Do** reservar Action Lime para acciones y selección.
- **Do** mantener objetivos táctiles de al menos 44 px y foco visible.
- **Do** enseñar controles cerca del objeto o momento en que se necesitan.
- **Do** respetar `prefers-reduced-motion`.

### Don't:

- **Don't** parecer un manual de teclas antes de parecer un juego.
- **Don't** mostrar todos los sistemas a la vez en el HUD.
- **Don't** imitar literalmente la interfaz de Minecraft.
- **Don't** usar neón decorativo, gradientes de texto, vidrio excesivo o paneles con idéntico peso visual.
- **Don't** depender solo del color o de recordar una tecla para una acción importante.
