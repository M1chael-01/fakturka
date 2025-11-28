import React, { useState, useEffect } from "react";
import Navigation from "../Nav";
import "../../../styles/admin/pages/GeneralSettings.css";
import GetBackendURL from "../../GetBackendURL";

const GeneralSettings = () => {
  const [settings, setSettings] = useState({
    dark: false,
    gdpr: true,
    synch: false,
    cookie: true,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    await updateSetting(settings);
       window.location.reload();
  };

  const handleReset = async () => {
    const defaultSettings = {
      dark: false,
      synch: true,
      gdpr: false,
      cookie: true,
    };
    setSettings(defaultSettings);
    await updateSetting(defaultSettings);
    window.location.reload();
  };

  const getUserSetting = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/userSetting/getUserSetting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id: 0 }), // backend možná očekává ID
      });

      if (!res.ok) throw new Error("Nepodařilo se načíst nastavení");

      const data = await res.json();
      console.log("User setting:", data);
      
      return data;
    } catch (error) {
      console.error("Chyba při získávání nastavení:", error);
      return null;
    }
  };

  const updateSetting = async (data) => {
    localStorage.setItem("a" , JSON.stringify(data));
    try {
      const res = await fetch(`${GetBackendURL()}/userSetting/saveSetting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ data }),
      });

      if (!res.ok) {
        console.error("Chyba serveru:", res.status, res.statusText);
      } else {
        console.log("Nastavení úspěšně aktualizováno:", data);
      }
    } catch (error) {
      console.error("Chyba při ukládání nastavení:", error);
    }
  };

  useEffect(() => {
    const fetchUserSettings = async () => {
      const result = await getUserSetting();
      if (!result) return;



      // Přiřadit hodnoty bezpečně s výchozími hodnotami
      const loadedSettings = {
        dark: result.dark ?? false,
        synch: result.synch ?? false,
        gdpr: result.gdpr ?? false,
        cookie: result.cookie ?? false,
      };

      if(result.dark) {
        document.body.classList.add("dark");
      }
     

      setSettings(loadedSettings);
    };

    fetchUserSettings();
  }, []);

  return (
    <div className="main-layout">
      <Navigation />
      <section className="settings-page">
        <div className="settings-container">
          <h1>⚙️ Obecné nastavení</h1>
          <p className="subtitle">Upravte si vzhled a chování aplikace.</p>

          <div className="settings-grid">
            <div className="settings-card">
              <h2>Nastavení aplikace</h2>

              <div className="setting-item">
                <div className="setting-text">
                  <p>🌙 Temný režim</p>
                  <span>Preferovat tmavé barevné schéma aplikace.</span>
                </div>
                <label className="modern-switch">
                  <input
                    type="checkbox"
                    checked={settings.dark}
                    onChange={() => handleToggle("dark")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-text">
                  <p>🔄 Automatická synchronizace</p>
                  <span>Povolit automatické načítání dat z externích systémů.</span>
                </div>
                <label className="modern-switch">
                  <input
                    type="checkbox"
                    checked={settings.synch}
                    onChange={() => handleToggle("synch")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-card">
              <h2>Ochrana soukromí</h2>

              <div className="setting-item">
                <div className="setting-text">
                  <p>🔐 GDPR souhlas</p>
                  <span>Souhlasím se zpracováním osobních údajů dle GDPR.</span>
                </div>
                <label className="modern-switch">
                  <input
                    type="checkbox"
                    checked={settings.gdpr}
                    onChange={() => handleToggle("gdpr")}
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="setting-item">
                <div className="setting-text">
                  <p>🍪 Cookies</p>
                  <span>Povolit používání analytických a funkčních cookies.</span>
                </div>
                <label className="modern-switch">
                  <input
                    type="checkbox"
                    checked={settings.cookie}
                    onChange={() => handleToggle("cookie")}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="button-row">
            <button className="btn save" onClick={handleSave}>Uložit změny</button>
            <button className="btn reset" onClick={handleReset}>Obnovit výchozí</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GeneralSettings;
