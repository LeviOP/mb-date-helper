import { addKnockoutButton } from "./knockoutDate";
import reactDialog from "./reactDialog";

const DIALOGS = [
    "external-link-attribute-dialog",
    "edit-relationship-dialog",
    "add-relationship-dialog"
];

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (!(node instanceof HTMLDivElement)) return;
            if (!DIALOGS.includes(node.id)) return;
            reactDialog(node);
        });
    });
});

observer.observe(document, {
    subtree: true,
    childList: true
});

const knockoutPartialDates = document.querySelectorAll<HTMLSpanElement>("span.partial-date");
knockoutPartialDates.forEach(addKnockoutButton);
