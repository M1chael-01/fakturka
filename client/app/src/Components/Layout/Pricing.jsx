import "../../styles/layouts/Pricing.css";  // Import component-specific styles
import plans from "../data/pricing.json";  // Import pricing plans data from JSON file
import { useNavigate } from "react-router";
const Pricing = () => {
  const navigate = useNavigate();
  const SelectPlan = (plan) =>{


// get id of the plans the first is 0 
   plan.map((i,id) =>{
      if(id == 0) {
       let selected =i.split(",").join("");
        plans.map((item,key) =>{
          if(selected == item.features[0]) {
            localStorage.setItem("planID" , key);
            navigate("/vytvorit-ucet");
          }
         
        })
      }
   })
  }



  const generateDelay = (index) =>{
    const baseDelay = 400;
    return (baseDelay+index * 100).toString();
  }

  return (
    <section className="pricing-section" id="cenik" data-aos="fade-up" data-aos-delay="300">
      {/* Section title */}
      <h2 className="pricing-title">Vyberte si plán</h2>
     <p className="pricing-subtitle">
  Vyberte si tarif, který nejlépe odpovídá vašim potřebám — ať už podnikáte sami, nebo vedete tým.
</p>


      {/* Container for all pricing cards */}
      <div className="pricing-cards">
        {/* Loop through each plan and render its card */}
        {plans.map(({ title, price, period, features, highlight, btnText },index) => (
          <div
            data-aos="fade-up"
            data-aos-delay={generateDelay(index)}
            key={title}
            className={`pricing-card ${highlight ? "highlight" : ""}`} // Highlight card if specified
          >
            {/* Plan title */}
            <h3 className="plan-title">{title}</h3>

            {/* Plan price with billing period */}
            <p className="plan-price">
              {price} <span className="plan-period">/{period}</span>
            </p>

            {/* List of features included in the plan */}
            <ul className="plan-features">
              {features.map((feature, i) => (
                <li key={i}>{feature}</li>
              ))}
            </ul>

            {/* Action button with optional highlight styling */}
            <button  onClick= {() => SelectPlan(features)} className={`plan-btn-pricing ${highlight ? "btn-highlight" : ""}`}>
              {btnText}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Pricing;
