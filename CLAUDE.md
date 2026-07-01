# CLAUDE.md — This is Money

Contexto para futuras sesiones de Claude Code en este repositorio.

## Qué es el proyecto

**This is Money** es un juego 3D que corre en el navegador, hecho con **Three.js**.
Es un prototipo de "sobrevivir y ganar plata": de día trabajas/compras/construyes y de
noche defiendes tu casa de enemigos. Incluye papá que obedece, mamá, ayudantes (hijos),
súper con productos, ciudad, estadios, robar/policía/cárcel, huerto, meteorito y cohete
para escapar a otro planeta.

Todo el juego vive en **un solo archivo**: `index.html` (~2170 líneas). No hay build,
ni framework, ni backend. Se abre el HTML y listo.

## Estructura del repo

```
index.html          Todo el juego (HTML + CSS + JS module en un archivo)
assets/             Modelos y texturas (~32 MB en total)
  edificio.glb      (~11.5 MB)
  tienda.glb        (~10.5 MB)
  papa_anim.glb     (~8 MB, papá animado)
  img_58.png        (~2 MB)
.gitignore          Ignora assets/* salvo los 4 archivos de arriba (whitelist)
```

- **Three.js** se carga por CDN vía `<script type="importmap">` desde
  `unpkg.com/three@0.160.0` (ver `index.html:188-197`). Se usa `GLTFLoader` para los `.glb`.
- Renderer: `WebGLRenderer` con `setPixelRatio(Math.min(devicePixelRatio, 2))` (`index.html:204-208`).
- No hay dependencias npm, ni `package.json`, ni tests. Para probar basta con abrir
  `index.html` en un navegador (por ejemplo `python3 -m http.server` y visitar la página,
  porque los `.glb` necesitan servirse por HTTP, no `file://`).

## Cómo se juega hoy (solo PC: teclado + mouse)

Entrada en `index.html:1353-1490`. Estado global del juego en `const state` (`index.html:1314`).

- **Moverse:** `WASD` / flechas — `index.html:1983`
- **Correr:** `Shift` (gasta hambre) — `index.html:1995`
- **Mirar cámara:** mover el mouse (sin clic) — `index.html:1427`
- **Pegar:** clic izquierdo — de noche golpea monstruos, de día golpea gente (te vuelve
  "buscado") — `index.html:1432`
- **Atajos de teclado** (`index.html:1358-1384`):
  - `Y` abrir vendedor (comprar escribiendo el nombre del producto)
  - `N` empezar la noche
  - `B` modo construir on/off · `1-9` elegir slot (hotbar tipo Minecraft) · `F` colocar · `X` borrar · `P`/`L` rotar
  - `E` interactuar (cobrar oro / robar / vender casa) · `J` cobrar oro
  - `Q` comer · `K` plantar semilla · `T` cavar (pala) · `R` lanzar cohete · `M` probar meteorito
  - `C`/`V`/`O` modos del papá (seguir/quedarse/limpiar) · `G` armar al papá · `H` invocar ayudante
  - `I` menú de ayuda

## Convenciones del código

- Idioma: **español** en comentarios, textos de UI y nombres de funciones/variables de dominio
  (`comer`, `plantSeed`, `tryRob`, `keepers`, `aldeanos`...). Mantener ese estilo.
- Todo en un archivo, secciones separadas por banners `// ====...`. Los headers de sección
  están en las líneas: 199, 265, 377, 515, 636, 869, 1000, 1201, 1227, 1254, 1306, 1353,
  1492, 1530, 1556, 1593, 1606, 1727, 1891 (buscar con `grep -n "======" index.html`).
- Bucle principal: `loop()` con `requestAnimationFrame` (`index.html:1899-1937`).
- El resize está en `index.html:2164` (`camera.aspect` + `renderer.setSize`).
- Funciones de acción reutilizables (útiles para enganchar cualquier control nuevo):
  `attack()`, `attackNPC()`, `openShopInput()`, `tryStartNight()`, `placeObject()`,
  `deleteObject()`, `eatFood()`, `plantSeed()`, `digHole()`, `tryLaunchRocket()`,
  `tryCollectGolden()`, `tryRob()`, `sellHouse()`, `selectSlot(n)`, `setDadMode(mode)`.

