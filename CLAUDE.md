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

## Guardado, audio, minimapa, auto y Platus (mejoras)

- **Guardado (localStorage, clave `tim_save`)**: `saveGame()` serializa stats + inventario + casa
  (`placed`) + auto + planeta + **huerto (`plants`: x/z/grow/apples) + ayudantes (`helpers`: x/z) +
  papá (modo, armado, posición, `dadArmor`)**; `loadGame()` reconstruye todo con `spawnPlaced()`/`spawnCar(opts)`/
  `spawnPlant(x,z,grow,apples)`/`makeHelperAt(x,z)`/`applyDadArmed(v)`. Autosave al superar la noche,
  al ocultar/cerrar la pestaña y cada 15 s. Botón **CONTINUAR** en el inicio si hay partida
  (`hasSave()`); **JUGAR DE NUEVO** borra el save (`clearSave()`).
  - Helpers reutilizables para evitar duplicar geometría/estado: `spawnPlant` (usado por `plantSeed` y
    `loadGame`), `makeHelperAt`/`clearHelpers` (usado por `spawnHelper` y `loadGame`),
    `ensureDadWeapon`/`applyDadArmed` (usado por `toggleDadArm` y `loadGame`). `startGame` y
    `goToPlanet` limpian `plants`+`helpers` (empezar de cero / viajar a Platus).
  - **Armadura del papá** (ítem de tienda `dadarmor`, $800): pone `state.dadArmor = 0.5` (recibe la
    mitad de daño). Todo el daño al papá pasa por `damageDad(amount)` (= `amount * state.dadArmor`),
    espejo de `damagePlayer`. Placa visible en el pecho vía `ensureDadArmorPlate`/`applyDadArmor`.
    Indicador 🛡️ en `#dadhud` (PC) y en `gearhud` (móvil). Se guarda y se resetea igual que el arma.
- **Audio**: `tone()`/`beep()` (SFX), `ensureEngine()` (motor del auto, oscilador continuo),
  `startMusic()` (música ambiental día/noche vía `setInterval`). Botón **🔊/🔇** (`toggleSound`,
  se guarda en `tim_sound`). Todo pasa por `ensureAudio()` (resume en gesto).
- **Minimapa** (`drawMinimap`): iconos 🏠 casa · 🛒 súper · 🔫 armería · 🚗 auto · 👴 papá ·
  🚔 policía (con aro rojo, solo cuando estás buscado) · 🏟️ estadios; enemigos como puntos rojos.
- **Auto** (`updateDriving`): atropella monstruos (`hitEnemy` 40), choca con `obstacles` (no atraviesa),
  sonido de motor. `spawnCar(opts)` acepta pos/heading/hp para cargar.
- **Platus** (planeta inventado de otra galaxia, `state.planet==='platus'`; antes se llamaba "Marte").
  Salen `alien`/`alienBig` (`makeAlienBig`, 140 vida/24 daño) y las recompensas de la noche se
  multiplican ×1.5. Etapas altas (≥10) pagan mucho más. `loadGame` mapea saves viejos `'marte'`→`'platus'`.
  - **Mundo propio (rediseño)**: en Platus NO existe NADA de la Tierra. `setEarthWorld(v)` oculta
    súper/armería/ciudad/barrios/GLBs/estadios/cárcel/gente/calles/tráfico **con sus colisiones**
    (`earthMeshes`/`earthObstacles`, snapshot por diff de `scene.children` entre dos marcadores;
    los GLB async se auto-registran en `loadBuilding`). Gates por planeta: `openShopInput`,
    `updateBuying`, `tryRob`, `tryCollectGolden`, `sellHouse`, minimapa.
  - **Contenido de Platus** (`buildPlatus`/`setPlatusVisible`): 60 árboles MUERTOS + 26 rocas de
    CARBÓN (`coalRocks`). Picar: golpear (👊/clic) cerca de una roca = +1 `state.inv.carbon`
    (`tryMineCoal`, engancha en `attackNPC` de día y `attack` de noche).
  - **Frío nocturno** (`updateCold` en el loop): de noche, a >7 de una fogata pierdes 2 hp/s
    (papá 1.2/s), overlay `#coldfx` azul + aviso 🥶 (1 vez/noche, `state.coldWarned`).
    **Fogata**: tecla `T` en Platus (= botón cavar móvil) gasta 3 carbón → `spawnCampfire(x,z)`
    (troncos + fuego emisivo + PointLight). `campfires` se guardan en el save.
  - **Trajes espaciales**: ítem `traje` ($2000, súper). Requisito para lanzar el cohete
    (`state.hasSuits`). Visual: casco+mochila del papá (`applySpaceSuit`), badge 🧑‍🚀 en gearhud.
  - **Cohete reutilizable**: tras el primer viaje (`state.usedRocket`), volver a lanzarlo cuesta
    **10 de carbón** (combustible). El cohete queda estacionado en (10,10) en ambos planetas
    (`spawnRocketMesh`/`removeRocket`). Desde Platus → `returnToEarth()` (mundo restaurado).
    El meteorito siguiente llega al PRÓXIMO millón (`state.meteorAt = totalEarned + 1M`, usado
    por `checkProgress`, que además solo dispara meteorito en la Tierra).
  - **Cinemática**: al despegar, la cámara baja (pitch→-1.05) y **CUALQUIER** planeta del que escapas
    se parte en 3 pedazos (con su color, `cine.col`/`cine.label`; split en t>2.6, se aleja despacio).
    El HUD se oculta con `body.cine` (clase agregada en `startEscapeCinematic`, quitada al terminar y
    en `saveAndExit`/`startGame`) para ver el planeta partirse; queda solo el toast.
  - Al llegar a un planeta: raciones del cohete (5 comida + 2 semillas), $200, trajes puestos.
  - **Solo hacia adelante** (`PLANETS` array, nombre+color por `state.trips`): el cohete nunca vuelve
    a la Tierra; cada viaje va a un planeta NUEVO (PLATUS→ZORVAX→KRYON→…). `updateCinematic` llama
    `goToPlanet()` siempre (se eliminó `returnToEarth`). Verdania (final) → SEGUIR JUGANDO = otro planeta.
  - **Cajones del cohete** (`state.cargo`, panel `#rocketbox`): interactuar cerca del cohete (E / botón
    🤝 en móvil) abre los cajones — mochila↔cohete (`moveCargo`, Guardar/Sacar todo) + botón DESPEGAR.
    La carga SOBREVIVE al viaje (`goToPlanet` no la borra), así compras en la Tierra y sobrevives más
    en el planeta nuevo. El cohete tiene puerta+ventanilla (`spawnRocketMesh`). El botón DESPEGAR
    resuelve además el "no encuentro cómo lanzar el cohete en el celular".
- **Indicadores**: overlay `#poisonfx` (tinte verde pulsante al estar envenenado).
- **Mundo agrandado**: límites jugables ±230 (antes ±110), suelo 520², avenidas centrales de 460
  (llegan al borde), +70 árboles en las afueras y un 2º desierto en (-165,140).
