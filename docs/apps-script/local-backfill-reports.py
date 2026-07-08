"""
SIS Skills Profile — bulk PDF report generator.
Reads /tmp/sis_export.json (all stored responses) and writes one PDF per
response into ~/Downloads/SIS_Reports/<QUESTIONNAIRE>/, matching the
platform's report content: decoded code, competency bars (/6), bands,
strongest/develop areas with suggestions, pre→post comparison for post-tests,
and the student's reflection.
"""

import json, os, re
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.pdfgen import canvas
from reportlab.lib.utils import simpleSplit

W, H = A4  # 595 x 842

# ── Brand ────────────────────────────────────────────────────────
PRIMARY = HexColor("#7047a4")
DARK    = HexColor("#161a32")
MID     = HexColor("#4b4451")
LIGHT   = HexColor("#7c7482")
TRACK   = HexColor("#e5e6ff")
SOFT    = HexColor("#f4f2ff")

COMPS = [
    ("communication", "Communication",    "#2f6df0"),
    ("leadership",    "Leadership",       "#f08a24"),
    ("emotional",     "Emotional Skills", "#16a06a"),
    ("thinking",      "Thinking Skills",  "#8b4fd1"),
    ("creativity",    "Creativity",       "#e8b321"),
    ("independence",  "Independence",     "#1fb6c9"),
    ("teamwork",      "Teamwork",         "#f0584f"),
]
LABEL = {k: l for k, l, _ in COMPS}
COLOR = {k: c for k, _, c in COMPS}

DORMS = {c: f"Dorm {c}" for c in "ABCDEFGH"}; DORMS["O"] = "Other / not assigned"
TRACKS = {"L": "Language Acquisition", "A": "Alpine Leadership",
          "I": "Innovation, Creativity & Entrepreneurship", "P": "Performing Arts",
          "C": "Code & Creativity", "E": "Enrichment", "O": "Other / not assigned"}
CLUBS = {"T": "Team Sports", "V": "Visual Arts", "M": "Music & Video Production",
         "H": "Hiking & Climbing", "B": "Cooking & Baking", "N": "Tennis",
         "O": "Other / not assigned"}
FAMS = {c: f"Family {c}" for c in "ABCDEFGHIJKLMN"}; FAMS["O"] = "Other / not assigned"

SUGGEST = {
    "communication": ["Speak to one new person each day.",
                      "Ask questions in classes or clubs, and join group discussions."],
    "leadership":    ["Take one small role in a group activity.",
                      "Help organize materials or encourage a peer."],
    "emotional":     ["Use family group check-ins to talk about the day.",
                      "Try a calm breathing strategy when stressed."],
    "thinking":      ["Ask 'why' and 'how' during classes and excursions.",
                      "Practice explaining your reasoning out loud."],
    "creativity":    ["Explore Performing Arts, Visual Arts or Code & Creativity.",
                      "Try project-based activities with open-ended tasks."],
    "independence":  ["Build a simple daily routine for materials and time.",
                      "Set one small personal goal each day."],
    "teamwork":      ["Join clubs, team sports and family activities.",
                      "Practice sharing tasks and including everyone."],
}

def band(s):
    if s <= 2.4: return "Emerging"
    if s <= 3.6: return "Developing"
    if s <= 4.8: return "Strengthening"
    return "Strong"

def decode(code):
    return (DORMS.get(code[0], f"Dorm {code[0]}"),
            TRACKS.get(code[1], "Other"),
            CLUBS.get(code[2], "Other"),
            FAMS.get(code[3], f"Family {code[3]}"))

def wrap(c, text, font, size, maxw, max_lines=None):
    lines = simpleSplit(text, font, size, maxw)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        lines[-1] = lines[-1].rstrip() + "…"
    return lines

