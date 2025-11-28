// Import the modern React DOM rendering method from React 18+
import { createRoot } from 'react-dom/client';

// Import global styles for the application
import './index.css';

// Import the main App component (root component of your React app)
import App from './App';

// Import BrowserRouter from react-router-dom to enable routing
import { BrowserRouter } from 'react-router-dom';

// Get the DOM element where the React app will mount
const container = document.getElementById('invounce');

// Ensure container exists before rendering
if (container) {
  const root = createRoot(container);

  // Wrap App in BrowserRouter so routing works
  root.render(
    <BrowserRouter>
      <App tab="home" />
    </BrowserRouter>
  );
} else {
  console.error("Element with ID 'invounce' not found in the HTML.");
}
