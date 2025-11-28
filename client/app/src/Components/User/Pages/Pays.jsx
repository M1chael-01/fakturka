import React, { useState, useEffect } from "react";
import Navigation from "../Nav";
import plans from "../../data/pricing.json";
import { QRCodeCanvas } from "qrcode.react";
import "../../../styles/layouts/Pays.css";

import GetBackendURL from "../../GetBackendURL";

const Pays = () => {
    const planID = localStorage.getItem("planID");
  const currentPlan = planID ? plans[parseInt(planID, 10)] : null;

  const [qrBankImageUrl, setQrBankImageUrl] = useState(null);
  const [planPrice,setPlanPrice] = useState(0);
  const [isPaid, setIsPaid] = useState(null); // new state to track payment

  const paymentUrl = currentPlan
    ? `https://payment.example.com/pay?plan=${currentPlan.title}`
    : "";


const paymentInformation = async () => {
  try {
    const res = await fetch(`${GetBackendURL()}/payment/paymentInformation`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      console.log("✅ Plán uživatele:", json.message);
      setPlanPrice(json.message);
      return json.message; // můžeš vrátit plán, pokud ho chceš dále použít
    } else {
      const error = await res.json();
      console.error("❌ Chyba odpovědi:", error.error || res.statusText);
    }
  } catch (err) {
    console.error("❌ Chyba při fetchi:", err);
  }

  return null; // když se něco pokazí
};



  // ✅ GET user ID
  const getUserID = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/auth/getUserID`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        const json = await res.json();
        return json.id; // Assuming server returns { id: 123 }
      }
    } catch (err) {
      console.error("Error fetching user ID:", err);
    }
    return null;
  };

  // ✅ BANK QR info
  const getBankInfo = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/payment/bankInfo`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        const result = await res.json();
        const userID = await getUserID();
        //setPlanPrice

        const imageUrl = generateBankQRUrl(
          result.bankAccount,
          result.bankCode,
          result.VS,
          planPrice,
          "CZK",
          `${userID} - Fakturka předplatne`
        );

        setQrBankImageUrl(imageUrl);
      } else {
        console.error("Failed to fetch bank info");
      }
    } catch (err) {
      console.error("Error fetching bank info:", err);
    }
  };

  const generateBankQRUrl = (accountNumber, bankCode, vs, amount, currency, message) => {
    return `https://api.paylibo.com/paylibo/generator/czech/image?accountNumber=${accountNumber}&bankCode=${bankCode}&amount=${amount}&currency=${currency}&vs=${vs}&message=${encodeURIComponent(
      message
    )}`;
  };

  // ✅ CHECK IF PAID
  const isPaymentPaid = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/payment/isPaid`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        return json.paid;
      } else {
        throw new Error("Chyba při získávání dat");
      }
    } catch (err) {
      console.error("Chyba při kontrole platby:", err);
      return false;
    }
  };
    // ✅ ON MOUNT
  useEffect(() => {
    getBankInfo();

    const check = async () => {
      const paid = await isPaymentPaid();
      console.log(paid);
      setIsPaid(paid);
      if(paid) {
        window.location.href = "/moje-platba/predplatne";
      }
   
    };

    check();
  }, []);


  // ✅ STRIPE payment
  const paymentStripe = async () => {
    alert(planPrice)
    const items = {
      name: "Fakturka-předplatne",
      price: Number(planPrice),
    };

    try {
      const res = await fetch(`${GetBackendURL()}/payment/onlinePayment`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Stripe session failed", data);
      }
    } catch (err) {
      console.error("Error starting Stripe payment:", err);
    }
  };


  useEffect(() => {
  const fetchPayment = async () => {
    const plan = await paymentInformation();
    if (plan) {
      console.log("Uživatelův plán:", plan);
      // Tady můžeš nastavit stav, přesměrovat, atd.
    }
  };

  fetchPayment();
}, []);




  return (
    <section className="content">
      <Navigation />
      <main className="pays-container">
        <h2 className="section-title">Platba předplatného</h2>

        {currentPlan ? (
          <>
            <div className="plan-details">
              <h3 className="plan-title">{currentPlan.title}</h3>
              <p className="plan-price">{currentPlan.price} Kč / měsíc</p>

              <ul className="plan-features">
                {currentPlan.features.map((feature, idx) => (
                  <li key={idx} className="feature-item">
                    ✔ {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="qr-wrapper">
              <h4 className="qr-title">Zaplaťte snadno přes QR kód</h4>

              {/* Show bank QR image if available */}
              {qrBankImageUrl ? (
                <>
                  <img
                    src={qrBankImageUrl}
                    alt="QR Platba"
                    className="qr-bank-image"
                    width={220}
                    height={220}
                  />
                  <p className="qr-instruction">
                    Naskenujte kód ve své bankovní aplikaci pro okamžitou platbu.
                  </p>
                </>
              ) : (
                <>
                  {/* fallback: custom QR code */}
                  <QRCodeCanvas
                    value={paymentUrl}
                    size={220}
                    bgColor="#ffffff"
                    fgColor="#000000"
                    level="H"
                    includeMargin
                  />
                  <p className="qr-instruction">
                    Naskenujte QR kód nebo použijte odkaz níže.
                  </p>
                </>
              )}
            </div>

            <div className="payment-link-box">
              <p>Nebo pokračujte ručně:</p>
              <a
               onClick={paymentStripe}
                rel="noreferrer"
                className="payment-link"
              >
                Otevřít platební bránu
              </a>
            </div>
            <p>Pokud jste již zaplatit a vidíte 
              informace o platbě tak je ignorujte.
            </p>
          </>
        ) : (
          <p className="no-plan-message">
            Žádný plán nebyl nalezen. Vyberte předplatné v nastavení účtu.
          </p>
        )}
      </main>
    </section>
  );
};

export default Pays;
