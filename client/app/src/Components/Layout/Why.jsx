import React from "react";
import Header from "./Header";
import "../../styles/layouts/Why.css";



const Why = () => {
  return (
    <>
      <Header />
      <section className="why-section">
        <div className="why-container">
          <h2 data-aos="fade-up">Proč Fakturka?</h2>
          <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
            Fakturka je tu pro vás, abyste mohli snadno spravovat své faktury, klienty a více.
          </p>

          <div className="why-grid">
            {/* Důvod 1 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="200">
              <div className="why-icon">
               💵
              </div>
              <h3>Jednoduchá fakturace</h3>
              <p>Vytvářejte a odesílejte faktury během několika minut bez složitých procesů.</p>
            </div>

            {/* Důvod 2 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="300">
              <div className="why-icon">
               🔑
              </div>
              <h3>Bezpečnost dat</h3>
              <p>Vaše data jsou v bezpečí díky šifrování a nejnovějším cyber technik.</p>
            </div>

            {/* Důvod 3 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="400">
              <div className="why-icon">
               📊
              </div>
              <h3>Pokročilé statistiky</h3>
              <p>Získejte přehled o vašich financích s pokročilými analytickými nástroji.</p>
            </div>

            {/* Důvod 4 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="500">
              <div className="why-icon">
              📞
              </div>
              <h3>Zákaznická podpora</h3>
              <p>Naši specialisté jsou vám k dispozici kdykoliv a kdekoliv.</p>
            </div>

            {/* Důvod 5 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="600">
              <div className="why-icon">
               🔁
              </div>
              <h3>Automatizované procesy</h3>
              <p>Automatizujte opakované úkoly jako vystavování faktur nebo upomínek.</p>
            </div>

            {/* Důvod 6 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="700">
              <div className="why-icon">
               ☁️
              </div>
              <h3>Cloudové řešení</h3>
              <p>Všechny vaše faktury a dokumenty jsou dostupne 24/7 díky cloudu.</p>
            </div>

            {/* Důvod 7 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="800">
              <div className="why-icon">
                🚀
              </div>
              <h3>Rychlé nasazení</h3>
              <p>Začněte používat Fakturku během pár minut bez nutnosti složité instalace.</p>
            </div>

            {/* Důvod 8 */}
            <div className="why-card" data-aos="fade-up" data-aos-delay="900">
              <div className="why-icon">
              📱
              </div>
              <h3>Plně responzivní</h3>
              <p>S Fakturkou pracujete pohodlně odkukoli s přístupem k internetu.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Why;
