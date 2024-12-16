import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

// Define __dirname for ES6 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000; // Use dynamic PORT for hosting platforms

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Allow requests from the React app or production client
  methods: ['GET', 'POST'],
}));
app.use(express.json()); // Middleware for parsing JSON

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Function to read CSV data
async function getCsvData() {
  const filePath = path.join(__dirname, 'data', 'SAMPLE-EMAILS - Sheet1.csv');
  const emails = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.email) emails.push(row.email);
      })
      .on('end', () => {
        resolve(emails);
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
        reject(error);
      });
  });
}

// Function to send emails
async function sendEmails() {
  try {
    const emails = await getCsvData();

    // Email template
    const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Christmas Email</title>
  <style>
    .facebook-icon {
      filter: invert(27%) sepia(89%) saturate(522%) hue-rotate(196deg) brightness(93%) contrast(91%);
    }
    .instagram-icon {
      filter: invert(39%) sepia(80%) saturate(577%) hue-rotate(320deg) brightness(90%) contrast(94%);
    }
    .twitter-icon {
      filter: invert(52%) sepia(19%) saturate(2874%) hue-rotate(187deg) brightness(91%) contrast(93%);
    }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #e8f4f3;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding: 80px;">
    <tr>
      <td align="center">
        <table width="550px" cellpadding="0" cellspacing="0" style="background-image: url('https://kelechieze.wordpress.com/wp-content/uploads/2024/12/myuio.png'); background-repeat: no-repeat; background-size: 100% 635px; background-position: center; background-color: #ffffff; border: 1px solid #dcdcdc; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
          <!-- Image at the top -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <img src="https://kelechieze.wordpress.com/wp-content/uploads/2024/12/logoi-removebg-preview.png" alt="Logan Bakery" style="width: 150px; height: 150px; margin-bottom: 10px;">
            </td>
          </tr>
          <!-- Greeting -->
          <tr>
            <td style="padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #db4a39; font-size: 30px;">MERRY <span style="color: #4caf50;">CHRISTMAS!</span></h1>
            </td>
          </tr>
          <!-- Message -->
          <tr>
            <td style="padding: 30px 80px; text-align: center; color: #555555; font-size: 18px; line-height: 1.5;">
              <p style="margin: 0; font-size: 18px;">May your days be filled with peace, hope, and joy this holiday season.</p>
              <p style="margin: 20px 0 0 0; font-size: 18px;">As always, thank you for your business, loyalty, and support.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <p style="margin: 0; font-size: 16px; color: #555555;">Sincerely,</p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #BB0C56;">ALLY-HUB TEAM</p>
            </td>
          </tr>
          <!-- Social Media Icons -->
          <tr>
            <td style="padding: 20px; background-color: #FF7222;">
              <table width="100%" cellpadding="0" cellspacing="0" style="text-align: center;">
                <tr>
                  <td style="width: 25%;">
                    <a href="https://www.facebook.com/yourpage" target="_blank">
                      <img src="https://kelechieze.wordpress.com/wp-content/uploads/2024/12/faybook.png" alt="Facebook" class="facebook-icon" style="max-width: 20%;">
                    </a>
                  </td>
                  <td style="width: 33.33%;">
                    <a href="https://www.instagram.com/yourpage" target="_blank">
                      <img src="https://kelechieze.wordpress.com/wp-content/uploads/2024/12/ig.png" alt="Instagram" class="instagram-icon" style="max-width: 20%;">
                    </a>
                  </td>
                  <td style="width: 33.33%;">
                    <a href="https://www.twitter.com/yourpage" target="_blank">
                      <img src="https://kelechieze.wordpress.com/wp-content/uploads/2024/12/twittwit.png" alt="Twitter" class="twitter-icon" style="max-width: 20%;">
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Merry Christmas from Ally-Hub!',
        html: emailTemplate, // Use the HTML template
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to: ${email}`);
    }

    return { success: true, message: 'Emails sent successfully.' };
  } catch (error) {
    console.error('Error sending emails:', error);
    return { success: false, message: 'Error sending emails.' };
  }
}

// API endpoint to fetch emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getCsvData();
    res.json(emails);
  } catch (error) {
    res.status(500).send('Error fetching data');
  }
});

// API endpoint to send emails manually
app.post('/api/send-emails', async (req, res) => {
  const result = await sendEmails();
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => { // Bind to 0.0.0.0
  console.log(`Server is running on port ${PORT}`);
});
