// Paste this whole file into the Google Sheet's Apps Script editor (Extensions > Apps Script).
// Change SECRET to any private word. Put the SAME word in Netlify as GOOGLE_SHEET_SECRET.
const SECRET = 'change-this-secret-word';
const SHEET_NAME = 'Enquiries';
const HEADERS = ['Date and time (IST)', 'Name', 'Phone', 'Email', 'Destination', 'Visa type', 'Message', 'Page', 'Status', 'Follow up notes'];

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.secret !== SECRET) return reply({ ok: false, error: 'wrong secret' });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName(SHEET_NAME);
    if (!sh) sh = ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0a2a66').setFontColor('#ffffff');
      sh.setFrozenRows(1);
      sh.setColumnWidths(1, 1, 150); sh.setColumnWidths(2, 3, 160); sh.setColumnWidths(7, 1, 320);
    }

    const row = sh.getLastRow() + 1;
    sh.getRange(row, 3).setNumberFormat('@'); // keep phone numbers as text (keeps + and leading zeros)
    sh.getRange(row, 1, 1, HEADERS.length).setValues([[
      Utilities.formatDate(new Date(), 'Asia/Kolkata', 'dd/MM/yyyy HH:mm'),
      d.name || '', d.phone || '', d.email || '', d.country || '', d.service || '', d.message || '', d.page || '', 'New', '',
    ]]);
    // Optional: email the enquiry too (used when the server cannot send email itself)
    if (d.notifyTo) {
      MailApp.sendEmail({
        to: d.notifyTo,
        subject: 'New visa enquiry from ' + (d.name || 'website') + (d.country ? ' (' + d.country + ')' : ''),
        replyTo: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '') ? d.email : '',
        name: 'Disha Overseas Website',
        body: ['Name: ' + (d.name || ''), 'Phone: ' + (d.phone || ''), 'Email: ' + (d.email || ''), 'Destination: ' + (d.country || ''),
               'Visa type: ' + (d.service || ''), 'Message: ' + (d.message || ''), 'Sent from: ' + (d.page || '')].join('\n'),
      });
    }
    return reply({ ok: true });
  } catch (err) {
    return reply({ ok: false, error: String(err) });
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}