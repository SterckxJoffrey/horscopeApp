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
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateText(data, answers) {
  const v = data.variants[0];

  const love = answersMap.amour[answers.amour];
  const work = answersMap.travail[answers.travail];
  const self = answersMap.bienEtre[answers.bienEtre];
  const mood = answersMap.futur[answers.futur];

  return `
${pick(v.intro)}
${pick(v.tones[mood] || [])}
${pick(v.love[love] || [])}
${pick(v.work[work] || [])}
${pick(v.wellbeing[self] || [])}
${pick(v.outro)}
`;
}