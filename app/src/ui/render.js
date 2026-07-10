function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatDateTime(date) {
  return `${formatDate(date)} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

const STEM_ELEMENT = {
  甲: "wood",
  乙: "wood",
  丙: "fire",
  丁: "fire",
  戊: "earth",
  己: "earth",
  庚: "metal",
  辛: "metal",
  壬: "water",
  癸: "water",
};

const BRANCH_ELEMENT = {
  寅: "wood",
  卯: "wood",
  巳: "fire",
  午: "fire",
  辰: "earth",
  戌: "earth",
  丑: "earth",
  未: "earth",
  申: "metal",
  酉: "metal",
  子: "water",
  亥: "water",
};

function elementClass(value) {
  const text = String(value);
  for (const char of text) {
    if (STEM_ELEMENT[char]) return `element-${STEM_ELEMENT[char]}`;
    if (BRANCH_ELEMENT[char]) return `element-${BRANCH_ELEMENT[char]}`;
  }
  return "";
}

function coloredCell(value, className = elementClass(value)) {
  return `<td class="${className}">${escapeHtml(value)}</td>`;
}

function renderPillarTable(chart, title = "命式表") {
  const displayOrder = ["time", "day", "month", "year"];
  const pillars = displayOrder.map((key) => chart.pillarMap[key]).filter(Boolean);
  const header = pillars
    .map((pillar) => `<th class="pillar-head pillar-${escapeHtml(pillar.key)}">${escapeHtml(pillar.pillarLabel)}</th>`)
    .join("");
  const row = (label, selector, classSelector = (value) => elementClass(value)) => `
    <tr>
      <th class="row-head">${escapeHtml(label)}</th>
      ${pillars
        .map((pillar) => {
          const value = selector(pillar);
          return coloredCell(value, classSelector(value, pillar));
        })
        .join("")}
    </tr>
  `;

  return `
    <section class="result-block chart-block">
      <div class="section-title">
        <h2>${escapeHtml(title)}</h2>
      </div>
      <div class="table-wrap">
        <table class="meishiki-table">
          <thead>
            <tr><th></th>${header}</tr>
          </thead>
          <tbody>
            ${row("天干", (pillar) => `${pillar.stem}（${pillar.stemElement}/${pillar.stemYinYang}）`)}
            ${row("地支", (pillar) => `${pillar.branch}（${pillar.branchElement}）`)}
            ${row("干支", (pillar) => pillar.kanshiLabel)}
            ${row("蔵干", (pillar) => pillar.hiddenStems.join("・"))}
            ${row("主蔵干", (pillar) => pillar.mainHiddenStem)}
            ${row("通変星", (pillar) => pillar.tenGod, () => "")}
            ${row("蔵干通変", (pillar) => pillar.hiddenTenGod, () => "")}
            ${row("十二運", (pillar) => pillar.twelveStage, () => "")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderElementBalance(chart) {
  const entries = Object.entries(chart.fiveElementBalance);
  const max = Math.max(...entries.map(([, count]) => count), 1);
  const elementMeta = {
    木: { className: "wood" },
    火: { className: "fire" },
    土: { className: "earth" },
    金: { className: "metal" },
    水: { className: "water" },
  };

  return `
    <section class="result-block balance-block">
      <div class="section-title">
        <h2>五行バランス</h2>
      </div>
      <div class="balance-list">
        ${entries
          .map(
            ([element, count]) => {
              const meta = elementMeta[element] || { className: "neutral", icon: "" };
              return `
              <div class="balance-row balance-${meta.className}">
                <strong>${escapeHtml(element)}</strong>
                <div class="balance-meter" aria-label="${escapeHtml(element)} ${count}">
                  <i style="width:${(count / max) * 100}%"></i>
                </div>
                <span>${count}</span>
              </div>
            `;
            },
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderInterpretation(interpretation) {
  return `
    <section id="interpretation-section" class="result-block interpretation-block">
      <div class="section-title">
        <h2>鑑定文</h2>
      </div>
      <div class="interpretation-list">
        ${interpretation
          .map(
            (item) => `
              <article>
                <h3>${escapeHtml(item.title)}</h3>
                <p>${escapeHtml(item.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderMajorLuck(luck) {
  return `
    <section id="major-luck-section" class="result-block luck-block major-luck-block">
      <div class="section-title">
        <h2>大運</h2>
        <span>${escapeHtml(luck.direction.label)}・開始 ${luck.start.age}歳</span>
      </div>
      <p class="subnote">
        起算: ${escapeHtml(luck.start.target.name)}（${formatDateTime(luck.start.target.date)}）までの日数を3で割って算出
      </p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>年齢</th>
              <th>期間</th>
              <th>干支</th>
              <th>通変星</th>
            </tr>
          </thead>
          <tbody>
            ${luck.rows
              .map(
                (row) => `
                  <tr class="${row.active ? "is-active" : ""}">
                    <td>${row.ageStart}-${row.ageEnd}歳</td>
                    <td>${row.yearStart}-${row.yearEnd}年</td>
                    <td>${escapeHtml(row.pillar.label)}</td>
                    <td>${escapeHtml(row.pillar.tenGod)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderAnnualLuck(rows) {
  return `
    <section id="annual-luck-section" class="result-block luck-block annual-luck-block">
      <div class="section-title">
        <h2>年運</h2>
        <span>前後10年</span>
      </div>
      <div class="table-wrap compact">
        <table>
          <thead>
            <tr>
              <th>年</th>
              <th>年齢</th>
              <th>干支</th>
              <th>通変星</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (row) => `
                  <tr class="${row.active ? "is-active" : ""}">
                    <td>${row.year}</td>
                    <td>${row.age}歳</td>
                    <td>${escapeHtml(row.pillar.label)}</td>
                    <td>${escapeHtml(row.pillar.tenGod)}</td>
                  </tr>
                `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCrossPillarTable(compatibility, firstName, secondName) {
  const rows = compatibility.crossRelations
    .map((item) => {
      const signals = [
        `五行：${item.stemRelation}`,
        item.stemCombination ? "干合" : "",
        item.branchRelation !== "—" ? `地支：${item.branchRelation}` : "",
      ].filter(Boolean).join(" ／ ");
      return `<tr>
        <td>${escapeHtml(item.firstLabel)}</td>
        <td>${escapeHtml(item.firstPillar.kanshiLabel)}<br><small>${escapeHtml(item.firstPillar.stem)}（${escapeHtml(item.firstPillar.stemElement)}）・${escapeHtml(item.firstPillar.branch)}</small></td>
        <td>${escapeHtml(item.secondLabel)}</td>
        <td>${escapeHtml(item.secondPillar.kanshiLabel)}<br><small>${escapeHtml(item.secondPillar.stem)}（${escapeHtml(item.secondPillar.stemElement)}）・${escapeHtml(item.secondPillar.branch)}</small></td>
        <td>${escapeHtml(signals)}</td>
      </tr>`;
    })
    .join("");
  return `<section class="result-block cross-pillar-block">
    <div class="section-title"><h2>柱ごとの照合一覧</h2><span>どことどこを読んだか</span></div>
    <p class="subnote">${escapeHtml(firstName)}の年・月・日柱と、${escapeHtml(secondName)}の年・月・日柱をすべて照合しています。五行関係に加えて、干合・地支の六合／冲／害が出た場所を表示します。</p>
    <div class="table-wrap cross-pillar-table">
      <table>
        <thead><tr><th>${escapeHtml(firstName)}</th><th>干支</th><th>${escapeHtml(secondName)}</th><th>干支</th><th>照合結果</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </section>`;
}

function renderCompatibility({ chart, partnerChart, compatibility }) {
  const firstName = chart.input.customerName || "あなた";
  const secondName = partnerChart.input.customerName || "お相手";
  const relationLabel = {
    比和: "同じ五行",
    生じる: "あなたが生じる",
    生じられる: "お相手が生じる",
    剋す: "あなたが剋す",
    剋される: "お相手が剋す",
  }[compatibility.stemRelation];
  const branchLabel = compatibility.branchRelation || "強い関係なし";
  const stemDetail = compatibility.stemCombination
    ? "さらに日干には干合があり、理屈より先に相手が気になる、互いの違いが印象に残るような引力として表れやすい組み合わせです。ただし、干合だけで「最高の相性」と決めるのではなく、日常の関係性と合わせて読むことが大切です。"
    : "この関係は、似ている部分だけで結び付くというより、二人の違いをどう役割に変えるかで魅力が深まりやすい組み合わせです。";
  const elementRows = Object.entries(chart.fiveElementBalance)
    .map(([element, firstValue]) => {
      const secondValue = partnerChart.fiveElementBalance[element];
      return `
        <div class="compatibility-element-row">
          <strong>${escapeHtml(element)}</strong>
          <div class="element-bar first" style="--amount:${firstValue}" aria-label="${escapeHtml(firstName)} ${escapeHtml(element)} ${firstValue}"><i></i><span>${firstValue}</span></div>
          <div class="element-bar second" style="--amount:${secondValue}" aria-label="${escapeHtml(secondName)} ${escapeHtml(element)} ${secondValue}"><i></i><span>${secondValue}</span></div>
        </div>`;
    })
    .join("");
  return `
    <div id="chart-section" class="app-preview-header">
      <div class="app-mark" aria-hidden="true">◇</div>
      <strong>四柱推命 相性診断</strong>
      <button type="button" class="date-edit-button" data-edit-input>入力を変更</button>
    </div>
    <div class="result-summary compatibility-summary">
      <div>
        <p class="eyebrow">相性の傾向</p>
        <h1>${escapeHtml(compatibility.level)}</h1>
        <p>${escapeHtml(firstName)}：${formatDate(chart.date)} ／ ${escapeHtml(secondName)}：${formatDate(partnerChart.date)}</p>
      </div>
    </div>
    <section class="result-block compatibility-map" aria-label="相性の見取り図">
      <div class="section-title"><h2>相性の見取り図</h2><span>どの要素同士を読んでいるか</span></div>
      <div class="compatibility-flow">
        <div class="compatibility-source">
          <span>${escapeHtml(firstName)}の生年月日</span>
          <strong>日柱</strong>
        </div>
        <div class="compatibility-links" aria-hidden="true"><i></i><i></i></div>
        <div class="compatibility-source">
          <span>${escapeHtml(secondName)}の生年月日</span>
          <strong>日柱</strong>
        </div>
      </div>
      <div class="compatibility-pair-grid">
        <div class="compatibility-pair">
          <span class="pair-label">日干 <small>本人の軸・価値観</small></span>
          <strong class="element-${elementClass(compatibility.firstDay.stem).replace("element-", "")}">${escapeHtml(compatibility.firstDay.stem)}<small>${escapeHtml(compatibility.firstDay.stemElement)}</small></strong>
          <b>${escapeHtml(relationLabel)}</b>
          <strong class="element-${elementClass(compatibility.secondDay.stem).replace("element-", "")}">${escapeHtml(compatibility.secondDay.stem)}<small>${escapeHtml(compatibility.secondDay.stemElement)}</small></strong>
        </div>
        <div class="compatibility-pair">
          <span class="pair-label">日支 <small>日常・距離感</small></span>
          <strong>${escapeHtml(compatibility.firstDay.branch)}</strong>
          <b>${escapeHtml(branchLabel)}</b>
          <strong>${escapeHtml(compatibility.secondDay.branch)}</strong>
        </div>
      </div>
      <div class="compatibility-balance-map">
        <div class="balance-map-head"><span>五行バランス <small>年・月・日柱の天干と地支</small></span><b>${escapeHtml(firstName)}</b><b>${escapeHtml(secondName)}</b></div>
        ${elementRows}
      </div>
    </section>
    <section class="result-block compatibility-block">
      <div class="section-title"><h2>日干の五行関係</h2><span>見取り図の日干：${escapeHtml(compatibility.firstDay.stem)} × ${escapeHtml(compatibility.secondDay.stem)}</span></div>
      <p>${escapeHtml(compatibility.stemText)}</p>
      <p>${escapeHtml(stemDetail)}</p>
    </section>
    <section class="result-block compatibility-block">
      <div class="section-title"><h2>日支の関係</h2><span>見取り図の日支：${escapeHtml(compatibility.firstDay.branch)} × ${escapeHtml(compatibility.secondDay.branch)}</span></div>
      <p>${escapeHtml(compatibility.branchText)}</p>
    </section>
    <section class="result-block compatibility-block">
      <div class="section-title"><h2>五行バランスの補完</h2></div>
      <p>${escapeHtml(compatibility.balanceText)}</p>
    </section>
    <section class="result-block compatibility-block overall-reading-block">
      <div class="section-title"><h2>総合所見</h2><span>年・月・日柱の照合から読む関係性</span></div>
      <p>${escapeHtml(compatibility.overallReading.core)}</p>
      <p>${escapeHtml(compatibility.overallReading.connection)}</p>
      <p>${escapeHtml(compatibility.overallReading.tension)}</p>
    </section>
    ${renderCrossPillarTable(compatibility, firstName, secondName)}
    <section class="compatibility-chart-grid" aria-label="二人の命式">
      ${renderPillarTable(chart, `${firstName}の命式`)}
      ${renderPillarTable(partnerChart, `${secondName}の命式`)}
    </section>
    <section class="result-block compatibility-block compatibility-guide">
      <div class="section-title"><h2>二人の関係を育てるヒント</h2></div>
      <p>相性は「良い・悪い」だけで決まるものではなく、二人の持ち味をどう扱うかで表れ方が変わります。今回の命式では、次の3点を意識すると関係の強みを活かしやすくなります。</p>
      <ol>${compatibility.guide.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
    <section class="result-block compatibility-scope">
      <div class="section-title"><h2>鑑定範囲と補足</h2></div>
      <p>この診断は、生年月日から算出した年柱・月柱・日柱を用いた相性鑑定です。出生時刻が分かる場合は時柱を加え、用神・忌神、格局、蔵干を含む合冲刑害、大運・年運の重なりまで読むことで、より個別性の高い鑑定になります。</p>
    </section>
  `;
}

export function renderResult(target, { mode = "chart", chart, partnerChart, compatibility, majorLuck, annualLuck, profile, interpretation = [] }) {
  if (mode === "compatibility") {
    target.innerHTML = renderCompatibility({ chart, partnerChart, compatibility });
    return;
  }
  const birthTimeLabel = chart.input.unknownTime
    ? "出生時刻なし"
    : `${String(chart.input.hour).padStart(2, "0")}:${String(chart.input.minute).padStart(2, "0")}`;

  target.innerHTML = `
    <div id="chart-section" class="app-preview-header">
      <div class="app-mark" aria-hidden="true">◇</div>
      <strong>四柱推命ツール</strong>
      <button type="button" class="date-edit-button" data-edit-input>日付を変更</button>
    </div>
    <nav class="app-tabs" aria-label="表示切り替え">
      <button type="button" class="is-active" data-scroll-target="chart-section">命式</button>
      <button type="button" data-scroll-target="major-luck-section">大運</button>
      <button type="button" data-scroll-target="annual-luck-section">年運</button>
      <button type="button" data-scroll-target="balance-section">五行</button>
    </nav>
    <div class="result-summary">
      <div>
        <p class="eyebrow">鑑定対象</p>
        <h1>${formatDate(chart.date)} ${escapeHtml(birthTimeLabel)}</h1>
        <p>節入り: ${escapeHtml(chart.monthBoundary.name)} / 空亡: ${escapeHtml(chart.voidBranches.join("・"))}</p>
      </div>
    </div>
    ${renderPillarTable(chart)}
    <div class="luck-grid">
      ${renderMajorLuck(majorLuck)}
      ${renderAnnualLuck(annualLuck)}
    </div>
    <div id="balance-section">${renderElementBalance(chart)}</div>
    ${profile.fortuneText?.enabled ? renderInterpretation(interpretation) : ""}
    ${
      profile.pdfReport?.enabled
        ? `<button type="button" class="pdf-button" data-print-report>PDF鑑定書を作成</button>`
        : ""
    }
    <nav class="bottom-nav" aria-label="主要表示">
      <button type="button" class="is-active" data-scroll-target="chart-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        命式
      </button>
      <button type="button" data-scroll-target="major-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 18h14M7 15l5-9 5 9"/></svg>
        大運
      </button>
      <button type="button" data-scroll-target="annual-luck-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v3M17 4v3M5 9h14M6 6h12v14H6z"/></svg>
        年運
      </button>
      <button type="button" data-scroll-target="balance-section">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v18M4 12h16M6 6l12 12M18 6 6 18"/></svg>
        五行
      </button>
    </nav>
  `;
}
