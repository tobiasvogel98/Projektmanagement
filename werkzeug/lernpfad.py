#!/usr/bin/env python3
"""Baut Lernpfad, Navigation und Suchindex des Lernprogramms aus einer zentralen Struktur.

Aufruf im Projektordner:  python3 werkzeug/lernpfad.py
Neue Seite aufnehmen: Eintrag in MODULE ergänzen, Skript laufen lassen.
"""
import html, json, re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# (schluessel, datei, titel)
MODULE = [
    {"id": "m1", "name": "Kalkulation & Offerte", "prio": "kern",
     "desc": "Vom Leistungsverzeichnis zum Einheitspreis: Mittellohn, Zuschläge, Richtpreise und Submission.",
     "seiten": [("s-kalkulation", "modul-kalkulation.html", "Kalkulation nach Schweizer Art"),
                ("3-1", "kapitel-3-1.html", "Submission, Vergabe und Richtpreisschätzung")]},
    {"id": "m2", "name": "Vertrag, Recht & Nachträge", "prio": "kern",
     "desc": "SIA 118 und Werkvertrag nach OR, Abwicklungsmodelle sowie Nachträge, Regie und Streitfälle.",
     "seiten": [("s-vertrag", "modul-vertrag.html", "SIA 118 und Werkvertrag"),
                ("2-2", "kapitel-2-2.html", "Abwicklungsmodelle: GU, TU und Einzelleistungsträger"),
                ("6-2", "kapitel-6-2.html", "Änderungen, Nachträge und Streitfälle")]},
    {"id": "m3", "name": "Bauprogramm & Ressourcen", "prio": "kern",
     "desc": "Bauprogramm, Balkenplan, Netzplan und kritischer Weg für die Wochen- und Gerätedisposition.",
     "seiten": [("4-1", "kapitel-4-1.html", "Bauprogramm und Terminplanung"),
                ("4-2", "kapitel-4-2.html", "Netzplan und kritischer Weg")]},
    {"id": "m4", "name": "Kosten, Controlling & Rechnungswesen", "prio": "kern",
     "desc": "Soll-Ist-Vergleich, Leistungsermittlung und die Grundlagen von Buchhaltung und Kostenrechnung.",
     "seiten": [("5-1", "kapitel-5-1.html", "Soll-Ist-Vergleich: Kosten und Termine überwachen"),
                ("5-2", "kapitel-5-2.html", "Leistungsermittlung und Projektsteuerung"),
                ("s-rechnungswesen", "modul-rechnungswesen.html", "Buchhaltung und Kostenrechnung")]},
    {"id": "m5", "name": "Bautechnik", "prio": "kern",
     "desc": "Hochbau und Baustoffe als grösste Lücke, dazu Grund- und Erdbau, Baugrube und Vermessung.",
     "seiten": [("s-hochbau", "modul-hochbau.html", "Hochbau und Baustoffe"),
                ("s-erdbau", "modul-erdbau.html", "Grund- und Erdbau, Baugrube und Spriessung"),
                ("s-vermessung", "modul-vermessung.html", "Vermessung und Absteckung")]},
    {"id": "m6", "name": "Arbeitssicherheit & Führung", "prio": "kern",
     "desc": "BauAV und Suva auf der Baustelle, dazu Führung, Kommunikation, LMV und Arbeitsrecht.",
     "seiten": [("s-sicherheit", "modul-sicherheit.html", "Arbeitssicherheit und Gesundheitsschutz"),
                ("s-fuehrung", "modul-fuehrung.html", "Führung und Personal")]},
    {"id": "m7", "name": "Organisation, Risiko & Qualität", "prio": "kontext",
     "desc": "Wie Projekte organisiert sind, wo Risiken liegen und wie Qualität gesichert wird.",
     "seiten": [("1-1", "kapitel-1-1.html", "Einführung: Projektmanagement am Bau"),
                ("2-1", "kapitel-2-1.html", "Projektorganisation"),
                ("1-4", "kapitel-1-4.html", "Risiken auf der Baustelle"),
                ("6-1", "kapitel-6-1.html", "Risikomanagement, Qualität und Erfahrungssicherung")]},
    {"id": "m8", "name": "Praxis-Repetition Tiefbau", "prio": "repetition",
     "desc": "Was du aus dem Alltag kennst: kurz prüfen, abhaken, weiter.",
     "seiten": [("s-repetition", "modul-repetition.html", "Praxis-Repetition Tiefbau")]},
]

