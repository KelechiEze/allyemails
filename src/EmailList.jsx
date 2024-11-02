import React, { useEffect, useState } from 'react';
import axios from 'axios';


function EmailList() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading emails...</p>;

  return (
    <div>
      <h2>Email List</h2>
      <ul>
        {emails.map((email, index) => (
          <li key={index}>{email}</li>
        ))}
      </ul>
    </div>
  );
}

export default EmailList;