- **Papá descansa** (tecla `Z` en PC / botón 😴 en el panel ⋯ móvil): `toggleDadRest()` lo sienta en
  el sofá o lo acuesta en la cama más cercana; `dad.userData.resting` lo excluye de `pickTarget`,
  proyectiles y embestidas (los monstruos NO lo ven). Se cura 2/s descansando y 0.5/s normal
  (regeneración pasiva en `updateDad`). Se guarda (`dadResting`) y se levanta con Z o C/V/O.
- **Modo creativo** (botón 🎨 en el inicio, `state.creative`): plata infinita ($∞, se re-fija en
  `renderHUD`), sin candados de desbloqueo, badge 🎨 CREATIVO, no actualiza el récord (`updateBest`
  retorna). Se guarda con la partida.
- Enemigos legado reintroducidos en la rotación: `ghost` (12+), `ogre` (16+), `dragon` (18+).

## Historia, funcionalidad, UX y calidad (lote de 5 commits)

1. **Historia**: intro en 4 tarjetas (`INTRO_CARDS`/`showIntro`, al empezar partida); diálogos con
   `say(quien, texto)` — el papá comenta por contexto cada ~1-2 min (`updateDialogues`, `DAD_LINES`),
   el vendedor saluda (`VENDOR_LINES`), la mamá regala desayuno cada amanecer; **FINAL**: cohete desde
   Platus con `verdaniaReady()` ($10M total o 4+ viajes) → pantalla `#win` VERDANIA con estadísticas
   (`showVictory`) + SEGUIR JUGANDO o NUEVA PARTIDA+ ($10.000, `state.ngplus`).
2. **Banco** (edificio en `BANK_POS` (58,-24), E para entrar, panel `#bankbox`): ahorros `state.bank`
   ganan **5% de interés** por noche; préstamo $2000 con deuda `state.debt` +10%/noche. Persisten.
3. **Vender**: botón 🔁 en la tienda (`shopSellMode` en `renderShopList`) — el vendedor compra tus
   objetos colocables del inventario al 50%.
4. **Clima** (`updateWeather`, `state.weather`): lluvia en la Tierra (Points + cielo gris + huerto ×2)
   y tormenta de polvo en Platus de día (cielo naranjo + daño lejos de fogata).
5. **Mates progresivas**: etapa 8+ desbloquea problemas de dos operaciones (tier 4, $700) y todos
   los premios escalan +5% por etapa.
6. **Foto**: botón 📷 (`takePhoto`, `renderer.render` + `toDataURL` + descarga PNG).
7. **UX desktop**: pointer lock al hacer clic en el canvas (Esc suelta); **menú de PAUSA** (Esc,
   `togglePause`, `state.paused` congela el loop) con sliders de sensibilidad (`lookMult`,
   `tim_sens`) y tamaño de botones (`--btnscale`, `tim_btnsize`), sonido, **modo rendimiento**
   (`applyPerfMode`: sin sombras + pixelRatio 1, `tim_perf`), foto, ayuda, código y salir;
   **cola de toasts** (`#toastStack`, el aviso anterior sube a una pila de 2).
8. **UX móvil**: **PWA** (`manifest.webmanifest` + `sw.js`: index red-primero, assets/CDN
   caché-primero → instalable y offline); vibración háptica (`vibr()` en daño/dorado/misión/cofre);
   hotbar con pestañas 🏠/🛡️/🪑 en celular (`BUILD_CATS`/`buildCat`).
9. **Perfiles con nombre**: JUGAR/CREATIVO piden username (`#namebox`); CONTINUAR lista perfiles
   (`#profilebox`, con 🗑️ borrar); saves en `tim_save_<nombre>` + registro `tim_profiles` +
   último `tim_profile`; migración automática del `tim_save` viejo a "Jugador". **Código de
   partida**: copiar/pegar el save en base64 entre dispositivos (menú pausa).
10. **Calidad**: música por contexto con melodía+bajo (día/noche/Platus en `MUSIC`); árboles de la
    Tierra y árboles muertos de Platus como `InstancedMesh` (2 draw calls c/u).

## Arreglos tras code review (lote historia/UX) + creativo invulnerable

1. **Botones de pausa muertos**: `querySelectorAll('.bankBtn')` reasignaba el `onclick` de los 6 botones
   de pausa (comparten la clase de estilo). Ahora se enlaza por `[data-bank]` (solo los del banco).
2. **Teclado en pausa**: `if (state.paused) return;` en el keydown (solo Esc reanuda); antes N/R/Y/F/B
   seguían ejecutándose con el juego pausado.
3. **Pointer lock atrapaba el mouse en los menús** (PC): helper `releaseLock()` (`exitPointerLock`) al
   abrir tienda/banco/mates y en `togglePause(true)`.
4. **CONTINUAR oculto tras actualizar**: `hasSave()` corría antes del IIFE `migrateOldSave`; se
   re-evalúa el botón al final de la migración.
5. **Clima no se reseteaba al cargar**: helper `resetWeather()` (limpia `weather`/`weatherLeft`/
   `weatherT`/`rainObj`/`#coldfx`) usado en `startGame`/`resetAll`/`goToPlanet`/`returnToEarth`/`loadGame`.
6. **PWA íconos falsos**: nuevo `icon.svg` cuadrado (raíz, no ignorado) + manifest honesto
   (img_58 declarado 848×1264). `sw.js` VERSION→`tim-v2` y cachea `icon.svg`.
7. **Slots 10-19 inaccesibles en PC** (teclas solo 1-9): **rueda del mouse** recorre los 19 slots
   (`canvas 'wheel'` → `selectSlot`, con wrap). También funciona el clic al slot cuando no hay lock.
8. **Modo creativo invulnerable**: en el loop, antes del chequeo de muerte, `if (state.creative) {
   state.hp = 100; state.dadHp = 100; hunger≥20 }` y `damagePlayer`/`damageDad` retornan en creativo;
   los chequeos `hp<=0 → goToJail` / `dadHp<=0 → gameOver` se saltan en creativo.

## Sistema de dopamina / retención (7 paquetes)

Implementados para mantener al jugador enganchado. Todo persiste en el save donde corresponde.

1. **Juice**: `floatText(pos,txt,color)` (textos que flotan, proyección 3D→pantalla), `coinBurst(pos,n)`
   (monedas 3D que saltan), combo de kills <2 s (`addCombo`, cartel `#combo` + tono ascendente),
   contador de dinero que "rueda" (`shownMoney` en `renderHUD`). Daño flotante en `hitEnemy`.
2. **Recompensa variable**: `killLoot(e)` — el kill paga `10+5*etapa` (+hasta 50% por combo), 10% de
   kill **DORADO** (×5), piñata (`makePinata`, 1 monstruo dorado/noche, +300+60*etapa), **cofres**
   nocturnos (`spawnChest`/`updateChest`, 2/noche vía `state.chestAt`, 30 s, plata/comida/semillas).
