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

function renderPillarTable(chart) {
  const pillars = chart.pillars;
  const header = pillars
    .map((pillar) => `<th class="pillar-head pillar-${escapeHtml(pillar.key)}">${escapeHtml(pillar.pillarLabel)}</th>`)
    .join("");
  const row = (label, selector) => `
    <tr>
      <th class="row-head">${escapeHtml(label)}</th>
      ${pillars.map((pillar) => `<td>${escapeHtml(selector(pillar))}</td>`).join("")}
    </tr>
  `;

  return `
    <section class="result-block chart-block">
      <div class="section-title">
        <h2>命式表</h2>
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
            ${row("通変星", (pillar) => pillar.tenGod)}
            ${row("蔵干通変", (pillar) => pillar.hiddenTenGod)}
            ${row("十二運", (pillar) => pillar.twelveStage)}
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

function renderMajorLuck(luck) {
  return `
    <section class="result-block luck-block major-luck-block">
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
    <section class="result-block luck-block annual-luck-block">
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

export function renderResult(target, { chart, majorLuck, annualLuck, profile }) {
  const birthTimeLabel = chart.input.unknownTime
    ? "出生時刻なし"
    : `${String(chart.input.hour).padStart(2, "0")}:${String(chart.input.minute).padStart(2, "0")}`;

  target.innerHTML = `
    <div class="app-preview-header">
      <div class="app-mark" aria-hidden="true">◇</div>
      <strong>四柱推命ツール</strong>
      <span class="app-gear" aria-hidden="true"></span>
    </div>
    <nav class="app-tabs" aria-label="表示切り替え">
      <span class="is-active">命式</span>
      <span>大運</span>
      <span>年運</span>
      <span>五行</span>
    </nav>
    <div class="result-summary">
      <div>
        <p class="eyebrow">鑑定対象</p>
        <h1>${formatDate(chart.date)} ${escapeHtml(birthTimeLabel)}</h1>
        <p>節入り: ${escapeHtml(chart.monthBoundary.name)} / 空亡: ${escapeHtml(chart.voidBranches.join("・"))}</p>
      </div>
      <div class="profile-badge">
        <span>流派設定</span>
        <strong>${escapeHtml(profile.name)}</strong>
      </div>
    </div>
    ${renderPillarTable(chart)}
    <div class="luck-grid">
      ${renderMajorLuck(majorLuck)}
      ${renderAnnualLuck(annualLuck)}
    </div>
    ${renderElementBalance(chart)}
    <section class="result-block">
      <div class="section-title">
        <h2>計算メモ</h2>
        <span>流派差分候補</span>
      </div>
      <ul class="notes-list">
        ${chart.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
      </ul>
    </section>
  `;
}
