import { Link } from "react-router";  // Import Link component for navigation (though unused here)
import "../../styles/layouts/Main.css"; // Import CSS styles for this component
import { useNavigate } from "react-router";
import { useState } from "react";
import image from "../../access/home.jpg";

const Main = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const SubmitEmail = () => {
    if (email) {
      localStorage.setItem("email", email);
      navigate("/vytvorit-ucet");
    }
  };

  

  return (
    <>
  <div className="bg">
    <section className="home">
      {/* Left content section with headline and list of benefits */}
      <div className="home-content">
        <h2>Už žádné složité programy</h2>
        <hr className="section-divider" /> {/* Decorative divider below headline */}

        {/* List of main features and advantages */}
        <ul className="feature-list">
          <li>Jednoduché a rychlé vystavování faktur</li>
          <li>Interaktivní grafy a přehledy finančních dat</li>
          <li>Automatizace účetních procesů</li>
          <li>Online správa klientů a plateb</li>
          <li>Bezpečné ukládání dat v cloudu</li>
        </ul>

        {/* Call to action form for email subscription or registration */}
        <form className="cta-form" onSubmit={(e) => SubmitEmail(e)}>
          <input
            type="email"
            id="email"
            placeholder="Zadejte e-mail"
            required
            onInput={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Začněte</button>
        </form>
      </div>

      {/* Right section displaying an illustrative image */}
      <div className="home-image">
        <img
          src= {image}
          alt="Ilustrace digitalizace"
          loading="lazy"
        />
      </div>
    </section>
    </div>
      </>
  );
};

export default Main;