3. **Tensión**: `state.bossNight` (noche % 5 == 0) → `spawnBossEnemy()` (el más fuerte, ×1.6 tamaño,
   ×4 vida, kill +$500) y pago nocturno ×3; **HORDA FINAL** último minuto (`state.hordeOn`, +50% tope,
   spawn ×2); **madrugar** (`tryStartNight` con >2 min de día → +$100).
4. **Rachas**: noche sin daño a la casa (`state.nightDamage`) → `state.streak++` y el pago se
   multiplica ×(1+0.1*racha, tope ×2); racha **diaria** real (`checkDailyStreak`, localStorage
   `tim_daily`, bono 100*días tope 500, 1 vez/día).
5. **Misiones diarias**: 3 al amanecer (`newMissions`/`missionProgress(type,n)`/`renderMissions`,
   panel `#missions`). Tipos: kills/harvest/dig/plant/rob/runover/math. Premio 150+50*etapa.
   - **Desafíos de mates** (educativo, 10-11 años / 5°-6° básico): tecla `U` en PC o botón 🧮 en el
     panel ⋯ móvil. Panel `#mathbox` con 4 alternativas tocables (`genMathProblem`: sumas/restas de
     3 cifras, mult/división, fracciones, porcentajes y problemas con plata del juego). Paga
     $100/$200/$400 por dificultad, racha `state.mathStreak` (+25% c/u, tope +100%), **5 al día**
     (`state.mathLeft`, se renuevan en `surviveNight`). Respuesta mala muestra la correcta y corta
     la racha. Persiste en el save. Esc/Cerrar/tap fuera lo cierran (`closeMathBox`).
6. **Colección/récords**: bestiario (`state.bestiary`, `recordKill`; 1ª vez de cada tipo +$100; se ve
   en el menú de ayuda vía `renderBestiary`, `ENEMY_NAMES`); récord personal (localStorage `tim_best`,
   `updateBest` en `checkProgress`, celebración 🏆 una vez por partida, línea `#bestline` en el título).
7. **Desbloqueos del medio juego** (`UNLOCK_ITEMS`, anunciados en `checkProgress`, candado 🔒 en la
   tienda hasta `unlockAt` de `totalEarned`): $50k perro guardián (`pet`, pelea de noche, 30 dmg),
   $100k torreta láser (clave `laser` en `updateDefenses`, dispara rápido), $150k segundo piso
   (`buildFloor2`, +$300/noche), $200k moto (`spawnCar({moto:true})`, ×1.45 velocidad), $250k heladera
   (colocable; el hambre baja a la mitad en `updateHunger`).
   - **Segundo piso**: `buildFloor2` lo arma sobre el footprint REAL de tu casa (centroide + bounding
     box de las `placed` wallWood/wallRock/door cerca de `HOUSE`, no el marcador fijo) e incluye
     **escaleras** (8 escalones + baranda por el lado +x), loza y techo. Se recomputa al cargar.
   - **Policía desde la cárcel**: `spawnPolice` los coloca en la puerta de `JAIL_POS` (55,-8), no
     en un ángulo aleatorio alrededor del jugador.

## Armas de fuego (mercado negro)

Sección **"ARMAS DE FUEGO"** de `index.html`. Las armas del callejón dejaron de ser "espadas
con nombre de pistola" y ahora son armas de verdad.

- `GUN_SPECS` (daño, alcance, cadencia, multiplicador de cabeza y si trae `scope`).
  `GUN_CLIP = 20`, `GUN_RELOAD = 5`. Cada arma tiene su personalidad:

  | Arma | Daño | Cabeza | Alcance | Cadencia | Precio |
  |---|---|---|---|---|---|
  | 🔫 Pistola del callejón | 9 | x2,2 → 20 | 60 m | 0,09 s (~11/s) | $1.800 |
  | 🔭 Pistola con mira | 14 | x3,2 → 45 | 95 m | 0,15 s | $3.200 |
  | 💥 Escopeta recortada | 26 | x1,8 → 47 | 30 m | 0,32 s | $2.600 |
  | 🎯 Rifle viejo | 22 | x3,0 → 66 | 130 m | 0,22 s | $4.500 |

  La lista del mercado negro muestra esos números en cada arma.
- Estado: `state.guns` (las que compraste), `state.gun` (la que llevas), `state.clip` (cargador),
  `state.ammo` (reserva), `state.reloadT`, `state.gadgetCharges`, `state.handGadget`. Todo se guarda.
- `makeHandGun(kind,color,scale,scope)` dibuja corredera, cachas, guardamonte, alza/punto de mira y
  la mira telescópica; se arma apuntando a +X y se gira para que el cañón mire al frente.
- Las balas también le pegan a las EMBESTIDAS de los toros (`type: 'bull'`), que antes las ignoraban.
- `fireGun()` gasta una bala, saca fogonazo (`muzzleFlash`), trazadora visible (`spawnTracer`),
  retroceso y hace `gunRaycastEnemy` (cilindro por bicho; el tercio de arriba = CABEZA → daño ×`head`).
- Recarga: al vaciar el cargador (o tras 3,5 s sin disparar) arranca `startReload`: 5 s, caen 6
  casquillos al suelo (`spawnShell`) y el arma se pone de lado (pose en `updateViewmodel`).
- `1` ahora **recorre todas tus armas** (`handItems()` / `equipHandItem()`): puños o espada →
  pistolas → láser → arco → bombas de mano. Las bombas (humo/confeti) se guardan como cargas y se
  usan con el clic (`throwHandGadget`).
- Mercado negro: pistola $1800 (60 m), escopeta $2600 (30 m), pistola con mira $3200 (95 m),
  rifle $4500 (130 m) y la caja de 50 balas $600.
- **Al callejón se vuelve cuantas veces quieras**: el botón del panel de misiones dice "Volver al
  callejón" aunque la misión esté hecha, y `enterAlleyMission` abre la puerta directo (sin repetir
  el paseo detrás de Tito) cuando `questDone('alley')`.
- **Apuntar con la mira**: tecla **E** (o el botón 🤝 en celular) = `toggleAim()` → `updateAim()`
  baja el FOV (30 con mira, 48 sin ella), muestra el **punto rojo** `#aimDot` y, en las armas con
  mira, el visor `#scopeMask`. El **CLIC solo dispara** (`tryGunShot`, un tiro por clic).
  `ctxWantsE` (lo calcula `updateContextPrompt`) hace que la E siga sirviendo para comprar, hablar
  o abrir cuando hay algo del mundo cerca; la mira solo se activa si no hay nada que usar.
- **También le pegas a la gente**: `gunRaycastPerson()` (aldeanos y víctimas) → empujón, sangre y
  BUSCADO (2 estrellas si es en la cabeza).
