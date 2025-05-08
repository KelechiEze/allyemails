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
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>ILS 2025 Confirmation</title>
          </head>
          <body style="margin:0; padding:0; background-color:#f8f9fa; font-family:Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f9fa; padding:20px 0;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:700px; background-color:#ffffff; border-radius:8px; overflow:hidden;">
                    <tr>
                      <td>
                        <!-- Header Image -->
                        <img src="your-image-path.jpg" alt="ILS 2025 Banner" style="width:100%; display:block;" />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px;">
                        <!-- Main Content -->
                        <h1 style="font-size:24px; color:#333366; margin-top:0;">ILS 2025 Conference Confirmation</h1>
                        <p style="font-size:16px; color:#333;"><strong>Greetings Joseph Kolawole,</strong></p>
                        <p style="font-size:16px; color:#333;">
                          We are excited that you will join us at the <strong>Orange County Convention Center</strong> in sunny
                          <strong>Orlando, FL</strong> for ILS 2025. This experience will equip you with invaluable leadership insights, help
                          you further your professional development, and empower you with evergreen strategies for tomorrow's challenges.
                        </p>

                        <!-- Code Box -->
                        <table width="100%" cellpadding="10" cellspacing="0" border="0" style="background-color:#f0f0f0; border-radius:6px; font-family:monospace; margin:20px 0;">
                          <tr>
                            <td style="font-size:16px; color:#333;">
                              <strong>Registration Number:</strong> 1490211060001<br/>
                              <strong>Verification Code:</strong> 040753
                            </td>
                          </tr>
                        </table>

                        <p style="font-size:16px; color:#333;">This correspondence serves as your confirmation for the 2025 ILS. Please review the important details below:</p>
                        <ul style="font-size:16px; color:#333; padding-left:20px;">
                          <li>This confirmation is exclusively for you and is non-transferable.</li>
                          <li>Present this confirmation at check-in to receive your credentials.</li>
                          <li>Visit <a href="https://thisisils.org" style="color:#333366; text-decoration:none;" target="_blank">ThisisILS.org</a> for additional information.</li>
                        </ul>

                        <p style="font-size:16px; color:#333;">
                          If you haven’t already, <a href="#" style="color:#333366; text-decoration:none;">click here</a> to complete a brief survey. You can also manage your reservation using the button below. If you registered with a group, this portal allows you to add or update their information. Be sure to have your registration and verification numbers handy.
                        </p>

                        <!-- Button -->
                        <p>
                          <a href="#" style="display:inline-block; background-color:#333366; color:#ffffff; padding:12px 24px; border-radius:6px; font-weight:bold; text-decoration:none; font-size:16px;">Manage My Reservation</a>
                        </p>

                        <p style="font-size:16px; color:#333;">
                          Please bring this confirmation with you. You may print it or have it available on your mobile device.
                        </p>

                        <p style="font-size:16px; color:#333;">Sincerely,<br/>ILS Registration Team</p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                      <td style="padding:20px; background-color:#f0f0f0; text-align:center; font-size:14px; color:#666;">
                        Copyright © 2025 T.D. JAKES MINISTRIES, All rights reserved.<br/>
                        P.O. BOX 5390, DALLAS, TX 75208
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
        subject: 'Happy Valentines Day',
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
