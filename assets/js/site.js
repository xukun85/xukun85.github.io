/* Shared site chrome: injects the nav + footer into every page and wires the
   theme toggle. Keeps the 4 pages consistent without a build step. */
(function () {
  "use strict";

  // ---- theme (persisted, shared across pages) ----
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.setAttribute("data-theme", saved);
  function currentDark() {
    const t = root.getAttribute("data-theme");
    if (t) return t === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  const PAGES = [
    { href: "index.html", label: "Home" },
    { href: "research.html", label: "Research" },
    { href: "publications.html", label: "Publications" },
    { href: "awards.html", label: "Services & Awards" },
  ];

  // current page basename (default index.html)
  let here = location.pathname.split("/").pop() || "index.html";
  if (here === "") here = "index.html";

  function buildNav() {
    const nav = document.createElement("nav");
    nav.className = "nav";
    const links = PAGES.map((p) => {
      const active = p.href === here ? " active" : "";
      return `<a class="navlink${active}" href="${p.href}">${p.label}</a>`;
    }).join("");
    nav.innerHTML = `
      <div class="wrap">
        <a class="brand" href="index.html">Kun&nbsp;Xu <span class="brand-cn">徐昆</span></a>
        <div class="navlinks">${links}</div>
        <button class="theme-btn" id="themeBtn" title="Toggle light/dark" aria-label="Toggle theme"></button>
      </div>`;
    document.body.prepend(nav);

    const btn = nav.querySelector("#themeBtn");
    const paint = () => { btn.textContent = currentDark() ? "☀" : "☾"; };
    paint();
    btn.addEventListener("click", () => {
      const next = currentDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      paint();
    });
  }

  function buildFooter() {
    const f = document.createElement("footer");
    const yr = new Date().getFullYear();
    f.innerHTML = `
      <div class="wrap footer-grid">
        <div>© ${yr} Kun Xu · Dept. of Computer Science &amp; Technology, Tsinghua University</div>
      </div>`;
    document.body.appendChild(f);
  }

  buildNav();
  buildFooter();
})();
