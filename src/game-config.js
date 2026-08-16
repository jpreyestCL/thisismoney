export const GAME_RULES = Object.freeze({
  saveVersion: 3,
  daySeconds: 240,
  nightSeconds: 180,
  firstNightSeconds: 90,
  finalHordeSeconds: 35,
  meteorAt: 75000,
  momAt: 20000,
  jailMoneyLoss: 0.20,
});

export const PROGRESSION = Object.freeze([
  { at: 0, icon: '🏠', name: 'Primer hogar', detail: 'Construye un refugio y supera la primera noche.' },
  { at: 2500, icon: '🐕', name: 'Perro guardián', detail: 'Un compañero que protege la casa.' },
  { at: 5000, icon: '🌾', name: 'Agricultura avanzada', detail: 'Huertos diversos y mejores cosechas.' },
  { at: 10000, icon: '🏍️', name: 'Movilidad', detail: 'La moto aparece en el catálogo.' },
  { at: 20000, icon: '👩', name: 'La familia crece', detail: 'Mamá se une y ayuda con comida.' },
  { at: 35000, icon: '🏗️', name: 'Segundo piso', detail: 'Amplía la casa y su producción.' },
  { at: 50000, icon: '🔆', name: 'Tecnología defensiva', detail: 'Láser y heladera disponibles.' },
  { at: 75000, icon: '🚀', name: 'Horizonte espacial', detail: 'Comienza la misión del cohete.' },
]);

export const HOUSE_VALUES = Object.freeze({
  wallWood: { protection: 8, comfort: 1 },
  wallRock: { protection: 14 },
  door: { protection: 4, comfort: 2 },
  roof: { protection: 12, comfort: 3 },
  window: { protection: -2, comfort: 7 },
  lamp: { comfort: 5, energy: -2 },
  oven: { comfort: 4, production: 8, energy: -2 },
  cama: { comfort: 12 }, sofa: { comfort: 8 }, tele: { comfort: 7, energy: -3 },
  mesa: { comfort: 4, production: 2 }, silla: { comfort: 3 }, cuadro: { comfort: 3 }, planta: { comfort: 4 },
  heladera: { comfort: 5, production: 10, energy: -3 },
  laser: { protection: 15, energy: -5 }, torreta: { protection: 12 }, ballesta: { protection: 9 },
});

export function nightDuration(nightNumber) {
  return nightNumber <= 1 ? GAME_RULES.firstNightSeconds : GAME_RULES.nightSeconds;
}

export function roadmapFor(totalEarned) {
  const achieved = PROGRESSION.filter(item => totalEarned >= item.at);
  const upcoming = PROGRESSION.filter(item => totalEarned < item.at);
  return {
    now: achieved[achieved.length - 1] || PROGRESSION[0],
    next: upcoming[0] || null,
    later: upcoming[1] || null,
  };
}

export function houseRatings(counts) {
  const result = { protection: 0, comfort: 0, production: 0, energy: 0 };
  for (const [key, amount] of Object.entries(counts)) {
    const values = HOUSE_VALUES[key];
    if (!values || !amount) continue;
    for (const stat of Object.keys(result)) result[stat] += (values[stat] || 0) * amount;
  }
  result.energy = Math.max(0, 10 + result.energy);
  result.score = Math.max(0, result.protection + result.comfort + result.production + result.energy);
  return result;
}
