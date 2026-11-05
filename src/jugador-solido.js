// Paso del jugador contra lo sólido. El desplazamiento pedido se parte en
// trozos cortos: si el frente está ocupado, se conserva el eje libre y el
// cuerpo se desliza. Nunca se mueve más de lo pedido (no hay teletransporte).

export const RADIO_JUGADOR = 0.42;
const PASO = 0.2;
const SALIDA = { x: 0, z: 0 };

export function deslizarJugador(x, z, dx, dz, ocupado) {
  const dist = Math.hypot(dx, dz);
  if (!(dist > 1e-8)) { SALIDA.x = x; SALIDA.z = z; return SALIDA; }
  const n = Math.max(1, Math.ceil(dist / PASO));
  const sx = dx / n, sz = dz / n;
  let cx = x, cz = z;
  for (let i = 0; i < n; i++) {
    const nx = cx + sx, nz = cz + sz;
    if (!ocupado(nx, nz)) { cx = nx; cz = nz; continue; }
    const libreX = Math.abs(sx) > 1e-8 && !ocupado(cx + sx, cz);
    const libreZ = Math.abs(sz) > 1e-8 && !ocupado(cx, cz + sz);
    if (libreX && !libreZ) cx += sx;
    else if (libreZ && !libreX) cz += sz;
    else if (libreX && libreZ) { if (Math.abs(sx) >= Math.abs(sz)) cx += sx; else cz += sz; }
    else break;
  }
  SALIDA.x = cx; SALIDA.z = cz;
  return SALIDA;
}
