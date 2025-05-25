// config/driveBackup.js
const fs = require('fs').promises;
const path = require('path');
const { google } = require('googleapis');

// مسیر فایل credentials (همین که تازه ساختیم)
const CREDENTIALS_PATH = path.resolve(__dirname, 'credentials.json');
// مسیر ذخیرهٔ توکن (پس از تولید ایجاد خواهد شد)
const TOKEN_PATH       = path.resolve(__dirname, 'token.json');

// Scope برای آپلود در Drive
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

// Folder ID مقصد روی Google Drive
// این ID را از لینکی که دادی برداشتیم:
const DRIVE_FOLDER_ID = '1PFxb8AnijVQeVozutv5MjYnFHFTs3zjP';

// بارگذاری credentials و ساخت OAuth2 client
async function createOAuthClient() {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const creds = JSON.parse(content).installed;
  const { client_id, client_secret, redirect_uris } = creds;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]
  );

  try {
    const token = await fs.readFile(TOKEN_PATH, 'utf-8');
    oAuth2Client.setCredentials(JSON.parse(token));
  } catch {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    throw new Error('Run get-token.js to generate token.json');
  }
  return oAuth2Client;
}

// یک‌بار اجرا می‌کنیم تا token.json ساخته شود
async function getNewToken(code) {
  const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
  const creds = JSON.parse(content).installed;
  const oAuth2Client = new google.auth.OAuth2(
    creds.client_id, creds.client_secret, creds.redirect_uris[0]
  );

  if (!code) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    console.log('Then run: node get-token.js <CODE>');
    process.exit(0);
  }

  const { tokens } = await oAuth2Client.getToken(code);
  await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf-8');
  console.log('Token stored to', TOKEN_PATH);
}

// تابع بک‌آپ: آپلود data.json به Drive
async function backupToDrive() {
  const auth = await createOAuthClient();
  const drive = google.drive({ version: 'v3', auth });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName  = `data-${timestamp}.json`;
  const filePath  = path.resolve(__dirname, '../data.json');

  const res = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType: 'application/json',
      body: await fs.createReadStream(filePath),
    },
  });
  console.log('Backup uploaded, fileId:', res.data.id);
}

module.exports = { backupToDrive, getNewToken };
