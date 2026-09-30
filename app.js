/* Lernprogramm Projektmanagement – Fortschritt, Suche, Komfortfunktionen */
(function () {
  "use strict";

  var KAPITEL = ["1-1","1-2","1-3","1-4","2-1","2-2","3-1","3-2","4-1","4-2",
                 "4-3","4-4","5-1","5-2","5-3","5-4","6-1","6-2"];

  function ladeFortschritt() {
    try { return JSON.parse(localStorage.getItem("pm-fortschritt") || "{}"); }
    catch (e) { return {}; }
  }
  function speichereFortschritt(p) {
    try { localStorage.setItem("pm-fortschritt", JSON.stringify(p)); } catch (e) {}
  }
  function aktuellesKapitel() {
    var m = location.pathname.match(/kapitel-(\d-\d)\.html$/);
    return m ? m[1] : null;
  }

  /* „Als gelernt markieren“-Knopf auf Kapitelseiten */
  function initGelerntKnopf() {
    var kap = aktuellesKapitel();
    var prevnext = document.querySelector(".prevnext");
    if (!kap || !prevnext) return;
    var wrap = document.createElement("div");
    wrap.className = "gelernt-wrap";
    var knopf = document.createElement("button");
    wrap.appendChild(knopf);
    prevnext.parentNode.insertBefore(wrap, prevnext);
    function zeichne() {
      var fertig = !!ladeFortschritt()[kap];
      knopf.textContent = fertig ? "✓ Kapitel " + kap.replace("-", ".") + " gelernt"
                                 : "Kapitel " + kap.replace("-", ".") + " als gelernt markieren";
      knopf.className = fertig ? "ist-gelernt" : "";
    }
    knopf.addEventListener("click", function () {
      var p = ladeFortschritt();
      if (p[kap]) { delete p[kap]; } else { p[kap] = true; }
      speichereFortschritt(p);
      zeichne();
    });
    zeichne();
  }

  /* Fortschrittsbalken und Haken im Lernpfad */
  function initLernpfad() {
    var ziel = document.getElementById("fortschritt");
    var p = ladeFortschritt();
    var anzahl = KAPITEL.filter(function (k) { return p[k]; }).length;
    if (ziel) {
      var prozent = Math.round((anzahl / KAPITEL.length) * 100);
      ziel.className = "progress-wrap";
      ziel.innerHTML =
        '<div class="progress-info">Ihr Fortschritt: <strong>' + anzahl + " von " +
        KAPITEL.length + ' Kapiteln</strong> (' + prozent + ' %) – Haken setzen Sie unten auf den Kapitelseiten.</div>' +
        '<div class="progress-balken"><span style="width:' + prozent + '%"></span></div>';
    }
    document.querySelectorAll('a[href^="kapitel-"]').forEach(function (a) {
      var m = a.getAttribute("href").match(/kapitel-(\d-\d)\.html/);
      if (m && p[m[1]] && a.closest("td") && !a.parentNode.querySelector(".kap-haken")) {
        var s = document.createElement("span");
        s.className = "kap-haken";
        s.textContent = "✓";
        s.title = "als gelernt markiert";
        a.parentNode.appendChild(s);
      }
    });
  }

  /* „Nach oben“-Knopf */
  function initNachOben() {
    if (document.body.scrollHeight < 1800) return;
    var b = document.createElement("button");
    b.id = "totop"; b.textContent = "↑"; b.title = "Nach oben";
    b.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(b);
    window.addEventListener("scroll", function () {
      b.classList.toggle("sichtbar", window.scrollY > 600);
    }, { passive: true });
  }

  /* Anker in zugeklappten Abschnitten öffnen */
  function initAnkerDetails() {
    function oeffne() {
      if (!location.hash) return;
      var ziel = document.getElementById(location.hash.slice(1));
      if (!ziel) return;
      var d = ziel.closest("details") || (ziel.tagName === "DETAILS" ? ziel : null);
      if (d) { d.open = true; ziel.scrollIntoView(); }
    }
    window.addEventListener("hashchange", oeffne);
    oeffne();
  }

  /* Volltextsuche (nur auf suche.html) */
  function initSuche() {
    var feld = document.getElementById("suchfeld");
    var ausgabe = document.getElementById("suchergebnisse");
    if (!feld || !ausgabe) return;
    var index = null;
    fetch("suchindex.json").then(function (r) { return r.json(); }).then(function (d) {
      index = d;
      var q = new URLSearchParams(location.search).get("q");
      if (q) { feld.value = q; suche(q); }
    });
    function schnipsel(text, pos, laenge) {
      var start = Math.max(0, pos - 80);
      var roh = (start > 0 ? "…" : "") +
        text.slice(start, pos) + "\u0001" + text.slice(pos, pos + laenge) + "\u0002" +
        text.slice(pos + laenge, pos + laenge + 120) + "…";
      return roh.replace(/&/g, "&amp;").replace(/</g, "&lt;")
                .replace(/\u0001/g, "<mark>").replace(/\u0002/g, "</mark>");
    }
    function suche(q) {
      q = q.trim();
      if (!index || q.length < 2) { ausgabe.innerHTML = ""; return; }
      var ql = q.toLowerCase(), treffer = [];
      index.forEach(function (s) {
        var pos = s.x.indexOf(ql);
        var imTitel = s.t.toLowerCase().indexOf(ql) >= 0;
        if (pos >= 0 || imTitel) {
          treffer.push({ s: s, pos: Math.max(pos, 0), gewicht: (imTitel ? 0 : 1) });
        }
      });
      treffer.sort(function (a, b) { return a.gewicht - b.gewicht; });
      ausgabe.innerHTML = treffer.length
        ? treffer.slice(0, 30).map(function (t) {
            return '<div class="such-treffer"><h3><a href="' + t.s.u + '">' + t.s.t +
              "</a></h3><p>" + schnipsel(t.s.x, t.pos, ql.length) + "</p></div>";
          }).join("")
        : "<p>Keine Treffer für „" + q.replace(/</g, "&lt;") + "“.</p>";
    }
    var timer = null;
    feld.addEventListener("input", function () {
      clearTimeout(timer);
      timer = setTimeout(function () { suche(feld.value); }, 200);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGelerntKnopf();
    initLernpfad();
    initNachOben();
    initAnkerDetails();
    initSuche();
  });
})();
