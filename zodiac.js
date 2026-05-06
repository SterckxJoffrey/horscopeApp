// Pour utiliser de vraies images : dépose tes PNG dans ./assets/zodiac/
// puis remplace `null` par require("./assets/zodiac/<fichier>.png").
const SIGNS = [
  { name: "Capricorne", symbol: "♑", image: null, from: [12, 22], to: [1, 19] },
  { name: "Verseau",    symbol: "♒", image: null, from: [1, 20],  to: [2, 18] },
  { name: "Poissons",   symbol: "♓", image: null, from: [2, 19],  to: [3, 20] },
  { name: "Bélier",     symbol: "♈", image: null, from: [3, 21],  to: [4, 19] },
  { name: "Taureau",    symbol: "♉", image: null, from: [4, 20],  to: [5, 20] },
  { name: "Gémeaux",    symbol: "♊", image: null, from: [5, 21],  to: [6, 20] },
  { name: "Cancer",     symbol: "♋", image: null, from: [6, 21],  to: [7, 22] },
  { name: "Lion",       symbol: "♌", image: null, from: [7, 23],  to: [8, 22] },
  { name: "Vierge",     symbol: "♍", image: null, from: [8, 23],  to: [9, 22] },
  { name: "Balance",    symbol: "♎", image: null, from: [9, 23],  to: [10, 22] },
  { name: "Scorpion",   symbol: "♏", image: null, from: [10, 23], to: [11, 21] },
  { name: "Sagittaire", symbol: "♐", image: null, from: [11, 22], to: [12, 21] },
];

export function getZodiacSign(birthDate) {
  if (!birthDate) return null;
  const parts = birthDate.split("-");
  if (parts.length !== 3) return null;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  if (!month || !day) return null;

  for (const sign of SIGNS) {
    const [fm, fd] = sign.from;
    const [tm, td] = sign.to;
    if (fm === tm && month === fm && day >= fd && day <= td) return sign;
    if (fm !== tm) {
      if (month === fm && day >= fd) return sign;
      if (month === tm && day <= td) return sign;
    }
  }
  return null;
}
