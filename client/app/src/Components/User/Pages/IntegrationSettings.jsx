import React from "react";
import "../../../styles/admin/pages/IntegrationSettings.css";
import Navigation from "../Nav";
import plans from "../../data/pricing.json";
import { Link } from "react-router-dom";

const IntegrationSettings = () => {
  const currentPlanId = Number(localStorage.getItem("planID")) || 0;
  const currentPlan = plans[currentPlanId];

  const handleChangePlanClick = () => {
    window.location.href = "/plans";
  };

  return (
    <section className="content">
      <Navigation />

      <main className="plan-page">
        <section className="plan-overview">
          <div className="plan-header">
            <h2>Spravujte své předplatné</h2>
            <p className="plan-subtitle">
              Spravujte své aktivní plány, prohlédněte si funkce a přejděte na vyšší tarif podle potřeby.
            </p>
          </div>

          <div className="plan-card">
            <div className="plan-card-header">
              <h3>{currentPlan.title}</h3>
              <span className="badge active">Aktivní</span>
            </div>

            <ul className="plan-details">
              
             
                
                <ul className="plan-features">
                  {currentPlan.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
              
            </ul>

          </div>
        </section>
         <hr className="divider"/>

        <section className="change-plan">
 <h3>Chcete změnit plán?</h3>
<p>Nezáleží na tom, jestli potřebujete více flexibility nebo jinou úroveň služeb — snadno přejděte na plán, který vám bude lépe vyhovovat.</p>

  <Link to="/nasteveni/zmena/plan">
    <button className="cta-button">Pojďte do toho</button>
  </Link>
</section>

      </main>
    </section>
  );
};

export default IntegrationSettings;



/* 
  get current plan 
  zobrazit předplatny

*/