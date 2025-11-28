import { useState } from "react";
import { Link } from "react-router-dom";
import "../../styles/layouts/Header.css";

const Header = () => {
  // State to track whether the mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

  // Function to toggle the menu open/close state
  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Function to close the menu, used when clicking a navigation link
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="header">
      <nav className="main-nav">
        {/* Application logo linking to homepage */}
        <div className="logo">
          <Link to="/">
            <span className="style">Fa</span>kturka
          </Link>
        </div>

        {/* Hamburger button for mobile navigation */}
        <button
          className={`hamburger ${menuOpen ? "active" : ""}`} // Adds 'active' class when menu is open for styling
          onClick={toggleMenu} // Toggle menu visibility on click
          aria-label="Toggle navigation menu" // Accessibility label for screen readers
          aria-expanded={menuOpen} // Indicates expanded state of menu for assistive technologies
        >
          {/* Visual lines of the hamburger icon */}
          <span />
          <span />
          <span />
        </button>

        {/* Main navigation links */}
        {/* Adds 'open' class to display menu on mobile when active */}
        <ul className={`nav-main ${menuOpen ? "open" : ""}`}>
          {/* Each link closes the mobile menu on click */}
          <li>
            <Link to="/co-umi-fakturka" onClick={closeMenu}>
              Co umí fakturka
            </Link>
          </li>
          <li>
            <Link to="/nase-ceny" onClick={closeMenu}>
              Ceník
            </Link>
          </li>
          <li>
            <Link to="/podpora" onClick={closeMenu}>
              FAQ
            </Link>
          </li>
          <li>
            <Link to="/proc-fakturka" onClick={closeMenu}>
              Proč fakturka
            </Link>
          </li>
          <li>
            <Link to="/kontakty" onClick={closeMenu}>
              Kontakt
            </Link>
          </li>
        </ul>

        {/* Action buttons for user authentication */}
        <ul className="nav-links">
          {/* Login link */}
          <li>
            <Link className="login" to="/prihlaseni" onClick={closeMenu}>
              Přihlášení
            </Link>
          </li>
          {/* Register link */}
          <li className="create">
            <Link to="/vytvorit-ucet" onClick={closeMenu}>
              Vytvořit účet
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
