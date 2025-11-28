import React, { useState } from 'react';
import Navigation from '../Nav';
import "../../../styles/admin/pages/Suppliers.css";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
    setFormData({ name: '', email: '', phone: '' });
    setEditing(null);
    setShowDrawer(false);
  };

  const handleEdit = (supplier) => {
    setEditing(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
    });
    setShowDrawer(true);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm('Opravdu chcete odstranit tohoto dodavatele?');
    if (confirmDelete) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      setSelectedSupplier(null);
    }
  };

  return (
    <section className="content">
      <Navigation />
      <div className="suppliers-page">
        <header className="page-header">
          <div>
            <h1>Dodavatelé</h1>
            <p>Spravujte své dodavatele a jejich kontaktní informace.</p>
          </div>
          <button onClick={() => setShowDrawer(true)} className="btn-primary">
            ➕ Přidat dodavatele
          </button>
        </header>

        {suppliers.length === 0 ? (
          <div className="empty-state">
            <h2>Žádní dodavatelé</h2>
            <p>Začněte tím, že přidáte svého prvního dodavatele.</p>
            <button onClick={() => setShowDrawer(true)} className="btn-primary">
              Přidat dodavatele
            </button>
          </div>
        ) : (
          <div className="suppliers-list">
            <table className="suppliers-table">
              <thead>
                <tr>
                  <th>Jméno</th>
                  <th>Email</th>
                  <th>Telefon</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <button
                        className="link"
                        onClick={() => setSelectedSupplier(s)}
                      >
                        {s.name}
                      </button>
                    </td>
                    <td>{s.email}</td>
                    <td>{s.phone}</td>
                    <td>
                      <button className="link" onClick={() => handleEdit(s)}>
                        Upravit
                      </button>
                      <button
                        className="link danger"
                        onClick={() => handleDelete(s.id)}
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedSupplier && (
          <div className="customer-detail">
            <h3>Detail dodavatele</h3>
            <p><strong>Jméno:</strong> {selectedSupplier.name}</p>
            <p><strong>Email:</strong> {selectedSupplier.email}</p>
            <p><strong>Telefon:</strong> {selectedSupplier.phone}</p>
            <button className="link" onClick={() => setSelectedSupplier(null)}>
              Zavřít
            </button>
          </div>
        )}

        {showDrawer && (
          <div className="drawer open">
            <div className="drawer-header">
              <h2>{editing ? 'Upravit dodavatele' : 'Přidat nového dodavatele'}</h2>
              <button onClick={resetForm} className="close-btn">×</button>
            </div>
            <form onSubmit={handleSubmit} className="drawer-form">
              <label>Jméno</label>
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Např. Dodavatel s.r.o."
                required
              />
              <label>Email</label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="např. kontakt@dodavatel.cz"
                required
              />
              <label>Telefon</label>
              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+420 123 456 789"
                required
              />
              <button type="submit" className="btn-primary">
                {editing ? 'Uložit změny' : 'Uložit dodavatele'}
              </button>
            </form>
          </div>
        )}
      </div>
    </section>
  );
};

export default Suppliers;
