/* Lernprogramm Bauführung SBA: Fortschritt, Suche, Komfort */
(function () {
  "use strict";

  /* LERNPFAD-START (generiert von werkzeug/lernpfad.py) */
  var LERNPFAD = {"module": [{"id": "m1", "name": "Modul 1 · Kalkulation & Offerte", "kaps": ["s-kalkulation", "3-1"]}, {"id": "m2", "name": "Modul 2 · Vertrag, Recht & Nachträge", "kaps": ["s-vertrag", "2-2", "6-2"]}, {"id": "m3", "name": "Modul 3 · Bauprogramm & Ressourcen", "kaps": ["4-1", "4-2"]}, {"id": "m4", "name": "Modul 4 · Kosten, Controlling & Rechnungswesen", "kaps": ["5-1", "5-2", "s-rechnungswesen"]}, {"id": "m5", "name": "Modul 5 · Bautechnik", "kaps": ["s-hochbau", "s-erdbau", "s-vermessung"]}, {"id": "m6", "name": "Modul 6 · Arbeitssicherheit & Führung", "kaps": ["s-sicherheit", "s-fuehrung"]}, {"id": "m7", "name": "Modul 7 · Organisation, Risiko & Qualität", "kaps": ["1-1", "2-1", "1-4", "6-1"]}, {"id": "m8", "name": "Modul 8 · Praxis-Repetition Tiefbau", "kaps": ["s-repetition"]}], "seiten": {"s-kalkulation": {"f": "modul-kalkulation.html", "t": "Kalkulation nach Schweizer Art"}, "3-1": {"f": "kapitel-3-1.html", "t": "Submission, Vergabe und Richtpreisschätzung"}, "s-vertrag": {"f": "modul-vertrag.html", "t": "SIA 118 und Werkvertrag"}, "2-2": {"f": "kapitel-2-2.html", "t": "Abwicklungsmodelle: GU, TU und Einzelleistungsträger"}, "6-2": {"f": "kapitel-6-2.html", "t": "Änderungen, Nachträge und Streitfälle"}, "4-1": {"f": "kapitel-4-1.html", "t": "Bauprogramm und Terminplanung"}, "4-2": {"f": "kapitel-4-2.html", "t": "Netzplan und kritischer Weg"}, "5-1": {"f": "kapitel-5-1.html", "t": "Soll-Ist-Vergleich: Kosten und Termine überwachen"}, "5-2": {"f": "kapitel-5-2.html", "t": "Leistungsermittlung und Projektsteuerung"}, "s-rechnungswesen": {"f": "modul-rechnungswesen.html", "t": "Buchhaltung und Kostenrechnung"}, "s-hochbau": {"f": "modul-hochbau.html", "t": "Hochbau und Baustoffe"}, "s-erdbau": {"f": "modul-erdbau.html", "t": "Grund- und Erdbau, Baugrube und Spriessung"}, "s-vermessung": {"f": "modul-vermessung.html", "t": "Vermessung und Absteckung"}, "s-sicherheit": {"f": "modul-sicherheit.html", "t": "Arbeitssicherheit und Gesundheitsschutz"}, "s-fuehrung": {"f": "modul-fuehrung.html", "t": "Führung und Personal"}, "1-1": {"f": "kapitel-1-1.html", "t": "Einführung: Projektmanagement am Bau"}, "2-1": {"f": "kapitel-2-1.html", "t": "Projektorganisation"}, "1-4": {"f": "kapitel-1-4.html", "t": "Risiken auf der Baustelle"}, "6-1": {"f": "kapitel-6-1.html", "t": "Risikomanagement, Qualität und Erfahrungssicherung"}, "s-repetition": {"f": "modul-repetition.html", "t": "Praxis-Repetition Tiefbau"}}};
  /* LERNPFAD-ENDE */
  var MODULE = LERNPFAD.module;
  var TRACK = [];
  MODULE.forEach(function (m) { m.kaps.forEach(function (k) { TRACK.push(k); }); });
  var SEITEN = LERNPFAD.seiten;

  function ladeFortschritt() {
    try { return JSON.parse(localStorage.getItem("pm-fortschritt") || "{}"); }
    catch (e) { return {}; }
  }
  function speichereFortschritt(p) {
    try { localStorage.setItem("pm-fortschritt", JSON.stringify(p)); } catch (e) {}
  }
  function aktuellesKapitel() {
    var datei = location.pathname.split("/").pop() || "index.html";
    for (var k in SEITEN) { if (SEITEN[k].f === datei) return k; }
    return null;
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
      ziel.innerHTML = '<p class="weiter-fertig">Alle ' + TRACK.length + ' Schritte abgeschlossen. Wiederhole bei Bedarf einzelne Selbsttests.</p>';
      return;
    }
    var kap = TRACK[i];
    ziel.innerHTML =
      '<a class="weiter-knopf" href="' + SEITEN[kap].f + '">▶ Weiter mit Schritt ' + (i + 1) +
      ": " + SEITEN[kap].t + "</a>";
  }

  /* Notizfeld „Stand Schule“ auf den neuen Modulseiten (gespeichert in diesem Browser) */
  function initStandSchule() {
    document.querySelectorAll(".stand-schule").forEach(function (box) {
      var key = "pm-schule-" + box.getAttribute("data-modul");
      var id = "notiz-" + box.getAttribute("data-modul");
      box.innerHTML =
        '<label for="' + id + '">Was wurde an der Schule behandelt, was ist anders als hier, was fehlt?</label>' +
        '<textarea id="' + id + '" rows="6" placeholder="z.B. 21.10.: Mittellohn behandelt, SBA rechnet Zuschläge auf den Lohn statt auf die direkten Kosten."></textarea>' +
        '<p class="hinweis">Wird automatisch in diesem Browser gespeichert. Auf einem anderen Gerät ist das Feld leer.</p>';
      var feld = box.querySelector("textarea");
      try { feld.value = localStorage.getItem(key) || ""; } catch (e) {}
      feld.addEventListener("input", function () {
        try { localStorage.setItem(key, feld.value); } catch (e) {}
      });
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
    initStandSchule();
    initLernpfad();
    initWeiterLernen();
    initNachOben();
    initAnkerDetails();
    initSuche();
  });
})();
