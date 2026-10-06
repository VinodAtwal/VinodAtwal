(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Theme
  --------------------------------------------------------- */

  var root = document.documentElement;
  var themeToggle = document.getElementById("themeToggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  function setTheme(next, persist) {
    root.setAttribute("data-theme", next);
    if (persist) {
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
    }
    if (themeMeta) {
      themeMeta.setAttribute("content", next === "dark" ? "#05070a" : "#f1f2ee");
    }
    if (themeToggle) {
      themeToggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  }

  function currentTheme() {
    return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(currentTheme() === "dark" ? "light" : "dark", true);
    });
  }

  var systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  var onSystemChange = function (e) {
    var stored = null;
    try { stored = localStorage.getItem("theme"); } catch (err) { /* ignore */ }
    if (!stored) setTheme(e.matches ? "dark" : "light", false);
  };
  if (systemDark.addEventListener) systemDark.addEventListener("change", onSystemChange);
  else if (systemDark.addListener) systemDark.addListener(onSystemChange);

  setTheme(currentTheme(), false);

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------------------------------------------------------
     Header: stuck state, scroll progress, mobile nav
  --------------------------------------------------------- */

  var topbar = document.getElementById("topbar");
  var progressBar = document.getElementById("progressBar");
  var nav = document.getElementById("nav");
  var navToggle = document.getElementById("navToggle");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (topbar) topbar.classList.toggle("stuck", y > 8);

    if (progressBar) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progressBar.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    ticking = false;
  }

  function requestScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestScroll, { passive: true });
  window.addEventListener("resize", requestScroll);
  onScroll();

  function setNav(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (navToggle) {
    navToggle.addEventListener("click", function () {
      setNav(navToggle.getAttribute("aria-expanded") !== "true");
    });
  }

  var navLinks = nav ? Array.prototype.slice.call(nav.querySelectorAll("a")) : [];

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () { setNav(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------------------------------------------------------
     Scroll-spy
  --------------------------------------------------------- */

  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"))
    .filter(function (s) { return s.id !== "top"; });
  var liveRegion = document.getElementById("navLive");
  var lastSpyId = null;

  var lastId = null;

  function setCurrent(id) {
    if (id === lastId) return;
    lastId = id;

    navLinks.forEach(function (link) {
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "true");
      else link.removeAttribute("aria-current");
    });

    if (liveRegion) liveRegion.textContent = id || "";
  }

  if (sections.length) {
    var spyMode = "observer";

    if ("IntersectionObserver" in window) {
      var visible = new Set();

      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        var pick = null;
        sections.forEach(function (section) {
          if (visible.has(section.id)) { pick = section.id; return; }
        });
        setCurrent(pick);
      }, { rootMargin: "-20% 0px -70% 0px", threshold: 0 });

      sections.forEach(function (section) { spy.observe(section); });
    } else {
      spyMode = "scroll";
    }

    /* The final section can sit entirely below the observer band, so at the
       document bottom force the last section to be current. */
    window.addEventListener("scroll", function () {
      var doc = document.documentElement;
      var atBottom = (window.innerHeight + window.scrollY) >= (doc.scrollHeight - 8);
      if (atBottom) setCurrent(sections[sections.length - 1].id);
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Reveal on scroll (gated on .js so content stays visible
     when JavaScript is unavailable)
  --------------------------------------------------------- */

  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealAll() {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealAll();
  } else {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry, i) {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = Math.min(i * 70, 280) + "ms";
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     Animated counters
  --------------------------------------------------------- */

  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));

  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";

    if (reduceMotion) { el.textContent = target + suffix; return; }

    var duration = 1100;
    var start = null;

    function frame(now) {
      if (start === null) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(runCounter);
    } else {
      var countObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          runCounter(entry.target);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.6 });

      counters.forEach(function (el) { countObserver.observe(el); });
    }
  }

  /* ---------------------------------------------------------
     Copy to clipboard
  --------------------------------------------------------- */

  var copyBtn = document.getElementById("copyEmail");
  var copyStatus = document.getElementById("copyStatus");
  var copyTimer = null;

  function announce(msg) {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    if (copyTimer) window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(function () { copyStatus.textContent = ""; }, 3200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      ok ? resolve() : reject(new Error("copy failed"));
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var email = copyBtn.getAttribute("data-email");
      copyText(email).then(function () {
        announce("Copied " + email + " to clipboard");
      }).catch(function () {
        announce("Couldn't copy automatically — the address is vinodatwal27@gmail.com");
      });
    });
  }

  /* ---------------------------------------------------------
     Live GitHub data (cached, with graceful fallback)
  --------------------------------------------------------- */

  var GH_USER = "VinodAtwal";
  var GH_CACHE_KEY = "gh-profile-cache";
  var GH_TTL = 6 * 60 * 60 * 1000;
  var ghState = { repos: null, followers: null, following: null, created: null, cached: false, error: false };

  function renderGh(source) {
    var set = function (key, value) {
      var el = document.querySelector('[data-gh="' + key + '"]');
      if (el && value !== null && value !== undefined) el.textContent = value;
    };

    set("repos", ghState.repos === null ? "—" : ghState.repos);
    set("followers", ghState.followers === null ? "—" : ghState.followers);
    set("following", ghState.following === null ? "—" : ghState.following);

    if (ghState.created) {
      try {
        var d = new Date(ghState.created);
        set("since", d.getUTCFullYear() + " (" + d.toLocaleDateString("en-GB", { month: "short" }) + ")");
      } catch (e) { set("since", "—"); }
    } else {
      set("since", "—");
    }

    var note = document.getElementById("ghNote");
    if (!note) return;

    if (ghState.error && !source) {
      note.textContent = "Live numbers are unavailable right now — GitHub's API is rate-limiting anonymous requests. The cards below are from the nightly workflow.";
    } else if (source === "cache") {
      note.textContent = "Showing cached numbers from an earlier visit.";
    } else {
      note.textContent = "Fetched live from api.github.com. Cached for 6 hours to respect GitHub's anonymous rate limit.";
    }
  }

  function loadGh() {
    var cached = null;
    try {
      var raw = localStorage.getItem(GH_CACHE_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch (e) { cached = null; }

    if (cached && cached.data && (Date.now() - cached.at) < GH_TTL) {
      ghState = cached.data;
      renderGh("cache");
      return;
    }

    if (!window.fetch) {
      ghState.error = true;
      renderGh(null);
      return;
    }

    window.fetch("https://api.github.com/users/" + GH_USER, {
      headers: { Accept: "application/vnd.github+json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    }).then(function (data) {
      ghState = {
        repos: data.public_repos,
        followers: data.followers,
        following: data.following,
        created: data.created_at,
        cached: false,
        error: false
      };
      try {
        localStorage.setItem(GH_CACHE_KEY, JSON.stringify({ at: Date.now(), data: ghState }));
      } catch (e) { /* private mode */ }
      renderGh("live");
    }).catch(function () {
      if (cached && cached.data) {
        ghState = cached.data;
        renderGh("cache");
      } else {
        ghState.error = true;
        renderGh(null);
      }
    });
  }

  loadGh();

  /* ---------------------------------------------------------
     Interactive terminal
  --------------------------------------------------------- */

  var termLog = document.getElementById("termLog");
  var termForm = document.getElementById("termForm");
  var termInput = document.getElementById("termInput");
  var termSuggest = document.getElementById("termSuggest");
  var termClock = document.getElementById("termClock");
  var replayBtn = document.getElementById("replay");

  if (termForm && termInput && termLog) {
    termForm.hidden = false;
    termLog.removeAttribute("aria-hidden");
    if (termSuggest) termSuggest.hidden = false;
  }

  /* ---- Bengaluru clock ---- */

  function tickClock() {
    if (!termClock) return;
    var now = new Date();
    var ist = new Date(now.getTime() + (now.getTimezoneOffset() + 330) * 60000);
    var days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var hh = String(ist.getHours()).padStart(2, "0");
    var mm = String(ist.getMinutes()).padStart(2, "0");
    var ss = String(ist.getSeconds()).padStart(2, "0");
    termClock.textContent = days[ist.getDay()] + " " + months[ist.getMonth()] + " " +
      ist.getDate() + " " + hh + ":" + mm + ":" + ss + " IST";
  }

  tickClock();
  window.setInterval(tickClock, 1000);

  /* ---- helpers ---- */

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function kbd(str) { return '<kbd>' + esc(str) + "</kbd>"; }

  function write(html, cls) {
    if (!termLog) return null;
    var el = document.createElement("div");
    el.className = "tline" + (cls ? " " + cls : "");
    el.innerHTML = html;
    termLog.appendChild(el);
    return el;
  }

  function echoCommand(cmd) {
    return '<span class="prompt">$</span> ' + esc(cmd);
  }

  function scrollTerm() {
    if (termLog && termLog.scrollHeight > termLog.clientHeight) {
      termLog.scrollTop = termLog.scrollHeight;
    }
  }

  function link(href, text) {
    return '<a class="tlink" href="' + esc(href) + '" target="_blank" rel="noopener noreferrer">' +
      esc(text) + "</a>";
  }

  function sectionLink(id, label) {
    return '<a class="tlink" href="#' + esc(id) + '" data-goto="' + esc(id) + '">' + esc(label) + "</a>";
  }

  /* ---- command implementations ---- */

  var COMMANDS = {

    help: function () {
      return [
        '<p class="tintro">Available commands:</p>',
        '<ul class="tcmds">',
        "<li>" + kbd("whoami") + " — who is behind this terminal</li>",
        "<li>" + kbd("about") + " — background, in three paragraphs' worth of lines</li>",
        "<li>" + kbd("experience") + " — the last eight years</li>",
        "<li>" + kbd("work") + " — open source repositories</li>",
        "<li>" + kbd("stack") + " — languages, frameworks and tooling</li>",
        "<li>" + kbd("writing") + " — engineering articles</li>",
        "<li>" + kbd("github") + " — live GitHub numbers</li>",
        "<li>" + kbd("contact") + " — email, location and profiles</li>",
        "<li>" + kbd("theme") + " — " + kbd("dark") + ", " + kbd("light") + " or " + kbd("toggle") + "</li>",
        "<li>" + kbd("open") + " " + kbd("<section>") + " — jump to a section</li>",
        "<li>" + kbd("ls") + " — list page sections</li>",
        "<li>" + kbd("neofetch") + " — the full system readout</li>",
        "<li>" + kbd("clear") + " — clear the scrollback</li>",
        "</ul>",
        '<p class="thint">Tip: press ' + kbd("Tab") + ' to autocomplete, ' + kbd("↑") + " / " + kbd("↓") +
          " for history, " + kbd("Esc") + " to close the menu.</p>"
      ].join("");
    },

    whoami: function () {
      return [
        '<dl class="tdl">',
        "<div><dt>name</dt><dd>Vinod Atwal</dd></div>",
        "<div><dt>role</dt><dd>Senior Software Engineer · DigiCert</dd></div>",
        "<div><dt>where</dt><dd>Bengaluru, India · IST</dd></div>",
        "<div><dt>focus</dt><dd>Secure SDLC tooling · PKI · identity platforms</dd></div>",
        "<div><dt>writes</dt><dd>Java and Go, mostly on AWS and Kubernetes</dd></div>",
        "</dl>"
      ].join("");
    },

    about: function () {
      return [
        "<p>I build distributed backend systems where correctness and trust are the whole point — the Secure SDLC " +
        "tooling behind release pipelines that can't ship unsigned code, identity platforms that hold at 100K+ " +
        "users, and signing services that stay fast under load.</p>",
        "<p>At DigiCert I develop a secure release manager, productised for premium enterprise customers — " +
        "tooling that generates SBOMs, CBOMs and SLSA attestations end to end, SAST scanning and " +
        "vulnerability detection with SARIF reports, VEX generation, and PQC, vulnerability management with policy-based " +
        "decisions — all backed by in-house PKI and signed attestations.</p>",
        "<p>I also build AI developer tooling — a project memory store pairing pgvector semantic search with " +
        "Tree-sitter AST parsing for method-level code resolution, and an agentic Jira-to-implementation " +
        "pipeline where every generated change is gated by its test suite before review.</p>",
        '<p class="tmore">' + sectionLink("about", "read the long version →") + "</p>"
      ].join("");
    },

    experience: function () {
      return [
        '<ol class="ttimeline">',
        "<li><b>2024 — present · DigiCert</b><span>Secure Release Manager — SBOM, CBOM and SLSA " +
        "attestation generation, SAST/SARIF/VEX, PQC management. −40% batch processing time.</span></li>",
        "<li><b>2021 — 2024 · Blackhawk Network</b><span>Enterprise IAM from scratch for 100K+ users. " +
        "OIDC, passkeys, PII-isolated person model. APISIX gateway, −40% API latency, −30% cost.</span></li>",
        "<li><b>2019 — 2021 · Infosys</b><span>GST Network full-stack for 50M+ registered users. " +
        "Redis licence-key and token auth, 50K+ monthly PDF compliance reports.</span></li>",
        "</ol>",
        '<p class="tmore">' + sectionLink("experience", "full timeline →") + "</p>"
      ].join("");
    },

    work: function () {
      var repos = [
        ["sievegate", "API contract testing that diffs a spec against the live implementation"],
        ["admission-controller-poc", "policy-gated, attestation-checked Kubernetes workloads"],
        ["embedded-infinispan", "Spring Boot with an embedded Infinispan cache cluster"],
        ["maxscale-galera-k8s", "MariaDB Galera multi-master on Kubernetes behind MaxScale"],
        ["BigCSVHandler", "streaming reads and writes for very large files"],
        ["ObjectProxy", "JDK dynamic proxies and cglib, tradeoffs compared"]
      ];
      var items = repos.map(function (r) {
        return '<li><a class="tlink" href="https://github.com/VinodAtwal/' + esc(r[0]) +
          '" target="_blank" rel="noopener noreferrer">' + esc(r[0]) + "</a><span>" + esc(r[1]) + "</span></li>";
      });
      return [
        '<ul class="trepos">' + items.join("") + "</ul>",
        '<p class="tmore">' + link("https://github.com/VinodAtwal?tab=repositories", "all repositories →") + "</p>"
      ].join("");
    },

    stack: function () {
      return [
        '<div class="tstack">',
        "<div><p class=\"tgroup\">languages</p><p>Java · Go · Python · SQL · Bash · Lua</p></div>",
        "<div><p class=\"tgroup\">supply chain</p><p>SBOM/CBOM/SLSA attestation gen · SAST · SARIF · VEX · PQC · code signing · PKI</p></div>",
        "<div><p class=\"tgroup\">identity</p><p>OAuth2/OIDC · WebAuthn/FIDO2 · Keycloak · Okta · policy authz</p></div>",
        "<div><p class=\"tgroup\">platform</p><p>AWS (EKS, ECS, Lambda, KMS) · Kubernetes · Docker · GitHub Actions</p></div>",
        "<div><p class=\"tgroup\">data</p><p>PostgreSQL · pgvector · MySQL · MongoDB · Elasticsearch · Redis</p></div>",
        "<div><p class=\"tgroup\">ai engineering</p><p>agent workflows · RAG · vector search · Tree-sitter · token optimisation</p></div>",
        "</div>",
        '<p class="tmore">' + sectionLink("stack", "full stack →") + "</p>"
      ].join("");
    },

    writing: function () {
      var posts = [
        ["Sep 2026", "How Three MariaDB Servers Behave Like One", "how-three-mariadb-servers-behave-like-one-the-truth-about-galera-and-maxscale-5671d0e5d990"],
        ["Jul 2026", "Kubernetes Admission Controllers, Explained", "kubernetes-admission-controllers-explained-what-they-are-and-how-they-actually-work-7e23ef4b5d82"],
        ["Jun 2026", "I Went Down a Rabbit Hole on Merkle Trees in Dynamo and Cassandra", "i-went-down-a-rabbit-hole-on-merkle-trees-in-dynamo-and-cassandra-heres-what-i-found-9113b133e016"],
        ["May 2026", "Layers All the Way Down: What's Actually Happening When You Run a Container", "layers-all-the-way-down-whats-actually-happening-when-you-run-a-container-52406a5ac46d"],
        ["May 2026", "Sockets Are Not Magic — They're Just Pipes With Fancy Names", "sockets-are-not-magic-theyre-just-pipes-with-fancy-names-6cd2e179925e"]
      ];
      var items = posts.map(function (p) {
        return '<li><a class="tlink" href="https://medium.com/@vinodatwal/' + esc(p[2]) +
          '" target="_blank" rel="noopener noreferrer">' + esc(p[1]) +
          '</a> <span class="tdate">' + esc(p[0]) + "</span></li>";
      });
      return [
        '<p class="tintro">' + posts.length + " articles, newest first (more on medium):</p>",
        '<ul class="tlist">' + items.join("") + "</ul>",
        '<p class="tmore">' + link("https://medium.com/@vinodatwal", "more on medium →") + "</p>"
      ].join("");
    },

    github: function () {
      var repos = ghState.repos === null ? "—" : ghState.repos;
      var followers = ghState.followers === null ? "—" : ghState.followers;
      var following = ghState.following === null ? "—" : ghState.following;
      var src = ghState.error ? "unavailable (rate limited) — see the work section" :
        ghState.cached ? "cached" : "live";
      return [
        '<dl class="tdl">',
        "<div><dt>public repos</dt><dd>" + esc(repos) + "</dd></div>",
        "<div><dt>followers</dt><dd>" + esc(followers) + "</dd></div>",
        "<div><dt>following</dt><dd>" + esc(following) + "</dd></div>",
        "<div><dt>source</dt><dd>" + esc(src) + "</dd></div>",
        "</dl>",
        '<p class="tmore">' + link("https://github.com/VinodAtwal", "github.com/VinodAtwal →") + "</p>"
      ].join("");
    },

    contact: function () {
      return [
        '<dl class="tdl">',
        '<div><dt>email</dt><dd><a class="tlink" href="mailto:vinodatwal27@gmail.com">vinodatwal27@gmail.com</a></dd></div>',
        "<div><dt>location</dt><dd>Bengaluru, India</dd></div>",
        "<div><dt>status</dt><dd>open to collaboration &amp; discussion</dd></div>",
        "<div><dt>profiles</dt><dd>" +
          link("https://www.linkedin.com/in/vinod-atwal/", "LinkedIn") + " · " +
          link("https://github.com/VinodAtwal", "GitHub") + " · " +
          link("https://medium.com/@vinodatwal", "Medium") +
        "</dd></div>",
        "</dl>",
        '<p class="thint">Use the ' + kbd("copy address") + ' button in the contact section for the clipboard.</p>'
      ].join("");
    },

    resume: function () {
      return '<p>The full résumé is available on request — ' +
        '<a class="tlink" href="mailto:vinodatwal27@gmail.com?subject=R%C3%A9sum%C3%A9%20request">' +
        "email me</a> and I'll send it over.</p>";
    },

    linkedin: function () {
      return '<p>' + link("https://www.linkedin.com/in/vinod-atwal/", "linkedin.com/in/vinod-atwal") + "</p>";
    },

    medium: function () {
      return '<p>' + link("https://medium.com/@vinodatwal", "medium.com/@vinodatwal") + "</p>";
    },

    neofetch: function () {
      return [
        '<div class="neo">',
        '<pre class="neo-art" aria-hidden="true">' + esc(
          "        _____                    _____          \n"
 +           "        /\\    \\                  /\\    \\         \n"
 +           "       /::\\____\\                /::\\    \\        \n"
 +           "      /:::/    /               /::::\\    \\       \n"
 +           "     /:::/    /               /::::::\\    \\      \n"
 +           "    /:::/    /               /:::/\\:::\\    \\     \n"
 +           "   /:::/____/               /:::/__\\:::\\    \\    \n"
 +           "   |::|    |               /::::\\   \\:::\\    \\   \n"
 +           "   |::|    |     _____    /::::::\\   \\:::\\    \\  \n"
 +           "   |::|    |    /\\    \\  /:::/\\:::\\   \\:::\\    \\ \n"
 +           "   |::|    |   /:::\\____\\/:::/  \\:::\\   \\:::\\____\\\n"
 +           "   |::|    |  /:::/    /\\::/    \\:::\\  /:::/    /\n"
 +           "   |::|    | /:::/    /  \\/____/ \\:::\\/:::/    / \n"
 +           "   |::|____|/:::/    /            \\::::::/    /  \n"
 +           "   |:::::::::::/    /              \\::::/    /   \n"
 +           "   \\::::::::::/____/               /:::/    /    \n"
 +           "    ~~~~~~~~~~                    /:::/    /     \n"
 +           "                                 /:::/    /      \n"
 +           "                                /:::/    /       \n"
 +           "                                \\::/    /        \n"
 +           "                                 \\/____/"
        ) + "</pre>",
        '<dl class="tdl">',
        "<div><dt>owner</dt><dd>Vinod Atwal @vinodatwal</dd></div>",
        "<div><dt>role</dt><dd>Senior Software Engineer</dd></div>",
        "<div><dt>org</dt><dd>DigiCert — Secure Release Manager</dd></div>",
        "<div><dt>location</dt><dd>Bengaluru, India</dd></div>",
        "<div><dt>experience</dt><dd>around 8 years</dd></div>",
        "<div><dt>shell</dt><dd>zsh</dd></div>",
        "<div><dt>wm</dt><dd>floating glass panels</dd></div>",
        "<div><dt>terminal</dt><dd>you are talking to it</dd></div>",
        "<div><dt>theme</dt><dd>" + esc(currentTheme()) + "</dd></div>",
        "</dl>",
        "</div>"
      ].join("");
    },

    uptime: function () {
      return "<p>around 8 years, 3 companies, 0 unshipped design docs that mattered. Current uptime since Sep 2019.</p>";
    },

    date: function () {
      return "<p>Your local time: " + esc(new Date().toString()) + "</p>";
    },

    ls: function () {
      var items = sections.map(function (s) {
        return "<li>" + sectionLink(s.id, s.id) + "</li>";
      });
      return '<ul class="tlist">' + items.join("") + "</ul>";
    },

    open: function (args) {
      var id = (args[0] || "").replace(/^#/, "");
      var target = document.getElementById(id);
      if (!target) {
        return '<p class="terr">no such section: ' + esc(id || "(nothing)") +
          ". try " + kbd("ls") + "</p>";
      }
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      return "<p>opening " + sectionLink(id, "#" + id) + "</p>";
    },

    theme: function (args) {
      var arg = (args[0] || "").toLowerCase();
      if (arg === "light" || arg === "dark") {
        setTheme(arg, true);
        return "<p>theme set to " + esc(arg) + ".</p>";
      }
      if (arg === "toggle" || arg === "") {
        var next = currentTheme() === "dark" ? "light" : "dark";
        setTheme(next, true);
        return "<p>theme toggled to " + esc(next) + ".</p>";
      }
      return '<p class="terr">usage: ' + kbd("theme") + " " + kbd("dark|light|toggle") + "</p>";
    },

    clear: function () {
      if (termLog) termLog.innerHTML = "";
      return null;
    },

    echo: function (args) { return "<p>" + esc(args.join(" ")) + "</p>"; },

    sudo: function (args) {
      return '<p class="terr">nice try. I do have root on a k8s cluster, but not here. ' +
        "try " + kbd("contact") + " instead.</p>";
    },

    true: function () { return ""; },
    exit: function () { return "<p>this terminal is the whole site. nothing to exit.</p>"; }
  };

  var ALIASES = {
    "hi": "help", "hello": "help", "?": "help", "man": "help",
    bio: "about", profile: "whoami", cv: "resume",
    exp: "experience", jobs: "experience", work_History: "experience",
    projects: "work", repos: "work", repo: "work",
    skills: "stack", tools: "stack", tech: "stack",
    blog: "writing", posts: "writing", articles: "writing",
    gh: "github", mail: "contact", email: "contact", reach: "contact",
    fetch: "github", whois: "whoami", info: "whoami",
    versions: "stack", ping: "date", sys: "neofetch", screenfetch: "neofetch"
  };

  var NAMES = Object.keys(COMMANDS).concat(Object.keys(ALIASES));
  NAMES = NAMES.filter(function (n, i) { return NAMES.indexOf(n) === i; }).sort();

  var history = [];
  var histIndex = -1;

  function run(raw) {
    var trimmed = raw.trim();
    if (!trimmed) return;

    history.push(trimmed);
    histIndex = history.length;

    write(echoCommand(trimmed), "tcmd");

    var parts = trimmed.split(/\s+/);
    var name = parts[0].toLowerCase();
    var args = parts.slice(1);

    var resolved = COMMANDS[name] ? name : (ALIASES[name] || null);

    if (!resolved) {
      write('<p class="terr">command not found: ' + esc(name) + ". try " + kbd("help") + "</p>");
      return;
    }

    var out = COMMANDS[resolved](args);
    if (out) write(out, "tout");

    scrollTerm();
  }

  if (termForm) {
    termForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var value = termInput.value;
      termInput.value = "";
      run(value);
    });

    termInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!history.length) return;
        histIndex = Math.max(0, histIndex - 1);
        termInput.value = history[histIndex] || "";
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!history.length) return;
        histIndex = Math.min(history.length, histIndex + 1);
        termInput.value = history[histIndex] || "";
      } else if (e.key === "Tab") {
        e.preventDefault();
        var parts = termInput.value.split(/\s+/);
        var current = parts[parts.length - 1].toLowerCase();
        if (parts.length > 1) return;
        var matches = NAMES.filter(function (n) { return n.indexOf(current) === 0; });
        if (matches.length === 1) {
          termInput.value = matches[0];
        } else if (matches.length > 1) {
          write('<p class="tmore">' + esc(matches.join("  ")) + "</p>", "tout");
          scrollTerm();
        }
      } else if (e.key === "l" && e.ctrlKey) {
        e.preventDefault();
        if (termLog) termLog.innerHTML = "";
      }
    });

    termLog.addEventListener("click", function (e) {
      var target = e.target.closest("[data-goto]");
      if (!target) return;
      var id = target.getAttribute("data-goto");
      var section = document.getElementById(id);
      if (section) {
        e.preventDefault();
        section.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (history.length) { histIndex = history.length - 1; }
      }
    });

    termLog.addEventListener("click", function (e) {
      if (window.getSelection && String(window.getSelection())) return;
      if (e.target.closest("a")) return;
      termInput.focus({ preventScroll: true });
    });

    /* Deliberately not auto-focused: focusing on load would put the
       terminal ahead of the skip link and header nav in the tab order. */
  }

  if (termSuggest) {
    termSuggest.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-cmd]");
      if (!btn) return;
      var cmd = btn.getAttribute("data-cmd");
      run(cmd);
      if (termInput) termInput.focus({ preventScroll: true });
    });
  }

  /* ---- replay the provenance trace ---- */

  var TRACE = [
    '<p class="term-cmd"><span class="prompt">$</span> sr trace <span class="flag">--pipeline</span> ' +
      "release <span class=\"flag\">--policy</span> slsa-l3</p>",
    '<ol class="pipeline">' +
      '<li class="stage"><span class="stage-name">fetch</span>' +
        '<span class="stage-detail">github.com/VinodAtwal/sievegate @ <code>a3f9c21</code></span>' +
        '<span class="verdict ok">verified</span></li>' +
      '<li class="stage"><span class="stage-name">build</span>' +
        '<span class="stage-detail">hermetic container · sbom spdx-2.3 · 118 pkgs</span>' +
        '<span class="verdict ok">verified</span></li>' +
      '<li class="stage"><span class="stage-name">sign</span>' +
        '<span class="stage-detail">keyless cosign · chain to internal PKI root</span>' +
        '<span class="verdict ok">verified</span></li>' +
      '<li class="stage"><span class="stage-name">attest</span>' +
        '<span class="stage-detail">in-toto provenance · policy engine</span>' +
        '<span class="verdict ok">verified</span></li>' +
      '<li class="stage"><span class="stage-name">admit</span>' +
        '<span class="stage-detail">signature + provenance gate · no vuln above threshold</span>' +
        '<span class="verdict allow">allowed</span></li>' +
      "</ol>",
    '<p class="term-out"><span class="prompt">&gt;</span> SLSA Level 3 satisfied — 0 policy violations</p>'
  ];

  if (replayBtn) {
    replayBtn.addEventListener("click", function () {
      if (history.length) { histIndex = history.length - 1; }
      write(echoCommand("sr trace --pipeline release --policy slsa-l3"), "tcmd");
      if (reduceMotion) {
        TRACE.forEach(function (chunk) { write(chunk, "tout"); });
      } else {
        TRACE.forEach(function (chunk, i) {
          var el = document.createElement("div");
          el.className = "tline tout";
          el.innerHTML = chunk;
          el.style.animation = "stageIn .42s cubic-bezier(.22,1,.36,1) both";
          el.style.animationDelay = i * 220 + "ms";
          termLog.appendChild(el);
        });
      }
      scrollTerm();
    });
  }

})();