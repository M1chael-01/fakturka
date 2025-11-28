import React, { useState } from 'react';
import Navigation from '../Nav';
import "../../../styles/admin/pages/Suppliers.css";
import { FaPlus } from "react-icons/fa";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    ico: '',
    bankAccount: '',
    address: ''
  });
  const [editing, setEditing] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, email, phone, ico, bankAccount, address } = formData;
    if (!name || !email || !phone || !ico || !bankAccount || !address) {
      alert("Vyplňte všechna pole.");
      return;
    }

    if (editing) {
      setSuppliers(prev =>
        prev.map(s => (s.id === editing.id ? { ...editing, ...formData } : s))
      );
    } else {
      const newSupplier = { id: Date.now(), ...formData };
      setSuppliers(prev => [...prev, newSupplier]);
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      ico: '',
      bankAccount: '',
      address: ''
    });
    setEditing(null);
    setShowDrawer(false);
  };

  const handleEdit = (supplier) => {
    setEditing(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      ico: supplier.ico,
      bankAccount: supplier.bankAccount,
      address: supplier.address
    });
    setShowDrawer(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Opravdu chcete odstranit tohoto dodavatele?');
    if (confirmDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()) ||
      s.phone.includes(query) ||
      s.ico.includes(query)
  );

  return (
    <>
      <section className="content">
        <Navigation />
        <section id="c" className="page-section">
          <div className="page-header">
            <h1><FaPlus className="icon" /> Dodavatelé</h1>
            <button className="new-income-btn" onClick={() => setShowDrawer(true)}>
              <FaPlus /> Nový dodavatel
            </button>
          </div>

          <div className="search-bar-wrapper">
            <input
              type="text"
              className="income-search-input"
              placeholder="Hledat podle jména, IČO, e-mailu nebo telefonu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="income-table">
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>E-mail</th>
                  <th>Telefon</th>
                  <th>IČO</th>
                  <th>Bankovní účet</th>
                  <th>Sídlo</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">Žádní dodavatelé nenalezeni.</td>
                  </tr>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.name}</td>
                      <td>{supplier.email}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.ico}</td>
                      <td>{supplier.bankAccount}</td>
                      <td>{supplier.address}</td>
                      <td>
                        <button className="btn edit" onClick={() => handleEdit(supplier)}>Upravit</button>
                        <button className="btn delete" onClick={() => handleDelete(supplier.id)}>Smazat</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showDrawer && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>{editing ? "Upravit dodavatele" : "Nový dodavatel"}</h2>

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Jméno*</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>E-mail*</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Telefon*</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>IČO*</label>
                    <input type="text" name="ico" value={formData.ico} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Bankovní účet*</label>
                    <input type="text" name="bankAccount" value={formData.bankAccount} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                    <label>Sídlo*</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} />
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

export default Suppliers;
