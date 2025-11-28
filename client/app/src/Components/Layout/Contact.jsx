import React, { useEffect } from "react";
import Header from "./Header";
import "../../styles/layouts/Contact.css";
import AOS from "aos";
import "aos/dist/aos.css";

const Contact = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <Header />
      <section className="contact-section">
        <div className="contact-wrapper">
          {/* LEFT - Info */}
          <div className="contact-info" data-aos="fade-up">
            <h2 className="contact-title">Kontaktujte nás</h2>
            <p className="contact-subtitle">Máte otázky? Jsme tu pro vás.</p>

            <div className="contact-item" data-aos="fade-up" data-aos-delay="100">
              <strong>Email: </strong>
              <a href="mailto:info@fakturka.cz"> info@fakturka.cz</a>
            </div>

            <div className="contact-item" data-aos="fade-up" data-aos-delay="200">
              <strong>Telefon:</strong>
              <a href="tel:+420123456789"> +420 123 456 789</a>
            </div>

            <div className="contact-item" data-aos="fade-up" data-aos-delay="300">
              <strong>Adresa:</strong>
              <p>Ulice 123, Praha, Česká republika</p>
            </div>

           
              <div className="contact-item" data-aos="fade-up" data-aos-delay="500">
          <strong>IČO:</strong>
          <p>12345678</p>
</div>

<div className="contact-item" data-aos="fade-up" data-aos-delay="600">
    <strong>DIČ:</strong>
    <p>CZ12345678</p>
</div>
           
          </div>

          {/* RIGHT - Form */}
          <div className="contact-form" data-aos="fade-up" data-aos-delay="500">
            <h3 className="form-title">Napište nám</h3>
            <form>
              <div className="form-group">
                <label htmlFor="fullname">Celé jméno</label>
                <input type="text" id="fullname" name="fullname" placeholder="Jan Novák" required />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" placeholder="jan@firma.cz" required />
              </div>

              <div className="form-group">
                <label htmlFor="message">Zpráva</label>
                <textarea id="message" name="message" rows="5" placeholder="Vaše zpráva..." required></textarea>
              </div>

              <button type="submit" className="submit-btn">Odeslat zprávu</button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
