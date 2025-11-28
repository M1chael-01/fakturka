import { useState } from 'react';
import '../../styles/layouts/WhatItDoes.css'; // Import styles for the component
import features from "../data/WhatItDoes.json"; // Import features data from JSON file

const WhatItDoes = () => {
  // State to hold the search input value
  const [search, setSearch] = useState('');

  // Filter features based on search input matching title or description (case insensitive)
  const filteredFeatures = features.filter(feature =>
    feature.title.toLowerCase().includes(search.toLowerCase()) ||
    feature.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="what-it-does" data-aos="fade-up" data-aos-delay="300">
      <h2>Co můžete dělat s Fakturkou?</h2>
    
      <p className="subtitle">Kompletní řešení pro správu faktur a financí pro podnikatele a osoby na volné noze.</p>

      {/* Grid displaying filtered features */}
      <div className="features-grid">
        {filteredFeatures.length > 0 ? (
          filteredFeatures.map(({ icon, title, description }, index) => (
            <article
              className="feature-card"
              key={index}
              tabIndex={0}           // Allows keyboard focus for accessibility
              aria-label={title}     // Accessible label for screen readers
            >
              <div className="feature-icon" aria-hidden="true">{icon}</div> {/* Icon is decorative, hidden from screen readers */}
              <h3 className="feature-title">{title}</h3>
              <p className="feature-description">{description}</p>
            </article>
          ))
        ) : (
          // Message shown if no results found
          <p className="no-results">Nothing found, try a different search.</p>
        )}
      </div>
    </section>
  );
};

export default WhatItDoes;
