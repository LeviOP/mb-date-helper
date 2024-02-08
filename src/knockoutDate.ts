import { DateRange, createCopyButton, getSingleDate, parseClipboard } from "./common";

export function addKnockoutButton(element: HTMLSpanElement) {
    createCopyButton(element);

    element.addEventListener("paste", (e) => {
        const text = e.clipboardData?.getData("text/plain") ?? "";
        const date = parseClipboard(text);
        if (date === null) return;
        e.preventDefault();
        knockoutSetDate(element, date);
    });
}

function knockoutSetDate(element: HTMLSpanElement, date: DateRange) {
    const singleDate = getSingleDate(date);
    setValueFromQuerySelector(element, "input.partial-date-year", singleDate.year ?? "");
    setValueFromQuerySelector(element, "input.partial-date-month", singleDate.month ?? "");
    setValueFromQuerySelector(element, "input.partial-date-day", singleDate.day ?? "");
}

function setValueFromQuerySelector(p: HTMLElement, selector: string, value: string) {
    const element = p.querySelector<HTMLInputElement>(selector);
    if (element === null) return;
    element.value = value;
}