## Jugabilidad en celular — IMPLEMENTADO (rama `claude/money-mobile-gameplay-n1ho6s`)

El juego ya es **jugable de forma completa en celular**, sin romper el modo teclado/mouse de PC.
Se detecta pantalla táctil con `matchMedia('(pointer: coarse)')` / `ontouchstart` /
`navigator.maxTouchPoints` y se añade la clase `body.touch`, que muestra los controles táctiles.

Todo el código táctil vive en `index.html`, sección **"CONTROLES TÁCTILES"** (buscar ese
comentario). Estado en el objeto `const touch = { moveX, moveY, run, crouch, jump }` (junto a `keys`).

Qué se implementó:
1. **Joystick virtual** (`#joystick` + `#joyKnob`, abajo-izq.): setea `touch.moveX/moveY` analógico.
   Se integra en `updateMovement()` como ejes `ax/az` combinados con `WASD` (con normalización
   en diagonal). También alimenta `updateViewmodel()` (`moving`).
2. **Capa de mirar** (`#lookLayer`, pantalla completa detrás de los botones): arrastrar ajusta
   `yaw`/`pitch` (como `mousemove`). Un **toque rápido de noche** = golpear (`attack()`); un toque
   con el vendedor abierto lo cierra.
3. **Botones táctiles** (`#touchBtns` abajo-der. + panel `#moreBtns` con "⋯ más"; `#moveBtns`
   sobre el joystick para correr/saltar/agachar). Cada botón (`.tbtn[data-act]`) llama a las
   funciones existentes vía `press(act)` en un handler `pointerdown` delegado. `run`/`crouch` son
   toggles (clase `.on`); `jump` es de un toque (se consume en `updateMovement`).
4. **Slots del hotbar** (`#buildbar .slot[data-slot]`) tocables → `selectSlot(n)` (sirve en PC también).
5. **Recuadro del vendedor**: botones **Comprar** (`#shopBuyBtn`) y **Cerrar** (`#shopCloseBtn`),
   necesarios en móvil (no hay tecla Esc).
6. **Aviso de rotación** (`#rotateHint`): en orientación vertical pide girar el teléfono.

Verificado con Playwright (Chromium) sirviendo `three` desde npm (el CDN unpkg está bloqueado
por el egress del sandbox): `body.touch`, joystick visible, HUD, botones (ayuda/más/correr),
**desplazamiento real del jugador** al empujar el joystick, layout sin botones fuera de pantalla
y **cero errores** de consola.

### Pendiente / mejoras posibles
- **Reducir peso de assets** (~32 MB de `.glb`): comprimir con Draco/meshopt para carga rápida con datos móviles.
- Ajuste fino de sensibilidad de mirar / tamaño de botones según feedback en dispositivos reales.
- Pantalla completa automática (`requestFullscreen`) al empezar — no implementado (puede ser intrusivo).

### Cómo probar en local (el juego necesita HTTP + el CDN de three)
El CDN `unpkg.com` está fuera del allowlist de egress del sandbox, así que para probar con
Playwright hay que instalar `three@0.160.0` desde npm e interceptar las peticiones a
`**/unpkg.com/three@0.160.0/**` sirviendo los archivos locales de `node_modules/three/`
(mismo path relativo). Emular un dispositivo táctil en **horizontal** (p.ej. viewport
851×393, `hasTouch:true`) para no toparse con el aviso de rotación.

## Git / flujo de trabajo

- Rama de desarrollo: **`claude/money-mobile-gameplay-n1ho6s`** (no pushear a otra rama sin permiso).
- `git push -u origin claude/money-mobile-gameplay-n1ho6s` y abrir PR en **draft** si no existe uno abierto.
- Repo con scope de GitHub: `jpreyestcl/thisismoney`.
