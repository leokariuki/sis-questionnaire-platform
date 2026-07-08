/**
 * SIS Reports → Google Drive (Apps Script Web App)
 *
 * Receives a report payload from the SIS WordPress plugin (push_report /
 * report-sync) and saves a formatted PDF into:
 *   SIS Reports / <SHEET> / <CODE>_<timestamp>.pdf
 *
 * Deploy (one time):
 *   1. script.google.com → New project → paste this file → set SHARED_TOKEN.
 *   2. Deploy → New deployment → Web app → Execute as: Me →
 *      Who has access: Anyone → Deploy → copy the Web App URL.
 *   3. In WordPress (or ask Leo): set options
 *        sis_reports_webhook = <Web App URL>
 *        sis_reports_token   = <SHARED_TOKEN>
 *   4. Backfill all existing reports by calling repeatedly until done:true:
 *        /wp-json/sis/v1/report-sync?key=<submit_key>&offset=0&max=10
 *
* IMPORTANT: deploy this script from a Google account that has EDITOR
 * access to the "SIS Reports" folder above (ideally bienesdar.ong@gmail.com,
 * which owns it). New PDFs then appear in that folder automatically.
 */

var SHARED_TOKEN = 'a9sUapkLRXNOoU4I4AhdX1o3Ld1Q10Sxt0yJK0ta';
// The shared "SIS Reports" folder (owned by bienesdar.ong@gmail.com):
// https://drive.google.com/drive/folders/1deID8fXGWVQlGfMSQENKrP-IAHBcCXa9
var ROOT_FOLDER_ID = '1deID8fXGWVQlGfMSQENKrP-IAHBcCXa9';

function doPost(e) {
  var out;
  try {
    var d = JSON.parse(e.postData.contents);
    if (!d || d.token !== SHARED_TOKEN) {
      out = { ok: false, error: 'bad token' };
    } else if (d.kind === 'report') {
      out = { ok: true, url: makeReportPdf(d) };
    } else {
      out = { ok: false, error: 'unknown kind' };
    }
  } catch (err) {
    out = { ok: false, error: String(err) };
  }
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}

function folderIn(parent, name) {
  var it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function makeReportPdf(d) {
  var root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  var folder = folderIn(root, d.sheet);

  var stamp = String(d.created || '').replace(/[^0-9]/g, '').slice(0, 12);
  var name = d.code + '_' + stamp + '.pdf';

  // Build a temporary Google Doc, then export it as PDF.
  var doc = DocumentApp.create('tmp-' + name);
  var body = doc.getBody();
  body.setMarginTop(36); body.setMarginBottom(36);

  var title = body.appendParagraph('SIS Skills Profile — ' + (d.type === 'POST' ? 'Post-Test' : 'Pre-Test'));
  title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
  title.editAsText().setForegroundColor('#7047a4');

  body.appendParagraph('Leysin American School Summer Experience · BienesDar / EduPaths')
      .editAsText().setForegroundColor('#7c7482').setFontSize(9);

  body.appendParagraph('Student code: ' + d.code + '    ·    ' + String(d.created).slice(0, 10))
      .editAsText().setBold(true);
  body.appendParagraph(d.legend.dorm + '  ·  ' + d.legend.track + '  ·  ' + d.legend.club + '  ·  ' + d.legend.family)
      .editAsText().setForegroundColor('#4b4451').setFontSize(10);

  var h = body.appendParagraph(d.matched ? 'Before and after SIS' : 'Your skills overview');
  h.setHeading(DocumentApp.ParagraphHeading.HEADING2);

  var rows = [['Skill', d.matched ? 'Before → After' : 'Score', 'Level']];
  d.skills.forEach(function (s) {
    var score = d.matched
      ? s.pre.toFixed(2) + ' → ' + s.score.toFixed(2) + (s.delta >= 0.2 ? '  ▲' : (s.delta <= -0.2 ? '  ▼' : ''))
      : s.score.toFixed(2) + ' / 6.00';
    rows.push([s.label, score, s.band]);
  });
  rows.push(['Overall', d.overall.score.toFixed(2) + ' / 6.00', d.overall.band]);
  var table = body.appendTable(rows);
  table.getRow(0).editAsText().setBold(true);

  function section(titleText, items) {
    var p = body.appendParagraph(titleText);
    p.setHeading(DocumentApp.ParagraphHeading.HEADING3);
    items.forEach(function (t) { body.appendListItem(t).setGlyphType(DocumentApp.GlyphType.BULLET); });
  }

  section('Your strongest skills', d.strongest.map(function (s) {
    return s.label + ' — ' + s.score.toFixed(2) + ' / 6.00 (' + s.band + ')';
  }));

  if (d.matched && d.improve.length) {
    section('Your biggest improvements', d.improve.map(function (s) {
      return s.label + ' — improved by +' + s.delta.toFixed(2) + ' since the pre-test';
    }));
  }

  var dev = [];
  d.develop.forEach(function (s) {
    dev.push(s.label + ':');
    (s.suggestions || []).forEach(function (t) { dev.push('   – ' + t); });
  });
  section(d.type === 'POST' ? 'Skills to keep developing' : 'Skills to practice during SIS', dev);

  if (d.example) {
    section('Something you learned and use', ['“' + d.example + '”']);
  }
  if (d.reflection) {
    section(d.type === 'POST' ? 'What you learned most' : 'In your own words', ['“' + d.reflection + '”']);
  }

  body.appendParagraph('SIS Skills Profile · Private to the student and their advisers · No names or ages are collected.')
      .editAsText().setForegroundColor('#7c7482').setFontSize(8);

  doc.saveAndClose();

  // Replace any existing PDF with the same name (idempotent re-generation).
  var existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);

  var pdf = folder.createFile(DriveApp.getFileById(doc.getId()).getAs('application/pdf')).setName(name);
  DriveApp.getFileById(doc.getId()).setTrashed(true);
  return pdf.getUrl();
}
