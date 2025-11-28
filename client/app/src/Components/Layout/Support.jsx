import React, { useState } from "react";
import Header from "./Header";
import "../../styles/layouts/Support.css";  // Import pro stylování
import { Link } from "react-router-dom";  // Ujistěte se, že používáte správnou verzi

const Support = () => {
  // Stav pro zobrazení/skrývání odpovědí na FAQ
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAnswer = (index) => {
    if (activeIndex === index) {
      setActiveIndex(null); // Skrytí odpovědi, pokud je kliknuto na stejnou otázku
    } else {
      setActiveIndex(index); // Zobrazení odpovědi pro kliknutou otázku
    }
  };

  return (
    <>
      <Header />
      <section className="support-section">
        <div className="support-container">
          <h2 data-aos="fade-up">Podpora</h2>
          <p className="subtitle" data-aos="fade-up" data-aos-delay="100">
            Máte otázky? Náš tým je tu, aby vám pomohl. Zde jsou nejčastější dotazy a možnost nás kontaktovat.
          </p>

          <div className="faq-section" data-aos="fade-up" data-aos-delay="200">
            <h3>Často kladené otázky</h3>
            {/* FAQ otázky */}
            {[
              {
                question: "Jak mohu obnovit zapomenuté heslo?",
                answer: "Pro obnovu hesla klikněte na 'Zapomenuté heslo' na stránce přihlášení. Na váš email vám zašleme instrukce."
              },
              {
                question: "Jak mohu upravit své faktury?",
                answer: "V sekci 'Faktury' jednoduše klikněte na konkrétní fakturu a zvolte možnost 'Upravit'."
              },
              {
                question: "Jak změnit plán?",
                answer: "Plán můžete změnit v nastavení účtu. Vyberte 'Nastavení', pak 'Plán' a zvolte požadovanou možnost."
              },
              {
                question: "Co když jsem udělal chybu při vyplňování faktury?",
                answer: "Chybu můžete opravit kliknutím na ikonu upravit vedle faktury. Pokud je faktura již odeslána, kontaktujte náš tým podpory pro případné změny."
              },
              {
                question: "Jak mohu stáhnout faktury do formátu PDF?",
                answer: "V sekci 'Faktury' klikněte na požadovanou fakturu a vyberte možnost 'Stáhnout PDF'."
              }
            ].map((faq, index) => (
              <div
                className="faq-item"
                key={index}
                onClick={() => toggleAnswer(index)}
                style={{ cursor: 'pointer', marginBottom: '15px' }}
              >
                <strong>{faq.question}</strong>
                {activeIndex === index && <p>{faq.answer}</p>}
              </div>
            ))}
          </div>

          <Link to="/kontakty">
            <button className="contact-btn">Nevíte si rady? Napište nám</button>
          </Link>
        </div>
      </section>
    </>
  );
};

export default Support;
