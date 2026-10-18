// ===================================================================
//  LLUVIA Y NIEVE CONTRA LOS TECHOS
//  Lo usan el juego (index.html) y tests/clima-techo.test.mjs.
//  Una cubierta es un rectángulo horizontal: centro (x, z), ancho w,
//  fondo d y altura y de la cara de arriba. Bajo esa cara no cae agua
//  ni nieve, y tampoco se acumula nada.
// ===================================================================

// Por debajo de esto es suelo, banca o losa rasa: no tapa el cielo.
export const ALTURA_TECHO_MIN = 1.15;

export function techoEn(techos, x, z) {
  let y = 0;
  if (!techos) return 0;
  for (let i = 0; i < techos.length; i++) {
    const t = techos[i];
    if (!t || !(t.y >= ALTURA_TECHO_MIN)) continue;
    if (Math.abs(x - t.x) <= t.w * 0.5 && Math.abs(z - t.z) <= t.d * 0.5 && t.y > y) y = t.y;
  }
  return y;
}

// Baja una gota o un copo. Si ya está bajo una cubierta, no cae.
// Si viene del cielo, se detiene en el techo o en el suelo descubierto.
export function avanzarPrecipitacion(techos, gota, dy) {
  const x = gota.x, z = gota.z;
  const techo = techoEn(techos, x, z);
  if (techo > 0 && gota.y < techo - 0.04) {
    return { cae: false, bajoTecho: true, impacto: false, x, y: gota.y, z, techo, donde: null };
  }
  const suelo = techo > 0 ? techo : 0;
  const y = gota.y - Math.max(0, dy);
  if (y <= suelo) {
    return {
      cae: true, bajoTecho: false, impacto: true, x, y: suelo, z, techo,
      donde: techo > 0 ? 'techo' : 'suelo',
    };
  }
  return { cae: true, bajoTecho: false, impacto: false, x, y, z, techo, donde: null };
}

// Al escampar: unos pocos charcos en suelo descubierto, nunca bajo techo.
export function charcosTrasLluvia(techos, origen, rnd) {
  const azar = rnd || Math.random;
  const out = [];
  let intentos = 0;
  while (out.length < 6 && intentos < 80) {
    intentos++;
    const lejos = intentos > 40;
    const r0 = lejos ? 12 : 4.8;
    const r1 = lejos ? 26 : 16;
    const a = azar() * Math.PI * 2;
    const r = r0 + azar() * (r1 - r0);
    const x = origen.x + Math.cos(a) * r;
    const z = origen.z + Math.sin(a) * r;
    if (techoEn(techos, x, z) > 0) continue;
    let cerca = false;
    for (const p of out) if ((p.x - x) * (p.x - x) + (p.z - z) * (p.z - z) < 7.84) { cerca = true; break; }
    if (cerca) continue;
    out.push({ x, z, y: 0.03 });
  }
  return out;
}

// Donde se queda la nieve que ya tocó suelo descubierto o un techo al aire.
// Un copo que está bajo la cubierta no deja nada.
export function quedaNieve(techos, copos) {
  const out = [];
  for (const c of copos) {
    const techo = techoEn(techos, c.x, c.z);
    if (techo > 0 && c.y < techo - 0.04) continue;
    if (techo > 0) out.push({ x: c.x, z: c.z, y: techo, donde: 'techo' });
    else out.push({ x: c.x, z: c.z, y: 0, donde: 'suelo' });
  }
  return out;
}
