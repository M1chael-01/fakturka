// Import render and screen utilities from React Testing Library
import { render, screen } from '@testing-library/react';

// Import the App component to be tested
import App from './App';

// Define a test case
test('renders learn react link', () => {
  // Render the <App /> component into the test environment
  render(<App />);

  // Search for an element that contains the text "learn react" (case-insensitive)
  const linkElement = screen.getByText(/learn react/i);

  // Assert that the element is present in the DOM
  expect(linkElement).toBeInTheDocument();
});
