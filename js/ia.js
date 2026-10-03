// ────────────────────────────────────────────────────────────────
// Roger Avellana — Página de Inteligencia Artificial
// Red neuronal, consola generativa, proceso y brillo de herramientas.
// Se carga solo en ia.html, después de main.js.
// ────────────────────────────────────────────────────────────────
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── IA: red neuronal animada en la cabecera ────────────────
  var neural = document.getElementById('neural-field');

  if (neural && neural.getContext) {
    var nctx = neural.getContext('2d');
    var nodes = [], NW = 0, NH = 0, nRunning = false, nRaf = 0, nInView = true;
    var mouse = { x: -9999, y: -9999 };
    var LINK = 140;

    function nResize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      NW = neural.clientWidth; NH = neural.clientHeight;
      neural.width = NW * dpr; neural.height = NH * dpr;
      nctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(110, Math.round(NW * NH / 11000));
      nodes = [];
      for (var k = 0; k < count; k++) {
        nodes.push({
          x: Math.random() * NW, y: Math.random() * NH,
          vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.8, hue: Math.random() < 0.18 ? 'peach' : 'lav',
          phase: Math.random() * 6.28
        });
      }
    }

    function nDraw(time) {
      var t = time / 1000;
      nctx.clearRect(0, 0, NW, NH);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduceMotion) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > NW) a.vx *= -1;
          if (a.y < 0 || a.y > NH) a.vy *= -1;
          // El cursor atrae ligeramente a los nodos cercanos
          var mdx = mouse.x - a.x, mdy = mouse.y - a.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
          if (md < 180 && md > 1) { a.x += mdx / md * 0.35; a.y += mdy / md * 0.35; }
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j];
          var dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            nctx.strokeStyle = 'rgba(143, 136, 255,' + ((1 - d / LINK) * 0.35).toFixed(3) + ')';
            nctx.lineWidth = 1;
            nctx.beginPath(); nctx.moveTo(a.x, a.y); nctx.lineTo(b.x, b.y); nctx.stroke();
          }
        }
        var mdist = Math.sqrt((mouse.x - a.x) * (mouse.x - a.x) + (mouse.y - a.y) * (mouse.y - a.y));
        if (mdist < 180) {
          nctx.strokeStyle = 'rgba(247, 185, 138,' + ((1 - mdist / 180) * 0.55).toFixed(3) + ')';
          nctx.beginPath(); nctx.moveTo(a.x, a.y); nctx.lineTo(mouse.x, mouse.y); nctx.stroke();
        }
        var glow = 0.55 + 0.45 * Math.sin(t * 1.6 + a.phase);
        nctx.fillStyle = a.hue === 'peach'
          ? 'rgba(247, 185, 138,' + glow.toFixed(2) + ')'
          : 'rgba(198, 168, 255,' + glow.toFixed(2) + ')';
        nctx.beginPath(); nctx.arc(a.x, a.y, a.r + (mdist < 120 ? 1.2 : 0), 0, 6.283); nctx.fill();
      }
    }

    function nFrame(time) {
      if (!nRunning) return;
      nDraw(time);
      nRaf = requestAnimationFrame(nFrame);
    }
    function nStart() { if (nRunning || reduceMotion) return; nRunning = true; nRaf = requestAnimationFrame(nFrame); }
    function nStop() { nRunning = false; cancelAnimationFrame(nRaf); }

    nResize();
    nDraw(0);
    var nTimer;
    window.addEventListener('resize', function () {
      clearTimeout(nTimer);
      nTimer = setTimeout(function () { nResize(); nDraw(performance.now()); }, 150);
    });
    var hero = neural.parentElement;
    hero.addEventListener('pointermove', function (e) {
      var r = neural.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', function () { mouse.x = mouse.y = -9999; });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        nInView = entries[0].isIntersecting;
        nInView ? nStart() : nStop();
      }).observe(neural);
    } else {
      nStart();
    }
    document.addEventListener('visibilitychange', function () {
      document.hidden || !nInView ? nStop() : nStart();
    });
  }

  // ─── IA: consola que escribe y "genera" respuestas ──────────
  var cPrompt = document.getElementById('console-prompt');

  if (cPrompt && !reduceMotion) {
    var cAnswer = document.getElementById('console-answer');
    var cStatus = document.getElementById('console-status');
    var cTokens = document.getElementById('console-tokens');
    var cModel = document.getElementById('console-model');
    var cBox = cPrompt.closest('.ai-console');
    var dialogs = [
      { model: 'claude', q: 'Propón tres conceptos para una marca de café de especialidad',
        a: '1. «Origen»: tipografía serif y tonos tierra. 2. «Ritual»: minimalismo cálido. 3. «Tueste»: contraste y textura.' },
      { model: 'chatgpt', q: 'Dame cinco titulares para lanzar una app de reservas',
        a: '«Reserva en 3 toques» · «Tu mesa te espera» · «Sin llamadas, sin esperas» · «El plan, resuelto» · «Hoy cenas fuera».' },
      { model: 'gemini', q: 'Resume las métricas de la campaña de septiembre',
        a: 'El alcance creció de forma sostenida; los carruseles superan al resto de formatos en guardados. Recomendación: más carruseles educativos.' },
      { model: 'claude', q: 'Revisa el tono de este copy para que suene más cercano',
        a: 'Cambiaría «Ofrecemos soluciones integrales» por «Te ayudamos de principio a fin». Más directo, más humano.' }
    ];
    var di = 0;

    function cWait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function cType(el, str, speed) {
      var n = 0;
      return new Promise(function (resolve) {
        (function step() {
          el.textContent = str.slice(0, ++n);
          if (n < str.length) setTimeout(step, speed + Math.random() * speed);
          else resolve();
        })();
      });
    }

    function cStream(str) {
      var words = str.split(' '), n = 0;
      return new Promise(function (resolve) {
        (function step() {
          n++;
          cAnswer.textContent = words.slice(0, n).join(' ');
          cTokens.textContent = Math.round(n * 1.4) + ' tokens';
          if (n < words.length) setTimeout(step, 70 + Math.random() * 90);
          else resolve();
        })();
      });
    }

    function cLoop() {
      var d = dialogs[di];
      cAnswer.textContent = '';
      cPrompt.textContent = '';
      cTokens.textContent = '0 tokens';
      cModel.textContent = d.model;
      cStatus.textContent = 'esperando instrucción';
      return cType(cPrompt, d.q, 28)
        .then(function () {
          cBox.classList.add('is-thinking');
          cStatus.textContent = 'pensando…';
          return cWait(900);
        })
        .then(function () {
          cStatus.textContent = 'generando';
          return cStream(d.a);
        })
        .then(function () {
          cBox.classList.remove('is-thinking');
          cStatus.textContent = 'respuesta lista';
          return cWait(3200);
        })
        .then(function () { di = (di + 1) % dialogs.length; return cLoop(); });
    }

    cWait(2200).then(function () { di = 1; cLoop(); });
  }

  // ─── IA: el proceso se ilumina al entrar en pantalla ────────
  var pipeline = document.querySelector('.ai-pipeline');
  if (pipeline) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var pObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { pipeline.classList.add('is-visible'); pObs.disconnect(); }
      }, { threshold: 0.3 });
      pObs.observe(pipeline);
    } else {
      pipeline.classList.add('is-visible');
    }
  }

  // ─── IA: brillo de las tarjetas siguiendo al cursor ─────────
  document.querySelectorAll('.ai-tool').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // ─── Automatización: pestañas del flujo ─────────────────────
  var flow = document.getElementById('ai-flow');
  if (flow) {
    var flows = [
      ['Nueva idea en el calendario editorial', 'Redacta borradores de copy y variantes por canal',
        'Ajusto tono, mensaje y diseño', 'Publicación programada en redes'],
      ['Cierre de mes de la campaña', 'Recopila los datos y resume las métricas clave',
        'Interpreto resultados y añado recomendaciones', 'Informe enviado al cliente'],
      ['Llega un brief por email o formulario', 'Extrae objetivos, público, plazos y entregables',
        'Valido el alcance y resuelvo dudas', 'Tareas creadas en el gestor de proyectos']
    ];
    var flowTexts = flow.querySelectorAll('.ai-node-text');
    var flowTabs = document.querySelectorAll('.ai-flow-tab');

    flowTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var k = Number(tab.getAttribute('data-flow'));
        flowTabs.forEach(function (x) { x.setAttribute('aria-selected', String(x === tab)); });
        flow.classList.add('is-switching');
        setTimeout(function () {
          flowTexts.forEach(function (el, n) { el.textContent = flows[k][n]; });
          flow.classList.remove('is-switching');
        }, reduceMotion ? 0 : 250);
      });
    });
  }

  // ─── Agentes: ejecución paso a paso ─────────────────────────
  var agent = document.getElementById('ai-agent');
  if (agent) {
    var agentSteps = agent.querySelectorAll('.ai-agent-log li');
    var agentRun = document.getElementById('ai-agent-run');
    var agentStatus = document.getElementById('ai-agent-status');
    var agentCount = document.getElementById('ai-agent-steps');
    var agentBusy = false;

    function setAgentDone(n) {
      agentSteps.forEach(function (li, k) {
        li.classList.toggle('is-done', k < n);
        li.classList.remove('is-running');
      });
      agentCount.textContent = n + ' / ' + agentSteps.length + ' pasos';
    }

    function runAgent() {
      if (agentBusy) return;
      agentBusy = true;
      agentRun.disabled = true;
      setAgentDone(0);
      agentStatus.textContent = 'ejecutando…';
      var k = 0;
      (function next() {
        if (k > 0) { agentSteps[k - 1].classList.remove('is-running'); agentSteps[k - 1].classList.add('is-done'); }
        agentCount.textContent = k + ' / ' + agentSteps.length + ' pasos';
        if (k === agentSteps.length) {
          agentStatus.textContent = 'esperando revisión humana';
          agentRun.textContent = '↻ Repetir';
          agentRun.disabled = false;
          agentBusy = false;
          return;
        }
        agentSteps[k].classList.add('is-running');
        k++;
        setTimeout(next, 750 + Math.random() * 500);
      })();
    }

    agentRun.addEventListener('click', runAgent);

    if (reduceMotion) {
      setAgentDone(agentSteps.length);
      agentStatus.textContent = 'esperando revisión humana';
      agentRun.textContent = '↻ Repetir';
    } else if ('IntersectionObserver' in window) {
      // Se ejecuta solo la primera vez que el agente entra en pantalla
      var aObs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { runAgent(); aObs.disconnect(); }
      }, { threshold: 0.4 });
      aObs.observe(agent);
    }
  }

})();
