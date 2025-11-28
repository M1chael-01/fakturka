import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "../Nav";
import plans from "../../data/pricing.json";
import GetBackendURL from "../../GetBackendURL";

import ModelWindow from "./ModelWindow";
import "../../../styles/admin/pages/IntegrationSettings.css";

const UpdatePlan = () => {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [availablePlans, setAvailablePlans] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    const planID = localStorage.getItem("planID");

    if (planID !== null) {
      const current = plans[parseInt(planID)];
      const others = plans.filter((_, index) => index.toString() !== planID);
      if (current) {
        setCurrentPlan(current);
        setAvailablePlans(others);
      } else {
        console.warn("Plán nebyl nalezen.");
      }
    }
  }, []);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

 const handleModalConfirm = async () => {
  const planID = plans.findIndex(p => p.title === selectedPlan.title);

  if (planID === -1) {
    alert("Zvolený plán nebyl nalezen.");
    return;
  }

  // Update frontend state and localStorage
  localStorage.setItem("planID", planID);
  setCurrentPlan(selectedPlan);
  setAvailablePlans(plans.filter((_, idx) => idx !== planID));

  try {
    const res = await fetch(`${GetBackendURL()}/userSetting/changePlan`, {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ planID })
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Plán úspěšně změněn:", result);
      // Optional: show toast or success modal
    } else {
      const error = await res.text();
      console.error("Chyba při změně plánu:", error);
      alert("Nepodařilo se změnit plán. Zkuste to prosím znovu.");
    }
  } catch (err) {
    console.error("Síťová chyba:", err);
    alert("Došlo k chybě při připojení k serveru.");
  }

  setShowModal(false); // Close modal after operation completes
};


  return (
    <section className="content">
      <Navigation />

      <main className="plan-page">
        <section className="plan-overview">
          <div className="plan-header">
            <h2>Změna předplatného</h2>
            <p className="plan-subtitle">
              Zobrazte si svůj aktuální plán a vyberte si jiný tarif, který více odpovídá vašim potřebám.
            </p>
          </div>
        </section>

        <hr className="divider" />

        <section className="available-plans">
          <div className="plan-grid" id="plan-flex">
            {availablePlans.map((plan, idx) => (
              <article className="plan-card" key={idx}>
                <div className="plan-card-header">
                  <h3>{plan.title}</h3>
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>


                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="cta-button"
                >
                  Vyberte plán
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Modal rendered conditionally */}
        {showModal && (
          <ModelWindow
            message={`Opravdu chcete přejít na plán "${selectedPlan.title}"?`}
            onConfirm={handleModalConfirm}
            onCancel={() => setShowModal(false)}
          />
        )}
      </main>
    </section>
  );
};

export default UpdatePlan;
