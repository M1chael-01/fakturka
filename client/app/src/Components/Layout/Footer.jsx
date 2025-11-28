// Import specific styles for the footer
import '../../styles/layouts/Footer.css';

/**
 * Footer Component
 * Displays the website footer with logo, navigation links, contact info,
 * links to terms, social media icons, and newsletter subscription option.
 */
import React from 'react';
import '../../styles/layouts/Footer.css'; // Make sure this path is correct

const Footer = () => {
  return (
    <footer className="footer-cta">
      <div className="footer-grid">
        {/* Logo and short description */}
        <div className="footer-block logo">
          <h3>Fakturka<span>.</span></h3>
          <p>
            Chytré fakturace, přehledné reporty a automatizace všeho, co potřebujete
            pro efektivní správu.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="footer-block">
          <h4>Navigace</h4>
          <ul>
            <li><a href="#">Funkce</a></li>
            <li><a href="#">Ceník</a></li>
            <li><a href="#">Kontakt</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-block">
          <h4>Kontakt</h4>
          <p>Email: <a href="mailto:podpora@fakturka.cz">podpora@fakturka.cz</a></p>
          <p>Telefon: <a href="tel:+420123456789">+420 123 456 789</a></p>
          <p>Adresa: Ulice 123, Praha, Česká republika</p>
        </div>

        {/* Social Media */}
        <div className="footer-block social-newsletter">
          <h4>Sledujte nás</h4>
          <div className="social-icons">
            <a href="https://facebook.com/fakturka" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 5 3.66 9.13 8.44 9.88v-6.99H7.9v-2.9h2.54V9.41c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.46h-1.25c-1.23 0-1.61.77-1.61 1.56v1.88h2.74l-.44 2.9h-2.3v6.99C18.34 21.13 22 17 22 12z" />
              </svg>
            </a>
            <a href="https://twitter.com/fakturka" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.5.58-2.28.69a3.93 3.93 0 001.72-2.17 7.82 7.82 0 01-2.5.96 3.9 3.9 0 00-6.63 3.56 11.07 11.07 0 01-8.05-4.08 3.9 3.9 0 001.21 5.22 3.87 3.87 0 01-1.77-.49v.05a3.9 3.9 0 003.13 3.83 3.9 3.9 0 01-1.76.07 3.9 3.9 0 003.63 2.7A7.82 7.82 0 012 19.54 11.06 11.06 0 008.29 21c7.54 0 11.67-6.25 11.67-11.67 0-.18 0-.35-.01-.53A8.35 8.35 0 0022.46 6z" />
              </svg>
            </a>
            <a href="https://linkedin.com/company/fakturka" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                <path d="M4.98 3.5a2.5 2.5 0 11.001 5.001A2.5 2.5 0 014.98 3.5zm.02 4.8H2V21h3v-12.7zM8 8.8H5V21h3v-6.5c0-3.5 4-3.8 4 0V21h3v-7.9c0-6-6.4-5.8-7 0V8.8z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Fakturka. Všechna práva vyhrazena.</p>
      </div>
    </footer>
  );
};

export default Footer;