ARCHIV = [("1-2", "kapitel-1-2.html", "Projektfinanzierung und Projektbewertung"),
          ("1-3", "kapitel-1-3.html", "Instrumente zur Projektbewertung"),
          ("3-2", "kapitel-3-2.html", "Detaillierte Kostenschätzung (Pumpstationsbeispiel)"),
          ("4-3", "kapitel-4-3.html", "Probabilistische Planung II"),
          ("4-4", "kapitel-4-4.html", "Simulation und ressourcenbasierte Terminplanung"),
          ("5-3", "kapitel-5-3.html", "Problemdiagnose und Projektdynamik"),
          ("5-4", "kapitel-5-4.html", "System- und Änderungsdynamik")]

PRIO_LABEL = {"kern": ("prio-kern", "Kern"), "kontext": ("prio-kontext", "Kontext"),
              "repetition": ("prio-repetition", "Repetition")}

# Schweizer Lesehinweis für übernommene MIT-Kapitel
SCHWEIZ = {
    "3-1": "Die US-Begriffe übersetzt: Bid = Offerte, Bidding = Submission, Bonds = Sicherheiten (in der Schweiz meist Solidarbürgschaft oder Garantie). Den Abschnitt zum Miller Act kannst du überspringen, er gilt nur in den USA. Für die Praxis zählen die Schätzklassen, Baupreisindizes und Parameterkosten (Franken pro Laufmeter oder Quadratmeter). Die Schweizer Kalkulation selbst lernst du im Schritt davor.",
    "2-2": "Übersetzt auf Schweizer Verhältnisse: General Contractor = Generalunternehmer (GU), Design-Build = Totalunternehmer (TU), Einzelvergabe = Einzelleistungsträger. Öffentliche Vergaben laufen in der Schweiz nach dem Beschaffungsrecht (BöB/IVöB) mit offenem, selektivem, Einladungs- und freihändigem Verfahren. Die US-Vertragsformen (Cost plus fee usw.) nur überfliegen.",
    "6-2": "Change Order = Bestellungsänderung oder Nachtrag. In der Schweiz regelt die SIA 118, wie Mehrleistungen angekündigt, dokumentiert und vergütet werden. Lies das Kapitel mit der Frage: Welche Beweise brauche ich, damit mein Nachtrag durchkommt? Gerichtliche US-Verfahren nur überfliegen.",
    "4-1": "Schedule = Bauprogramm. Auf der Baustelle arbeitest du meist mit dem Balkenplan (Gantt) und einem Wochenprogramm. Der Netzplan in diesem Kapitel ist die Logik dahinter: Abhängigkeiten, Dauer, Puffer.",
    "4-2": "Fokus auf Netzplan, Vorwärts- und Rückwärtsrechnung und kritischen Weg. PERT mit Wahrscheinlichkeiten ist für die SBA Nebensache, den Teil kannst du überfliegen.",
    "5-1": "Das ist dein Soll-Ist-Vergleich: Budget gegen effektive Kosten, geplanter gegen tatsächlichen Fortschritt. Denk dabei an die Kostenkontrolle deiner Baustellen und an das Abgrenzungsprotokoll per Halbjahr.",
    "5-2": "Earned Value heisst in der Praxis Leistungsermittlung: Was ist die erbrachte Leistung wert, gemessen an den Offertpreisen? Merke dir die Grundidee (Plan, Ist, Leistung) und die Kennzahlen Kostenabweichung und Terminabweichung. Die Formeldetails sind zweitrangig.",
    "1-1": "Einstieg in die Denkweise: Organisieren, Planen, Überwachen, Steuern, Lernen. US-Beispiele nur überfliegen. Wichtig sind die fünf Phasen als roter Faden für den ganzen Lehrgang.",
    "2-1": "Organisationsformen (Linie, Matrix, Projekt) und Organigramm gelten auch in der Schweiz. Übertrage die Rollen auf deine Welt: Bauherrschaft, Bauleitung, Unternehmer mit Bauführer, Polier und Vorarbeiter.",
    "1-4": "Unsicherheit am Bau heisst konkret: Baugrund, Werkleitungen im Boden, Wetter, Nachträge, Personalausfall. Die Entscheidungsbäume helfen beim Denken, die Finanzmathematik kannst du überspringen.",
    "6-1": "Qualität heisst in der Schweiz: Qualitätsmanagement nach Firmenhandbuch, Prüfplan, Abnahmen und Mängelliste nach SIA 118. Projektlernen entspricht der Nachkalkulation und dem Erfahrungsaustausch nach Bauende.",
}

