import { SingleDate, createCopyButton, getDateString, getEndDate, getSingleDate, getStartDate, isSingleDate, parseClipboard } from "./common";

export default function(element: HTMLDivElement) {
    const partialDates = element.querySelectorAll<HTMLSpanElement>("span.partial-date");
    if (partialDates === null) return;
    if (partialDates.length < 2) return;

    partialDates.forEach(createCopyButton);

    const copyRange = document.createElement("button");
    copyRange.type = "button";
    copyRange.innerText = "R";
    copyRange.addEventListener("click", async () => {
        const start = getDateString(partialDates[0]);
        const end = getDateString(partialDates[1]);

        const checkBox = element.querySelector<HTMLInputElement>("input#id-period\\.ended");
        if (checkBox === null) return;

        const string = start + " – " + (end === "" && checkBox.checked ? "????" : end);
        await navigator.clipboard.writeText(string);
    });
    partialDates[1].appendChild(copyRange);

    element.addEventListener("paste", (e) => {
        const text = e.clipboardData?.getData("text/plain") ?? "";
        const date = parseClipboard(text);
        if (date === null) return;

        e.preventDefault();

        const startDate = getStartDate(date);
        reactSetDate(partialDates[0], startDate);

        const endDate = getEndDate(date);
        reactSetDate(partialDates[1], endDate);

        const checkBox = element.querySelector<HTMLInputElement>("input#id-period\\.ended");
        if (checkBox === null) return;
        reactSetChecked(checkBox, date.ended);
    });

    partialDates.forEach((span) => {
        span.addEventListener("paste", (e) => {
            const text = e.clipboardData?.getData("text/plain") ?? "";
            const date = parseClipboard(text);
            if (date === null) return;

            if (!isSingleDate(date)) return;

            e.preventDefault();
            e.stopPropagation();

            const singleDate = getSingleDate(date);
            reactSetDate(span, singleDate);
        });
    });
}

function reactSetDate(element: HTMLSpanElement, date: SingleDate) {
    reactSetValueFromQuerySelector(element, "input.partial-date-year", date.year ?? "");
    reactSetValueFromQuerySelector(element, "input.partial-date-month", date.month ?? "");
    reactSetValueFromQuerySelector(element, "input.partial-date-day", date.day ?? "");
}

function reactSetValueFromQuerySelector(p: HTMLElement, selector: string, value: string) {
    const input = p.querySelector<HTMLInputElement>(selector);
    if (input === null) return;
    input.value = value;
    if (!("_valueTracker" in input)) return;
    // @ts-expect-error: clear the interal value to force an actual change
    // If we're setting the value to nothing, make it something to force a change
    input._valueTracker?.setValue(value === "" ? " " : "");
    input.dispatchEvent(new Event("input", { bubbles: true }));
}

function reactSetChecked(input: HTMLInputElement, checked: boolean) {
    if (checked !== input.checked) input.click();
}
