(function () {
  "use strict";

  const pages = {
    home: {
      href: "index.html",
      label: "Home",
      sections: [
        ["overview", "Overview"],
        ["why-gundam", "Why GUNDAM?"],
        ["lineage", "Lineage and Legacy"],
        ["experiments", "Experiments"],
        ["publications", "Publications"],
        ["posters", "Posters"],
        ["talks", "Talks"],
        ["license", "License"]
      ]
    },
    install: {
      href: "install.html",
      label: "How to Install",
      sections: [
        ["requirements", "Requirements"],
        ["quick-start", "Quick Start"],
        ["standard-build", "Standard Build"],
        ["development-setup", "Development Setup"],
        ["platform-guides", "Platform Guides"],
        ["troubleshooting", "Troubleshooting"]
      ]
    },
    tutorials: {
      href: "tutorials.html",
      label: "Tutorials",
      sections: [
        ["start", "Start Here"],
        ["inputs", "Input Examples"],
        ["configuration", "Configuration"],
        ["first-fit", "Run a First Fit"],
        ["diagnostics", "Fit Diagnostics"],
        ["advanced", "Advanced Workflows"]
      ]
    },
    documentation: {
      href: "documentation.html",
      label: "Documentation",
      sections: [
        ["user-guide", "User Guide"],
        ["configuration-reference", "Configuration Reference"],
        ["applications", "Applications"],
        ["developers", "For Developers"],
        ["faq", "FAQs"],
        ["resources", "Resources"]
      ]
    },
    collaboration: {
      href: "collaboration.html",
      label: "Collaboration",
      sections: [
        ["mission", "Mission"],
        ["participation", "Participation"],
        ["contributors", "Contributors"],
        ["development", "Development Policy"],
        ["governance", "Governance"],
        ["join", "Get Involved"]
      ]
    },
    contact: {
      href: "contact.html",
      label: "Contact Us",
      sections: [
        ["support", "User Support"],
        ["bugs", "Report a Bug"],
        ["features", "Request a Feature"],
        ["contribute", "Contribute"],
        ["before-posting", "Before Posting"]
      ]
    },
    releases: {
      href: "releases.html",
      label: "Releases",
      sections: [
        ["latest", "Latest Release"],
        ["install-release", "Install a Release"],
        ["versioning", "Versioning"],
        ["history", "Release History"],
        ["upgrade", "Upgrade Guidance"]
      ]
    }
  };

  const sourceUrl = "https://github.com/gundam-organization/gundam";
  const body = document.body;
  const currentPage = body.dataset.page || "home";

  function icon(name) {
    const paths = {
      menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      external: '<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>'
    };
    return `<svg aria-hidden="true" viewBox="0 0 24 24">${paths[name]}</svg>`;
  }

  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;

    const primaryLinks = Object.entries(pages).map(([key, page]) => {
      const current = key === currentPage ? ' aria-current="page"' : "";
      return `<a href="${page.href}"${current}>${page.label}</a>`;
    }).join("");

    host.innerHTML = `
      <a class="skip-link" href="#main-content">Skip to content</a>
      <div class="header-atmosphere" aria-hidden="true"></div>
      <div class="header-inner">
        <a class="brand" href="index.html" aria-label="GUNDAM home">
          <img src="assets/images/gundam-logo.png" alt="GUNDAM High Energy Physics">
        </a>
        <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-navigation">
          <span class="nav-toggle-icon">${icon("menu")}</span>
          <span>Menu</span>
        </button>
        <nav class="primary-navigation" id="primary-navigation" aria-label="Primary navigation">
          ${primaryLinks}
          <a class="source-link" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">
            Source ${icon("external")}
          </a>
        </nav>
      </div>`;

    const toggle = host.querySelector(".nav-toggle");
    const navigation = host.querySelector(".primary-navigation");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.querySelector(".nav-toggle-icon").innerHTML = icon(open ? "menu" : "close");
      navigation.classList.toggle("is-open", !open);
      body.classList.toggle("menu-open", !open);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) {
        toggle.setAttribute("aria-expanded", "false");
        navigation.classList.remove("is-open");
        body.classList.remove("menu-open");
      }
    });
  }

  function renderSideNavigation() {
    const host = document.getElementById("section-navigation");
    const page = pages[currentPage];
    if (!host || !page) return;

    host.innerHTML = `
      <div class="section-nav-inner">
        <p class="section-nav-title">On this page</p>
        <nav aria-label="Table of contents">
          ${page.sections.map(([id, label], index) => `
            <a href="#${id}"${index === 0 ? ' class="is-active" aria-current="location"' : ""}>
              <span>${label}</span>${icon("chevron")}
            </a>`).join("")}
        </nav>
      </div>`;

    const links = Array.from(host.querySelectorAll("a"));
    const sections = links.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (!visible.length) return;
      const id = visible[0].target.id;
      links.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-22% 0px -62% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    host.innerHTML = `
      <div class="footer-inner">
        <div>
          <p class="footer-name">GUNDAM</p>
          <p>Generalized and Unified Neutrino Data Analysis Methods</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="documentation.html">Documentation</a>
          <a href="contact.html">Contact</a>
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">GitHub ${icon("external")}</a>
        </nav>
      </div>
      <div class="footer-meta">
        <p>GUNDAM software is distributed under the GNU LGPL v2.1.</p>
        <p>Built as a static, accessible GitHub Pages site.</p>
      </div>`;
  }

  function setExternalLinkLabels() {
    document.querySelectorAll('main a[target="_blank"]').forEach((link) => {
      if (!link.querySelector("svg")) link.insertAdjacentHTML("beforeend", ` ${icon("external")}`);
    });
  }

  renderHeader();
  renderSideNavigation();
  renderFooter();
  setExternalLinkLabels();
})();

