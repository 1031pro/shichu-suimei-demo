import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { calculateChart } from "../src/engine/chart.js";
import { calculateAnnualLuck, calculateMajorLuck } from "../src/engine/luck.js";
import { calculateCompatibility } from "../src/engine/compatibility.js";

const input = {
  year: 1990,
  month: 1,
  day: 1,
  hour: 12,
  minute: 0,
  unknownTime: true,
  sex: "male",
};

const chart = calculateChart(input, setsuiri);
const majorLuck = calculateMajorLuck(chart, setsuiri, 2026);
const annualLuck = calculateAnnualLuck(chart, 2026, 10);

if (chart.pillars.length !== 3) throw new Error("unknownTime should hide the time pillar");
if (majorLuck.rows.length !== 10) throw new Error("major luck rows should be 10");
if (annualLuck.length !== 21) throw new Error("annual luck rows should be 21");

const partnerChart = calculateChart({ ...input, year: 1992, month: 6, day: 15 }, setsuiri);
const compatibility = calculateCompatibility(chart, partnerChart);
if (!compatibility.level || !compatibility.stemRelation) throw new Error("compatibility should return a diagnostic result");
if (compatibility.crossRelations.length !== 9) throw new Error("compatibility should compare all year, month, and day pillar pairs");
if (!compatibility.overallReading.core) throw new Error("compatibility should include an overall reading");

console.log(chart.pillars.map((pillar) => `${pillar.pillarLabel}:${pillar.stem}${pillar.branch}`).join(", "));
console.log(`majorLuck=${majorLuck.rows.length}, annualLuck=${annualLuck.length}`);
