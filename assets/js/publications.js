/* Renders the full publication list from data/publications.json.
   Used by publications.html. No framework, no build. */
(function () {
  "use strict";
  const PUB_BASE = "pub/";

  const esc = (s) => (s || "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Homepages of Kun Xu's students / group members — applied across every paper
  // so their names link wherever they appear (merged with per-paper author_links).
  const AUTHOR_HOMES = {
    "Jiaqi Wu": "https://jiaoplusjuan.github.io/",
    "Xuejun Hu": "https://hoosus.github.io/",
    "Zhong Shi": "https://hercier.github.io/",
    "Zheng-Jun Du": "https://zhengjun-du.github.io/",
    "Shaokun Zheng": "https://github.com/Mike-Leo-Smith",
    "Di An": "https://github.com/111116",
    "Jinfan Lu": "https://github.com/LJFYC007",
    "Lifan Wu": "https://winmad.github.io/",
  };

  function resolveHref(link) {
    if (link.external || link.link_back) return link.href;
    return PUB_BASE + link.href;
  }

  function renderAuthors(pub) {
    let html = esc(pub.authors);
    // merge global student homepages with per-paper author links (per-paper wins)
    const links = Object.assign({}, AUTHOR_HOMES);
    (pub.author_links || []).forEach((al) => {
      if (al.name && al.url) links[al.name] = al.url;
    });
    // longest names first so a short name never matches inside a longer one
    Object.keys(links).sort((a, b) => b.length - a.length).forEach((name) => {
      const e = esc(name);
      html = html.replace(e, `<a href="${esc(links[name])}" target="_blank" rel="noopener">${e}</a>`);
    });
    return html.replace(/\bKun Xu\b/g, '<span class="me">Kun Xu</span>');
  }

  function pubNode(pub) {
    const el = document.createElement("article");
    const hasThumb = !!pub.teaser;
    el.className = "pub" + (hasThumb ? "" : " no-thumb");

    const thumb = hasThumb
      ? `<img class="pub-thumb" src="${esc(PUB_BASE + pub.teaser.href)}" alt="" loading="lazy"
             onerror="this.closest('.pub').classList.add('no-thumb');this.remove();">`
      : "";

    const links = (pub.links || []).map((l) => {
      const cls = l.link_back ? "lb" : "";
      const t = l.link_back ? ' title="hosted at cg.cs.tsinghua.edu.cn"' : "";
      return `<a class="${cls}" href="${esc(resolveHref(l))}" target="_blank" rel="noopener"${t}>${esc(l.label)}</a>`;
    }).join("");

    const bibBtn = pub.bibtex ? `<button class="bibtoggle" type="button">bibtex</button>` : "";
    const bibBox = pub.bibtex ? `<pre class="bibbox hidden">${esc(pub.bibtex)}</pre>` : "";

    const award = pub.award
      ? `<span class="pub-award" title="${esc(pub.award)}">🏆 ${esc(pub.award)}</span>` : "";

    el.innerHTML = `
      ${thumb}
      <div class="pub-body">
        <h3 class="pub-title2">${esc(pub.title)}</h3>
        ${award}
        <p class="pub-authors2">${renderAuthors(pub)}</p>
        <p class="pub-venue2">${esc(pub.venue)}</p>
        <div class="pub-links2">${links}${bibBtn}</div>
        ${bibBox}
      </div>`;

    if (pub.bibtex) {
      const b = el.querySelector(".bibtoggle");
      const box = el.querySelector(".bibbox");
      b.addEventListener("click", () => box.classList.toggle("hidden"));
    }
    el._hay = (pub.title + " " + pub.authors + " " + pub.venue + " " + pub.year).toLowerCase();
    return el;
  }

  // Papers before CUTOFF are collapsed behind a button so the page doesn't load
  // ~30 older teaser images up front. Searching auto-reveals them.
  const CUTOFF = 2020;
  const yearOf = (p) => parseInt(p.year) || 0;
  let allPubs = [], olderShown = false, applyFilter = null;

  function makeHead(year) {
    const h = document.createElement("div");
    h.className = "year-head";
    h.textContent = year;
    h._yearHead = true;
    return h;
  }
  function appendPubs(list, root) {
    let last = root._lastYear || null;
    list.forEach((p) => {
      if (p.year !== last) { root.appendChild(makeHead(p.year)); last = p.year; }
      root.appendChild(pubNode(p));
    });
    root._lastYear = last;
  }

  function showOlder(root) {
    if (olderShown) return;
    olderShown = true;
    const btn = document.getElementById("showOlderBtn");
    if (btn) btn.remove();
    appendPubs(allPubs.filter((p) => yearOf(p) < CUTOFF), root);
    if (applyFilter) applyFilter();
  }

  function render(root) {
    root.innerHTML = ""; root._lastYear = null; olderShown = false;
    appendPubs(allPubs.filter((p) => yearOf(p) >= CUTOFF), root);
    const older = allPubs.filter((p) => yearOf(p) < CUTOFF);
    if (older.length) {
      const btn = document.createElement("button");
      btn.id = "showOlderBtn";
      btn.className = "show-older";
      btn.type = "button";
      btn.textContent = `Show earlier papers (2006–${CUTOFF - 1}) — ${older.length} more`;
      btn.addEventListener("click", () => showOlder(root));
      root.appendChild(btn);
    }
  }

  function wireSearch(root) {
    const input = document.getElementById("pubSearch");
    const count = document.getElementById("pubCount");
    const total = allPubs.length;
    applyFilter = function () {
      const q = input.value.trim().toLowerCase();
      if (q && !olderShown) showOlder(root);      // searching covers older papers too
      let shown = 0;
      const items = [...root.children];
      items.forEach((n) => {
        if (n._yearHead || n._hay === undefined) return;   // skip year heads & the button
        const match = !q || n._hay.includes(q);
        n.classList.toggle("hidden", !match);
        if (match) shown++;
      });
      let seen = 0, head = null;
      items.forEach((n) => {
        if (n._yearHead) {
          if (head) head.classList.toggle("hidden", seen === 0);
          head = n; seen = 0;
        } else if (n._hay !== undefined && !n.classList.contains("hidden")) seen++;
      });
      if (head) head.classList.toggle("hidden", seen === 0);
      count.textContent = q ? `${shown} / ${total}` : `${total} papers`;
    };
    input.addEventListener("input", applyFilter);
    applyFilter();
  }

  const root = document.getElementById("pubList");
  fetch("data/publications.json")
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((pubs) => { allPubs = pubs; render(root); wireSearch(root); })
    .catch((e) => {
      root.innerHTML =
        `<p style="color:var(--text-faint)">Could not load publications (${esc(String(e))}). ` +
        `If viewing locally, serve over http (e.g. <code>python3 -m http.server</code>).</p>`;
    });
})();
