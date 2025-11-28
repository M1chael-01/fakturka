import React, { useState, useEffect } from 'react';
import Navigation from '../Nav';
import GetBackendURL from '../../GetBackendURL';
import "../../../styles/admin/pages/MyAcc.css";

const MyAccount = () => {
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [ico, setIcoValue] = useState("");
  const [subject, setSubjectValue] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);


  const [fetchedName,setFetchedName] = useState("");

  // Fetch user info from backend
  const fetchUserInfo = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/auth/getUserInfo`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Chyba při získávání informací o uživateli (${res.status}): ${errorText}`);
      }

      const data = await res.json();
      return data;
    } catch (err) {
      console.error("UserInfo error:", err);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetchUserInfo();
      if (res) {
        setFetchedName(res.userName)
        setEmail(res.email);
        setUserName(res.username);
        setIcoValue(res.ico || "");
        setSubjectValue(res.subject || "");
        setIcoValue(res.moreinfo.ico)
        setSubjectValue(res.moreinfo.subject)
      }
    };
    fetchData();
  }, []);
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Nová hesla se neshodují.");
    }

    alert("Probíhá ukládání údajů. Počkejte prosím.");
    setIsChangingPassword(true);

    try {
      const res = await fetch(`${GetBackendURL()}/auth/changePassword`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText);
        throw new Error(`Chyba: ${errorText}`);
      }

      alert("Heslo úspěšně změněno.");
      setChangePasswordMode(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Chyba při změně hesla:", err);
     
    } finally {
      setIsChangingPassword(false);
    }
  };


  const saveUserInfo = async () => {
  if (!email || !userName) {
    return alert("Vyplňte prosím jméno a email.");
  }

  setIsSaving(true);
  try {
    const data = {
      email,
      username: userName,
      moreInfo: {ico:ico,subject:subject}
    };

    

    if (ico) data.moreInfo.ico = ico;
    if (subject) data.moreInfo.subject = subject;

    // Remove moreInfo if it's empty
    if (Object.keys(data.moreInfo).length === 0) {
      delete data.moreInfo;
    }

    const res = await fetch(`${GetBackendURL()}/auth/updateUserInfo`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ data,fetchedName }) // Send in wrapped object
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Server error: ${error}`);
    }

    const result = await res.json();
    console.log("User info updated:", result);
    window.location.reload();
  } catch (error) {
    console.error("Chyba při ukládání údajů:", error);
    alert("Nepodařilo se uložit údaje.");
  } finally {
    setIsSaving(false);
  }
};


  // Password change form
  const PasswordForm = () => (
    <div className="password-form">
      <div className="form-group">
        <label htmlFor="currentPassword">Aktuální heslo</label>
        <input
          type="password"
          id="currentPassword"
          className="form-input"
          placeholder="Zadejte aktuální heslo"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="newPassword">Nové heslo</label>
        <input
          type="password"
          id="newPassword"
          className="form-input"
          placeholder="Zadejte nové heslo"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="confirmPassword">Potvrzení nového hesla</label>
        <input
          type="password"
          id="confirmPassword"
          className="form-input"
          placeholder="Potvrďte nové heslo"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <div className="form-controls">
        <button
          className="control-btn primary"
          onClick={handlePasswordChange}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? "Ukládání..." : "Uložit nové heslo"}
        </button>
        <button className="control-btn secondary" onClick={() => setChangePasswordMode(false)}>
          Zrušit
        </button>
      </div>
    </div>
  );

  // Profile edit form
  const ProfileForm = () => (
    <div className="form-flex-grid">
      <div className="form-group">
        <label htmlFor="username">Jméno</label>
        <input
          type="text"
          id="username"
          className="form-input"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          className="form-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="ico">IČO</label>
        <input
          type="text"
          id="ico"
          className="form-input"
          placeholder="Zadejte IČO (např. 12345678)"
          value={ico}
          onChange={(e) => setIcoValue(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="activity">Předmět podnikání</label>
        <input
          type="text"
          id="activity"
          className="form-input"
          placeholder="Např. obchod a služby"
          value={subject}
          onChange={(e) => setSubjectValue(e.target.value)}
        />
      </div>
      <p className="form-note">
        Pokud nemáte vyplněné IČO a předmět podnikání, prosíme o jejich doplnění pro lepší přizpůsobení služeb.
      </p>
      <div className="form-controls">
        <button onClick={saveUserInfo} className="control-btn primary">
        Uložit
        </button>
        <button className="control-btn secondary" onClick={() => setChangePasswordMode(true)}>
          Změna hesla
        </button>
        
        
        <button
          className="control-btn danger"
          onClick={() => alert("Funkce smazání účtu zatím není dostupná.")}
        >
          Smazat účet
        </button>
      </div>
    </div>
  );

  return (
    <section className="content">
      <Navigation />
      <div className="top">
        <div className="my-account-container">
          <h2>{changePasswordMode ? "🔒 Změna hesla" : "👤 Účet uživatele"}</h2>
          {changePasswordMode ? <PasswordForm /> : <ProfileForm />}
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