def draw_report(path, row, pre_row=None):
    sheet = row["sheet"]; code = row["code"]
    is_post = sheet.startswith("POST")
    scores = row["scores"]["byCompetency"]; overall = row["scores"]["overall"]
    created = datetime.strptime(row["created"], "%Y-%m-%d %H:%M:%S")
    dorm, track, club, fam = decode(code)
    reflection = (row["answers"].get("Reflection_Open") or "").strip()
    tr4 = (row["answers"].get("TR4_Open") or "").strip()

    c = canvas.Canvas(path, pagesize=A4)

    # Header band
    c.setFillColor(PRIMARY); c.rect(0, H - 90, W, 90, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 21)
    c.drawString(40, H - 48, f"SIS Skills Profile — {'Post-Test' if is_post else 'Pre-Test'}")
    c.setFont("Helvetica", 10.5); c.setFillColor(HexColor("#e6d5ff"))
    c.drawString(40, H - 68, "Leysin American School Summer Experience · BienesDar / EduPaths")

    # Meta
    y = H - 118
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 11)
    c.drawString(40, y, f"Student code: {code}")
    c.setFont("Helvetica", 10); c.setFillColor(MID)
    c.drawRightString(W - 40, y, created.strftime("%d %B %Y"))
    y -= 15
    c.drawString(40, y, f"{dorm}  ·  {track}  ·  {club}  ·  {fam}")

    # Skills bars
    y -= 32
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 13)
    c.drawString(40, y, "Before and after SIS" if (is_post and pre_row) else "Your skills overview")
    y -= 8
    bar_x, bar_w = 165, 330
    for key, label, col in COMPS:
        y -= 24
        val = float(scores.get(key, 0))
        c.setFont("Helvetica", 9.5); c.setFillColor(MID)
        c.drawString(40, y + 2, label)
        if is_post and pre_row:
            pre_val = float(pre_row["scores"]["byCompetency"].get(key, 0))
            c.setFillColor(TRACK); c.roundRect(bar_x, y + 8, bar_w, 5, 2.5, fill=1, stroke=0)
            c.setFillColor(HexColor(col + "80") if False else HexColor(col))
            c.saveState(); c.setFillColor(HexColor(col)); c.setFillAlpha(0.35)
            c.roundRect(bar_x, y + 8, max(bar_w * pre_val / 6, 5), 5, 2.5, fill=1, stroke=0)
            c.restoreState()
            c.setFillColor(TRACK); c.roundRect(bar_x, y, bar_w, 6, 3, fill=1, stroke=0)
            c.setFillColor(HexColor(col)); c.roundRect(bar_x, y, max(bar_w * val / 6, 6), 6, 3, fill=1, stroke=0)
            delta = round(val - pre_val, 2)
            arrow = "▲" if delta >= 0.2 else ("▼" if delta <= -0.2 else "·")
            c.setFont("Helvetica-Bold", 9); c.setFillColor(DARK)
            c.drawRightString(W - 40, y + 1, f"{pre_val:.2f} → {val:.2f}  {arrow}")
        else:
            c.setFillColor(TRACK); c.roundRect(bar_x, y + 1, bar_w, 8, 4, fill=1, stroke=0)
            c.setFillColor(HexColor(col)); c.roundRect(bar_x, y + 1, max(bar_w * val / 6, 8), 8, 4, fill=1, stroke=0)
            c.setFont("Helvetica-Bold", 9); c.setFillColor(DARK)
            c.drawRightString(W - 40, y + 1, f"{val:.2f} / 6.00")
    if is_post and pre_row:
        y -= 16
        c.setFont("Helvetica-Oblique", 8.5); c.setFillColor(LIGHT)
        c.drawString(bar_x, y, "Lighter bar = before (pre-test) · solid bar = after (post-test)")

    # Overall
    y -= 30
    c.setFillColor(SOFT); c.roundRect(40, y - 10, W - 80, 32, 8, fill=1, stroke=0)
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 11)
    c.drawString(52, y, f"Overall: {overall:.2f} / 6.00   ·   Range: {band(overall)}")

    ranked = sorted(COMPS, key=lambda t: -float(scores.get(t[0], 0)))
    top2, bottom2 = ranked[:2], sorted(COMPS, key=lambda t: float(scores.get(t[0], 0)))[:2]

    # Strongest
    y -= 44
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Your strongest skills")
    for key, label, col in top2:
        y -= 17
        c.setFillColor(HexColor(col)); c.circle(46, y + 3, 3.2, fill=1, stroke=0)
        c.setFillColor(DARK); c.setFont("Helvetica", 10)
        c.drawString(56, y, f"{label} — {float(scores.get(key,0)):.2f} / 6.00 ({band(float(scores.get(key,0)))})")

    # Improvements (post) or Keep developing + suggestions (both)
    if is_post and pre_row:
        pre_sc = pre_row["scores"]["byCompetency"]
        gains = sorted(((k, l, cl, round(float(scores.get(k,0)) - float(pre_sc.get(k,0)), 2))
                        for k, l, cl in COMPS), key=lambda t: -t[3])
        gains = [g for g in gains if g[3] >= 0.2][:2]
        if gains:
            y -= 30
            c.setFillColor(DARK); c.setFont("Helvetica-Bold", 12)
            c.drawString(40, y, "Your biggest improvements")
            for k, l, cl, d in gains:
                y -= 17
                c.setFillColor(HexColor(cl)); c.circle(46, y + 3, 3.2, fill=1, stroke=0)
                c.setFillColor(DARK); c.setFont("Helvetica", 10)
                c.drawString(56, y, f"{l} — improved by +{d:.2f} since the pre-test")

    y -= 30
    c.setFillColor(DARK); c.setFont("Helvetica-Bold", 12)
    c.drawString(40, y, "Skills to keep developing" if is_post else "Skills to practice during SIS")
    for key, label, col in bottom2:
        y -= 17
        c.setFillColor(HexColor(col)); c.circle(46, y + 3, 3.2, fill=1, stroke=0)
        c.setFillColor(DARK); c.setFont("Helvetica-Bold", 10)
        c.drawString(56, y, label)
        for s in SUGGEST[key]:
            y -= 13
            c.setFont("Helvetica", 9.5); c.setFillColor(MID)
            c.drawString(64, y, f"– {s}")

    # Student quotes
    def quote(title, text, yy):
        c.setFillColor(DARK); c.setFont("Helvetica-Bold", 12)
        c.drawString(40, yy, title)
        yy -= 15
        c.setFont("Helvetica-Oblique", 9.5); c.setFillColor(MID)
        for ln in wrap(c, f"“{text}”", "Helvetica-Oblique", 9.5, W - 100, 3):
            c.drawString(48, yy, ln); yy -= 13
        return yy

    if is_post and tr4 and y > 150:
        y -= 28; y = quote("Something you learned and use", tr4, y)
    if reflection and y > 120:
        y -= 24
        y = quote("What you learned most" if is_post else "In your own words", reflection, y)

    # Footer
    c.setStrokeColor(TRACK); c.setLineWidth(1); c.line(40, 52, W - 40, 52)
    c.setFont("Helvetica", 8); c.setFillColor(LIGHT)
    c.drawCentredString(W / 2, 40,
        "SIS Skills Profile · Private to the student and their advisers · No names or ages are collected.")
    c.save()

def main():
    rows = json.load(open("/tmp/sis_export.json"))
    pre_by = {}
    for r in rows:
        if r["sheet"].startswith("PRE"):
            pre_by[(r["sheet"], r["code"])] = r  # latest wins (rows are ASC)
    base = os.path.expanduser("~/Downloads/SIS_Reports")
    made = 0
    for r in rows:
        sheet = r["sheet"]
        outdir = os.path.join(base, sheet)
        os.makedirs(outdir, exist_ok=True)
        pre = None
        if sheet.startswith("POST"):
            pre = pre_by.get((sheet.replace("POST", "PRE"), r["code"]))
        stamp = re.sub(r"[: ]", "", r["created"])[:16]
        fname = f"{r['code']}_{stamp}.pdf"
        draw_report(os.path.join(outdir, fname), r, pre)
        made += 1
    print(f"Generated {made} reports in {base}")

main()
