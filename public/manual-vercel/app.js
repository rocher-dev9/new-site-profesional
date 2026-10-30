(() => {
  const dialog = document.getElementById("finder");
  const input = document.getElementById("finder-input");
  const results = document.getElementById("finder-results");
  const sheets = [...document.querySelectorAll(".sheet")];

  const normalize = (text) =>
    text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  const escapeHtml = (text) =>
    text.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  // Separa celdas y párrafos, que textContent uniría sin espacio.
  const textOf = (node) => {
    const parts = node.querySelectorAll("th, td, li, p, figcaption, pre");
    const text = parts.length ? [...parts].map((p) => p.textContent).join(" ") : node.textContent;
    return text.replace(/\s+/g, " ");
  };

  // Cada entrada es un capítulo o un apartado, con el texto que contiene.
  const entries = sheets.flatMap((sheet) => {
    const chapter = sheet.querySelector("h2").textContent;
    const tab = sheet.querySelector(".sheet__tab").textContent;
    const list = [{ id: sheet.id, title: chapter, where: tab, level: 1, text: "" }];
    for (const node of sheet.querySelector(".sheet__body").children) {
      if (node.tagName === "H2") continue;
      if (node.tagName === "H3") {
        list.push({ id: node.id, title: node.textContent, where: chapter, level: 2, text: "" });
      } else {
        list[list.length - 1].text += ` ${textOf(node)}`;
      }
    }
    return list.map((e) => ({ ...e, search: normalize(`${e.title} ${e.text}`) }));
  });

  const snippet = (entry, term) => {
    const at = normalize(entry.text).indexOf(term);
    if (at < 0) return "";
    const start = Math.max(0, at - 60);
    const raw = entry.text.slice(start, at + term.length + 90).trim();
    const hit = normalize(raw).indexOf(term);
    if (hit < 0) return escapeHtml(raw);
    return `${start ? "… " : ""}${escapeHtml(raw.slice(0, hit))}<mark>${escapeHtml(
      raw.slice(hit, hit + term.length),
    )}</mark>${escapeHtml(raw.slice(hit + term.length))} …`;
  };

  const render = () => {
    const term = normalize(input.value.trim());
    if (!term) {
      results.innerHTML = `<ul>${entries
        .filter((e) => e.level === 1)
        .map((e) => `<li><a href="#${e.id}"><small>${escapeHtml(e.where)}</small><strong>${escapeHtml(e.title)}</strong></a></li>`)
        .join("")}</ul>`;
      return;
    }
    const matches = entries
      .filter((e) => e.search.includes(term))
      .sort((a, b) => normalize(b.title).includes(term) - normalize(a.title).includes(term))
      .slice(0, 40);
    if (!matches.length) {
      results.innerHTML = `<p>No hay resultados para «${escapeHtml(input.value.trim())}». Prueba con un término más corto o con el nombre de un producto.</p>`;
      return;
    }
    results.innerHTML = `<ul>${matches
      .map((e) => `<li><a href="#${e.id}"><small>${escapeHtml(e.where)}</small><strong>${escapeHtml(e.title)}</strong><span>${snippet(e, term)}</span></a></li>`)
      .join("")}</ul>`;
  };

  const open = () => {
    input.value = "";
    render();
    dialog.showModal();
    input.focus();
  };

  document.getElementById("finder-open").addEventListener("click", open);
  input.addEventListener("input", render);
  results.addEventListener("click", (event) => {
    if (event.target.closest("a")) dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "/" && !dialog.open && !event.target.closest("input, textarea")) {
      event.preventDefault();
      open();
    }
  });

  document.addEventListener("click", async (event) => {
    const button = event.target.closest(".code__copy");
    if (!button) return;
    const code = button.closest(".code").querySelector("pre").textContent;
    try {
      await navigator.clipboard.writeText(code);
      button.textContent = "Copiado";
    } catch {
      button.textContent = "No se pudo copiar";
    }
    setTimeout(() => { button.textContent = "Copiar"; }, 1600);
  });

  // Marca en el canto derecho la parte que se está leyendo.
  const railLinks = [...document.querySelectorAll("[data-rail]")];
  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        const part = change.target.id === "control-del-documento" ? null : change.target.dataset.part;
        railLinks.forEach((link) => {
          if (link.dataset.rail === part) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  sheets.forEach((sheet) => observer.observe(sheet));
})();
