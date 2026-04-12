// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import { transformerNotationHighlight, transformerNotationDiff } from "@shikijs/transformers";

// https://astro.build/config
export default defineConfig({
    site: "https://mszalewicz.github.io",
    base: "/docs",
    integrations: [mdx(), sitemap()],
    markdown: {
        shikiConfig: {
            theme: "github-light",
            transformers: [transformerNotationHighlight(), transformerNotationDiff()],
        },
    },
});
