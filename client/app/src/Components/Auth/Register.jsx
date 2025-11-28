import React, { useEffect, useState } from "react";
import GetBackendURL from "../GetBackendURL";
import "../../styles/auth/AuthForm.css";

const Register = () => {
  // State for email input
  const [email, setEmail] = useState("");
  // State for username input
  const [username, setUsername] = useState("");
  // State for password input
  const [password, setPassword] = useState("");
  // State for confirm password input
  const [confirmPassword, setConfirmPassword] = useState("");
  // State to hold any error message
  const [error, setError] = useState("");
  // State for loading and success/error from API
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Handle form submission for registration
  const handleRegister = async (e) => {
    e.preventDefault(); // Prevent default form submission reload
    setError(""); // Clear previous errors
    setSuccess(""); // Clear previous success messages

    // Validate if password and confirm password match
    if (password !== confirmPassword) {
      setError("Hesla se neshodují!"); // Set error if passwords do not match
      return; // Stop submission
    }

    // Call the API to create the account
    await CreateAccountAPI(email, username, password);
  };

  // Function to handle account creation via API
  const CreateAccountAPI = async (email, username, password) => {
    try {
      setLoading(true); // Set loading state to true while waiting for the API response

    const response = await fetch(`${GetBackendURL()}/auth/create-account`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ email, username, password }),
});

// login,registreace 
// navrhanout design pro dashbaord

// zabezpčti otestovat


// 


      const data = await response.json();

      if (response.ok) {
        console.log(data);
        setSuccess("Účet byl úspěšně vytvořen!"); // Success message
        resetForm(); // Reset form on success
      } else {
        setError(data.message || "Došlo k chybě při registraci."); // Error message from server
      }
    } catch (err) {
      console.error(err);
      setError("Došlo k chybě při odesílání požadavku.");
    } finally {
      setLoading(false); // Reset loading state after API call is complete
    }
  };

  // Reset form fields after successful registration
  const resetForm = () => {
    setEmail("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
  };

  // Load email from localStorage on component mount
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail); // Pre-fill email input if email is stored
    }

    // Clear stored email when page is unloaded
    const handleUnload = () => {
      localStorage.removeItem("email");
    };

    window.addEventListener("beforeunload", handleUnload);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  return (
    <div className="register-page" data-aos="fade-up">
      <div className="register-box">
        {/* Header section */}
        <div className="register-header">
          <h2>Vytvořit účet</h2>
         <div className="angled-line"></div>

        </div>

        {/* Registration form */}
        <form onSubmit={handleRegister} className="register-form">
          {/* Email input */}

          {/* ******************************* */}
          <div className="form-flex">

          <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="např. jan@firma.cz"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          {/* Username input */}
          <label htmlFor="username">Uživatelské jméno</label>
          <input
            id="username"
            type="text"
            placeholder="Vyberte si uživatelské jméno"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="name"
          />
          </div>
          <div>

          {/* Password input */}
          <label htmlFor="password">Heslo</label>
          <input
            id="password"
            type="password"
            placeholder="Zadejte heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {/* Confirm password input */}
          <label htmlFor="confirmPassword">Potvrzení hesla</label>
          <input
            id="confirmPassword"
            type="password"
            placeholder="Zadejte heslo znovu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          </div>
           </div>

          {/* Display error message if any */}
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}

          {/* Submit button */}
          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "Registruji..." : "Registrovat se"}
          </button>
        </form>
          {/* Divider between form and alternative options */}
        <div className="divider">Nebo</div>

        {/* Link to registration page if user doesn't have an account */}
        <p className="switch-auth">
          Už máte účet? <a href="/prihlaseni">Přihlásit se</a>
        </p>

        {/* Link to login page */}
       
      </div>
    </div>
  );
};

export default Register;
