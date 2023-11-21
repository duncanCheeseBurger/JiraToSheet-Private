import express from 'express';
import { google } from 'googleapis';
import opn from 'opn'; // For opening the browser for auth
import getJiraTickets from './jira.js';
import 'dotenv/config'

const OAuth2 = google.auth.OAuth2;


const RANGE = 'Sheet1!A1';

const REDIRECT_URL = 'http://localhost:3000/oauth2callback';

const oauth2Client = new OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  REDIRECT_URL
);

const app = express();

// getJiraTickets()
// Setup the routes
app.get('/', (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  res.send(`Click <a href="${authUrl}">here</a> to authorize access to your Google Sheets.`);
});



app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  try {
    let issueArray = await getJiraTickets();
    // console.log(`issue array: ${issueArray}`)
    // let issueArray = getJiraTickets.issueArray
    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: RANGE,
      valueInputOption: 'RAW',
      resource: {
        values: issueArray,
      },
    });
    res.send('Data written to your sheet!');
  } catch (error) {
    res.send('Error writing to the sheet: ' + error);
  }
});

app.listen(3000, () => {
  console.log('App is running on http://localhost:3000/');
  opn('http://localhost:3000/');
});
