require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY || "");
const { payment,pool } = require("../config/db");

/**
 * Vrací bankovní informace pro QR platbu.
 */
async function getBankInfomation(req, res) {
  try {
    const bankAccount = process.env.BANK_ACCOUNT_NUMBER;
    const bankCode = process.env.BANK_CODE;
    const VS = process.env.VS;

    res.status(200).json({ bankAccount, bankCode, VS });
  } catch (err) {
    console.error("Chyba při získávání bankovních údajů:", err);
    res.status(500).json({ error: "Serverová chyba" });
  }
}

/**
 * Vytváří Stripe Checkout session pro online platbu kartou.
 */
async function onlinePayment(req, res) {
  try {
    const { items } = req.body;

    if (!items || typeof items.name !== "string" || typeof items.price !== "number") {
      return res.status(400).json({ error: "Neplatná data platby." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "czk",
          product_data: {
            name: items.name,
          },
          unit_amount: items.price * 100,
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL}/success`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    if (process.env.NODE_ENV !== "production") {
      console.log("Stripe session URL:", session.url);
    }

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Stripe chyba:", err);
    res.status(500).json({ error: "Platbu se nepodařilo zpracovat." });
  }
}

/**
 * Potvrzení úspěšné platby – uloží do DB.
 */
async function paymentAccepted(req, res) {
  console.log("✅ paymentAccepted endpoint funguje");

  const { planID } = req.body;

  if (!planID) {
    console.warn("❌ planID není v těle požadavku");
    return res.status(400).json({ error: "planID is required" });
  }

  try {
    const userID = req.session?.user?.id;
    if (!userID) {
      return res.status(401).json({ error: "Nepřihlášený uživatel." });
    }

    const alreadyPaid = await isPaymentPaid(userID);
    if (alreadyPaid) {
      return res.status(400).json({ error: "Platba již byla provedena." });
    }

    await payment.query(
      `INSERT INTO one_payment ("userID", "paid", "plan", "date") VALUES ($1, $2, $3, CURRENT_DATE)`,
      [userID, true, planID]
    );

    console.log("✅ Platba byla zaznamenána do DB");
    res.status(200).json({ message: "Platba byla potvrzena.", planID });
  } catch (err) {
    console.error("❌ Chyba při ukládání platby:", err);
    res.status(500).json({ error: "Nepodařilo se uložit platbu." });
  }
}

/**
 * Endpoint pro zjištění, zda je platba provedena.
 */
async function checkPaid(req, res) {
  const userID = req.session?.user?.id;
  if (!userID) {
    return res.status(401).json({ error: "Nepřihlášený uživatel." });
  }

  try {
    const paid = await isPaymentPaid(userID);
    return res.status(200).json({ paid });
  } catch (err) {
    console.error("❌ Chyba při kontrole platby:", err);
    return res.status(500).json({ error: "Chyba při kontrole platby." });
  }
}

/**
 * Zkontroluje, zda uživatel má platbu pro dnešek.
 * Vrací boolean.
 */
async function isPaymentPaid(userID) {
  if (!userID) throw new Error("User ID is required");

  try {
    const result = await payment.query(
      `SELECT * FROM one_payment WHERE "userID" = $1 AND "date" = CURRENT_DATE`,
      [userID]
    );
    return result.rows.length > 0;
  } catch (err) {
    console.error("❌ Chyba při ověřování platby:", err);
    throw err;
  }
}
const paymentInformation = async (req, res) => {
  const userID = req.session?.user?.id;

  if (!userID) {
    return res.status(401).json({ error: "Neautorizovaný přístup" });
  }

  try {
    const query = await pool.query(
      `SELECT plan FROM one_user WHERE id = $1`,
      [userID]
    );

    const result = query.rows;

    if (result.length === 0) {
      return res.status(404).json({ error: "Uživatel nenalezen" });
    }

    const plan = Number(result[0].plan);
    let pricePlan;

    switch (plan) {
      case 1:
        pricePlan = process.env.PRODUCT_DIGITAL_PLAN_1;
        break;
      case 2:
        pricePlan = process.env.PRODUCT_DIGITAL_PLAN_2;
        break;
      default:
        return res.status(400).json({ error: "Neplatný plán" });
    }

    res.status(200).json({ message: pricePlan });

  } catch (err) {
    console.error("Chyba při získávání plánu:", err);
    res.status(500).json({ error: "Interní chyba serveru" });
  }
};




module.exports = {
  getBankInfomation,
  onlinePayment,
  paymentAccepted,
  checkPaid,
  paymentInformation
};
