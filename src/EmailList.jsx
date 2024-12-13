import React, { useEffect, useState } from 'react';
import axios from 'axios';

function EmailList() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false); // For showing the email sending status

  useEffect(() => {
    // Fetch emails from the backend
    const fetchEmails = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/emails');
        setEmails(response.data);
      } catch (error) {
        console.error('Error fetching emails:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
  }, []);

  // Function to trigger email sending
  const handleSendEmails = async () => {
    setSending(true);
    try {
      const response = await axios.post('https://allyemails.onrender.com/api/send-emails');
      alert(response.data.message); // Show success message
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Failed to send emails.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading emails...</p>;

  return (
    <div>
      <h2>Email List</h2>
      <ul>
        {emails.map((email, index) => (
          <li key={index}>{email}</li>
        ))}
      </ul>
      <button onClick={handleSendEmails} disabled={sending}>
        {sending ? 'Sending Emails...' : 'Send Emails'}
      </button>
    </div>
  );
}

export default EmailList;
