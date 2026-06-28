import { setsuiri } from "../../data/setsuiri/setsuiri-1900-2200.js";
import { defaultProfile } from "./data/profile.js";
import { calculateChart } from "./engine/chart.js";
import { calculateAnnualLuck, calculateMajorLuck } from "./engine/luck.js";
import { renderResult } from "./ui/render.js";

const form = document.querySelector("#birth-form");
const resultPanel = document.querySelector("#results");
const yearSelect = document.querySelector("#birth-year");
const monthSelect = document.querySelector("#birth-month");
const daySelect = document.querySelector("#birth-day");
const hourSelect = document.querySelector("#birth-hour");
const minuteSelect = document.querySelector("#birth-minute");
const unknownTime = document.querySelector("#unknown-time");
const currentYearInput = document.querySelector("#current-year");

function option(value, label = value) {
  const element = document.createElement("option");
  element.value = String(value);
  element.textContent = String(label);
  return element;
}

function fillSelect(select, values, selected) {
  select.replaceChildren(...values.map((value) => option(value)));
  select.value = String(selected);
}

function updateDays() {
  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);
  const days = new Date(year, month, 0).getDate();
  const currentDay = Math.min(Number(daySelect.value || 1), days);
  fillSelect(daySelect, Array.from({ length: days }, (_, i) => i + 1), currentDay);
}

function setTimeControlsState() {
  const disabled = unknownTime.checked;
  hourSelect.disabled = disabled;
  minuteSelect.disabled = disabled;
}

function readInput() {
  const data = new FormData(form);
  return {
    year: Number(data.get("birthYear")),
    month: Number(data.get("birthMonth")),
    day: Number(data.get("birthDay")),
    hour: Number(data.get("birthHour") || 12),
    minute: Number(data.get("birthMinute") || 0),
    unknownTime: data.get("unknownTime") === "on",
    sex: data.get("sex") || "male",
    currentYear: Number(data.get("currentYear")),
  };
}

function calculateAndRender() {
  const input = readInput();
  const chart = calculateChart(input, setsuiri);
  const majorLuck = calculateMajorLuck(chart, setsuiri, input.currentYear);
  const annualLuck = calculateAnnualLuck(chart, input.currentYear, 10);
  renderResult(resultPanel, {
    chart,
    majorLuck,
    annualLuck,
    profile: defaultProfile,
  });
}

function initForm() {
  const today = new Date();
  fillSelect(yearSelect, Array.from({ length: 161 }, (_, i) => 1900 + i), 1990);
  fillSelect(monthSelect, Array.from({ length: 12 }, (_, i) => i + 1), 1);
  fillSelect(hourSelect, Array.from({ length: 24 }, (_, i) => i), 12);
  fillSelect(minuteSelect, Array.from({ length: 60 }, (_, i) => i), 0);
  currentYearInput.value = today.getFullYear();
  updateDays();
  setTimeControlsState();
}

yearSelect.addEventListener("change", updateDays);
monthSelect.addEventListener("change", updateDays);
unknownTime.addEventListener("change", setTimeControlsState);
form.addEventListener("submit", (event) => {
  event.preventDefault();
  calculateAndRender();
});

initForm();
calculateAndRender();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("Service worker registration failed", error);
    });
  });
}
