// Choque de la gente: índice por celdas (se consulta en vez de recorrer
// todos los obstáculos) y un paso que se desliza, rodea o retrocede.
// Nunca teletransporta: el desplazamiento cabe en el paso pedido.

const CELDA = 8;
const SALIDA = { x: 0, z: 0, avanzo: false, cambio: false };
const PASO = { x: 0, z: 0, avanzo: false, huyo: false };

export function crearIndice() {
  const buckets = new Map();
  let marca = 1;
  const key = (i, j) => (i + 4000) * 9000 + (j + 4000);
  return {
    llenar(cajas) {
      for (const arr of buckets.values()) arr.n = 0;
      for (let n = 0; n < cajas.length; n++) {
        const o = cajas[n];
        const i0 = Math.floor(o.minX / CELDA), i1 = Math.floor(o.maxX / CELDA);
        const j0 = Math.floor(o.minZ / CELDA), j1 = Math.floor(o.maxZ / CELDA);
        for (let i = i0; i <= i1; i++) {
          for (let j = j0; j <= j1; j++) {
            const k = key(i, j);
            let b = buckets.get(k);
            if (!b) { b = []; b.n = 0; buckets.set(k, b); }
            if (b.n < b.length) b[b.n] = o; else b.push(o);
            b.n++;
          }
        }
      }
    },
    tocar(x, z, radio, filtrar) {
      if (marca >= 0x7fffffff) {
        for (const b of buckets.values()) for (let k = 0; k < b.n; k++) b[k]._npcMarca = 0;
        marca = 1;
      }
      const m = ++marca;
      const ci = Math.floor(x / CELDA), cj = Math.floor(z / CELDA);
      for (let i = ci - 1; i <= ci + 1; i++) {
        for (let j = cj - 1; j <= cj + 1; j++) {
          const b = buckets.get(key(i, j));
          if (!b) continue;
          for (let k = 0; k < b.n; k++) {
            const o = b[k];
            if (o._npcMarca === m) continue;
            o._npcMarca = m;
            if (filtrar && !filtrar(o)) continue;
            if (x > o.minX - radio && x < o.maxX + radio && z > o.minZ - radio && z < o.maxZ + radio) return o;
          }
        }
      }
      return null;
    },
  };
}

function probar(x, z, dx, dz, ocupado) {
  if (!dx && !dz) return false;
  return !ocupado(x + dx, z + dz);
}

function unPaso(x, z, dx, dz, ocupado, estado, huyendo) {
  const lado = estado.lado || 1;
  const px = -dz * lado, pz = dx * lado;
  let ox = 0, oz = 0, ok = false;
  if ((estado.quieto || 0) > 0.22 && probar(x, z, px, pz, ocupado)) { ox = px; oz = pz; ok = true; }
  else if ((estado.quieto || 0) > 0.22 && probar(x, z, -px, -pz, ocupado)) { ox = -px; oz = -pz; ok = true; }
  else if (probar(x, z, dx, dz, ocupado)) { ox = dx; oz = dz; ok = true; }
  else if (Math.abs(dx) >= Math.abs(dz) && probar(x, z, dx, 0, ocupado)) { ox = dx; oz = 0; ok = true; }
  else if (Math.abs(dx) < Math.abs(dz) && probar(x, z, 0, dz, ocupado)) { ox = 0; oz = dz; ok = true; }
  else if (probar(x, z, dx, 0, ocupado)) { ox = dx; oz = 0; ok = true; }
  else if (probar(x, z, 0, dz, ocupado)) { ox = 0; oz = dz; ok = true; }
  else if (probar(x, z, px, pz, ocupado)) { ox = px; oz = pz; ok = true; }
  else if (probar(x, z, -px, -pz, ocupado)) { ox = -px; oz = -pz; ok = true; }
  else if (!huyendo && probar(x, z, -dx, -dz, ocupado)) {
    estado.huirX = -dx; estado.huirZ = -dz;
    estado.retro = Math.max(estado.retro || 0, 0.4);
    estado.lado = -lado;
    PASO.x = x - dx; PASO.z = z - dz; PASO.avanzo = false; PASO.huyo = true;
    return PASO;
  }
  PASO.x = ok ? x + ox : x;
  PASO.z = ok ? z + oz : z;
  PASO.avanzo = ok;
  PASO.huyo = false;
  return PASO;
}

// estado: { quieto, lado, retro, huirX, huirZ }
// Devuelve el mismo objeto siempre: el que llama tiene que copiar x/z al tiro.
export function moverNpc(x, z, dx, dz, ocupado, estado, dt) {
  const t = dt > 0 ? dt : 0.016;
  if (!estado.lado) estado.lado = 1;
  let dirX = dx, dirZ = dz, huyendo = false;
  if ((estado.retro || 0) > 0 && (estado.huirX || estado.huirZ)) {
    const paso = Math.hypot(dx, dz);
    const h = Math.hypot(estado.huirX, estado.huirZ) || 1;
    if (paso > 1e-6) { dirX = estado.huirX / h * paso; dirZ = estado.huirZ / h * paso; }
    estado.retro = Math.max(0, estado.retro - t);
    huyendo = true;
  }
  if (ocupado(x, z)) {
    let ux = 0, uz = 0, mejor = 1e9;
    for (let k = 0; k < 8; k++) {
      const a = k * 0.78539816339, cx = Math.cos(a), cz = Math.sin(a);
      for (let s = 1; s <= 40; s++) {
        const d = s * 0.5;
        if (!ocupado(x + cx * d, z + cz * d)) {
          if (d < mejor) { mejor = d; ux = cx; uz = cz; }
          break;
        }
      }
    }
    if (mejor < 1e9) {
      const paso = Math.min(0.28, mejor);
      SALIDA.x = x + ux * paso; SALIDA.z = z + uz * paso;
      SALIDA.avanzo = true; SALIDA.cambio = false;
      return SALIDA;
    }
  }
  const paso = Math.hypot(dirX, dirZ);
  if (paso < 1e-6) {
    SALIDA.x = x; SALIDA.z = z; SALIDA.avanzo = false; SALIDA.cambio = false;
    return SALIDA;
  }
  const partes = Math.max(1, Math.ceil(paso / 0.3));
  const sx = dirX / partes, sz = dirZ / partes;
  let cx = x, cz = z, avanzo = false;
  for (let i = 0; i < partes; i++) {
    const r = unPaso(cx, cz, sx, sz, ocupado, estado, huyendo);
    const nx = r.x, nz = r.z, huyo = r.huyo, dio = r.avanzo;
    cx = nx; cz = nz;
    if (dio) avanzo = true;
    if (huyo) { avanzo = true; break; }
    if (!dio) break;
  }
  const mx = cx - x, mz = cz - z;
  if (mx * mx + mz * mz < 1e-8) estado.quieto = (estado.quieto || 0) + t;
  else if (mx * dx + mz * dz > 1e-4 || (avanzo && !huyendo)) estado.quieto = 0;
  let cambio = false;
  if ((estado.quieto || 0) > 0.55) {
    estado.lado = -(estado.lado || 1);
    estado.quieto = 0.12;
    cambio = true;
  }
  SALIDA.x = cx; SALIDA.z = cz; SALIDA.avanzo = avanzo; SALIDA.cambio = cambio;
  return SALIDA;
}