- **El balero**: vendedor de munición al fondo del mercado negro (`alley.ammoMan`); E le compra la
  caja de 50 balas ($600).
- **Bomba de humo**: se LANZA lejos (`throwSmokeBomb` → `updateThrownBombs`, ~65 de alcance en
  terreno abierto); al caer `spawnSmokeCloud()` crea una nube de 22 esferas que crece y se disipa en
  14 s. `playerInSmoke()` entra en `isPlayerHidden()`: DENTRO del humo los monstruos no te ven, y
  `updatePolice` tampoco: los pacos se quedan dando vueltas en `lostAt` (donde te vieron por última
  vez) y la marca de BUSCADO baja 2,5 veces más rápido.

## La ciudad estilo GTA (`src/city-map.js`)

El trazado de la Tierra dejó de estar repartido en coordenadas sueltas por `index.html`: ahora vive
en **`src/city-map.js`**, que es la única fuente de la verdad y que el navegador y los tests importan
igual. Convención: **+x este, −x oeste, +z norte, −z sur**.

- **Cuadrícula**: avenidas en los ejes `[-150, -110, -55, 0, 55, 110, 150]`, verticales y
  horizontales (`AVENIDAS`). Las de ±150 son la **autopista del anillo** (flag `anillo`), y de ahí
  salen **ramales** cortos a cada lugar de las afueras (aeropuerto, acuático, diversiones, playa,
  desiertos). Calzada de 9 con vereda de 2,6 a cada lado (`CALLE` / `MEDIA_CALLE`).
- **Distritos** (`DISTRITOS`): 16 manzanas de 40×40 en el centro (tu casa, Plaza Central, centro
  comercial, rascacielos, los tres estadios, cárcel, arcade, armería, oficinas y cuatro barrios),
  4 manzanas de 25×25 en las esquinas del anillo, y 6 zonas de afueras (aeropuerto 150×110, parque
  acuático, parque de diversiones, playa y dos desiertos). `manzanasLibres()` devuelve las manzanas
  de la cuadrícula que no le tocaron a nadie: el juego les planta una arboleda para que no queden
  potreros pelados entre avenidas.
- **Lugares** (`LUGARES`): el punto exacto de cada cosa (súper, banco, armería, gasolinera, cárcel,
  arcade, estadios, parques, playa, aeropuerto, cohete, spawns…), siempre dentro de su distrito.
  `index.html` ya no tiene coordenadas a mano: todo sale de aquí.
- **Cerros** (`CERROS`): la montaña de nieve y los demás cerros quedan SIEMPRE fuera del anillo.
- `validarMapa()` comprueba que ningún distrito se cruce con otro, que ninguna calle pase por encima
  de una manzana, que los cerros no tapen nada, que cada lugar caiga dentro de su distrito y fuera
  del asfalto, y que a cada distrito llegue alguna calle. Lo corre `tests/city-map.test.mjs`.

**Cómo se dibuja**: `callesDelMapa()` alimenta `makeRoad` (asfalto + veredas + línea central
discontinua; las horizontales y las verticales van a alturas apenas distintas para que los cruces no
peleen por z-fighting) y los **cruces peatonales** van en un solo `InstancedMesh` en los nueve
semáforos (`SEMAFOROS`). `onRoadAt` delega en `enCalle`, así el pasto 3D y los árboles nunca brotan
sobre la calzada ni sobre la vereda.

**Tráfico**: `spawnCars` reparte 3 autos andando por avenida (4 en la autopista, 1-2 en celular) más
2 estacionados por calle — en la autopista no se estaciona nadie. `stoppedByLight` frena en
CUALQUIERA de los nueve cruces con semáforo y `tryTurn` hace que en cada esquina el auto decida si
sigue derecho o dobla (30% de probabilidad), como el tráfico de verdad. Los peatones caminan por las
veredas de los cruces.

**Rascacielos** (`buildSkyline`): torres de 17 a 42 de alto en las manzanas `centro` y `oficinas`,
con textura de ventanas generada por canvas (`makeWindowTexture`, unas encendidas y otras apagadas),
remate, antena con baliza roja sobre los 26 de alto, colisión y azotea donde se puede aterrizar. Los
huecos del patrón son plazoletas y ahí van los `.glb` (`edificio.glb` / `tienda.glb`).

**Barrios** (`poblarBarrio`): cada manzana de casas se llena con dos hileras que MIRAN a la calle
(`makeCityHouse` recibe la rotación) y el patio común en el medio, más sus vecinos con rutina.
El reparto lo hace `repartirManzana(r, fondoFila)`: NINGUNA casa es igual a la de al lado y
NINGUNA se atraviesa con su vecina (ver "Casas distintas" más abajo).

**Auditores en vivo** (con `?debug=1`):
- `__tim.auditCity()` → `{sobreCalle, fuera, encimados}`. Revisa el rectángulo COMPLETO de cada
  obstáculo grande: que no pise asfalto ni vereda, que esté dentro de alguna manzana y que no se
  meta dentro de otro edificio. Las piezas de una misma construcción (alas y fuselaje del mismo
  avión, torres del mismo castillo) se marcan con el parámetro `grupo` de `addObstacle` y no cuentan.
- `__tim.auditTraffic(segundos)` → cuántos autos se movieron, cuántos doblaron y cuáles se salieron
  del asfalto.
- `__tim.auditSkiRoad()` → el camino al cerro nevado sale de la autopista del anillo en (150,130) y
  no puede pisar ninguna manzana ni ninguna otra calle de la ciudad.
- `__tim.perfInfo()` → objetos de la escena, llamadas de dibujo, triángulos y geometrías.

## Gráficos

**Árboles**: `buildTrees` usa 4 InstancedMesh (tronco cónico con corteza + copa de 3 pisos) con
altura, giro y verde distintos por árbol (`setColorAt`, `worldTreeSizes`).

**Armas**: `makeVoxelSword` (hoja que se afina, canal brillante, punta en cono, cruz con quillones,
empuñadura de cuero enrollado y pomo redondo) y `makeVoxelShovel` (palo torneado con anillos, mango
en D, cuello metálico y cuchara curva con filo) usan materiales metálicos de verdad.

**Supermercado** (`makeStore`): rótulo con marco, toldo a rayas con pilares, vitrinas y puertas de
vidrio con tiradores, felpudo, carritos, piso de cerámica con juntas, lámparas colgantes (2 luces
reales por tienda, solo fuera de modo rendimiento), mostrador con caja registradora y góndolas con
tapa, repisa y cintillo de precios.

**Puerta que se abre**: la hoja cuelga de un grupo-bisagra (`obj.hinge`) con paneles, manilla de
latón, cerradura y bisagras; el marco es dintel + dos jambas (sin barra abajo: el vano queda limpio)
y la caja de guía se esconde con `material.visible = false` (NO con `mesh.visible`, que se llevaría
también el marco y la hoja). Tiene caja de choque (`obj.aabb`) mientras está CERRADA. `tryDoor()`
(enganchada en `tryInteract`, tecla E) llama a `setDoorOpen`, que gira la hoja y quita/pone el
obstáculo. El estado se guarda (`open` en `placed`).

