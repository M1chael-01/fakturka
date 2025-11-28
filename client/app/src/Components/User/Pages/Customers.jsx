import React, { useState, useEffect } from 'react';
import Navigation from '../Nav';
import '../../../styles/admin/pages/Customers.css';
import { FaPlus } from "react-icons/fa";
import GetBackendURL from '../../GetBackendURL';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '', address: '', email: '', phone: '',
    ico: '', bankAccount: '', note: ''
  });
  const [editing, setEditing] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [query, setQuery] = useState("");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ name: '', address: '', email: '', phone: '', ico: '', bankAccount: '', note: '' });
    setEditing(null);
    setShowDrawer(false);
  };

  // Create or update customer
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, address } = formData;
    if (!name || !address) {
      alert("Vyplňte povinná pole: Jméno a Adresa.");
      return;
    }

    if (editing) {
      // Update existing
      try {
        const res = await fetch(`${GetBackendURL()}/business/updateRecord`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id: editing.id })
        });

        if (!res.ok) {
          const errMsg = await res.text();
          alert("Chyba při aktualizaci: " + errMsg);
        } else {
          const updated = await res.json();
          console.log("Záznam aktualizován:", updated);
          window.location.reload();
          resetForm();
        }
      } catch (err) {
        console.error("Chyba při PUT požadavku:", err);
      }
    } else {
      // Create new
      const newCustomer = { id: Date.now(), ...formData };
      setCustomers(prev => [newCustomer, ...prev]);
      // Optionally send to backend
      try {
        await fetch(`${GetBackendURL()}/business/createNewCustomerRecord`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: formData })
        });
      } catch (err) {
        console.error("Chyba při vytváření záznamu:", err);
      }
      resetForm();
    }
  };

  const handleEdit = (customer) => {
    setEditing(customer);
    setFormData({ ...customer });
    setShowDrawer(true);
  };

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Opravdu chcete odstranit tohoto odběratele?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${GetBackendURL()}/business/deleteRecord`, {
      method: "POST", // Or DELETE if backend supports it
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id })
    });

    if (res.ok) {
      const result = await res.json();
      console.log("✅ Odběratel byl smazán:", result);
      setCustomers(prev => prev.filter(c => c.id !== id)); // Update the UI
    } else {
      const error = await res.text();
      alert(`❌ Chyba při mazání: ${error}`);
    }
  } catch (err) {
    console.error("Chyba při požadavku na smazání:", err);
    alert("Chyba serveru.");
  }
};


  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.email.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.includes(query) ||
    c.ico.includes(query)
  );

  // Fetch from backend
  const fetchIncomingData = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/business/selectCustomers`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map((i, idx) => ({
          id: i.id ?? idx,
          name: i.name ?? "",
          address: i.address ?? "",
          email: i.email ?? "",
          phone: i.phone ?? "",
          ico: i.ico ?? "",
          bankAccount: i.bankAccount ?? "",
          note: i.note ?? ""
        }));
        setCustomers(formatted);
      } else {
        console.error("Failed to fetch:", res.statusText);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchIncomingData();
  }, []);

  return (
    <>
      <section className="content">
        <Navigation />
        <section id="c" className="page-section">
          <div className="page-header">
            <h1><FaPlus className="icon" /> Odběratelé</h1>
            <button className="new-income-btn" onClick={() => setShowDrawer(true)}>
              <FaPlus /> Nový odběratel
            </button>
          </div>

          <div className="search-bar-wrapper">
            <input
              type="text"
              className="income-search-input"
              placeholder="Hledat podle jména, IČO, e-mailu nebo telefonu…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="income-table">
              <thead>
                <tr>
                  <th>Jméno</th><th>Adresa</th><th>Email</th><th>Telefon</th><th>IČO</th><th>Poznámka</th><th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr><td colSpan="7" className="no-data">Žádní odběratelé nenalezeni.</td></tr>
                ) : (
                  filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.address}</td>
                      <td>{c.email}</td>
                      <td>{c.phone}</td>
                      <td>{c.ico}</td>
                      <td>{c.note}</td>
                      <td>
                        <button className="btn edit" onClick={() => handleEdit(c)}>Upravit</button>
                        <button className="btn delete" onClick={() => handleDelete(c.id)}>Smazat</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showDrawer && (
            <div className="modal-overlay" onClick={resetForm}>
              <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>{editing ? "Upravit odběratele" : "Nový odběratel"}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Jméno a příjmení*</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Telefon</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Adresa*</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>IČO</label>
                      <input type="text" name="ico" value={formData.ico} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                      <label>Bankovní účet</label>
                      <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Poznámka</label>
                    <textarea name="note" value={formData.note} onChange={handleChange} />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn save">Uložit</button>
                    <button type="button" className="btn reset" onClick={resetForm}>Zrušit</button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </section>
      </section>
    </>
  );
};

export default Customers;
