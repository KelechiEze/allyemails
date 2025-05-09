import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  methods: ['GET', 'POST']
}));
app.use(express.json());

// Setup Nodemailer with Gmail App Password (NOT your Gmail login)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  }
});

// CSV parsing function
async function getCsvData() {
  const filePath = path.join(__dirname, 'data', 'SAMPLE-EMAILS - Sheet1.csv');
  const emails = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.email) emails.push(row.email.trim());
      })
      .on('end', () => resolve(emails))
      .on('error', (error) => {
        console.error('CSV read error:', error.message);
        reject(error);
      });
  });
}

// Email sending function
async function sendEmails() {
  try {
    const emails = await getCsvData();

    if (!emails.length) throw new Error('No email addresses found in CSV.');

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; background-color: #f8f9fa; margin: 0; padding: 0;">
          <table width="100%" cellpadding="20" cellspacing="0" border="0">
            <tr>
              <td align="center">
                <table width="700" cellpadding="0" cellspacing="0" style="background: #fff; border-radius: 8px;">
                  <tr>
                    <td>
                      <img src="your-image-path.jpg" alt="ILS 2025 Banner" style="width:100%; display:block;" />
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 20px;">
                      <h1 style="color:#333366;">ILS 2025 Conference Confirmation</h1>
                      <p><strong>Greetings Joseph Kolawole,</strong></p>
                      <p>We are excited that you will join us at the <strong>Orange County Convention Center</strong> in <strong>Orlando, FL</strong> for ILS 2025.</p>
                      <table width="100%" style="background-color:#f0f0f0; border-radius:6px; font-family:monospace; margin:20px 0;">
                        <tr>
                          <td style="padding:10px;">
                            <strong>Registration Number:</strong> 1490211060001<br/>
                            <strong>Verification Code:</strong> 040753
                          </td>
                        </tr>
                      </table>
                      <ul>
                        <li>This confirmation is exclusively for you and is non-transferable.</li>
                        <li>Present this confirmation at check-in to receive your credentials.</li>
                        <li>Visit <a href="https://thisisils.org" target="_blank">ThisisILS.org</a> for more information.</li>
                      </ul>
                      <p><a href="#" style="display:inline-block; background:#333366; color:#fff; padding:12px 20px; border-radius:6px; text-decoration:none;">Manage My Reservation</a></p>
                      <p>Sincerely,<br/>ILS Registration Team</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="text-align:center; padding:15px; background:#f0f0f0; font-size:14px; color:#666;">
                      © 2025 T.D. JAKES MINISTRIES, P.O. BOX 5390, DALLAS, TX 75208
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    // Send emails
    for (const email of emails) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'ILS 2025 Conference Confirmation',
        html: emailTemplate
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to: ${email}`);
    }

    return { success: true, message: 'All emails sent successfully.' };

  } catch (error) {
    console.error('❌ Email send error:', error.message);
    return { success: false, message: 'Server error: ' + error.message };
  }
}

// API route to fetch emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await getCsvData();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch email data.' });
  }
});

// API route to trigger sending emails
app.post('/api/send-emails', async (req, res) => {
  const result = await sendEmails();
  if (result.success) {
    res.status(200).json({ message: result.message });
  } else {
    res.status(500).json({ message: result.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