**Heladera**: dos puertas con manillas largas, junta, dispensador de hielo con luz, imanes de
colores y pies. **Planta**: macetero de terracota con borde, tierra, tallo, 7 hojas abiertas y
cogollo. **Cuadro**: marco dorado con moldura, paspartú y un paisaje pintado (cielo, sol, cerros y
campo).

**Autos** (`makeCar`): carrocería con hombros y techo, parabrisas/luneta/ventanas de vidrio,
parachoques y molduras cromadas, parrilla, focos emisivos, luces traseras rojas, espejos, tapabarros,
llantas cromadas y patente. Pintura metálica.

**Aviones** (`makePlane`): fuselaje cilíndrico con morro redondo y cola cónica, franja de color,
parabrisas, 18 ventanillas, alas con winglets, turbinas cilíndricas con pilón, deriva con remate,
estabilizadores, tren de aterrizaje con ruedas dobles y luces de posición roja/verde.

**Personas** (`makePerson`): nariz, orejas, pelo (capa, nuca, patillas y chasquilla), cuello,
cinturón con hebilla, manos colgando de los brazos y zapatos en las piernas (se mueven al caminar).

**Cama**: patas torneadas, marco de madera, colchón con sábana, plumón que cubre la mitad de abajo
con doblez y pliegues, dos almohadas inclinadas, cabecera con postes y piecera (en `spawnPlaced`,
rama `key === 'cama'`). El color comprado tiñe el plumón.

**Flechas en el agua** (`updatePlayerArrows`): al tocar una `waterZone` sueltan un chapuzón, pierden
el 78% de la velocidad y se hunden despacio (tope 1,3 m/s) hasta el `bottom` de la zona; dentro del
agua la estela y el brillo se apagan. Una flecha disparada desde dentro del agua sale igual de lenta.

**Aterrizar en los árboles**: el cálculo del suelo revisa `worldTreeSpots`/`worldTreeSizes` (copa a
5,55 × altura) con el mismo chequeo de barrido que los techos, y `mcTree` registra una
`addLandingSurface` para los árboles de los parques.

**Hueco de la piscina**: el suelo del mundo (un plano de 1800²) pasaba por DENTRO del vaso y se veía
verde bajo el agua. `buildWaterPark` reemplaza `ground.geometry` por un `ShapeGeometry` con un hueco
del tamaño del vaso, reescribiendo las UV en metros (por eso `groundTex`/`groundNormalTex` pasan a
`repeat 1/9`). Fuera de la Tierra el hueco se tapa con `poolPatch` (se alterna en `updateGrassField`).

**Zonas sin pasto**: `noGrassZones` (declarado junto a `landingSurfaces`) + `addNoGrassZone`/
`inNoGrassZone`. `mcFloor` registra automáticamente cada loza que dibuja (parques, plazas, canchas
del coliseo, el resort de esquí…) y `makeStadium` registra su cancha, así el pasto 3D no brota ahí.

**Parques**: helpers compartidos mejorados — `mcBench` (tablas, respaldo listado, patas y
apoyabrazos de fierro), `mcLamp` (base, poste, farola de vidrio emisiva y remate), `mcTree` (tronco
cónico + copa en 3 capas giradas), `mcFence` (pasamanos arriba y abajo) y dos nuevos: `mcFlowers`
(macizo de flores de 6 colores) y `mcBush` (arbusto). El parque del condominio tiene fuente redonda
con chorro y gotas; el de diversiones suma flores, arbustos, faroles, bancas y basureros.

**Estadios** (`makeStadium`): cancha con rayas de cortadora y líneas pintadas (borde, mitad y
círculo central), graderías escalonadas de 3 gradas con asientos de colores y baranda, cuatro torres
de iluminación con 6 focos cada una y arco de entrada con el nombre. El público va SENTADO en las
gradas (muslos a 90°, `userData.seated` para que `swingLimbs` no lo haga caminar) y mirando al centro
de la cancha. Solo básquet y tenis son `addNoGrassZone`: la cancha de fútbol SÍ lleva pasto 3D.

**Energía del láser**: `state.laserEnergy` (0-100) con barra `#laserBar` abajo al centro (solo cuando
llevas el láser). Cada tiro gasta `LASER_SHOT = 4` (25 tiros con la barra llena); al agotarse entra
en `laserCooling` y tarda `LASER_RELOAD = 20` s en volver al 100% (la barra se va llenando y avisa
los segundos que faltan). Si dejas de disparar 2,5 s se recupera solita a 7%/s. `laserSpendShot()`
se llama al principio de `attack`/`attackNPC`: sin energía no hay rayo ni daño.

**Rayo láser** (`spawnLaserBeam` + `updateLaserShots`): haz CÓNICO (grueso en el cañón, fino en el
blanco) con núcleo blanco, halo de color y resplandor aditivo que titila, tres anillos de energía
que viajan hacia el objetivo, fogonazo en el cañón y estallido con anillo en el impacto; se apaga en
0,26 s. `shootBeam(target, color)` lo usa el jugador y la torreta láser dispara un rayo
azul instantáneo en vez de un dardo.

**Pasto**: el suelo usa una textura en grises generada por canvas (`makeGroundDetailTexture`, con
parches, briznas y tierrita) para que el color del planeta la siga tiñendo, más un normal map
procedural (`makeGroundNormalTexture`) que le da relieve (se salta en modo rendimiento).
Encima hay pasto 3D: `grassField`, un `InstancedMesh` (1 draw call) de matitas en cruz con textura
de briznas y `alphaTest`, repartidas alrededor del jugador (`scatterGrass` + `fillGrassChunk`, de a
220 por frame para no trabar) y meciéndose con el viento vía `onBeforeCompile` (el shader mueve la
punta, 0 coste de CPU). 2.800 matitas en PC / 650 en celular; solo en la Tierra.


**Casas**: las piezas de TU casa llevan detalle propio (`addWallDetail` / `addRoofDetail`, llamados
en `spawnPlaced`): la madera tiene tablas y vigas, la piedra sillares irregulares, el metal chapas y
remaches, y todas un zócalo abajo; el techo lleva hileras de tejas, alero y caballete. Los materiales
de pared/techo usan `flatShading` con su propia rugosidad/metalicidad (`objMaterial`).
Las casas de la ciudad (`makeCityHouse`) suman cimiento, marco y pomo de puerta, escalón, marcos +
alféizar + cruz en las ventanas, alero y chimenea; todo lo fino se salta si `preferLowPerf`
(celulares) para no disparar las mallas.

**Casas distintas (y que no se atraviesan)**: antes TODAS las casas de la ciudad eran el mismo cubo
con techo de pirámide. Ahora cada una saca un **plano** (`HOUSE_PLANS` + `planDeCasa(maxW, maxD)`)
antes de construirse:

