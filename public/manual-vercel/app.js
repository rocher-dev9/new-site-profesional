(() => {
  const dialog = document.getElementById("finder");
  const input = document.getElementById("finder-input");
  const results = document.getElementById("finder-results");
  const sheets = [...document.querySelectorAll(".sheet")];
  const railLinks = [...document.querySelectorAll("[data-rail]")];
  const hereTab = document.getElementById("here-tab");
  const hereTitle = document.getElementById("here-title");
  const progress = document.getElementById("progress");
  let currentSheet = null;
  let currentLink = null;

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
    const base = { sheet: sheet.id, part: sheet.dataset.part };
    const list = [{ ...base, id: sheet.id, title: chapter, where: tab, level: 1, text: "" }];
    for (const node of sheet.querySelector(".sheet__body").children) {
      if (node.tagName === "H2") continue;
      if (node.tagName === "H3") {
        list.push({ ...base, id: node.id, title: node.textContent, where: chapter, level: 2, text: "" });
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

  // Sin texto: los apartados del capítulo actual y luego todo el manual, por partes.
  const renderIndex = () => {
    const group = (name, items) => `<div class="finder__group">${escapeHtml(name)}</div><ul>${items.join("")}</ul>`;
    const here = entries.filter((e) => e.level === 2 && e.sheet === currentSheet?.id);
    const parts = new Map();
    for (const e of entries.filter((entry) => entry.level === 1)) {
      const name = e.id === "control-del-documento"
        ? e.where
        : railLinks.find((link) => link.dataset.rail === e.part).getAttribute("aria-label");
      const mark = e.sheet === currentSheet?.id ? ' aria-current="true"' : "";
      // El grupo ya dice la parte: aquí basta con el capítulo o el anexo.
      const where = e.where === name || e.where === e.title ? "" : e.where.replace(/^Parte \w+, c/, "C");
      const item = `<li><a href="#${e.id}"${mark}>${where ? `<small>${escapeHtml(where)}</small>` : ""}<strong>${escapeHtml(e.title)}</strong></a></li>`;
      parts.set(name, [...(parts.get(name) ?? []), item]);
    }
    results.innerHTML = [
      here.length ? group("En este capítulo", here.map((e) => `<li><a href="#${e.id}"><strong>${escapeHtml(e.title)}</strong></a></li>`)) : "",
      ...[...parts].map(([name, items]) => group(name, items)),
    ].join("");
  };

  const render = () => {
    const term = normalize(input.value.trim());
    if (!term) {
      renderIndex();
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
  document.getElementById("here").addEventListener("click", open);
  input.addEventListener("input", render);
  // Intro va al primer resultado; las flechas recorren la lista.
  dialog.addEventListener("keydown", (event) => {
    const links = [...results.querySelectorAll("a")];
    const at = links.indexOf(document.activeElement);
    if (event.key === "Enter" && event.target === input) {
      event.preventDefault();
      links[0]?.click();
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      links[at + 1]?.focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      (at > 0 ? links[at - 1] : input).focus();
    }
  });
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

  // Barra de avance y apartado que se está leyendo en el índice lateral.
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(window.scrollY / max, 1) : 0})`;

    let link = null;
    if (currentSheet) {
      const line = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 8;
      const passed = [...currentSheet.querySelectorAll(".sheet__body > h3")].filter((h) => h.getBoundingClientRect().top <= line);
      const last = passed[passed.length - 1];
      if (last) link = currentSheet.querySelector(`.sheet__toc a[href="#${last.id}"]`);
    }
    if (link === currentLink) return;
    currentLink?.removeAttribute("aria-current");
    link?.setAttribute("aria-current", "true");
    currentLink = link;
    const toc = link?.closest(".sheet__toc");
    if (toc && (link.offsetTop < toc.scrollTop || link.offsetTop + link.offsetHeight > toc.scrollTop + toc.clientHeight)) {
      toc.scrollTop = link.offsetTop - toc.clientHeight / 2;
    }
  };
  const requestUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);

  // Indica en la barra el capítulo actual; en la portada, el índice.
  const setCurrent = (sheet) => {
    currentSheet = sheet;
    const tab = sheet ? sheet.querySelector(".sheet__tab").textContent.replace(/^Parte \w+, capítulo /, "Cap. ") : "Manual";
    const title = sheet ? sheet.querySelector("h2").textContent : "Índice";
    hereTab.textContent = tab;
    hereTab.hidden = tab === title;
    hereTitle.textContent = title;
    requestUpdate();
  };

  // Marca en el canto derecho la parte que se está leyendo.
  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;
        setCurrent(change.target.classList.contains("sheet") ? change.target : null);
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
  observer.observe(document.querySelector(".cover"));
  requestUpdate();
})();
