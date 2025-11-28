// Import external stylesheet for CTA styling
import "../../styles/layouts/Cta.css";

// Import Link from React Router for client-side navigation
import { Link } from "react-router-dom";

/**
 * Call-to-Action (CTA) Component
 *
 * @param {string} headline - The main headline text
 * @param {string} text - Supporting description text
 * @param {string} btn - Button label
 * @param {string} to - Link target route (default: "/register")
 *
 * @returns JSX element representing the CTA section
 */
const Cta = ({ headline, text, btn, to = "/vytvorit-ucet" }) => {
  return (
    <section className="cta">
      {/* Wrapper for all CTA content */}
      <div className="cta-content">
        {/* Headline displayed prominently */}
        <h2 className="cta-headline">{headline}</h2>

        {/* Supporting descriptive text */}
        <p className="cta-text">{text}</p>

        {/* Button linking to specified route for user action */}
        <Link to={to} className="cta-button">
          {btn}
        </Link>
      </div>
    </section>
  );
};

export default Cta;
