import React from 'react';
import { createRoot } from 'react-dom/client';  // Correct import
import App from './App';  // Import your main App component

const root = createRoot(document.getElementById('root'));  // Create the root element
root.render(<App />);  // Render your App component