NAV_ARCHIV_BANNER = ('<div class="archiv-hinweis"><span class="label">Archiv</span>'
                     '<p>Dieses Kapitel ist nicht mehr Teil des Lernpfads Bauführung SBA, weil es für die Prüfung kaum eine Rolle spielt. '
                     'Es bleibt zum Nachschlagen erhalten.</p></div>')


def track():
    t = []
    for m in MODULE:
        for k, f, titel in m["seiten"]:
            t.append({"k": k, "f": f, "t": titel, "m": m})
    return t


def lies(f):
    return (ROOT / f).read_text(encoding="utf-8")


def schreib(f, s):
    (ROOT / f).write_text(s, encoding="utf-8")


def bezeichnung(e):
    return ("Kapitel " + e["k"].replace("-", ".") + " · " if not e["k"].startswith("s-") else "") + e["t"]


def seiten_anpassen():
    T = track()
    n = len(T)
    for i, e in enumerate(T):
        s = lies(e["f"])
        m = e["m"]
        nr = i + 1
        mod_nr = MODULE.index(m) + 1
        s = re.sub(r'<p class="kicker">.*?</p>',
                   f'<p class="kicker">Lernpfad Bauführung SBA · Modul {mod_nr} · {html.escape(m["name"])}</p>', s, count=1, flags=re.S)
        s = re.sub(r'<p class="breadcrumb">.*?</p>',
                   f'<p class="breadcrumb"><a href="kursplan.html">Lernpfad</a> › <a href="kursplan.html#{m["id"]}">Modul {mod_nr}</a> › {html.escape(e["t"])}</p>',
                   s, count=1, flags=re.S)
        quelle = "Eigener Inhalt, Entwurf" if e["k"].startswith("s-") else "Grundlage: MIT 1.040, Frühjahr 2004"
        s = re.sub(r'<div class="kapitel-meta">.*?</div>',
                   f'<div class="kapitel-meta">\n    <span><strong>Schritt {nr} von {n}</strong> im Lernpfad Bauführung SBA</span>\n    <span>{quelle}</span>\n  </div>',
                   s, count=1, flags=re.S)
        prev = f'<a href="{T[i-1]["f"]}">← Schritt {nr-1} · {html.escape(T[i-1]["t"])}</a>' if i > 0 else '<a href="kursplan.html">← Zum Lernpfad</a>'
        nxt = f'<a href="{T[i+1]["f"]}">Schritt {nr+1} · {html.escape(T[i+1]["t"])} →</a>' if i + 1 < n else '<a href="kursplan.html">Zum Lernpfad →</a>'
        s = re.sub(r'<nav class="prevnext">.*?</nav>',
                   f'<nav class="prevnext">\n    {prev}\n    <span class="spacer"></span>\n    {nxt}\n  </nav>', s, count=1, flags=re.S)
        if not e["k"].startswith("s-"):
            nummer = e["k"].replace("-", ".")
            s = re.sub(r'<title>.*?</title>', f'<title>{html.escape(e["t"])} – Lernprogramm Bauführung</title>', s, count=1, flags=re.S)
            s = re.sub(r'(<header class="site-header">.*?<h1>).*?(</h1>)', lambda mm: mm.group(1) + f'Kapitel {nummer}: {html.escape(e["t"])}' + mm.group(2), s, count=1, flags=re.S)
            box = (f'<div class="schweiz" id="schweizer-praxis"><span class="label">Schweizer Praxis · so liest du dieses Kapitel</span>'
                   f'<p>{html.escape(SCHWEIZ[e["k"]])}</p></div>')
            s = re.sub(r'\s*<div class="schweiz" id="schweizer-praxis">.*?</div>', '', s, flags=re.S)
            s = re.sub(r'(<div class="baufuehrung">.*?</div>)', lambda mm: mm.group(1) + "\n\n    " + box, s, count=1, flags=re.S)
        schreib(e["f"], s)

    for k, f, titel in ARCHIV:
        s = lies(f)
        if 'class="archiv-hinweis"' not in s:
            s = s.replace('<main>', '<main>\n  ' + NAV_ARCHIV_BANNER, 1)
        s = re.sub(r'<div class="kapitel-meta">.*?</div>',
                   '<div class="kapitel-meta">\n    <span><strong>Archiv</strong>, nicht im Lernpfad</span>\n    <span>Quelle: MIT 1.040, Frühjahr 2004</span>\n  </div>', s, count=1, flags=re.S)
        s = re.sub(r'<p class="breadcrumb">.*?</p>',
                   f'<p class="breadcrumb"><a href="kursplan.html">Lernpfad</a> › <a href="kursplan.html#archiv">Archiv</a> › Kapitel {k.replace("-", ".")}</p>', s, count=1, flags=re.S)
        s = re.sub(r'<p class="kicker">.*?</p>', '<p class="kicker">Archiv · nicht Teil des Lernpfads Bauführung SBA</p>', s, count=1, flags=re.S)
        s = re.sub(r'<nav class="prevnext">.*?</nav>',
                   '<nav class="prevnext">\n    <a href="kursplan.html#archiv">← Zum Archiv</a>\n  </nav>', s, count=1, flags=re.S)
        schreib(f, s)