| Plano | Ancho | Fondo | Techo | Gracia |
|---|---|---|---|---|
| `clasica` | 5 – 7,5 | 5 – 7,5 | pirámide | la de toda la vida |
| `chalet` | 7 – 9,5 | 6 – 8 | dos aguas | |
| `alargada` | 9 – 12,5 | 5,5 – 7 | dos aguas | ancha y baja |
| `angosta` | 4,2 – 5,4 | 6,5 – 9 | dos aguas | casi siempre de dos pisos |
| `pareada` | 4,6 – 6 | 6 – 8,5 | plana | terraza con antepecho |
| `moderna` | 6,5 – 9 | 6,5 – 9 | plana | terraza y estanque de agua |
| `cabania` | 4 – 5,5 | 4 – 5,5 | pirámide | la más chica |
| `casona` | 11 – 14 | 8 – 10,5 | mansarda | **pórtico con columnas** |
| `ele` | 9 – 12 | 8 – 10,5 | dos aguas | **ala lateral** (planta en L) |
| `garaje` | 8,5 – 12 | 6,5 – 8,5 | pirámide | **garaje con portón** |

- `techoCasa(...)` dibuja los cuatro techos (pirámide estirada a w×d con `ConeGeometry` + `rotateY`
  horneado en la geometría, dos aguas escalonado, terraza plana con antepecho y mansarda).
- El segundo piso se recoge y deja **balcón** sobre la puerta (salvo en las de techo plano, la
  `angosta` y la `casona`, donde ocupa toda la planta). Hay ventanas al frente, a los costados y
  **atrás** (antes las casas eran un muro liso por el patio).
- **Nada se atraviesa**: `repartirManzana(r, fondoFila)` va poniendo casa por casa AL LADO de la
  anterior (`x += plan.w + 1,6 a 4`), con la fachada pegada a la vereda y el fondo limitado a la
  mitad de la manzana. En manzanas chicas (las del anillo) ninguna casa puede pasar de la mitad de
  la hilera, para que no quede una sola casa por calle. Cada casa registra sus volúmenes reales
  (cuerpo + ala + garaje) como obstáculos con su propio `grupo` (`casa<N>`), así `auditCity()`
  detecta de verdad si dos casas se montan.
- Los vecinos del condominio usan el mismo sorteo con el hueco de su lote (`planDeCasa(l.w - 1.2,
  l.d - 5)`) y la casa se planta con antejardín hacia el pasaje.
- Pruebas: `tests/casas.test.mjs` corre el reparto real (sacado de `index.html` con `vm`) en 200
  barrios sorteados y exige cero cruces, casas dentro de la manzana y variedad de formas.


`renderer` con `ACESFilmicToneMapping` (exposición 1.15, 1 en modo rendimiento), sombras suaves
`PCFSoftShadowMap` con mapa de 2048 (512 en rendimiento), `pixelRatio` hasta 2 y luces nuevas:
hemisférica azulada 1.15, sol cálido 2.1 con `normalBias` y un relleno frío (`rim`) del lado
opuesto. `applyPerfMode()` baja todo eso de golpe en equipos lentos y en celular.
- **Tubo de confeti** (`makeHandTube` + `fireConfettiTube` + `updateConfetti`): 130 papelitos de 8
  colores que salen hacia donde miras, caen al suelo y se apagan a los ~6 s; de paso aturde a los
  monstruos a menos de 11.
- Debug: `__tim.fireGun(spec)`, `__tim.currentGunSpec()`, `__tim.handItems()`, `__tim.gunAmmoText()`,
  `__tim.bulletsCount()`, `__tim.shellsCount()`.

## Recados de la ciudad (misiones largas)

Tres misiones nuevas al estilo del callejón, en la sección **"RECADOS DE LA CIUDAD"** de
`index.html` (buscar ese banner). Van en `STORY_QUESTS` (se ven en el panel 📜) y su progreso
vive en `state.story[id]` (se guarda).

- Un solo recado activo a la vez (`let job`), solo de día, en la Tierra y fuera de mundos de
  misión (`jobCanRun()`). `nextJobId()` los ofrece en orden cuando ya tienes casa.
- `jobMarker` = aro + haz de luz reutilizado; `updateArrow` apunta la flecha guía al recado
  activo y el HUD de objetivo muestra `job.label` (+ el reloj del reparto).
- `tryJobInteract()` (enganchado en `tryInteract`) es la tecla **E**: calmar al perro / abrir
  el cajón. `updateJobs(dt)` corre en el loop (se pausa sola de noche).
- **🐕 El perro perdido**: aparece en la ciudad, lo calmas con E, te sigue y lo llevas a casa →
  +$500 y el **perro guardián** gratis (`spawnPet()`).
- **🍕 Reparto exprés**: 3 pedidos contra reloj (80 s cada uno; si se enfría, otro pedido sin
  castigo) → +$180 por pedido y +$900 + 3 comidas al terminar.
- **📦 El cargamento de Tito** (pide el callejón, $20.000): 3 cajones; cada uno suelta 2 zombis
  al abrirlo (marcados `dirtZombie` para que sirva el combate de día) → +$250 c/u y al final
  +$1.500 y las **gafas de noche** (`state.gadgets.gafas`).
- **Se empiezan a mano**: botón `#jobBtn` abajo al centro ("▶️ HACER MISIÓN · …"). `nextJobId()`
  decide cuál toca, `renderJobBtn()` lo pinta (y muestra el paso actual mientras la haces) y
  `jobBtnClick()` la arranca. Ya no se auto-arrancan: solo avisan una vez por toast (`jobOffered`).
- **Flechas en el suelo** (`jobPath` + `updateJobPath`): 8 triángulos planos que corren desde tus
  pies hacia el objetivo y se apagan al llegar.
- **Sonidos por misión** (`updateJobSound`): el perro LADRA cada vez más seguido según te acercas
  (`jobBark`), el pedido pita (más rápido bajo 15 s) y el cajón suena a metal.
- Debug (`?debug=1`): `__tim.startJob(id)`, `__tim.updateJobs(dt)`, `__tim.tryJobInteract()`,
  `__tim.jobInfo()`, `__tim.jobDogPos()`, `__tim.jobCratePos()`.

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
  `alien` sale solo en Platus.

## Arreglos tras code review (buscado/policía, ciudad en Platus, auto robado)

Bugs detectados en un code review de la fusión (calles/tráfico + estrellas + robar auto) y corregidos:

1. **`addObstacle` ahora retorna el obstáculo** (antes no retornaba nada). Así `car.userData.obstacle`
   de los autos estacionados queda seteado y `stealCar` sí puede quitar la caja de colisión al robarlos
   (antes dejaba un muro invisible permanente en cada plaza de estacionamiento).
