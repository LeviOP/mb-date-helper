import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        monkey({
            entry: "src/main.ts",
            userscript: {
                namespace: "https://github.com/LeviOP",
                match: ["*://*.musicbrainz.org/*"],
                downloadURL: "https://raw.githubusercontent.com/LeviOP/mb-date-helper/main/dist/mb-date-helper.user.js",
                updateURL: "https://raw.githubusercontent.com/LeviOP/mb-date-helper/main/dist/mb-date-helper.user.js"
            }
        })
    ]
});
