import React, { useState, useEffect } from "react";
import Navigation from "../Nav";
import "../../styles/admin/pages/IncomeExpenses.css";
import { FaPlus } from "react-icons/fa";
import GetBackendURL from "../../GetBackendURL";

const Expenses = () => {
  const categories = ["Nákup", "Služba", "Jiný"];
  const [expenses, setExpenses] = useState([]);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newExpense, setNewExpense] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
    note: "",
    paymentMethod: "",
  });

  const handleNewExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = (expense) => {
    setNewExpense({
      date: expense.date,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      note: expense.note,
      paymentMethod: expense.paymentMethod,
    });
    setEditId(expense.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const fetchExpenses = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/cashflow/getMoreDetailsExpence`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error(`Chyba serveru ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json.expenses)) {
        const parsed = json.expenses.map((e) => ({
          id: e.id,
          date: e.date,
          description: e.description,
          amount: Number(e.amount),
          category: e.categorie,
          note: e.note || "",
          paymentMethod: e.payment || "",
        }));
        setExpenses(parsed);
      }
    } catch (err) {
      console.error("❌ Chyba při načítání výdajů:", err.message);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);


const handleUpdateExpense = async () =>{
alert("");
}


  const handleSaveExpense = async () => {
    if (
      !newExpense.date ||
      !newExpense.description ||
      !newExpense.amount ||
      !newExpense.category ||
      !newExpense.paymentMethod
    ) {
      alert("Vyplňte všechna povinná pole.");
      return;
    }
    if (isNaN(newExpense.amount) || Number(newExpense.amount) <= 0) {
      alert("Částka musí být kladné číslo.");
      return;
    }

    const body = {
      date: newExpense.date,
      description: newExpense.description,
      payment: newExpense.paymentMethod,
      amount: Number(newExpense.amount),
      categorie: newExpense.category,
      note: newExpense.note || null,
    };

    try {
      if (isEditMode) {
        const res = await fetch(
          `${GetBackendURL()}/cashflow/updateExpense/${editId}`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        );
        if (!res.ok) throw new Error("Nepodařilo se aktualizovat výdaj.");
        const json = await res.json();
        setExpenses((prev) =>
          prev.map((e) =>
            e.id === editId
              ? {
                  id: editId,
                  date: json.data.date,
                  description: json.data.description,
                  amount: Number(json.data.amount),
                  category: json.data.categorie,
                  note: json.data.note || "",
                  paymentMethod: json.data.payment || "",
                }
              : e
          )
        );
      } else {
        const res = await fetch(`${GetBackendURL()}/cashflow/createExpense`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) throw new Error("Nepodařilo se uložit výdaj.");
        const json = await res.json();
        const saved = json.data;
        setExpenses((prev) => [
          ...prev,
          {
            id: saved.id,
            date: saved.date,
            description: saved.description,
            amount: Number(saved.amount),
            category: saved.categorie,
            note: saved.note || "",
            paymentMethod: saved.payment || "",
          },
        ]);
      }

      setIsModalOpen(false);
      setIsEditMode(false);
      setEditId(null);
      setNewExpense({
        date: "",
        description: "",
        amount: "",
        category: "",
        note: "",
        paymentMethod: "",
      });
    } catch (err) {
      console.error("❌ Chyba při ukládání výdaje:", err.message);
      alert(err.message);
    }
  };

  const filtered = expenses.filter((e) =>
    e.description.toLowerCase().includes(query.toLowerCase()) ||
    e.category.toLowerCase().includes(query.toLowerCase())
  );

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <>
      <section className="content">
        <Navigation />
        <section className="page-section">
          <div className="page-header">
            <h1>
              <FaPlus className="icon" /> Výdaje
            </h1>
            <button
              className="new-income-btn"
              onClick={() => {
                setIsModalOpen(true);
                setIsEditMode(false);
                setEditId(null);
                setNewExpense({
                  date: "",
                  description: "",
                  amount: "",
                  category: "",
                  note: "",
                  paymentMethod: "",
                });
              }}
            >
              <FaPlus /> Nový výdaj
            </button>
          </div>

          <div className="search-bar-wrapper">
            <input
              type="text"
              placeholder="Hledat podle popisu nebo kategorie…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="income-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Popis</th>
                  <th className="text-right">Částka (Kč)</th>
                  <th>Kategorie</th>
                  <th>Poznámka</th>
                  <th>Platba</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Žádné výdaje nenalezeny.
                    </td>
                  </tr>
                ) : (
                  filtered.map((e) => (
                    <tr key={e.id}>
                      <td>{e.date}</td>
                      <td>{e.description}</td>
                      <td className="text-right">{e.amount.toLocaleString("cs-CZ")} Kč</td>
                      <td>{e.category}</td>
                      <td>{e.note}</td>
                      <td>{e.paymentMethod}</td>
                      <td>
                        <button className="btn edit-btn" onClick={() => handleEditClick(e)}>
                          Upravit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="income-total">
            Celkem výdajů: {total.toLocaleString("cs-CZ")} Kč
          </div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{isEditMode ? "Upravit výdaj" : "Nový výdaj"}</h2>

                <div className="form-group">
                  <label>Datum*</label>
                  <input type="date" name="date" value={newExpense.date} onChange={handleNewExpenseChange} />
                </div>
                <div className="form-group">
                  <label>Popis*</label>
                  <input type="text" name="description" value={newExpense.description} onChange={handleNewExpenseChange} />
                </div>
                <div className="form-group-row">
                  <div className="form-group half">
                    <label>Částka (Kč)*</label>
                    <input type="number" name="amount" value={newExpense.amount} onChange={handleNewExpenseChange} />
                  </div>
                  <div className="form-group half">
                    <label>Platba*</label>
                    <select name="paymentMethod" value={newExpense.paymentMethod} onChange={handleNewExpenseChange}>
                      <option value="">-- Vyberte --</option>
                      <option value="karta">Karta</option>
                      <option value="hotově">Hotově</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Kategorie*</label>
                  <select name="category" value={newExpense.category} onChange={handleNewExpenseChange}>
                    <option value="">-- Vyberte --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Poznámka</label>
                  <textarea name="note" value={newExpense.note} onChange={handleNewExpenseChange} />
                </div>
                <div className="modal-actions">
                <button
  className="btn save"
  onClick={() => {
    if (isEditMode) {
      handleUpdateExpense();
    } else {
      handleSaveExpense();
    }
  }}
>
  {isEditMode ? "Aktualizovat" : "Uložit"}


                  </button>
                  <button className="btn reset" onClick={() => {
                      setIsModalOpen(false);
                      setIsEditMode(false);
                      setEditId(null);
                      setNewExpense({
                        date: "", description: "", amount: "", category: "", note: "", paymentMethod: "",
                      });
                    }}>
                    Zrušit
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </section>
    </>
  );
};

export default Expenses;