2. **Buscado/policía se limpia en todas las transiciones**: `state.wanted`/`state.wantedLevel = 0` +
   `clearPolice()` ahora también en `goToPlanet()` (Platus), `goToJail()` (muerte) y `faintFromHunger()`
   — antes solo `policeCatch`/`startGame`/`loadGame` lo hacían, así que reaparecías BUSCADO.
3. **Platus sin ciudad terrestre**: helper `setCityVisible(v)` oculta/muestra `roadMeshes` (nuevo array
   poblado en `makeRoad`) + `traffic` + `parkedCars` + `trafficLights`. Se llama `false` en `goToPlanet`
   y `true` en `startGame`/`loadGame` (según `state.planet`). `nearestStreetCar` retorna `null` en Platus
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

## Celular más fácil de jugar

- **Joystick flotante**: tocar cualquier parte de la mitad IZQUIERDA de la pantalla hace que el
  joystick salte al dedo (`joyStart`/`joyMoveTo`/`joyReset`); la derecha sigue siendo mirar. El
  `touchmove`/`touchend` se escuchan también en `window`, así el dedo puede salirse del círculo.
- **Mantener 👊 dispara/pega seguido** (`touch.hitHeld` + `touch.hitRepeat` en el loop), al ritmo del
  arma que lleves.
- **Ayuda de puntería** (`aimHelp()`): en celular el blanco de las balas mide 2,25 (1,15 en PC) y el
  cono del golpe cuerpo a cuerpo es mucho más ancho. A las PERSONAS no se les aplica, para no
  volverte BUSCADO sin querer.

## Menos teclas en PC (E contextual + menú de rueda)

Las teclas viejas SIGUEN funcionando; esto solo agrega caminos más fáciles.

- **E hace todo lo que tengas delante**: además de lo que ya hacía, ahora cubre el vendedor
  (`tryVendorHere`, antes Y), llamar ayudante al lado de la mamá (`tryHelperHere`, antes H) y el
  huerto (`tryGardenHere`: planta si llevas semillas, si no cava con la pala — antes K y T). Van al
  FINAL de la cadena de `tryInteract`, así que solo saltan cuando no hay nada más cerca.
  `tryCollectGolden`/`tryRob`/`sellHouse` ahora devuelven `true`/`false` para poder encadenarlas.
- **Tab abre un menú en rueda** (`openWheel`/`wheelOptions`/`closeWheel`, `#wheelMenu`): modos del
  papá (C/V/O), descansar (Z), armarlo (G), llamar ayudante (H), mates (U), empezar la noche (N),
  misiones y ayuda (I). Cada opción muestra su tecla vieja como recordatorio. Esc o Tab lo cierran,
  `algunRecuadroAbierto()` lo cuenta como recuadro abierto (el teclado del juego se congela).
- Los carteles de contexto que decían Y o K ahora dicen **E**.
- **En celular** todo esto tiene su botón: **🎯 acciones** abre la misma rueda (items más chicos con
  la clase `chico`), **🔭 mira** pone/saca la mira y solo aparece con un arma de fuego en la mano
  (clase `body.armado`, que `renderHUD` alterna), y el botón **🤝 usar** ya hacía de E contextual.

## El terreno y el condominio (para hacerte una casa hay que comprar el lote)

Ya no se construye en cualquier parte: la manzana `casa` es el **Condominio Los Aromos** y
la casa se levanta en un **lote comprado**.

- **Empiezas con $2000** (`START_MONEY`) y el **terreno vale $1000** (`PRECIO_TERRENO`).
- **Trazado en `src/city-map.js`** (`CONDOMINIO`): un `pasaje` interior (z 27.5, 6 de ancho),
  el `porton` que da a la avenida del oeste, la explanada `comun` (donde quedan el cohete, la
  conserjería y el punto de aparición) y **7 `lotes`**: 5 con vecino ya construido y **2 EN
  VENTA** (`sur1` y `nor4`, de 14×14.5 — caben 3×3 paredes). Helpers: `lotesEnVenta`,
  `lotePorId`, `loteEn`, `rectLote`, `enCondominio`. `validarMapa()` revisa que ningún lote
  se pise con otro, con el pasaje, con la explanada ni con la calle.
- **`buildCondominio()`** (en `index.html`, justo antes del cierre del mundo terrestre para que
  se oculte al viajar a Platus) arma pasaje, reja perimetral, portón con dintel, conserjería,
  explanada con árboles y bancas, y por cada lote: pasto, reja con la entrada hacia el pasaje,
  sendero, buzón, cartel y —si tiene vecino— su casa (`planDeCasa(l.w - 1.2, l.d - 5)` sortea una
  forma distinta para cada lote y garantiza que quepa dentro de la reja).
- **Comprar**: `tryBuyPlot()` (enganchado en `tryInteract`, tecla **E** / botón 🤝) cobra los
  $1000 estando dentro del lote o a menos de 7. `mudarseAlLote()` mueve `HOUSE`, `BUTLER_HOME`
  y el marcador verde `homePlot` al lote, y cambia los carteles (`SE VENDE` → `TU TERRENO`,
  el otro queda `VENDIDO`). `resetPlots()` lo deja todo de nuevo en venta.
- **Construir**: `puedeConstruirCasa(key, x, z)` bloquea las `PIEZAS_DE_CASA` (paredes, puerta,
  techo, pilar, piso 2) si no tienes lote o si apuntas fuera de él. Muebles, defensas y huerto
  siguen libres. Se aplica en `placeObject` y en `placeBlueprint` (el plano entero tiene que caber).
- **Saves viejos**: `migrarTerrenoAntiguo(d)` le regala el lote más cercano al que ya tenía casa
  y marca `state.plotLegacy` para no obligarlo a mudarse (sigue construyendo donde estaba).
- El **tutorial** parte con "Compra tu terreno" (8 pasos), la **flecha guía** apunta al lote en
  venta mientras no tengas uno y el **minimapa** los marca con 🪧.
- Los cinco **toros** se fueron del condominio al potrero verde del norte (manzana libre en
  (27.5, 130)); la mamá aparece en la explanada común.
- `makeSign` ahora **achica la letra hasta que el texto entra** en el cartel (antes se cortaba).

## El banco y la cárcel (edificios en los que se ENTRA)

Los dos eran una caja de 8×5 y ahora son edificios grandes, con interior recorrible y gente
adentro. Comparten tres helpers: `edifCaja` (caja + colisión opcional, agrupada para que
`auditCity` no la cuente encimada), `edifRejas` (fila de barrotes con travesaños) y
`sentarPersona` (deja a un `makePerson` sentado y marcado `seated`).
Las dos se construyen con `buildBank()` / `buildJail()` **junto al condominio** (después de
`buildAirport()`): usan `mcFloor`/`mcBench`/`mcTree`, que dependen de `parkMatCache` y no
existen todavía en la línea donde se declaran `BANK_POS`/`JAIL_POS`.

