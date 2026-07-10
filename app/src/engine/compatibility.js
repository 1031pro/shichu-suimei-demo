const ELEMENTS = ["木", "火", "土", "金", "水"];
const STEM_COMBINATIONS = new Set(["甲己", "乙庚", "丙辛", "丁壬", "戊癸"]);
const BRANCH_RELATIONS = {
  六合: ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"],
  冲: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"],
  害: ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"],
};
const PILLAR_LABELS = { year: "年柱", month: "月柱", day: "日柱" };

function unorderedPair(first, second) {
  return `${first}${second}`;
}

function hasPair(pairs, first, second) {
  const pair = unorderedPair(first, second);
  return pairs.some((value) => value === pair || value === `${second}${first}`);
}

function elementRelation(from, to) {
  const offset = (ELEMENTS.indexOf(to) - ELEMENTS.indexOf(from) + 5) % 5;
  return ["比和", "生じる", "剋す", "生じられる", "剋される"][offset];
}

function relationSummary(relation, firstName, secondName) {
  const first = firstName ? `${firstName}さん` : "あなた";
  const second = secondName ? `${secondName}さん` : "お相手";
  const names = `${first}と${second}`;
  const text = {
    比和: "似た感覚や価値観を共有しやすく、対等な関係を作りやすい組み合わせです。",
    生じる: `${first}が${second}を後押ししやすい関係です。支え方が一方通行にならないよう、役割を言葉にすると安定します。`,
    生じられる: `${second}から${first}が力を受け取りやすい関係です。受け取るだけでなく、感謝や反応を返すことが関係を育てます。`,
    剋す: "考え方や進め方に違いが出やすい関係です。優劣ではなく、得意分野を分担できると刺激として活かせます。",
    剋される: "相手のペースや判断が強く感じられることがあります。境界線や期待値を早めに共有すると、無理のない関係に整えやすくなります。",
  };
  return `${names}は${text[relation]}`;
}

function balanceComplement(first, second) {
  const firstWeak = ELEMENTS.filter((element) => first.fiveElementBalance[element] === 0);
  const secondStrong = ELEMENTS.filter((element) => second.fiveElementBalance[element] >= 2);
  const supported = firstWeak.filter((element) => secondStrong.includes(element));
  if (supported.length) {
    return `${supported.join("・")}の要素は、1人目の命式で少なめな一方、2人目に目立ちます。異なる持ち味を補い合える余地があります。`;
  }
  return "五行の偏りは大きく補完し合う形ではありませんが、共通するペースや価値観を土台に関係を育てやすい組み合わせです。";
}

function branchSummary(relation, firstDay, secondDay) {
  const label = `${firstDay.branch}と${secondDay.branch}`;
  if (relation === "六合") {
    return `${label}は「六合」にあたります。日支は日常の距離感や、二人で過ごす時の居心地を読む際に重視される要素です。最初から説明しなくても気持ちが通じる場面が生まれやすく、生活リズムや小さな約束を共有するほど安心感が育ちます。`;
  }
  if (relation === "冲") {
    return `${label}は「冲」にあたります。近づく力がないという意味ではなく、互いの常識やペースを動かしやすい組み合わせです。相手を変えようとすると疲れやすいため、「違うから面白い」と扱い、譲れないことと任せられることを分けると関係の推進力になります。`;
  }
  if (relation === "害") {
    return `${label}は「害」にあたります。大きな衝突よりも、言葉にしない期待の違いが小さなすれ違いとして残りやすい関係です。「察してほしい」を少し減らし、予定・連絡頻度・お金など現実的なことほど先に共有すると、安心して付き合いやすくなります。`;
  }
  return `${label}の間には、特に強い結び付きやぶつかり合いを示す関係は出ていません。これは相性が薄いという意味ではなく、日干の関係や五行の偏りを手がかりに、二人に合う距離感をゆっくり作っていく組み合わせです。`;
}

function relationshipGuide(stemRelation, branchRelation, stemCombination) {
  const first = stemRelation === "剋す" || stemRelation === "剋される"
    ? "意見が食い違った時ほど、結論を急がず「何を大切にしているか」を一度たずねる"
    : "自然にできている助け合いを、言葉にして感謝として返す";
  const second = branchRelation === "冲" || branchRelation === "害"
    ? "予定・連絡頻度・一人の時間など、曖昧にしやすいルールを最初にすり合わせる"
    : "一緒に過ごす定番の時間や習慣を一つ作り、居心地のよさを積み重ねる";
  const third = stemCombination
    ? "惹かれ合う気持ちが強い分、相手の気持ちを決めつけず、節目ごとに本音を確認する"
    : "相手にない持ち味を直そうとせず、役割の違いとして頼り合う";
  return [first, second, third];
}

