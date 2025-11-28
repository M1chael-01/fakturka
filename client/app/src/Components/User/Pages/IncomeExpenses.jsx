import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import Navigation from "../Nav";
import GetBackendURL from "../../GetBackendURL";
import "../../styles/admin/pages/IncomeExpenses.css";

const IncomeExpenses = () => {
  const categories = ["Prodej", "Služba", "Jiný"];
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [incomes, setIncomes] = useState([]);

  const [newIncome, setNewIncome] = useState({
    date: "",
    description: "",
    amount: "",
    category: "",
    note: "",
    paymentMethod: "",
  });

  const handleNewIncomeChange = (e) => {
    const { name, value } = e.target;
    setNewIncome({ ...newIncome, [name]: value });
  };

  const handleEditClick = (income) => {
    setNewIncome({
      date: income.date,
      description: income.description,
      amount: income.amount,
      category: income.category,
      note: income.note,
      paymentMethod: income.paymentMethod,
    });
    setEditId(income.id);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const fetchResults = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/cashflow/getMoreDetailsIncome`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error(`Chyba serveru: ${res.status}`);

      const data = await res.json();
      if (Array.isArray(data.incomes)) {
        const parsed = data.incomes.map((item) => ({
          id: item.id,
          date: item.date,
          description: item.description,
          amount: Number(item.amount),
          category: item.categorie,
          note: item.note,
          paymentMethod: item.payment,
        }));
        setIncomes(parsed);
      }
    } catch (err) {
      console.error("❌ Chyba při načítání dat:", err.message);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleSaveIncome = async () => {
    if (!newIncome.date || !newIncome.description || !newIncome.amount || !newIncome.category) {
      alert("Vyplňte všechna povinná pole.");
      return;
    }

    if (isNaN(newIncome.amount) || Number(newIncome.amount) <= 0) {
      alert("Částka musí být kladné číslo.");
      return;
    }

    try {
      const endpoint = isEditMode
        ? `${GetBackendURL()}/cashflow/updateIncome`
        : `${GetBackendURL()}/cashflow/createIncome`;

      const bodyPayload = isEditMode
        ? {
            id: editId,
            date: newIncome.date,
            description: newIncome.description,
            amount: newIncome.amount,
            categorie: newIncome.category,
            note: newIncome.note,
            payment: newIncome.paymentMethod,
          }
        : {
            date: newIncome.date,
            description: newIncome.description,
            amount: newIncome.amount,
            categorie: newIncome.category,
            note: newIncome.note,
            payment: newIncome.paymentMethod,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Chyba při ukládání příjmu.");
      }

      const savedIncome = await response.json();

      if (isEditMode) {
        setIncomes((prev) =>
          prev.map((item) =>
            item.id === editId
              ? {
                  ...item,
                  date: savedIncome.data.date,
                  description: savedIncome.data.description,
                  amount: Number(savedIncome.data.amount),
                  category: savedIncome.data.categorie,
                  note: savedIncome.data.note,
                  paymentMethod: savedIncome.data.payment,
                }
              : item
          )
        );
      } else {
        setIncomes((prev) => [
          ...prev,
          {
            id: savedIncome.data.id || prev.length + 1,
            date: savedIncome.data.date,
            description: savedIncome.data.description,
            amount: Number(savedIncome.data.amount),
            category: savedIncome.data.categorie,
            note: savedIncome.data.note,
            paymentMethod: savedIncome.data.payment,
          },
        ]);
      }
           window.location.reload();

      setNewIncome({
        date: "",
        description: "",
        amount: "",
        category: "",
        note: "",
        paymentMethod: "",
      });
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  // Přidána funkce pro smazání příjmu
  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Opravdu chcete tento příjem smazat?")) return;

    try {
      const response = await fetch(`${GetBackendURL()}/cashflow/deleteIncome`, {
        method: "POST",  // nebo DELETE, záleží na API
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Chyba při mazání příjmu.");
      }

      // Po úspěšném smazání aktualizujeme stav
      setIncomes((prev) => prev.filter((income) => income.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  const filteredIncomes = incomes.filter(
    (income) =>
      income.description.toLowerCase().includes(query.toLowerCase()) ||
      income.category.toLowerCase().includes(query.toLowerCase())
  );

  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

  return (
    <>
      <section className="content">
        <Navigation />
        <section className="page-section">
          <div className="page-header">
            <h1>
              <FaPlus className="icon" /> Příjmy
            </h1>
            <button
              className="new-income-btn"
              onClick={() => {
                setIsEditMode(false);
                setNewIncome({ date: "", description: "", amount: "", category: "", note: "", paymentMethod: "" });
                setIsModalOpen(true);
              }}
            >
              <FaPlus /> Nový příjem
            </button>
          </div>

          <div className="search-bar-wrapper">
            <input
              type="text"
              className="income-search-input"
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
                {filteredIncomes.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      Žádné příjmy nenalezeny.
                    </td>
                  </tr>
                ) : (
                  filteredIncomes.map((income) => (
                    <tr key={income.id}>
                     <td>{new Date(income.date).toLocaleDateString()}</td>
                      <td>{income.description}</td>
                      <td className="text-right">{income.amount.toLocaleString("cs-CZ")} Kč</td>
                      <td>{income.category}</td>
                      <td>{income.note}</td>
                      <td>{income.paymentMethod}</td>
                      <td>
                        <button className="btn edit-btn" onClick={() => handleEditClick(income)}>
                          Upravit
                        </button>
                        {/* Tlačítko pro smazání */}
                        <button
                          className="btn delete-btn"
                          onClick={() => handleDeleteIncome(income.id)}
                          style={{ marginLeft: "8px", backgroundColor: "#e74c3c", color: "white" }}
                        >
                          Smazat
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="income-total">Celkem příjmů: {totalIncome.toLocaleString("cs-CZ")} Kč</div>

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{isEditMode ? "Upravit příjem" : "Nový příjem"}</h2>

                <div className="form-group">
                  <label>Datum*</label>
                  <input type="date" name="date" value={newIncome.date} onChange={handleNewIncomeChange} />
                </div>

                <div className="form-group">
                  <label>Popis*</label>
                  <input type="text" name="description" value={newIncome.description} onChange={handleNewIncomeChange} />
                </div>

                <div className="form-group-row">
                  <div className="form-group half">
                    <label>Částka (Kč)*</label>
                    <input type="number" name="amount" value={newIncome.amount} onChange={handleNewIncomeChange} />
                  </div>

                  <div className="form-group half">
                    <label>Platba*</label>
                    <select name="paymentMethod" value={newIncome.paymentMethod} onChange={handleNewIncomeChange}>
                      <option value="">-- Vyberte --</option>
                      <option value="karta">Karta</option>
                      <option value="hotově">Hotově</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Kategorie*</label>
                  <select name="category" value={newIncome.category} onChange={handleNewIncomeChange}>
                    <option value="">-- Vyberte --</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Poznámka</label>
                  <textarea name="note" value={newIncome.note} onChange={handleNewIncomeChange} />
                </div>

                <div className="modal-actions">
                  <button className="btn save" onClick={handleSaveIncome}>
                    {isEditMode ? "Aktualizovat" : "Uložit"}
                  </button>
                  <button
                    className="btn reset"
                    onClick={() => {
                      setIsModalOpen(false);
                      setIsEditMode(false);
                      setNewIncome({
                        date: "",
                        description: "",
                        amount: "",
                        category: "",
                        note: "",
                        paymentMethod: "",
                      });
                    }}
                  >
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

export default IncomeExpenses;
