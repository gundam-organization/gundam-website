# GUNDAM documentation sources

Each Markdown file here is one scrollable page of the website's
**Documentation** menu (`documentation.html?page=<id>`). The pages are rendered
in the browser by `assets/js/docs.js`, so editing a file and pushing to `main`
is enough to update the site.

## How a page is structured

- `#` is the page title (one per file).
- `##` headings are the **sub-sections** and `###` headings are the
  **sub-sub-sections**. The "On this page" bar on the right lists both levels.
  Deeper headings (`####` and below) show in the text only.
- To link to another page, use its file name plus the heading anchor, as you
  would on GitHub, for example `[Propagator](configuration.md#propagator-configuration)`.
  The anchor is the heading text in lower case, with punctuation removed and
  spaces turned into `-`.
- Put any images in a `docs/images/` folder and reference them as `images/<file>`.

## Adding or reordering pages

Pages and their order in the left bar come from `manifest.json`. To add a
page, create `<name>.md` here and add an entry with a unique `id`, the `file`
name, a `title`, and a one-line `description` to one of the groups.

## Local preview

Run `npm run dev` from the repository root and open
<http://localhost:4173/documentation.html>. Opening the HTML file directly from
disk does not work, because browsers block `fetch()` on `file://` pages.