- **🏦 Banco Central** (`BANK`, 20×11×6.4 en `LUGARES.banco` = (19,-15); el súper se corrió a
  (28,-35) para dejarle el frente de la manzana). Por fuera: seis columnas acanaladas, frontón
  escalonado con reloj, puerta doble de bronce, ventanales enrejados, torre con cúpula, mástiles,
  jardineras y **dos cajeros automáticos** en la fachada. Por dentro: mármol, mesón de tres
  ventanillas (la del centro va ABIERTA para ver a la cajera), bóveda acorazada con rueda, sala
  de espera, cordón de la fila y dos luces reales (se saltan en modo rendimiento).
  - **La cajera** (`bankTeller`) está sentada a su escritorio. `bankDeskNear()` dice si estás
    frente a ella (<4,2) o en un cajero (<2,6), y `tryBank()` abre el `#bankbox` de siempre
    (la cajera además te saluda con `say`). Ya NO basta con acercarse al edificio.
- **🚔 Penal La Roca** (`JAIL`, 37×35 en la manzana `carcel`): muro perimetral con rollos de
  alambre de púas, cuatro torres de vigilancia con foco, portón con dintel y reja corrida,
  patio con dos canchas de básquet, bancas y mesa, y el **Pabellón A** (29×14) con pasillo,
  cinco celdas enrejadas (litera, váter, luz) y ventanucos.
  - **Presos y guardias**: `makePrisoner` (buzo naranja con rayas, gorro y número) y `makeGuard`
    (uniforme azul, gorra con visera, placa y luma). Cinco presos en las celdas, tres en el patio
    y tres guardias. `updateJailFolk(dt)` (en el bucle) los pasea dentro de su radio; solo corre
    en la Tierra y a menos de 90 del penal.
  - Los policías salen por `JAIL_GATE` (fuera del muro), no dentro del recinto.
- Bug de fondo arreglado: `makeStore` tenía 3 filas fijas de góndolas y el súper trae 26
  productos, así que los dos últimos ("cohete" y "trajes") terminaban **en medio de la avenida**.
  Ahora las filas se calculan con `Math.ceil(items.length / cols.length)`.
- Debug: `__tim().jailFolk`, `__tim().bankTeller()`, `__tim().bankDeskNear()`, `__tim().JAIL`.

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

## Chat mundial (muro global + globos en el juego)

Una sola sala para TODOS los que están jugando (es aparte de las salas P2P de "jugar con
amigos": el chat no pasa por PeerJS, va por la API mundial del VPS).

- **Servidor** (`server/leaderboard.mjs`, el mismo servicio del ranking): `GET /chat`
  devuelve los últimos `CHAT_HISTORY` mensajes; `?since=<id>` solo lo dicho después de ese id
  (los globos del juego) y `?since=-1` nada, solo `{lastId, online}` para empezar a escuchar
  sin repetir lo viejo. `POST /chat {playerId, name, text}` publica. Tablas `chat_messages` y
  `chat_presence` (`server/schema.sql`); `?me=<uuid>&name=` marca presencia (ventana de 75 s)
  y con eso se cuenta "X jugadores". `chatPrune()` borra mensajes de más de 48 h cada 10 min.
  Rutas nuevas en `server/nginx-location.conf` (`/api/chat`) y chequeo en `deploy.yml`.
- **Reglas compartidas** (`src/chat.js`, lo importan el navegador y el servidor, para que el
  mensaje que ves sea el que se guarda): `cleanChatText` (140 caracteres, una línea, enlaces →
  `(enlace)`, groserías → `***`), `cleanChatName`, `chatSendWait` (2,5 s entre mensajes),
  `CHAT_BUBBLE_MS = 7000`. Pruebas: `node tests/chat.test.mjs`.
- **Cliente** (sección `CHAT MUNDIAL` en `index.html`, después del ranking): objeto `chat`
  (`lastId`, `history`, `mine`, `bubbles`, `backoff`…). `chatSync()` corre en un `setInterval`
  de 2,5 s pero solo pregunta según dónde estés: 4 s con el muro abierto, 7 s jugando, 20 s en
  el menú y nunca con la pestaña oculta; si la red falla, `backoff` espacia hasta 60 s.
  `chatBubble()` crea el globo (máx. 3) y lo borra a los 7 s (`chatFadeBubble`).
  `renderChatWall()` **solo agrega** las filas nuevas (`data-chat-id`) para no mover el texto
  que estás leyendo. La identidad es el mismo uuid anónimo del ranking (`randomUuid()`).
- **UI**: `#chatbox` (muro, botón `💬 MURO GLOBAL` del inicio + `#chatTeaser` con el último
  mensaje), `#chatFeed` (globos) y `#chatReply` (barra para contestar). Abrir el muro estando
  en partida pausa el juego, como el menú de ayuda.
- **Controles**: `Enter` abre la barra de chat (solo si el foco está en el canvas/cuerpo),
  `Esc` la cierra, botón `💬` en el panel `⋯` del celular (`press('chat')`) y tocar fuera
  también cierra. Mientras escribes, `typing = true` bloquea el teclado del juego.
- El nombre sale de `tim_chat_name` (lo que escribas en el muro) o del perfil de la partida.
- **Un solo recuadro de escribir a la vez** (arreglo del code review): abrir el chat cierra
  vendedor/mates y viceversa, y todos los cierres usan `algunRecuadroAbierto()` (lista
  `TYPING_BOXES`) en vez de comparar a mano contra otros paneles. Antes, cerrar uno devolvía
  el teclado al juego aunque quedara otro abierto.
- **`chatName()` no puede leer `net` directo** (`nombreDeLaSala()`): `const net` se declara al
  final del archivo, así que en la primera consulta del chat (que ahora sale al cargar la
  página) leerlo lanzaba ReferenceError y dejaba `chat.busy` trabado para SIEMPRE: nadie
  registraba presencia y el muro no se actualizaba nunca. Por lo mismo, preparar la consulta
  quedó dentro del `try` de `chatSync`: pase lo que pase, `busy` se libera.
- Otros arreglos del review: el muro carga la conversación aunque la primera consulta falle
  (`chat.historyLoaded`, antes quedaba pegado en "no hay mensajes" al entrar a jugar); la
  espera entre mensajes NO se borra cuando el servidor contesta 429 (solo si no hubo red);
  el primer aviso de presencia sale al tiro (`lastPresence = null`, antes el muro decía
  "0 jugadores" los primeros 20 s); `validPlayerId` exige la forma real de un uuid (antes un
  id mal formado llegaba a PostgreSQL y devolvía 500, también en el ranking); el POST del
  chat responde antes de la presencia y la limpieza (si fallaban, el jugador reenviaba y el
  mensaje salía dos veces); el filtro ya no se come "conocí"/"conos"/"Vergara" (lista de
  terminaciones en vez de "cualquier sufijo corto") ni parte los emoji de familia (el ZWJ
  se conserva).
