/**
 * Fotos reales (Wikimedia Commons) usadas para representar cada tipo de
 * vehiculo. Son enlaces externos verificados (HTTP 200).
 */
export const FOTO: Record<string, string> = {
  AUTOMOVIL:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/2/24/2018_Toyota_Corolla_%28ZRE172R%29_Ascent_sedan_%282018-11-02%29_02.jpg/960px-2018_Toyota_Corolla_%28ZRE172R%29_Ascent_sedan_%282018-11-02%29_02.jpg',
  CAMIONETA:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Jeep_Gladiator_JT_2019_1.jpg/960px-Jeep_Gladiator_JT_2019_1.jpg',
  CAMPERO:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Moscow%2C_Toyota_RAV4_XA40%2C_July_2025_01.jpg/960px-Moscow%2C_Toyota_RAV4_XA40%2C_July_2025_01.jpg',
  MICROBUS:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Toyota_Commuter_in_Bangkok_%284%29.jpg/960px-Toyota_Commuter_in_Bangkok_%284%29.jpg',
  MOTOCICLETA:
    'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Ktm_motorcycle_side_view_114275_3840x2160.jpg/960px-Ktm_motorcycle_side_view_114275_3840x2160.jpg'
};

/** Color de acento por tipo de vehiculo */
export const ACENTO: Record<string, string> = {
  AUTOMOVIL: '#2563eb',
  CAMIONETA: '#ea580c',
  CAMPERO: '#16a34a',
  MICROBUS: '#7c3aed',
  MOTOCICLETA: '#e11d48'
};

export function fotoDe(tipo: string): string {
  return FOTO[tipo] ?? FOTO['AUTOMOVIL'];
}

export function acentoDe(tipo: string): string {
  return ACENTO[tipo] ?? '#2563eb';
}
