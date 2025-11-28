import React, { useEffect, useState } from "react";
import Navigation from "../Nav";
import GetBackendURL from "../../GetBackendURL";
import "../../styles/layouts/PaymenInfo.css";

const PaymenInfo = ({ info }) => {
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handlePaymentInfo = async () => {
      const planID = localStorage.getItem("planID");

      if (info === "success") {
        setIsSuccess(true);

        if (!planID) {
          setMessage("✅ Platba proběhla úspěšně. Děkujeme za předplatné!");
          console.warn("⚠️ Plan ID nebyl nalezen v localStorage.");
          return;
        }

        setMessage("✅ Platba proběhla úspěšně. Děkujeme za předplatné!");

        try {
          const response = await fetch(`${GetBackendURL()}/payment/accepted`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ planID }),
          });

          if (response.ok) {
            const data = await response.json();
            console.log("✅ Platba zpracována:", data);
          } else {
            console.error("❌ Backend vrátil chybu:", response.status);
          }
        } catch (err) {
          console.error("❌ Chyba při odesílání info o platbě:", err);
        }

      } else if (info === "paid-info") {
        setIsSuccess(true);
        setMessage("✅ Již máte aktivní předplatné. Děkujeme!");

      } else {
        setIsSuccess(false);
        setMessage("❌ Platba byla zrušena nebo nedokončena.");
      }
    };

    handlePaymentInfo();
  }, [info]);

 
  return (
    <section className="content">
      <Navigation />
      <div className={`payment-info-box ${isSuccess ? "success" : "cancel"}`}>
        <h2>{isSuccess ? "Platba úspěšná" : "Platba zrušena"}</h2>
        <p>{message}</p>
      </div>
    </section>
  );
};

export default PaymenInfo;
