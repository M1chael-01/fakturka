import React, { useState } from "react";
import GetBackendURL from "../GetBackendURL";
import "../../styles/auth/AuthForm.css";

const Login = () => {
  // State to hold the email input value
  const [email, setEmail] = useState("");
  // State to hold the password input value
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
const [success, setSuccess] = useState("");

  // Handle form submission for login
  const handleLogin = (e) => {
    e.preventDefault(); // Prevent default form submission reload
   
    loginAPI(email,password);
    
  };


 
const loginAPI = async (email, password) => {
  try {
    const res = await fetch(`${GetBackendURL()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password }),
      credentials: "include"  
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess("Přihlášení bylo úspěšné!");
      window.location.href = "/app";
      setError("");
      console.log(data);
    } else {
      const errData = await res.json();
      setError(errData.message || "Přihlášení selhalo.");
      setSuccess("");
    }
  } catch (err) {
    console.warn(err);
    setError("Chyba připojení k serveru.");
    setSuccess("");
  }
};


  return (
    // Container with fade-up animation attribute
    <div className="register-page" data-aos="fade-up">
      <div className="register-box" id="login-box">
        {/* Header section with title */}
        <div className="register-header">
          <h2>Přihlášení</h2>
           <div className="angled-line"></div>
        </div>

        {/* Login form with controlled inputs */}
        <form className="register-form" onSubmit={handleLogin}>
          {/* Email input label and field */}
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

          {/* Password input label and field */}
          <label htmlFor="password">Heslo</label>
          <input
            id="password"
            type="password"
            placeholder="Zadejte heslo"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {/* Submit button to trigger login */}
          <button type="submit" className="register-btn">
            Přihlásit se
          </button>
        </form>

        {/* Divider between form and alternative options */}
        <div className="divider">Nebo</div>

        {/* Link to registration page if user doesn't have an account */}
        <p className="switch-auth">
          Nemáte účet? <a href="/vytvorit-ucet">Zaregistrujte se</a>
        </p>
      </div>
    </div>
  );
};

export default Login;
