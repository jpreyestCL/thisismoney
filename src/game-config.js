export const GAME_RULES = Object.freeze({
  saveVersion: 3,
  morningSeconds: 60,      // mañana: 1 minuto
  daySeconds: 180,          // día (mediodía): 3 minutos
  afternoonSeconds: 150,    // tarde: 2 minutos y medio
  nightSeconds: 120,        // noche: 2 minutos
  firstDaySeconds: 390,
  firstNightSeconds: 120,
  finalHordeSeconds: 35,
  meteorAt: 1000000,   // el "millón": recién ahí cae el meteorito
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
  { at: 1000000, icon: '🚀', name: 'Horizonte espacial', detail: 'Al llegar al millón cae el meteorito: comienza la misión del cohete.' },
]);

export const CHAPTERS = Object.freeze([
  { id: 'home', title: 'Un techo para los dos', goal: 'Completa el entrenamiento y termina tu primer hogar.', reward: 600, blueprint: 'familyWorkshop' },
  { id: 'neighbors', title: 'El barrio recuerda', goal: 'Alcanza 3 puntos de confianza ayudando a habitantes.', reward: 900, blueprint: 'communityBoard' },
  { id: 'resistance', title: 'Tres amaneceres', goal: 'Supera 3 noches y logra 45 de protección en la casa.', reward: 1400, blueprint: 'reinforcedWalls' },
  { id: 'team', title: 'Jugar en equipo', goal: 'Obtén medallas en 2 deportes distintos.', reward: 1800, blueprint: 'trophyRoom' },
  { id: 'enterprise', title: 'El negocio familiar', goal: 'Abre un negocio y completa 3 pedidos.', reward: 2400, blueprint: 'marketStall' },
  { id: 'secrets', title: 'Bajo la ciudad', goal: 'Encuentra 3 secretos o reliquias del mundo.', reward: 3200, blueprint: 'treasureMap' },
  { id: 'guardian', title: 'La noche del guardián', goal: 'Derrota un jefe y conserva la casa en pie.', reward: 4500, blueprint: 'guardianCore' },
  { id: 'horizon', title: 'Horizonte espacial', goal: 'Prepara el cohete y escapa con tu familia.', reward: 7500, blueprint: 'starHome' },
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
  espejo: { comfort: 6 }, alfombra: { comfort: 7 }, bano: { comfort: 10 },
  computador_gamer: { comfort: 10, production: 6, energy: -3 }, pc_gamer: { comfort: 8, production: 5, energy: -3 },
  silla_gamer: { comfort: 8 }, luces_gamer: { comfort: 6, energy: -2 }, teclado_gamer: { comfort: 4, production: 3 },
  parlante_gamer: { comfort: 7, energy: -2 }, mesa_gamer: { comfort: 6, production: 5 },
  wallMetal: { protection: 22 }, wallDoor: { protection: 6, comfort: 3 }, pilar: { protection: 5, comfort: 2 },
  laser: { protection: 15, energy: -5 }, torreta: { protection: 12 }, ballesta: { protection: 9 },
});

// Mañana 1 min + día 3 min + tarde 2,5 min. Recién ahí cae la noche, que dura 2 min.
export function dayDuration(_nightNumber) {
  return GAME_RULES.morningSeconds + GAME_RULES.daySeconds + GAME_RULES.afternoonSeconds;
}

export function nightDuration(_nightNumber) {
  return GAME_RULES.nightSeconds;
}

export function dayPart(dayTime) {
  const m = GAME_RULES.morningSeconds, d = GAME_RULES.daySeconds, a = GAME_RULES.afternoonSeconds;
  const t = Math.max(0, dayTime || 0);
  if (t < m) return { id: 'morning', name: 'Mañana', icon: '🌅', left: m - t, length: m, sun: (t / m) * 0.18 };
  if (t < m + d) return { id: 'midday', name: 'Día', icon: '☀️', left: m + d - t, length: d, sun: 0.18 + ((t - m) / d) * 0.6 };
  const u = Math.min(1, (t - m - d) / a);
  return { id: 'afternoon', name: 'Tarde', icon: '🌇', left: Math.max(0, m + d + a - t), length: a, sun: 0.78 + u * 0.22 };
}

// Los monstruos dan monedas pequeñas: trabajar, construir y superar la noche son la economía principal.
export function monsterKillReward(stage, combo = 1) {
  const base = 1 + Math.min(7, Math.floor((Math.max(1, stage) - 1) / 5));
  return Math.round(base * (1 + Math.min(0.25, (Math.max(1, combo) - 1) * 0.05)));
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
