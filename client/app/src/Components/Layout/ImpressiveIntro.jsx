import {Link} from "react-router-dom"
import '../../styles/layouts/ImpressiveIntro.css';
import image from "./../../access/home.jpg";

/**
 * ImpressiveIntro Component
 * Highlights the ease of preparing documents for the financial office using Fakturka.
 */
const ImpressiveIntro = () => {
  return (
    <section className="impressive-intro">
      {/* Text block with headline, description, and call-to-action button */}
      <div className="intro-text">
<h2><span className="highlight">Úřady?</span> Raz dva hotovo!</h2>


   <p className="subtext">
      Zapomeňte na stres z faktur a výkazů. S Fakturkou máte všechno hotové během chvilky — automaticky, bez chyb a připravené k odeslání účetní nebo na finančák.
    </p>

        {/* Call-to-action button */}
        <Link to= "/vytvorit-ucet"><button className="cta-button">Zkuste to zdarma</button></Link>
      </div>

      {/* Image block illustrating tax records */}
      <div className="intro-image">
        <img
          src={image}
          alt="Illustration of tax records"
          loading="lazy" // Lazy loading for better performance
        />
      </div>
    </section>
  );
};

export default ImpressiveIntro;
