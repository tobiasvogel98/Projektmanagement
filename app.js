/* Lernprogramm Projektmanagement – Track Bauführung: Fortschritt, Suche, Komfort */
(function () {
  "use strict";

  var MODULE = [
    { id: "b1", name: "Modul B1 · Kalkulation & Offerte", kaps: ["3-1", "3-2"] },
    { id: "b2", name: "Modul B2 · Terminplanung & Ressourcen", kaps: ["4-1", "4-2", "4-3", "4-4"] },
    { id: "b3", name: "Modul B3 · Kosten- & Leistungskontrolle", kaps: ["5-1", "5-2"] },
    { id: "b4", name: "Modul B4 · Nachträge, Regie & Streitfälle", kaps: ["6-2"] },
    { id: "b5", name: "Modul B5 · Organisation & Verträge", kaps: ["1-1", "1-2", "1-3", "2-1", "2-2"] },
    { id: "b6", name: "Modul B6 · Risiko, Qualität & Dynamik", kaps: ["1-4", "5-3", "5-4", "6-1"] }
  ];
  var TRACK = [];
  MODULE.forEach(function (m) { m.kaps.forEach(function (k) { TRACK.push(k); }); });

  var TITEL = {
    "3-1": "Vergabeverfahren und Kostenschätzung I",
    "3-2": "Detaillierte Kostenschätzung",
    "4-1": "Planung und deterministische Terminplanung",
    "4-2": "Deterministische Planung II und PERT",
    "4-3": "Probabilistische Planung II",
    "4-4": "Simulation und Ressourcenplanung",
    "5-1": "Kosten- und Terminüberwachung",
    "5-2": "Earned-Value-Analyse",
    "6-2": "Reviews, Audits, Änderungen und Streitfälle",
    "1-1": "Einführung",
    "1-2": "Projektfinanzierung und -bewertung",
    "1-3": "Instrumente zur Projektbewertung",
    "2-1": "Projektorganisation",
    "2-2": "Abwicklungsmodelle, Vergütung und Vergabe",
    "1-4": "Umgang mit Unsicherheit",
    "5-3": "Problemdiagnose und Projektdynamik",
    "5-4": "System- und Änderungsdynamik",
    "6-1": "Risikomanagement II, Qualität und Projektlernen"
  };

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
  function naechsterSchritt(p) {
    for (var i = 0; i < TRACK.length; i++) {
      if (!p[TRACK[i]]) return i; // 0-basiert
    }
    return -1; // alles fertig
  }
  function balken(prozent) {
    return '<div class="progress-balken"><span style="width:' + prozent + '%"></span></div>';
  }

  /* „Als gelernt markieren“-Knopf auf Kapitelseiten */
  function initGelerntKnopf() {
    var kap = aktuellesKapitel();
    var prevnext = document.querySelector(".prevnext");
    if (!kap || !prevnext) return;
    var schritt = TRACK.indexOf(kap) + 1;
    var wrap = document.createElement("div");
    wrap.className = "gelernt-wrap";
    var knopf = document.createElement("button");
    wrap.appendChild(knopf);
    prevnext.parentNode.insertBefore(wrap, prevnext);
    function zeichne() {
      var fertig = !!ladeFortschritt()[kap];
      knopf.textContent = fertig ? "✓ Schritt " + schritt + " gelernt"
                                 : "Schritt " + schritt + " als gelernt markieren";
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

  /* Gesamtbalken + Modul-Teilbalken + Schritt-Markierungen im Lernpfad */
  function initLernpfad() {
    var p = ladeFortschritt();
    var gesamt = TRACK.filter(function (k) { return p[k]; }).length;
    var naechster = naechsterSchritt(p);

    var ziel = document.getElementById("fortschritt");
    if (ziel) {
      var prozent = Math.round((gesamt / TRACK.length) * 100);
      ziel.className = "progress-wrap";
      ziel.innerHTML =
        '<div class="progress-info">Gesamt: <strong>' + gesamt + " von " + TRACK.length +
        ' Schritten</strong> (' + prozent + " %)</div>" + balken(prozent);
    }

    document.querySelectorAll(".modul-balken").forEach(function (el) {
      var m = MODULE.find(function (x) { return x.id === el.getAttribute("data-modul"); });
      if (!m) return;
      var fertig = m.kaps.filter(function (k) { return p[k]; }).length;
      var proz = Math.round((fertig / m.kaps.length) * 100);
      el.innerHTML =
        '<div class="progress-info">' + fertig + " von " + m.kaps.length +
        (fertig === m.kaps.length ? " ✓" : "") + "</div>" + balken(proz);
    });

    document.querySelectorAll(".schritt").forEach(function (li) {
      var kap = li.getAttribute("data-kap");
      var status = li.querySelector(".s-status");
      if (p[kap]) {
        li.classList.add("done");
        if (status) status.textContent = "✓";
      } else if (TRACK.indexOf(kap) === naechster) {
        li.classList.add("next");
        if (status) status.innerHTML = '<span class="weiter-chip">Hier weitermachen</span>';
      }
    });
  }

  /* „Weiter lernen“-Knopf (Startseite und Lernpfad) */
  function initWeiterLernen() {
    var ziel = document.getElementById("weiter-lernen");
    if (!ziel) return;
    var p = ladeFortschritt();
    var i = naechsterSchritt(p);
    if (i < 0) {
      ziel.innerHTML = '<p class="weiter-fertig">🎉 Alle 18 Schritte abgeschlossen – stark! Wiederhole bei Bedarf einzelne Selbsttests.</p>';
      return;
    }
    var kap = TRACK[i];
    ziel.innerHTML =
      '<a class="weiter-knopf" href="kapitel-' + kap + '.html">▶ Weiter mit Schritt ' + (i + 1) +
      ": Kapitel " + kap.replace("-", ".") + " – " + TITEL[kap] + "</a>";
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
    initWeiterLernen();
    initNachOben();
    initAnkerDetails();
    initSuche();
  });
})();