def kursplan():
    T = track()
    n = len(T)
    nr = 0
    teile = []
    for i, m in enumerate(MODULE):
        cls, lab = PRIO_LABEL[m["prio"]]
        li = []
        for k, f, titel in m["seiten"]:
            nr += 1
            neu = ' <span class="neu-chip">neu</span>' if k.startswith("s-") else ""
            li.append(f'        <li class="schritt" data-kap="{k}"><span class="s-nr">{nr}</span><a href="{f}">{html.escape(bezeichnung({"k": k, "t": titel}))}</a>{neu}<span class="s-status"></span></li>')
        teile.append(f'''  <section class="unit" id="{m["id"]}">
    <div class="unit-head">
      <span class="le-badge">Modul {i+1}</span>
      <h3>{html.escape(m["name"])}</h3>
      <span class="le-meta"><span class="{cls}">{lab}</span></span>
    </div>
    <div class="unit-body">
      <p class="unit-desc">{html.escape(m["desc"])}</p>
      <div class="modul-balken" data-modul="{m["id"]}"></div>
      <ol class="schritte">
{chr(10).join(li)}
      </ol>
    </div>
  </section>''')
    archiv = "\n".join(f'        <li><a href="{f}">Kapitel {k.replace("-", ".")} · {html.escape(t)}</a></li>' for k, f, t in ARCHIV)
    s = f'''<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Lernpfad Bauführung SBA – Lernprogramm</title>
<meta name="description" content="Der Lernpfad zum Lehrgang Bauführer:in Hoch-/Tiefbau SBA: {n} Schritte in {len(MODULE)} Modulen, mit Fortschritt je Modul.">
<link rel="stylesheet" href="style.css">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
</head>
<body>

<header class="site-header">
  <div class="inner">
    <p class="kicker">Lernprogramm · Bauführer:in Hoch-/Tiefbau SBA</p>
    <h1>Lernpfad Bauführung SBA</h1>
    <p class="sub">{n} Schritte in {len(MODULE)} Modulen, der Reihe nach von Schritt 1 bis {n}. Nach jedem Schritt unten den Haken setzen, dann zeigt dir der Pfad den nächsten. Seiten mit «neu» sind Entwürfe, die du mit den Schulunterlagen abgleichst.</p>
  </div>
</header>

<nav class="mainnav">
  <div class="inner">
    <a href="index.html">Startseite</a>
    <a href="kursplan.html" class="active">Lernpfad</a>
    <a href="glossar.html">Glossar</a>
    <a href="suche.html">Suche</a>
  </div>
</nav>

<main>

  <section class="card">
    <h2>Dein Fortschritt</h2>
    <div id="weiter-lernen"></div>
    <div id="fortschritt"></div>
  </section>

{chr(10).join(chr(10) + t for t in teile)}

  <section class="unit geplant" id="archiv">
    <div class="unit-head">
      <span class="le-badge">Archiv</span>
      <h3>Nicht mehr im Lernpfad</h3>
      <span class="le-meta"><span class="prio-geplant">Nachschlagen</span></span>
    </div>
    <div class="unit-body">
      <p class="unit-desc">US-Kapitel aus dem MIT-Kurs, die für die SBA kaum eine Rolle spielen. Sie zählen nicht zum Fortschritt.</p>
      <ul>
{archiv}
      </ul>
    </div>
  </section>

</main>

<footer>
  <div class="inner">
    <p>Kapitel mit Nummer: deutsche Übersetzung von <a href="https://ocw.mit.edu/courses/1-040-project-management-spring-2004/" target="_blank" rel="noopener">MIT OpenCourseWare: 1.040 Project Management, Spring 2004</a> (Dr.&nbsp;Nathaniel Osgood), Lizenz <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener">CC BY-NC-SA 4.0</a>. Seiten mit «neu»: eigener Inhalt, Entwurf.</p>
  </div>
</footer>

<script src="app.js" defer></script>
</body>
</html>
'''
    schreib("kursplan.html", s)


