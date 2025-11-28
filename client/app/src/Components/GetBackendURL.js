/**
 * GetBackendURL
 * --------------
 * Returns the base URL for the backend API.
 * It first checks for the environment variable REACT_APP_API_URL.
 * If that variable is not set, it falls back to the default local URL "http://localhost:5000".
 *
 * This allows easy switching between development and production backend endpoints.
 */
function GetBackendURL() {
  return process.env.REACT_APP_API_URL || "http://localhost:5000";
}

export default GetBackendURL;
