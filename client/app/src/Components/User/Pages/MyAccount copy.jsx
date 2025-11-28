import React, { useState } from 'react';
import Navigation from '../Nav';
import "../../../styles/admin/pages/MyAcc.css";

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const [name, setName] = useState('Jan Novák');
  const [email, setEmail] = useState('jan.novak@example.com');
  const [companyName, setCompanyName] = useState('Moje Firma s.r.o.');
  const [ico, setIco] = useState('12345678');
  const [dic, setDic] = useState('CZ12345678');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [companyMessage, setCompanyMessage] = useState('');

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileMessage('Jméno a email nesmí být prázdné.');
      return;
    }
    setProfileMessage('✅ Profil byl úspěšně aktualizován.');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage('❌ Nové heslo a potvrzení se neshodují.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('❌ Heslo musí mít alespoň 6 znaků.');
      return;
    }
    setPasswordMessage('✅ Heslo bylo úspěšně změněno.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCompanySave = (e) => {
    e.preventDefault();
    if (!ico.trim()) {
      setCompanyMessage('❌ IČO nesmí být prázdné.');
      return;
    }
    setCompanyMessage('✅ Firemní údaje byly uloženy.');
  };

  return (
    <section className="content">
      <Navigation />
      <div className="my-account-container">
        <h2>Účet uživatele</h2>

        {/* Přepínače sekcí */}
        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            Úprava profilu
          </button>
          <button className={`tab-btn ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>
            Změna hesla
          </button>
          <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
            Podnikatel
          </button>
        </div>

        <div className="account-grid single-column">

          {/* Sekce: Úprava profilu */}
          {activeTab === 'profile' && (
            <section className="profile-edit-section">
              <h3>Úprava profilu</h3>
              <form onSubmit={handleProfileUpdate} className="profile-form">
                <label>
                  Jméno:
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="profile-input" required />
                </label>

                <label>
                  Email:
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="profile-input" required />
                </label>

                <button type="submit" className="btn-save-profile">Uložit změny</button>
              </form>

              {profileMessage && (
                <p className={`profile-message ${profileMessage.includes('✅') ? 'success' : 'error'}`}>
                  {profileMessage}
                </p>
              )}
            </section>
          )}

          {/* Sekce: Změna hesla */}
          {activeTab === 'password' && (
            <section className="password-change-section">
              <h3>Změna hesla</h3>
              <form onSubmit={handlePasswordChange} className="password-form">
                <label>
                  Aktuální heslo:
                  <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                </label>

                <label>
                  Nové heslo:
                  <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                </label>

               

                <button type="submit" className="btn-change-password">Změnit heslo</button>
              </form>

              {passwordMessage && (
                <p className={`password-message ${passwordMessage.includes('✅') ? 'success' : 'error'}`}>
                  {passwordMessage}
                </p>
              )}
            </section>
          )}

          {/* Sekce: Firemní údaje */}
          {activeTab === 'info' && (
            <section className="company-info-section">
              <h3>Podnikatel</h3>
              <form onSubmit={handleCompanySave} className="company-form">
                <label>
                  Název firmy:
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </label>

                <label>
                  IČO:
                  <input type="text" value={ico} onChange={(e) => setIco(e.target.value)} required />
                </label>

                <label>
                  DIČ:
                  <input type="text" value={dic} onChange={(e) => setDic(e.target.value)} />
                </label>

                <button type="submit" className="btn-save-profile">Uložit firemní údaje</button>
              </form>

              {companyMessage && (
                <p className={`profile-message ${companyMessage.includes('✅') ? 'success' : 'error'}`}>
                  {companyMessage}
                </p>
              )}
            </section>
          )}
        </div>
      </div>
    </section>
  );
};

export default MyAccount;
