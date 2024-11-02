import React from 'react';
import EmailList from './EmailList'; // Import your component
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div>
      <h1>Weekly Email List</h1>
      <EmailList />
    </div>
  );
}

export default App;
