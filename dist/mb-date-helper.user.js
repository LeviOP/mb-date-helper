// ==UserScript==
// @name         mb-date-helper
// @namespace    https://github.com/LeviOP
// @version      0.1.0
// @author       LeviOP
// @description  Userscript which assists in copy and pasting dates in MusicBrainz
// @license      GPL-3.0-only
// @downloadURL  https://raw.githubusercontent.com/LeviOP/mb-date-helper/main/dist/mb-date-helper.user.js
// @updateURL    https://raw.githubusercontent.com/LeviOP/mb-date-helper/main/dist/mb-date-helper.user.js
// @match        *://*.musicbrainz.org/*
// ==/UserScript==

(function () {
  'use strict';

  function createCopyButton(span) {
    const button = document.createElement("button");
    button.type = "button";
    button.innerText = "C";
    span.appendChild(button);
    button.addEventListener("click", () => {
      copyDate(span);
    });
  }
  async function copyDate(span) {
    const string = getDateString(span);
    await navigator.clipboard.writeText(string);
  }
  function getDateString(span) {
    var _a, _b, _c;
    const year = (_a = span.querySelector(".partial-date-year")) == null ? void 0 : _a.value;
    if (year === void 0)
      return "";
    const month = (_b = span.querySelector(".partial-date-month")) == null ? void 0 : _b.value;
    if (month === void 0)
      return "";
    const day = (_c = span.querySelector(".partial-date-day")) == null ? void 0 : _c.value;
    if (day === void 0)
      return "";
    const string = [
      year || (month || day ? "????" : ""),
      month || (day ? "??" : ""),
      day || ""
    ].filter(Boolean).join("-");
    return string;
  }
  function sanatizeDateRange(date) {
    if (date.startYear === "????")
      date.startYear = void 0;
    if (date.startMonth === "??")
      date.startMonth = void 0;
    if (date.startDay === "??")
      date.startDay = void 0;
    if (date.endYear === "????")
      date.endYear = void 0;
    if (date.endMonth === "??")
      date.endMonth = void 0;
    if (date.endDay === "??")
      date.endMonth = void 0;
    return date;
  }
  const HYPENATED_RANGE = /^\(?(?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?)?(?:(?: ?– (\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?| – ?)?)?\)?$/;
  const WORDED_SINGULAR = /^\(?(?:(?:in|on) (\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?|ended)\)?$/;
  const WORDED_RANGE = /^\(?(?:(from|until) (?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?))(?:(?: ?(?:until|to) (?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?))| to present)?\)?$/;
  function parseClipboard(text) {
    if (HYPENATED_RANGE.test(text)) {
      const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = HYPENATED_RANGE.exec(text);
      const date = {
        startYear,
        startMonth,
        startDay,
        endYear,
        endMonth,
        endDay,
        ended: Boolean(endYear === "????" && !endMonth && !endDay)
      };
      return sanatizeDateRange(date);
    } else if (WORDED_SINGULAR.test(text)) {
      const [, year, month, day] = WORDED_SINGULAR.exec(text);
      const date = {
        startYear: year,
        startMonth: month,
        startDay: day,
        endYear: year,
        endMonth: month,
        endDay: day,
        ended: !(year || month || day)
      };
      return sanatizeDateRange(date);
    } else if (WORDED_RANGE.test(text)) {
      const [, index, startYear, startMonth, startDay, endYear, endMonth, endDay] = WORDED_RANGE.exec(text);
      if (index === "from") {
        const date = {
          startYear,
          startMonth,
          startDay,
          endYear,
          endMonth,
          endDay,
          ended: Boolean(endYear === "????" && !endMonth && !endDay)
        };
        return sanatizeDateRange(date);
      } else {
        const date = {
          endYear: startYear,
          endMonth: startMonth,
          endDay: startDay,
          ended: true
        };
        return sanatizeDateRange(date);
      }
    }
    return null;
  }
  function getStartDate(date) {
    return {
      year: date.startYear,
      month: date.startMonth,
      day: date.startDay
    };
  }
  function getEndDate(date) {
    return {
      year: date.endYear,
      month: date.endMonth,
      day: date.endDay
    };
  }
  function getSingleDate(date) {
    if (date.startYear || date.startMonth || date.startDay)
      return getStartDate(date);
    return getEndDate(date);
  }
  function isSingleDate(date) {
    return (date.startYear || date.startMonth || date.startDay) !== void 0 && (date.endYear || date.endMonth || date.endDay) === void 0 && date.ended === false;
  }
  function addKnockoutButton(element) {
    createCopyButton(element);
    element.addEventListener("paste", (e) => {
      var _a;
      const text = ((_a = e.clipboardData) == null ? void 0 : _a.getData("text/plain")) ?? "";
      const date = parseClipboard(text);
      if (date === null)
        return;
      e.preventDefault();
      knockoutSetDate(element, date);
    });
  }
  function knockoutSetDate(element, date) {
    const singleDate = getSingleDate(date);
    setValueFromQuerySelector(element, "input.partial-date-year", singleDate.year ?? "");
    setValueFromQuerySelector(element, "input.partial-date-month", singleDate.month ?? "");
    setValueFromQuerySelector(element, "input.partial-date-day", singleDate.day ?? "");
  }
  function setValueFromQuerySelector(p, selector, value) {
    const element = p.querySelector(selector);
    if (element === null)
      return;
    element.value = value;
  }
  function reactDialog(element) {
    const partialDates = element.querySelectorAll("span.partial-date");
    if (partialDates === null)
      return;
    if (partialDates.length < 2)
      return;
    partialDates.forEach(createCopyButton);
    const copyRange = document.createElement("button");
    copyRange.type = "button";
    copyRange.innerText = "R";
    copyRange.addEventListener("click", async () => {
      const start = getDateString(partialDates[0]);
      const end = getDateString(partialDates[1]);
      const checkBox = element.querySelector("input#id-period\\.ended");
      if (checkBox === null)
        return;
      const string = start + " – " + (end === "" && checkBox.checked ? "????" : end);
      await navigator.clipboard.writeText(string);
    });
    partialDates[1].appendChild(copyRange);
    element.addEventListener("paste", (e) => {
      var _a;
      const text = ((_a = e.clipboardData) == null ? void 0 : _a.getData("text/plain")) ?? "";
      const date = parseClipboard(text);
      if (date === null)
        return;
      e.preventDefault();
      const startDate = getStartDate(date);
      reactSetDate(partialDates[0], startDate);
      const endDate = getEndDate(date);
      reactSetDate(partialDates[1], endDate);
      const checkBox = element.querySelector("input#id-period\\.ended");
      if (checkBox === null)
        return;
      reactSetChecked(checkBox, date.ended);
    });
    partialDates.forEach((span) => {
      span.addEventListener("paste", (e) => {
        var _a;
        const text = ((_a = e.clipboardData) == null ? void 0 : _a.getData("text/plain")) ?? "";
        const date = parseClipboard(text);
        if (date === null)
          return;
        if (!isSingleDate(date))
          return;
        e.preventDefault();
        e.stopPropagation();
        const singleDate = getSingleDate(date);
        reactSetDate(span, singleDate);
      });
    });
  }
  function reactSetDate(element, date) {
    reactSetValueFromQuerySelector(element, "input.partial-date-year", date.year ?? "");
    reactSetValueFromQuerySelector(element, "input.partial-date-month", date.month ?? "");
    reactSetValueFromQuerySelector(element, "input.partial-date-day", date.day ?? "");
  }
  function reactSetValueFromQuerySelector(p, selector, value) {
    var _a;
    const input = p.querySelector(selector);
    if (input === null)
      return;
    input.value = value;
    if (!("_valueTracker" in input))
      return;
    (_a = input._valueTracker) == null ? void 0 : _a.setValue(value === "" ? " " : "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }
  function reactSetChecked(input, checked) {
    if (checked !== input.checked)
      input.click();
  }
  const DIALOGS = [
    "external-link-attribute-dialog",
    "edit-relationship-dialog",
    "add-relationship-dialog"
  ];
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLDivElement))
          return;
        if (!DIALOGS.includes(node.id))
          return;
        reactDialog(node);
      });
    });
  });
  observer.observe(document, {
    subtree: true,
    childList: true
  });
  const knockoutPartialDates = document.querySelectorAll("span.partial-date");
  knockoutPartialDates.forEach(addKnockoutButton);

})();