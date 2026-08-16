# This is Money

A single-file 3D survival-and-money game that runs in any modern browser. No build step, no framework, no backend: open `index.html` and play.

> **Note / Nota:** the game itself (menus, dialogue, shop, help screen) is entirely **in Spanish**. This README is bilingual — English first, Spanish below. · **El juego está en español**; este README está en inglés y español.

**Play / Jugar:** https://tim.strivexlatam.com · **License / Licencia:** [MIT](LICENSE)

---

## English

### What it is

By day you work, buy, farm and build. By night monsters come and you defend your house and your dad. Earn enough money and you can escape in a rocket to a whole other planet, where the world, the shop and the enemies are different.

It started as a small prototype and grew into a fairly large sandbox: a city with traffic and police, two supermarkets, stadiums, a bank with interest and loans, a jail, an orchard, voxel mines you dig yourself, beaches you can swim (and drown) in, vehicles including a helicopter, alien planets with contracts, boss titans, an arena, floating islands, and a story with an ending.

It is also, quietly, an educational game: there is a built-in math challenge mode (`U`) aimed at roughly 10–11 year olds (Chilean 5th–6th grade), which pays in-game money for correct answers.

### Tech

- **Three.js 0.160.0**, loaded from a CDN through an `<script type="importmap">`.
- Everything lives in **one file**: [`index.html`](index.html) (~6.3k lines of HTML + CSS + a single ES module).
- 3D models are `.glb` compressed with WebP 1024² textures + [meshopt](https://github.com/zeux/meshoptimizer) geometry, decoded by a shared `GLTFLoader` with `MeshoptDecoder`. Assets went from ~32 MB to ~2.9 MB.
- **PWA**: [`manifest.webmanifest`](manifest.webmanifest) + [`sw.js`](sw.js). Installable, and playable offline after the first visit (network-first for `index.html`, cache-first for assets and the Three.js CDN).
- **No dependencies, no `package.json`, no tests, no build.**

### Run it locally

The `.glb` files must be served over HTTP (`file://` will not work), and the page needs internet access the first time to fetch Three.js from the CDN.

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

### Project structure

```
index.html            The whole game (HTML + CSS + one ES module)
icon.svg              PWA icon
manifest.webmanifest  PWA manifest
sw.js                 Service worker (offline support)
assets/
  edificio.glb        City building      (~1.06 MB)
  tienda.glb          Shop building      (~0.95 MB)
  papa_anim.glb       Animated dad       (~0.48 MB)
  img_58.png          Title background   (~0.47 MB)
.github/workflows/    Deploy to VPS on push to main
CLAUDE.md             Detailed developer notes (in Spanish)
```

`.gitignore` uses a whitelist for `assets/`: only those four files are tracked.

### Controls

**Desktop (keyboard + mouse)**

| Key | Action |
|---|---|
| `WASD` / arrows | Move |
| Mouse | Look (click the canvas for pointer lock, `Esc` releases) |
| `Shift` · `Space` · `Ctrl` | Run · Jump · Crouch |
| Left click | Attack (monsters at night, people by day — that makes you *wanted*) |
| `E` | Interact: mount, enter/exit vehicle, shelter, ruins, castle, coliseum, rocket, bank, collect gold, rob, sell house |
| `Y` | Open the shopkeeper (buy by typing the item name) |
| `U` | Math challenge (earn $100–$400, 5 per day) |
| `Q` · `K` · `T` | Eat · Plant a seed · Dig (shovel; on Platus `F` makes a campfire) |
| `B` · `1`–`9` · mouse wheel · `F` · `X` · `P`/`L` | Build mode · pick slot · scroll all slots · place · delete · rotate |
| `N` | Start the night early |
| `C` / `V` / `O` · `G` · `Z` | Dad: follow / stay / clean · arm him · make him rest |
| `H` | Summon a helper (after meeting mom) |
| `R` | Launch the rocket |
| `I` · `Esc` | Help menu · Pause menu |

**Mobile / tablet (touch)**

Touch devices are detected automatically (`pointer: coarse`) and get: a virtual joystick (left), drag-to-look anywhere on screen, and action buttons on the right — 👊 hit, 🤝 interact, 🛒 shop, 🍖 eat, 🌙 night, 🔨 build, ✋ place, 🪏 dig, 🔥 campfire, 🌱 plant, and a ⋯ panel with the rest (rotate, delete, dad modes, math, helper, rocket, help). A hint asks you to rotate the phone to landscape. Touch controls can also be forced on from the help menu.

### Saves and settings

Everything is stored in `localStorage` — there is no server and no account:

- `tim_save_<name>` — one save per named profile (money, stats, inventory, house, vehicles, plants, helpers, dad, campfires, mines, planet, bank…)
- `tim_profiles`, `tim_profile` — the profile list and the last one used
- `tim_best`, `tim_daily` — personal record and daily streak
- `tim_sound`, `tim_perf`, `tim_sens`, `tim_btnsize` — sound, performance mode, look sensitivity, button size

There is also a **game code**: the save can be copied/pasted as base64 from the pause menu to move a game between devices.

### Deployment

Every push to `main` triggers [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which runs on a self-hosted runner and `rsync`s the static files into the nginx webroot of https://tim.strivexlatam.com, then verifies the site returns HTTP 200.

### Contributing

The whole game is one file, split into sections by `// =====` banners (`grep -n "======" index.html`). Conventions:

- Comments, UI strings and domain function/variable names are **in Spanish** (`comer`, `plantSeed`, `tryRob`, `keepers`…). Please keep that style.
- Reuse the action functions (`attack()`, `placeObject()`, `eatFood()`, `selectSlot(n)`, …) when wiring a new control, so keyboard and touch stay in sync.
- Test by serving over HTTP and checking the browser console is clean, on both desktop and an emulated touch device in landscape.

[`CLAUDE.md`](CLAUDE.md) holds much more detailed developer notes (in Spanish) about every system: enemies per stage, the economy, planets, the dopamine/retention systems, past bug fixes and how the assets were compressed.

### Credits and license

- Built with [Three.js](https://threejs.org) (MIT).
- The code is released under the **MIT License** — see [`LICENSE`](LICENSE).
- The 3D models and images in `assets/` are bundled with the project. Check their provenance before reusing them on their own; the MIT grant is meant for the game code.

---

## Español

### Qué es

**This is Money** es un juego 3D que corre en el navegador, hecho con **Three.js**. De día trabajas, compras, siembras y construyes; de noche llegan los monstruos y defiendes tu casa y a tu papá. Si juntas suficiente plata puedes escapar en un cohete a otro planeta, donde el mundo, la tienda y los enemigos son distintos.

Empezó como un prototipo chico y creció harto: ciudad con tráfico y policía, dos supermercados, estadios, banco con intereses y préstamos, cárcel, huerto, minas voxel que cavas tú mismo, playas donde puedes nadar (y ahogarte), vehículos incluido un helicóptero, planetas alien con contratos, jefes titanes, un coliseo, islas flotantes y una historia con final.

También es un juego **educativo**: incluye desafíos de matemáticas (tecla `U`) pensados para 10-11 años (5°-6° básico), que pagan plata dentro del juego por cada respuesta correcta.

**El juego está completamente en español** (menús, diálogos, tienda, ayuda).

### Tecnología

- **Three.js 0.160.0** desde CDN mediante `<script type="importmap">`.
- Todo vive en **un solo archivo**: [`index.html`](index.html) (~6.3k líneas de HTML + CSS + un módulo ES).
- Los modelos `.glb` están comprimidos con texturas WebP 1024² + geometría [meshopt](https://github.com/zeux/meshoptimizer), decodificados por un `GLTFLoader` compartido con `MeshoptDecoder`. Los assets pasaron de ~32 MB a ~2.9 MB.
- **PWA**: [`manifest.webmanifest`](manifest.webmanifest) + [`sw.js`](sw.js). Instalable y jugable offline después de la primera visita (red primero para `index.html`, caché primero para assets y el CDN de Three.js).
- **Sin dependencias, sin `package.json`, sin tests, sin build.**

### Cómo correrlo local

Los `.glb` necesitan servirse por HTTP (con `file://` no funciona) y la primera vez hace falta internet para bajar Three.js del CDN.

```bash
python3 -m http.server 8000
```

Después abre `http://localhost:8000`.

### Estructura del repo

```
index.html            Todo el juego (HTML + CSS + un módulo ES)
icon.svg              Ícono de la PWA
manifest.webmanifest  Manifiesto de la PWA
sw.js                 Service worker (offline)
assets/
  edificio.glb        Edificio de ciudad   (~1,06 MB)
  tienda.glb          Tienda               (~0,95 MB)
  papa_anim.glb       Papá animado         (~0,48 MB)
  img_58.png          Fondo del título     (~0,47 MB)
.github/workflows/    Deploy al VPS en cada push a main
CLAUDE.md             Notas de desarrollo detalladas
```

El `.gitignore` usa lista blanca para `assets/`: solo esos cuatro archivos están versionados.

### Controles

**PC (teclado + mouse)**

| Tecla | Acción |
|---|---|
| `WASD` / flechas | Caminar |
| Mouse | Mirar (clic en el canvas activa el pointer lock, `Esc` lo suelta) |
| `Shift` · `Espacio` · `Ctrl` | Correr · Saltar · Agacharse |
| Clic izquierdo | Pegar (de noche a los monstruos, de día a la gente — te vuelve *buscado*) |
| `E` | Interactuar: montura, subir/bajar del vehículo, refugio, ruinas, castillo, coliseo, cohete, banco, cobrar oro, robar, vender la casa |
| `Y` | Abrir el vendedor (compras escribiendo el nombre) |
| `U` | Desafío de mates ($100-$400, 5 al día) |
| `Q` · `K` · `T` | Comer · Plantar semilla · Cavar (pala; en Platus `F` hace fogata) |
| `B` · `1`-`9` · rueda del mouse · `F` · `X` · `P`/`L` | Modo construir · elegir slot · recorrer todos los slots · colocar · borrar · girar |
| `N` | Empezar la noche antes |
| `C` / `V` / `O` · `G` · `Z` | Papá: seguir / quedarse / limpiar · armarlo · mandarlo a descansar |
| `H` | Invocar un ayudante (después de conocer a la mamá) |
| `R` | Lanzar el cohete |
| `I` · `Esc` | Menú de ayuda · Menú de pausa |

**Celular / tablet (táctil)**

Se detecta pantalla táctil automáticamente (`pointer: coarse`): joystick virtual (izquierda), arrastrar la pantalla para mirar y botones de acción a la derecha — 👊 pegar, 🤝 usar, 🛒 tienda, 🍖 comer, 🌙 noche, 🔨 construir, ✋ poner, 🪏 cavar, 🔥 fogata, 🌱 plantar, y un panel ⋯ con el resto (girar, borrar, modos del papá, mates, hijo, cohete, ayuda). Un aviso pide girar el teléfono a horizontal. Los controles táctiles también se pueden forzar desde el menú de ayuda.

### Guardado y ajustes

Todo se guarda en `localStorage`; no hay servidor ni cuentas:

- `tim_save_<nombre>` — una partida por perfil (plata, stats, inventario, casa, vehículos, plantas, ayudantes, papá, fogatas, minas, planeta, banco…)
- `tim_profiles`, `tim_profile` — lista de perfiles y el último usado
- `tim_best`, `tim_daily` — récord personal y racha diaria
- `tim_sound`, `tim_perf`, `tim_sens`, `tim_btnsize` — sonido, modo rendimiento, sensibilidad de la mirada, tamaño de botones

También existe el **código de partida**: desde el menú de pausa puedes copiar/pegar el save en base64 para llevarlo a otro dispositivo.

### Despliegue

Cada push a `main` dispara [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que corre en un runner self-hosted, hace `rsync` de los archivos estáticos al webroot de nginx de https://tim.strivexlatam.com y verifica que el sitio responda HTTP 200.

### Cómo contribuir

Todo el juego es un archivo, dividido en secciones con banners `// =====` (`grep -n "======" index.html`). Convenciones:

- Comentarios, textos de UI y nombres de funciones/variables de dominio **en español** (`comer`, `plantSeed`, `tryRob`, `keepers`…). Mantén ese estilo.
- Reutiliza las funciones de acción (`attack()`, `placeObject()`, `eatFood()`, `selectSlot(n)`, …) al enganchar un control nuevo, así teclado y táctil quedan iguales.
- Prueba sirviendo por HTTP y revisando que la consola quede sin errores, en PC y en un dispositivo táctil emulado en horizontal.

En [`CLAUDE.md`](CLAUDE.md) hay notas de desarrollo mucho más detalladas de cada sistema: enemigos por etapa, economía, planetas, sistemas de retención, arreglos previos y cómo se comprimieron los assets.

### Créditos y licencia

- Hecho con [Three.js](https://threejs.org) (MIT).
- El código se publica bajo la **licencia MIT** — ver [`LICENSE`](LICENSE).
- Los modelos 3D e imágenes de `assets/` vienen con el proyecto. Revisa su procedencia antes de reutilizarlos por separado; la licencia MIT está pensada para el código del juego.
