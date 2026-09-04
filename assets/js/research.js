/* Research page: curated themes, each pulling representative papers (and their
   real links) from data/publications.json so nothing drifts out of sync. */
(function () {
  "use strict";
  const PUB_BASE = "pub/";
  const esc = (s) => (s || "").replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const THEMES = [
    {
      name: "ReSTIR &amp; Real-Time Sample Reuse",
      teaser: "2026/restcv_teaser.png",
      blurb: "Reusing path samples across space and time in real-time path tracing — layering control variates on reservoir resampling, and shaping where the residual error lands so it is less visible.",
      titles: [
        "Spatio-Temporal Control Variates",
        "Blue Noise Dithering for Reservoir-based",
      ],
    },
    {
      name: "Walk on Spheres &amp; Monte Carlo PDE Solvers",
      teaser: "2026/gd_pde_teaser.webp",
      blurb: "Grid-free Monte Carlo solvers for partial differential equations, and how variance-reduction ideas from rendering — gradient-domain reconstruction in particular — carry over to them.",
      titles: [
        "Gradient-Domain Reconstruction for Monte Carlo",
      ],
    },
    {
      name: "Gradient-Domain Rendering &amp; Monte Carlo Denoising",
      teaser: "2024/filter_teaser.jpg",
      blurb: "Driving down variance and noise in physically based rendering — gradient-domain reconstruction, unbiased estimators, and learned denoising.",
      titles: [
        "Generalized Unbiased Reconstruction",
        "Filtering-Based Reconstruction",
        "Ensemble Denoising",
        "Adversarial Monte Carlo denoising",
      ],
    },
    {
      name: "Rendering Systems &amp; Frameworks",
      teaser: "2022LuisaRender/LUISA.png",
      blurb: "High-performance renderer architecture and GPU programming abstractions.",
      titles: ["LuisaRender", "GPU Coroutines"],
    },
    {
      name: "Real-Time &amp; Neural Rendering",
      teaser: "2022neuralGI/NGI.png",
      blurb: "Interactive global illumination, appearance, shadows, and inverse rendering — via analytic bases and neural predictors, including capturing and relighting real materials and scenes.",
      titles: [
        "Neural Global Illumination",
        "Kernel Predicting Neural Shadow Maps",
        "Generalized Spherical Harmonics Products",
        "Fast and Accurate Spherical Harmonics Products",
        "Anisotropic Spherical Gaussians",
        "Real-Time Neural Homogeneous Translucent",
        "Deferred Neural Lighting",
        "Deep Inverse Rendering",
      ],
    },
    {
      name: "Differentiable Rendering",
      teaser: "2024/DPM_teaser.jpg",
      blurb: "Inverse rendering by differentiating light transport — path gradients, manifold formulations, and optimal-transport objectives.",
      titles: [
        "Differentiable Photon Mapping",
        "Extended Path Space Manifolds",
        "Differentiable Rendering using RGBXY",
      ],
    },
    {
      name: "Image &amp; Video Editing / Recoloring",
      teaser: "2021videopalette/palette_teaser.jpg",
      blurb: "Palette-based recoloring, edit propagation, and learned retouching for images and video.",
      titles: [
        "Video Recoloring via Spatial-Temporal",
        "Fast Video Recoloring",
        "Neural Color Operators",
        "Palette-Based Content-Aware",
        "Efficient Affinity-based Edit Propagation",
      ],
    },
  ];

  function primaryLink(pub) {
    const ls = pub.links || [];
    const pref = ["project page", "paper", "doi"];
    for (const key of pref) {
      const m = ls.find((l) => l.label.toLowerCase().startsWith(key));
      if (m) return m;
    }
    return ls[0] || null;
  }
  function resolveHref(link) {
    if (!link) return null;
    if (link.external || link.link_back) return link.href;
    return PUB_BASE + link.href;
  }

  function render(pubs) {
    const byPrefix = (prefix) => pubs.find((p) => p.title.startsWith(prefix));
    const root = document.getElementById("themes");
    root.innerHTML = "";
    THEMES.forEach((t) => {
      const matched = t.titles.map(byPrefix).filter(Boolean);
      matched.sort((a, b) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0)); // newest first
      const papers = matched.map((p) => {
        const link = primaryLink(p);
        const href = resolveHref(link);
        const label = href
          ? `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(p.title)}</a>`
          : esc(p.title);
        const award = p.award ? ` <span class="theme-award" title="${esc(p.award)}">🏆</span>` : "";
        return `<li>${label} <span class="theme-yr">${esc(p.year)}</span>${award}</li>`;
      }).join("");
      const block = document.createElement("section");
      block.className = "theme";
      block.innerHTML = `
        <img class="theme-thumb" src="${esc(PUB_BASE + t.teaser)}" alt="" loading="lazy"
             onerror="this.style.visibility='hidden'">
        <div class="theme-body">
          <h2 class="theme-name">${t.name}</h2>
          <p class="theme-blurb">${t.blurb}</p>
          <ul class="theme-papers">${papers}</ul>
        </div>`;
      root.appendChild(block);
    });
  }

  fetch("data/publications.json")
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch((e) => {
      document.getElementById("themes").innerHTML =
        `<p style="color:var(--text-faint)">Could not load research data (${esc(String(e))}).</p>`;
    });
})();
