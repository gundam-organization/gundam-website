/*
 * GUNDAM documentation viewer.
 *
 * documentation.html            -> landing page listing every section
 * documentation.html?page=<id>  -> renders docs/<file>.md as one scrollable page
 *
 * The list of sections lives in docs/manifest.json. The left bar lists those
 * sections; the right bar ("On this page") lists the page's ## sub-sections
 * and ### sub-sub-sections and highlights the one being read.
 */
(function () {
  "use strict";

  const DOCS_DIR = "docs/";
  const MANIFEST_URL = DOCS_DIR + "manifest.json";
  const SOURCE_REPO = "https://github.com/gundam-organization/gundam-website";
  const RELEASES_API = "https://api.github.com/repos/gundam-organization/gundam/releases";
  const RELEASES_URL = "https://github.com/gundam-organization/gundam/releases";
  const TOC_LEVELS = ["H2", "H3"];
  const WIDE_TOC = window.matchMedia("(min-width: 1280px)");
  const MOBILE = window.matchMedia("(max-width: 900px)");

  const pageId = new URLSearchParams(window.location.search).get("page");
  const $ = (id) => document.getElementById(id);

  const ICONS = {
    chevron: '<path d="m9 18 6-6-6-6"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24">${ICONS[name]}</svg>`;

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);

  const pageHref = (id, hash) => `documentation.html?page=${encodeURIComponent(id)}${hash || ""}`;

  /* GitHub-compatible heading IDs, so "file.md#anchor" links written for
     GitHub also work here. Duplicates get -1, -2, ... like on GitHub. */
  function createSlugger() {
    const seen = new Set();
    return (text) => {
      const base = text.trim().toLowerCase()
        .replace(/[^\p{L}\p{M}\p{N}\p{Pc}\- ]/gu, "")
        .replace(/ /g, "-");
      let slug = base;
      let n = 0;
      while (seen.has(slug)) {
        n += 1;
        slug = `${base}-${n}`;
      }
      seen.add(slug);
      return slug;
    };
  }

  async function fetchText(url) {
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
    return response.text();
  }

  /* ---------------------------------------------------------------- left bar */

  function renderSectionNav(manifest, current) {
    const host = $("section-navigation");
    if (!host) return;
    const groups = manifest.groups.map((group) => `
      <p class="section-nav-group">${escapeHtml(group.title)}</p>
      ${group.pages.map((page) => {
        const active = current && page.id === current.id;
        return `<a href="${pageHref(page.id)}"${active ? ' class="is-active" aria-current="page"' : ""}>
            <span>${escapeHtml(page.title)}</span>${icon("chevron")}
          </a>`;
      }).join("")}`).join("");

    host.innerHTML = `
      <div class="section-nav-inner">
        <p class="section-nav-title"><a href="documentation.html">Documentation</a></p>
        <nav aria-label="Documentation sections">${groups}</nav>
      </div>`;

    // On narrow screens the bar scrolls sideways: bring the current entry into view.
    const active = host.querySelector("a.is-active");
    const inner = host.querySelector(".section-nav-inner");
    if (active && inner && inner.scrollWidth > inner.clientWidth) {
      inner.scrollLeft = active.offsetLeft - inner.clientWidth / 2 + active.offsetWidth / 2;
    }
  }

  /* ------------------------------------------------------------ landing page */

  function renderLanding(manifest) {
    const host = $("docs-landing-groups");
    if (!host) return;
    host.innerHTML = manifest.groups.map((group) => `
      <h3 class="docs-landing-group">${escapeHtml(group.title)}</h3>
      <div class="link-grid">
        ${group.pages.map((page) => `
          <a class="link-card" href="${pageHref(page.id)}">
            <h3>${escapeHtml(page.title)}</h3>
            <p>${escapeHtml(page.description || "")}</p>
            <span class="link-label">Open section</span>
          </a>`).join("")}
      </div>`).join("");
  }

  /* ------------------------------------------------------------ section page */

  function transformContent(root, pages) {
    const byFile = new Map(pages.map((p) => [p.file, p]));
    const slug = createSlugger();

    // Heading IDs (the H1 is counted too, as on GitHub) + hover anchor links.
    root.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach((heading) => {
      const text = heading.textContent;
      if (!heading.id) heading.id = slug(text);
      if (heading.tagName !== "H1") {
        heading.insertAdjacentHTML("beforeend",
          ` <a class="heading-anchor" href="#${heading.id}" aria-label="Link to ${escapeHtml(text.trim())}">${icon("link")}</a>`);
      }
    });

    // Links: other doc pages, in-page anchors, external sites.
    root.querySelectorAll("a[href]").forEach((link) => {
      const href = link.getAttribute("href");
      if (link.classList.contains("heading-anchor") || href.startsWith("#")) return;
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) {
        if (/^https?:/i.test(href)) {
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.insertAdjacentHTML("beforeend", ` ${icon("external")}`);
        }
        return;
      }
      const match = href.match(/^(?:\.\/)?([^?#]+\.md)(#.*)?$/);
      if (match && byFile.has(match[1])) {
        link.href = pageHref(byFile.get(match[1]).id, match[2]);
      } else if (!href.startsWith("/")) {
        link.href = DOCS_DIR + href;
      }
    });

    // Relative images live in docs/.
    root.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (!/^([a-z][a-z0-9+.-]*:|\/)/i.test(src)) img.src = DOCS_DIR + src;
      img.decoding = "async";
    });

    // Wide tables scroll sideways instead of stretching the page.
    root.querySelectorAll("table").forEach((table) => {
      const wrap = document.createElement("div");
      wrap.className = "table-wrap";
      table.replaceWith(wrap);
      wrap.appendChild(table);
    });

    // Copy buttons on code blocks.
    root.querySelectorAll("pre").forEach((pre) => {
      const wrap = document.createElement("div");
      wrap.className = "code-block";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "code-copy";
      button.innerHTML = `${icon("copy")}<span>Copy</span>`;
      button.addEventListener("click", () => copyCode(pre, button));
      wrap.appendChild(button);
    });
  }

  async function copyCode(pre, button) {
    const text = pre.innerText.replace(/\n$/, "");
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const range = document.createRange();
      range.selectNodeContents(pre);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
    const label = button.querySelector("span");
    label.textContent = "Copied";
    button.classList.add("is-done");
    setTimeout(() => {
      label.textContent = "Copy";
      button.classList.remove("is-done");
    }, 1600);
  }

  /* <div id="releases"></div> in the Markdown is filled with the GitHub
     release list, as on the previous documentation site. */
  async function fillReleases(root) {
    const host = root.querySelector("#releases");
    if (!host) return;
    host.classList.add("docs-releases");
    host.innerHTML = '<p class="docs-loading">Loading releases…</p>';
    let releases = null;
    try {
      const cached = JSON.parse(sessionStorage.getItem("gundam-releases") || "null");
      if (cached && Date.now() - cached.time < 3600e3) releases = cached.data;
    } catch (error) { /* storage unavailable */ }
    try {
      if (!releases) {
        const response = await fetch(RELEASES_API, { headers: { Accept: "application/vnd.github+json" } });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        releases = (await response.json()).map((r) => ({
          name: r.name || r.tag_name, tag: r.tag_name, url: r.html_url,
          date: r.published_at, prerelease: r.prerelease
        }));
        try {
          sessionStorage.setItem("gundam-releases", JSON.stringify({ time: Date.now(), data: releases }));
        } catch (error) { /* storage unavailable */ }
      }
      host.innerHTML = `<ul class="docs-release-list">${releases.map((r) => `
        <li>
          <span class="docs-release-name">${escapeHtml(r.name)}${r.prerelease ? ' <span class="tag">pre-release</span>' : ""}</span>
          <span class="docs-release-date">${r.date ? escapeHtml(new Date(r.date).toISOString().slice(0, 10)) : ""}</span>
          <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer">View release ${icon("external")}</a>
        </li>`).join("")}</ul>
        <p><a href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer">All releases on GitHub ${icon("external")}</a></p>`;
    } catch (error) {
      host.innerHTML = `<p>The release list could not be loaded right now. See the <a href="${RELEASES_URL}" target="_blank" rel="noopener noreferrer">GUNDAM releases on GitHub ${icon("external")}</a>.</p>`;
    }
  }

  /* ------------------------------------------------------------- right bar */

  function buildToc(root) {
    const toc = $("docs-toc");
    const toggle = $("docs-toc-toggle");
    const headings = Array.from(root.querySelectorAll(TOC_LEVELS.join(",").toLowerCase()));
    if (!toc || !headings.length) return [];

    let html = "";
    let openH2 = false;
    let openList = false;
    headings.forEach((heading) => {
      const label = escapeHtml(heading.textContent.trim());
      const link = `<a href="#${heading.id}" data-target="${heading.id}">${label}</a>`;
      if (heading.tagName === "H2") {
        if (openList) { html += "</ol>"; openList = false; }
        if (openH2) html += "</li>";
        html += `<li class="toc-h2">${link}`;
        openH2 = true;
      } else {
        if (!openList) { html += "<ol>"; openList = true; }
        html += `<li class="toc-h3">${link}</li>`;
      }
    });
    if (openList) html += "</ol>";
    if (openH2) html += "</li>";

    toc.innerHTML = `
      <div class="docs-toc-inner">
        <p class="docs-toc-title">On this page</p>
        <nav aria-label="Sub-sections of this page"><ol>${html}</ol></nav>
        <a class="docs-toc-top" href="#main-content">Back to top</a>
      </div>`;
    toc.hidden = false;
    if (toggle) toggle.hidden = false;
    return headings;
  }

  function stickyOffset() {
    const header = $("site-header");
    let offset = header ? header.offsetHeight : 0;
    const sections = $("section-navigation");
    if (MOBILE.matches && sections) offset += sections.offsetHeight;
    return offset + 36;
  }

  function setupScrollSpy(headings) {
    const toc = $("docs-toc");
    const scroller = toc.querySelector(".docs-toc-inner");
    const links = new Map(Array.from(toc.querySelectorAll("a[data-target]")).map((a) => [a.dataset.target, a]));
    let activeId = null;
    let locked = false;
    let unlockTimer = null;
    let ticking = false;

    function setActive(id) {
      if (id === activeId) return;
      activeId = id;
      links.forEach((link, target) => {
        const on = target === id;
        link.classList.toggle("is-active", on);
        if (on) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      toc.querySelectorAll("li.toc-h2").forEach((li) => {
        li.classList.toggle("is-current", !!li.querySelector('a[aria-current="location"]'));
      });
      // Keep the highlighted entry visible inside the (scrollable) bar.
      const link = links.get(id);
      if (link && scroller && scroller.scrollHeight > scroller.clientHeight) {
        const top = link.offsetTop; // .docs-toc-inner is position: relative
        if (top < scroller.scrollTop + 40 || top > scroller.scrollTop + scroller.clientHeight - 60) {
          scroller.scrollTop = top - scroller.clientHeight / 3;
        }
      }
    }

    function update() {
      ticking = false;
      if (locked) return;
      const offset = stickyOffset();
      let current = headings[0];
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top - offset <= 1) current = heading;
        else break;
      }
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (atBottom && headings[headings.length - 1].getBoundingClientRect().top > 0) {
        current = headings[headings.length - 1];
      }
      setActive(current.id);
    }

    window.addEventListener("scroll", () => {
      if (locked) {
        clearTimeout(unlockTimer);
        unlockTimer = setTimeout(() => { locked = false; }, 180);
        return;
      }
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });

    // A click highlights its entry immediately, even for short sections at the
    // bottom of the page that can never scroll up to the top.
    toc.addEventListener("click", (event) => {
      const link = event.target.closest("a[data-target]");
      if (!link) return;
      setActive(link.dataset.target);
      locked = true;
      clearTimeout(unlockTimer);
      unlockTimer = setTimeout(() => { locked = false; }, 900);
    });

    return { update, setActive };
  }

  function setupTocToggle() {
    const toc = $("docs-toc");
    const toggle = $("docs-toc-toggle");
    if (!toc || !toggle) return;
    toggle.innerHTML = `${icon("list")}<span>On this page</span>`;

    const close = () => {
      toc.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    };
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = !toc.classList.contains("is-open");
      toc.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
    });
    toc.addEventListener("click", (event) => {
      if (event.target.closest("a") && !WIDE_TOC.matches) close();
    });
    document.addEventListener("click", (event) => {
      if (!toc.contains(event.target) && event.target !== toggle) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
    WIDE_TOC.addEventListener("change", close);
  }

  function renderPager(page, pages) {
    const host = $("docs-pager");
    if (!host) return;
    const index = pages.findIndex((p) => p.id === page.id);
    const prev = pages[index - 1];
    const next = pages[index + 1];
    host.innerHTML = `
      ${prev ? `<a class="docs-pager-link prev" href="${pageHref(prev.id)}"><span class="docs-pager-dir">${icon("arrowLeft")} Previous</span><span class="docs-pager-title">${escapeHtml(prev.title)}</span></a>` : "<span></span>"}
      ${next ? `<a class="docs-pager-link next" href="${pageHref(next.id)}"><span class="docs-pager-dir">Next ${icon("arrowRight")}</span><span class="docs-pager-title">${escapeHtml(next.title)}</span></a>` : ""}`;
  }

  function scrollToHash() {
    if (!window.location.hash) return false;
    let target = null;
    try {
      target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
    } catch (error) { /* malformed hash */ }
    if (target) target.scrollIntoView({ block: "start", behavior: "instant" });
    return !!target;
  }

  function showError(message, file) {
    const content = $("docs-content");
    $("docs-title").textContent = "Page unavailable";
    content.innerHTML = `
      <div class="callout">
        <p><strong>This documentation page could not be loaded.</strong> ${escapeHtml(message)}</p>
        <p>If you opened the HTML file straight from disk, preview the site with <code>npm run dev</code> instead, because browsers block loading files from <code>file://</code> pages.</p>
        ${file ? `<p>You can also read the <a href="${SOURCE_REPO}/blob/main/docs/${encodeURIComponent(file)}" target="_blank" rel="noopener noreferrer">Markdown source on GitHub</a>.</p>` : ""}
        <p><a href="documentation.html">Back to all documentation sections</a></p>
      </div>`;
  }

  async function renderPage(page, pages) {
    const content = $("docs-content");
    $("docs-kicker").textContent = page.group;
    $("docs-title").textContent = page.title;
    $("docs-lede").textContent = page.description || "";
    document.title = `${page.title} | GUNDAM Documentation`;
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = canonical.href.split("?")[0] + `?page=${encodeURIComponent(page.id)}`;

    let markdown;
    try {
      markdown = await fetchText(DOCS_DIR + page.file);
    } catch (error) {
      showError(error.message, page.file);
      return;
    }
    if (!window.marked) {
      showError("The Markdown renderer (assets/js/vendor/marked.umd.js) did not load.", page.file);
      return;
    }

    const holder = document.createElement("div");
    holder.innerHTML = window.marked.parse(markdown, { gfm: true });
    transformContent(holder, pages);

    // The Markdown H1 becomes the page title in the hero.
    const h1 = holder.querySelector("h1");
    if (h1) {
      $("docs-title").textContent = h1.textContent.trim();
      h1.remove();
    }

    content.replaceChildren(...holder.childNodes);
    fillReleases(content);

    const edit = $("docs-edit");
    if (edit) {
      edit.innerHTML = `Spotted a problem on this page? <a href="${SOURCE_REPO}/blob/main/docs/${encodeURIComponent(page.file)}" target="_blank" rel="noopener noreferrer">Edit docs/${escapeHtml(page.file)} on GitHub ${icon("external")}</a>`;
      edit.hidden = false;
    }
    renderPager(page, pages);

    const headings = buildToc(content);
    let spy = null;
    if (headings.length) {
      spy = setupScrollSpy(headings);
      setupTocToggle();
    }

    // Jump to #anchor now that the content exists; repeat once images have
    // loaded (they can push the target down) unless the reader has scrolled.
    const jumped = scrollToHash();
    if (spy) spy.update();
    if (jumped) {
      let userMoved = false;
      const mark = () => { userMoved = true; };
      ["wheel", "touchstart", "keydown", "mousedown"].forEach((type) => window.addEventListener(type, mark, { once: true, passive: true }));
      const images = Array.from(content.querySelectorAll("img")).filter((img) => !img.complete);
      Promise.all(images.map((img) => new Promise((resolve) => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      }))).then(() => {
        if (!userMoved && images.length) scrollToHash();
      });
    }
  }

  function renderNotFound(id) {
    $("docs-kicker").textContent = "Documentation";
    $("docs-title").textContent = "Section not found";
    $("docs-content").innerHTML = `
      <div class="callout">
        <p>There is no documentation section called <code>${escapeHtml(id)}</code>. Pick a section from the list, or go back to the <a href="documentation.html">documentation overview</a>.</p>
      </div>`;
  }

  /* ------------------------------------------------------------------- init */

  async function init() {
    let manifest;
    try {
      manifest = JSON.parse(await fetchText(MANIFEST_URL));
    } catch (error) {
      if (pageId) showError(error.message);
      else if ($("docs-landing-groups")) $("docs-landing-groups").innerHTML = `<p>The section list could not be loaded (${escapeHtml(error.message)}).</p>`;
      return;
    }
    const pages = manifest.groups.flatMap((group) => group.pages.map((page) => ({ ...page, group: group.title })));
    const current = pageId ? pages.find((page) => page.id === pageId) : null;

    renderSectionNav(manifest, current);
    if (!pageId) {
      renderLanding(manifest);
    } else if (!current) {
      renderNotFound(pageId);
    } else {
      await renderPage(current, pages);
    }
  }

  init();
})();
