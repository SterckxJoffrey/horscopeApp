import data from './data.json';

const answersMap = {
  amour: {
    A: "passion",
    B: "stabilite",
    C: "profondeur",
    D: "liberte"
  },
  travail: {
    A: "ambition",
    B: "equilibre",
    C: "exploration",
    D: "repos"
  },
  bienEtre: {
    A: "aligne",
    B: "instable",
    C: "neglige",
    D: "perdu"
  },
  futur: {
    A: "confiant",
    B: "prudent",
    C: "incertain",
    D: "anxieux"
  }
};

function pick(arr) {
  // Sécurité au cas où l'élément est manquant ou n'est pas un tableau
  if (!arr || !Array.isArray(arr) || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * @param {Object} data - Ton fichier JSON enrichi
 * @param {Object} answers - Les réponses choisies (A, B, C, D)
 * @param {string} sign - Le signe de l'utilisateur (ex: "belier", "lion", etc.)
 */
export function generateText(data, answers, sign) {
  const v = data.variants[0];

  // On récupère les clés correspondantes aux réponses
  const love = answersMap.amour[answers.amour];
  const work = answersMap.travail[answers.travail];
  const self = answersMap.bienEtre[answers.bienEtre];
  const mood = answersMap.futur[answers.futur];

  // Normalisation du signe (au cas où il y aurait des majuscules)
  const userSign = sign.toLowerCase();

  return `
${pick(v.intro[userSign] || [])}
${pick(v.tones[mood] || [])}
${pick(v.love[love] || [])}
${pick(v.work[work] || [])}
${pick(v.wellbeing[self] || [])}
${pick(v.outro)}
`;
}