function getBranchRelation(first, second) {
  return Object.entries(BRANCH_RELATIONS).find(([, pairs]) => hasPair(pairs, first, second))?.[0] || "—";
}

function buildCrossPillarRelations(first, second) {
  const keys = ["year", "month", "day"];
  return keys.flatMap((firstKey) =>
    keys.map((secondKey) => {
      const firstPillar = first.pillarMap[firstKey];
      const secondPillar = second.pillarMap[secondKey];
      const stemCombination =
        STEM_COMBINATIONS.has(unorderedPair(firstPillar.stem, secondPillar.stem)) ||
        STEM_COMBINATIONS.has(unorderedPair(secondPillar.stem, firstPillar.stem));
      return {
        firstKey,
        secondKey,
        firstLabel: PILLAR_LABELS[firstKey],
        secondLabel: PILLAR_LABELS[secondKey],
        firstPillar,
        secondPillar,
        stemRelation: elementRelation(firstPillar.stemElement, secondPillar.stemElement),
        stemCombination,
        branchRelation: getBranchRelation(firstPillar.branch, secondPillar.branch),
      };
    }),
  );
}

function makeOverallReading(stemRelation, branchRelation, stemCombination, crossRelations) {
  const strongConnections = crossRelations.filter((item) => item.stemCombination || item.branchRelation === "六合");
  const tensionPoints = crossRelations.filter((item) => item.branchRelation === "冲" || item.branchRelation === "害");
  const core = stemRelation === "比和"
    ? "二人は根っこの感覚が近く、言葉にしなくても理解し合える部分を育てやすい関係です。"
    : stemRelation === "生じる" || stemRelation === "生じられる"
      ? "二人の間には、片方の持ち味がもう片方の行動や安心感を後押ししやすい流れがあります。"
      : "二人は同じやり方を選ぶより、違いを役割として認めた時に関係が豊かになる組み合わせです。";
  const connection = strongConnections.length
    ? `年・月・日柱を照合すると、結び付きとして読める関係が${strongConnections.length}か所あります。特に${strongConnections.slice(0, 2).map((item) => `${item.firstLabel}×${item.secondLabel}`).join("、")}は、二人が自然に歩調を合わせやすい場面です。`
    : "年・月・日柱の照合では、強い結び付きの記号は多くありません。だからこそ、関係の形を既成の相性に委ねず、二人らしいルールを作っていけます。";
  const tension = tensionPoints.length
    ? `一方で、${tensionPoints.slice(0, 2).map((item) => `${item.firstLabel}×${item.secondLabel}`).join("、")}には調整を要する関係が見られます。これは悪い印ではなく、生活の優先順位や伝え方を丁寧に扱うほど、理解を深める入口になります。`
    : "大きなぶつかり合いを示す関係は目立ちません。慣れによって会話を省略しすぎないことが、穏やかな関係を長く保つ鍵になります。";
  return { core, connection, tension };
}

export function calculateCompatibility(first, second) {
  const firstDay = first.pillarMap.day;
  const secondDay = second.pillarMap.day;
  const stemRelation = elementRelation(firstDay.stemElement, secondDay.stemElement);
  const branchRelation = getBranchRelation(firstDay.branch, secondDay.branch);
  const stemCombination =
    STEM_COMBINATIONS.has(unorderedPair(firstDay.stem, secondDay.stem)) ||
    STEM_COMBINATIONS.has(unorderedPair(secondDay.stem, firstDay.stem));

  const crossRelations = buildCrossPillarRelations(first, second);
  const points = (stemRelation === "比和" ? 2 : 0) + (stemRelation === "生じる" || stemRelation === "生じられる" ? 1 : 0) + (stemCombination ? 2 : 0) + (branchRelation === "六合" ? 2 : 0) - (branchRelation === "冲" ? 2 : 0) - (branchRelation === "害" ? 1 : 0);
  const level = points >= 3 ? "調和しやすい" : points <= -1 ? "工夫で育つ" : "個性を活かせる";

  return {
    level,
    firstDay,
    secondDay,
    stemRelation,
    stemCombination,
    branchRelation,
    crossRelations,
    overallReading: makeOverallReading(stemRelation, branchRelation, stemCombination, crossRelations),
    stemText: relationSummary(stemRelation, first.input.customerName, second.input.customerName),
    branchText: branchSummary(branchRelation, firstDay, secondDay),
    balanceText: balanceComplement(first, second),
    guide: relationshipGuide(stemRelation, branchRelation, stemCombination),
  };
}
