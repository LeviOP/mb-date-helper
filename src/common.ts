export function createCopyButton(span: HTMLSpanElement) {
    const button = document.createElement("button");
    button.type = "button";
    button.innerText = "C";
    span.appendChild(button);
    button.addEventListener("click", () => {
        copyDate(span);
    });
}

export async function copyDate(span: HTMLSpanElement) {
    const string = getDateString(span);
    await navigator.clipboard.writeText(string);
}

export function getDateString(span: HTMLSpanElement): string {
    const year = span.querySelector<HTMLInputElement>(".partial-date-year")?.value;
    if (year === undefined) return "";
    const month = span.querySelector<HTMLInputElement>(".partial-date-month")?.value;
    if (month === undefined) return "";
    const day = span.querySelector<HTMLInputElement>(".partial-date-day")?.value;
    if (day === undefined) return "";

    const string = [
        year || ((month || day) ? "????" : ""),
        month || (day ? "??" : ""),
        day || ""
    ].filter(Boolean).join("-");

    return string;
}

export interface DateRange {
    startYear?: string;
    startMonth?: string;
    startDay?: string;
    endYear?: string;
    endMonth?: string;
    endDay?: string;
    ended: boolean;
}

function sanatizeDateRange(date: DateRange): DateRange {
    if (date.startYear === "????") date.startYear = undefined;
    if (date.startMonth === "??") date.startMonth = undefined;
    if (date.startDay === "??") date.startDay = undefined;
    if (date.endYear === "????") date.endYear = undefined;
    if (date.endMonth === "??") date.endMonth = undefined;
    if (date.endDay === "??") date.endMonth = undefined;
    return date;
}

const HYPENATED_RANGE = /^\(?(?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?)?(?:(?: ?– (\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?| – ?)?)?\)?$/;
const WORDED_SINGULAR = /^\(?(?:(?:in|on) (\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?|ended)\)?$/;
const WORDED_RANGE = /^\(?(?:(from|until) (?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?))(?:(?: ?(?:until|to) (?:(\d{4}|\?{4})(?:-(\d{1,2}|\?{2}))?(?:-(\d{1,2}|\?{2}))?))| to present)?\)?$/;

export function parseClipboard(text: string): DateRange | null {
    if (HYPENATED_RANGE.test(text)) {
        const [, startYear, startMonth, startDay, endYear, endMonth, endDay] = HYPENATED_RANGE.exec(text) as RegExpExecArray;
        const date: DateRange = {
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
        const [, year, month, day] = WORDED_SINGULAR.exec(text) as RegExpExecArray;
        const date: DateRange = {
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
        const [, index, startYear, startMonth, startDay, endYear, endMonth, endDay] = WORDED_RANGE.exec(text) as RegExpExecArray;
        if (index === "from") {
            const date: DateRange = {
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
            const date: DateRange = {
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

export interface SingleDate {
    year?: string;
    month?: string;
    day?: string;
}

export function getStartDate(date: DateRange): SingleDate {
    return {
        year: date.startYear,
        month: date.startMonth,
        day: date.startDay
    };
}

export function getEndDate(date: DateRange): SingleDate {
    return {
        year: date.endYear,
        month: date.endMonth,
        day: date.endDay
    };
}

export function getSingleDate(date: DateRange): SingleDate {
    if (date.startYear || date.startMonth || date.startDay) return getStartDate(date);
    return getEndDate(date);
}

export function isSingleDate(date: DateRange): boolean {
    return ((date.startYear || date.startMonth || date.startDay) !== undefined && (date.endYear || date.endMonth || date.endDay) === undefined && date.ended === false);
}
