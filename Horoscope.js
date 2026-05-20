import dataFr from './data.json';
import dataNl from './data.nl.json';

const DATA_BY_LANG = { fr: dataFr, nl: dataNl };

const answersMap = {
  amour: { A: "passion", B: "stabilite", C: "profondeur", D: "liberte" },
  travail: { A: "ambition", B: "equilibre", C: "exploration", D: "repos" },
  bienEtre: { A: "aligne", B: "instable", C: "neglige", D: "perdu" },
  futur: { A: "confiant", B: "prudent", C: "incertain", D: "anxieux" },
};

const rand = (n) => Math.floor(Math.random() * Math.max(1, n));

export function getData(language) {
  return DATA_BY_LANG[language] || dataFr;
}

export function pickIndices(answers, signKey, language = "fr") {
  const v = getData(language).variants[0];
  const sign = signKey.toLowerCase();
  const love = answersMap.amour[answers.amour];
  const work = answersMap.travail[answers.travail];
  const self = answersMap.bienEtre[answers.bienEtre];
  const mood = answersMap.futur[answers.futur];

  return {
    intro: rand((v.intro[sign] || []).length),
    tone: rand((v.tones[mood] || []).length),
    love: rand((v.love[love] || []).length),
    work: rand((v.work[work] || []).length),
    wellbeing: rand((v.wellbeing[self] || []).length),
    outro: rand((v.outro || []).length),
  };
}

export function composeText(answers, signKey, picks, language) {
  const v = getData(language).variants[0];
  const sign = signKey.toLowerCase();
  const love = answersMap.amour[answers.amour];
  const work = answersMap.travail[answers.travail];
  const self = answersMap.bienEtre[answers.bienEtre];
  const mood = answersMap.futur[answers.futur];

  const pickAt = (arr, idx) => {
    if (!Array.isArray(arr) || arr.length === 0) return "";
    return arr[idx % arr.length];
  };

  return [
    pickAt(v.intro[sign], picks.intro),
    pickAt(v.tones[mood], picks.tone),
    pickAt(v.love[love], picks.love),
    pickAt(v.work[work], picks.work),
    pickAt(v.wellbeing[self], picks.wellbeing),
    pickAt(v.outro, picks.outro),
  ]
    .filter(Boolean)
    .join("\n");
}

export function generateText(_data, answers, signKey, language = "fr") {
  const picks = pickIndices(answers, signKey, language);
  return composeText(answers, signKey, picks, language);
}
