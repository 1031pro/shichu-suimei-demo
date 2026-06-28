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
  const header = pillars.map((pillar) => `<th>${escapeHtml(pillar.pillarLabel)}</th>`).join("");
  const row = (label, selector) => `
    <tr>
      <th>${escapeHtml(label)}</th>
      ${pillars.map((pillar) => `<td>${escapeHtml(selector(pillar))}</td>`).join("")}
    </tr>
  `;

  return `
    <section class="result-block">
      <div class="section-title">
        <h2>命式</h2>
        <span>日干基準</span>
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
    木: {
      className: "wood",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 7c8 0 15 6 15 14 0 9-7 15-15 15S9 30 9 21C9 13 16 7 24 7Z"/><path d="M24 29v12M17 41h14M24 29l-7-7M24 29l8-9"/></svg>`,
    },
    火: {
      className: "fire",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M27 5c2 8 10 12 10 23 0 8-6 14-13 14S11 36 11 28c0-7 4-12 9-18 0 7 5 10 7 14 2-4 2-8 0-19Z"/><path d="M25 31c0 4-3 7-7 7 1 3 4 5 7 5 5 0 9-4 9-9 0-4-2-7-6-10 0 3-1 5-3 7Z"/></svg>`,
    },
    土: {
      className: "earth",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M5 38 18 14l8 12 5-7 12 19H5Z"/><path d="M15 38h18M20 31h8"/></svg>`,
    },
    金: {
      className: "metal",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4 39 19 24 44 9 19 24 4Z"/><path d="M9 19h30M18 19l6 25 6-25M18 19l6-15 6 15"/></svg>`,
    },
    水: {
      className: "water",
      icon: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 5c8 10 14 18 14 26 0 8-6 13-14 13s-14-5-14-13c0-8 6-16 14-26Z"/><path d="M17 31c1 4 4 6 8 6"/></svg>`,
    },
  };

  return `
    <section class="result-block">
      <div class="section-title">
        <h2>五行バランス</h2>
        <span>天干・地支</span>
      </div>
      <div class="balance-grid">
        ${entries
          .map(
            ([element, count]) => {
              const meta = elementMeta[element] || { className: "neutral", icon: "" };
              return `
              <div class="balance-card balance-${meta.className}">
                <div class="balance-icon">${meta.icon}</div>
                <div class="balance-copy">
                  <strong>${escapeHtml(element)}</strong>
                  <span>${count}</span>
                </div>
                <div class="balance-meter" aria-label="${escapeHtml(element)} ${count}">
                  <i style="width:${(count / max) * 100}%"></i>
                </div>
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
    <section class="result-block">
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
    <section class="result-block">
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
    <div class="result-summary">
      <div>
        <p class="eyebrow">Calculated chart</p>
        <h1>${formatDate(chart.date)} ${escapeHtml(birthTimeLabel)}</h1>
        <p>
          月柱の節入り: ${escapeHtml(chart.monthBoundary.name)} ${formatDateTime(chart.monthBoundary.date)}
          / 空亡: ${escapeHtml(chart.voidBranches.join("・"))}
        </p>
      </div>
      <div class="profile-badge">
        <span>Rule profile</span>
        <strong>${escapeHtml(profile.name)}</strong>
      </div>
    </div>
    ${renderPillarTable(chart)}
    ${renderElementBalance(chart)}
    ${renderMajorLuck(majorLuck)}
    ${renderAnnualLuck(annualLuck)}
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