def index_tabelle():
    zeilen = []
    for i, m in enumerate(MODULE):
        cls, lab = PRIO_LABEL[m["prio"]]
        inhalt = ", ".join(html.escape(t) for _, _, t in m["seiten"])
        zeilen.append(f'<tr><td class="num">{i+1}</td><td><a href="kursplan.html#{m["id"]}">{html.escape(m["name"])}</a><br><span class="modul-map">{inhalt}</span></td><td><span class="{cls}">{lab}</span></td></tr>')
    tab = ('<!-- MODULTABELLE-START --><div class="table-wrap"><table><thead><tr><th>Nr.</th><th>Modul und Inhalt</th><th>Priorität</th></tr></thead><tbody>'
           + "".join(zeilen) + '</tbody></table></div><!-- MODULTABELLE-ENDE -->')
    s = lies("index.html")
    s = re.sub(r"<!-- MODULTABELLE-START -->.*?<!-- MODULTABELLE-ENDE -->", lambda _: tab, s, flags=re.S)
    schreib("index.html", s)


def app_js():
    T = track()
    daten = {"module": [{"id": m["id"], "name": f"Modul {i+1} · {m['name']}", "kaps": [k for k, _, _ in m["seiten"]]} for i, m in enumerate(MODULE)],
             "seiten": {e["k"]: {"f": e["f"], "t": e["t"]} for e in T}}
    s = lies("app.js")
    block = "/* LERNPFAD-START (generiert von werkzeug/lernpfad.py) */\n  var LERNPFAD = " + json.dumps(daten, ensure_ascii=False) + ";\n  /* LERNPFAD-ENDE */"
    s = re.sub(r"/\* LERNPFAD-START.*?LERNPFAD-ENDE \*/", lambda _: block, s, flags=re.S)
    schreib("app.js", s)


def suchindex():
    dateien = ["index.html", "kursplan.html", "glossar.html"] + [e["f"] for e in track()] + [f for _, f, _ in ARCHIV]
    idx = []
    for f in dateien:
        s = lies(f)
        titel = re.search(r"<title>(.*?)</title>", s, re.S).group(1).split(" – ")[0]
        body = re.sub(r"<script.*?</script>|<style.*?</style>|<nav.*?</nav>", " ", s, flags=re.S)
        text = html.unescape(re.sub(r"<[^>]+>", " ", body))
        text = re.sub(r"\s+", " ", text).strip().lower()
        idx.append({"u": f, "t": html.unescape(titel), "x": text})
    (ROOT / "suchindex.json").write_text(json.dumps(idx, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    seiten_anpassen()
    kursplan()
    index_tabelle()
    app_js()
    suchindex()
    print("Lernpfad:", len(track()), "Schritte in", len(MODULE), "Modulen")
