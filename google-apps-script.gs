const SPREADSHEET_ID = '195KtS1cC7urF3kfX5Rj5LM2RhTYltzm_P1-FT6I0ppU';
const SHEET_NAME = 'Bookings';

function parseRequestData_(e) {
  const data = Object.assign({}, (e && e.parameter) || {});

  if (e && e.postData && e.postData.contents) {
    const body = e.postData.contents;
    const contentType = String(e.postData.type || '').toLowerCase();

    try {
      if (contentType.indexOf('application/json') !== -1) {
        const parsedJson = JSON.parse(body);
        Object.keys(parsedJson || {}).forEach(function(key) {
          if (!(key in data) || data[key] === '') {
            data[key] = parsedJson[key];
          }
        });
      } else {
        const parsedForm = {};
        body.split('&').forEach(function(pair) {
          if (!pair) return;
          const parts = pair.split('=');
          const rawKey = parts.shift() || '';
          const rawValue = parts.join('=');
          const key = decodeURIComponent(rawKey.replace(/\+/g, ' '));
          const value = decodeURIComponent(rawValue.replace(/\+/g, ' '));
          if (!(key in parsedForm)) {
            parsedForm[key] = value;
          }
        });

        Object.keys(parsedForm).forEach(function(key) {
          if (!(key in data) || data[key] === '') {
            data[key] = parsedForm[key];
          }
        });
      }
    } catch (error) {
      Logger.log('Unable to parse post body: ' + error);
    }
  }

  return data;
}

function pickField_(data, keys) {
  for (var i = 0; i < keys.length; i += 1) {
    var value = data[keys[i]];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '';
}

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const namedSheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (namedSheet) {
    return namedSheet;
  }

  const sheets = spreadsheet.getSheets();
  if (sheets.length > 0) {
    return sheets[0];
  }

  return spreadsheet.insertSheet(SHEET_NAME);
}

function doPost(e) {
  try {
    const sheet = getTargetSheet_();
    const data = parseRequestData_(e);
    const message = pickField_(data, ['message', 'notes', 'details', 'description', 'issue']);

    sheet.appendRow([
      new Date(),
      data.name || '',
      String(data.phone || ''),
      data.service || '',
      data.date || '',
      message,
      data.area || '',
      data.timestamp || ''
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  const sheet = getTargetSheet_();

  return ContentService
    .createTextOutput(
      'Google Apps Script booking endpoint is running. Target sheet: ' + sheet.getName()
    )
    .setMimeType(ContentService.MimeType.TEXT);
}
