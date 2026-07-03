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
assets/             Modelos y texturas (~2.9 MB en total, comprimidos)
  edificio.glb      (~1.06 MB)
  tienda.glb        (~0.95 MB)
  papa_anim.glb     (~0.48 MB, papá animado)
  img_58.png        (~0.47 MB, fondo del título)
.gitignore          Ignora assets/* salvo los 4 archivos de arriba (whitelist)
```

- **Three.js** se carga por CDN vía `<script type="importmap">` desde
  `unpkg.com/three@0.160.0` (ver `index.html:188-197`). Se usa un `GLTFLoader` **compartido**
  (`const gltfLoader`) con `MeshoptDecoder` para los `.glb` comprimidos.
- **Assets comprimidos** (ver más abajo): los `.glb` usan texturas **WebP 1024²** (nativo en
  GLTFLoader) + geometría **meshopt** (`EXT_meshopt_compression`, por eso el `MeshoptDecoder`).
  Pasaron de ~32 MB a ~2.9 MB (~91% menos). Reencodeados con `@gltf-transform/cli`.
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

## Features nuevas (auto, catálogo, pintura, ventanas)

Agregadas sobre la rama de móvil. Todo sigue en `index.html`.

1. **Auto** (`let car`): se compra al vendedor escribiendo "auto" ($2000). `spawnCar()` arma un
   grupo con cuerpo rectangular, 4 ruedas redondas (cilindros con `geometry.rotateZ`), manubrio
   (torus), faros y asiento. Tiene vida (100). Subes/bajas con **E** (`toggleCar()`); conduces con
   **W/S** (avanzar/retroceder) y **A/D** (girar) — `updateDriving()` reemplaza el caminar cuando
   `state.driving`. `updateCar()` (en el loop) le baja vida si hay monstruos cerca y lo destruye a 0.
   Barra de vida flotante (`car.bar`, billboard). Se limpia con `removeCar()` en los reinicios.
2. **Catálogo del vendedor ampliado** (feature "todos los objetos"): `SHOP = STORE_A + STORE_B +
   DECOR_ITEMS + PAINTS`. Se compra escribiéndole al vendedor (tecla **Y** → `processShopBuy` busca
   por nombre). Precios de referencia: auto 2000, cuadro 300, ventana 50, pintura 400.
3. **Muebles/decoración** (`DECOR_ITEMS`, colocables): cuadro, mesa, silla, cama, sofá, tele, planta,
   ventana. Se añaden a `BUILD_KEYS` (hotbar ahora tiene 16 slots colocables + herramienta; `#buildbar`
   usa `flex-wrap`). Geometría/altura/material por clave en `objGeometry/objY/objMaterial`; detalles
   (patas, respaldo, pantalla…) en `placeObject`.
4. **Ventanas transparentes**: clave `window`, material `MeshStandardMaterial` transparente
   (`opacity 0.28`) con marco y cruz. No bloquea (decorativa).
5. **Pintura** (`PAINTS`, un color por tarro, $400): comprar "pintura roja/azul/…" llama a
   `paintHouse(color)` que recolorea todas las piezas de la casa (paredes/techo/puerta) a < 20 de
   `HOUSE`. Si no hay casa, no cobra.

`freshInv()` construye el inventario inicial desde `BUILD_KEYS` (usado en el `state` y los reinicios).
Verificado con Playwright: comprar auto (vida 100, 4 ruedas), conducir (avanza con W), colocar ventana
transparente, pintar la pared de café→rojo, y **cero errores**.

## Guardado, audio, minimapa, auto y Marte (mejoras)

- **Guardado (localStorage, clave `tim_save`)**: `saveGame()` serializa stats + inventario + casa
  (`placed`) + auto + planeta; `loadGame()` reconstruye todo con `spawnPlaced()`/`spawnCar(opts)`.
  Autosave al superar la noche, al ocultar/cerrar la pestaña y cada 15 s. Botón **CONTINUAR** en el
  inicio si hay partida (`hasSave()`); **JUGAR DE NUEVO** borra el save (`clearSave()`).
- **Audio**: `tone()`/`beep()` (SFX), `ensureEngine()` (motor del auto, oscilador continuo),
  `startMusic()` (música ambiental día/noche vía `setInterval`). Botón **🔊/🔇** (`toggleSound`,
  se guarda en `tim_sound`). Todo pasa por `ensureAudio()` (resume en gesto).
- **Minimapa** (`drawMinimap`): iconos 🏠 casa · 🛒 súper · 🔫 armería · 🚗 auto · 👴 papá ·
  🚔 policía (con aro rojo, solo cuando estás buscado) · 🏟️ estadios; enemigos como puntos rojos.
- **Auto** (`updateDriving`): atropella monstruos (`hitEnemy` 40), choca con `obstacles` (no atraviesa),
  sonido de motor. `spawnCar(opts)` acepta pos/heading/hp para cargar.
- **Marte**: en `state.planet==='marte'` salen `alien`/`alienBig` (`makeAlienBig`, 140 vida/24 daño) y
  las recompensas de la noche se multiplican ×1.5. Etapas altas (≥10) pagan mucho más.
- **Indicadores**: overlay `#poisonfx` (tinte verde pulsante al estar envenenado).
- Enemigos legado reintroducidos en la rotación: `ghost` (12+), `ogre` (16+), `dragon` (18+).

## Sistema de enemigos por etapa (acumulativo)

Los monstruos dependen de `state.stage` (sube cada 1000 ganados) y **se acumulan**: los de etapas
anteriores siguen apareciendo. Definiciones en `ENEMY_DEFS` (modelo, `hp`, `spd(s)`, `dmg`, flags).
`unlockedTypes()` arma el pool de la etapa; `pickEnemyType()` elige ponderado (`ENEMY_WEIGHT`).

- **1** zombie (10 vida, 10 daño) · **2** zombieArmored (30) · **3** smart (10, abre puertas) ·
  **4** smartArmored (30, abre puertas) · **5** toro (`makeKnight`, 50 vida, embestidas de 17 daño) ·
  **6-9** toroArmored (80) · **10** mole (topo, 20 vida/20 daño, ahora también de noche) ·
  **11** moleBoss (`makeMoleBoss`, 160 vida, invoca topitos vía `updateMoles`) ·
  **15** ant (hormiga, 30 vida/17 daño, **envenena** 2/seg por 10s → `applyPoison`/`updatePoison`,
  `state.poison`/`dadPoison`) · **20** flyer (60 vida/20 daño, vuela y rompe techos, flag `breaksAir`).
- Flags de comportamiento en `userData`: `opensDoors`, `commander` (manda embestidas con `launchBull`,
  el daño de la embestida = `dmg` del comandante), `mole` (lo maneja `updateMoles`), `boss`, `poison`,
  `fly`, `breaksAir`. El bucle de combate está en `updateNight`.
- Tipos legado (`ogre`, `ghost`, `dragon`) siguen en `ENEMY_DEFS` pero no salen en la rotación normal;
  `alien` sale solo en Marte.

## Arreglos tras code review (buscado/policía, ciudad en Marte, auto robado)

Bugs detectados en un code review de la fusión (calles/tráfico + estrellas + robar auto) y corregidos:

1. **`addObstacle` ahora retorna el obstáculo** (antes no retornaba nada). Así `car.userData.obstacle`
   de los autos estacionados queda seteado y `stealCar` sí puede quitar la caja de colisión al robarlos
   (antes dejaba un muro invisible permanente en cada plaza de estacionamiento).
2. **Buscado/policía se limpia en todas las transiciones**: `state.wanted`/`state.wantedLevel = 0` +
   `clearPolice()` ahora también en `goToPlanet()` (Marte), `goToJail()` (muerte) y `faintFromHunger()`
   — antes solo `policeCatch`/`startGame`/`loadGame` lo hacían, así que reaparecías BUSCADO.
3. **Marte sin ciudad terrestre**: helper `setCityVisible(v)` oculta/muestra `roadMeshes` (nuevo array
   poblado en `makeRoad`) + `traffic` + `parkedCars` + `trafficLights`. Se llama `false` en `goToPlanet`
   y `true` en `startGame`/`loadGame` (según `state.planet`). `nearestStreetCar` retorna `null` en Marte
   (no se puede robar un auto invisible).
4. **Atropellar peatón cuenta una vez por atropello** (flag `n.userData.hitByCar`) en vez de llamar
   `becomeWanted(15,2)` cada frame mientras lo arrastras (antes inflaba a 5 estrellas y reiniciaba el timer).
5. **La policía baja de número al bajarte del auto** (`updatePolice` ahora hace `while (police.length >
   desired) pop()`), no deja el cop extra del modo conducción.
6. **Enter con filtro vacío cierra la tienda** en PC (`processShopBuy` restauró `closeShopInput()`).
7. **Spawns del jugador/papá fuera de la avenida central**: jugador `(10, ,16)`, papá `(12,0,13)`
   (antes `(0, ,14)`/`(2,0,11)`, sobre la avenida vertical x∈[-4.5,4.5]).

Verificado con Playwright (Chromium, viewport táctil 851×393): cargar + iniciar + conducir + abrir/cerrar
tienda con Enter vacío → **cero errores** de consola y render correcto de la ciudad.

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

### Peso de assets — REDUCIDO (~32 MB → ~2.9 MB)
Los `.glb` se comprimieron con `@gltf-transform/cli`: `resize` a 1024² + `webp` (q85) + `meshopt`.
`img_58.png` se reencodeó (PNG paletizado, sharp). El `GLTFLoader` compartido lleva
`setMeshoptDecoder(MeshoptDecoder)` (import de `three/addons/libs/meshopt_decoder.module.js`).
WebP no requiere decoder extra (nativo en GLTFLoader r160). Verificado con Playwright: los 3
modelos cargan, el papá conserva su animación (`dadMixer`) y **cero errores**.

Para recomprimir en el futuro (ejemplo por modelo):
```
gltf-transform resize  in.glb a.glb --width 1024 --height 1024 --filter lanczos3
gltf-transform webp    a.glb  b.glb --quality 85
gltf-transform meshopt b.glb  out.glb
```

### Pendiente / mejoras posibles
- Ajuste fino de sensibilidad de mirar / tamaño de botones según feedback en dispositivos reales.
- Pantalla completa automática (`requestFullscreen`) al empezar — no implementado (puede ser intrusivo).
- Texturas normales a 1024²/WebP q85: si se ven artefactos, subir calidad o resolución de ese slot.

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
