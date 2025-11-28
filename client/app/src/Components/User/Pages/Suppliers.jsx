import React, { useState,useEffect } from 'react';
import GetBackendURL from '../../GetBackendURL';
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone, ico, bankAccount, address } = formData;
    if (!name || !email || !phone || !ico || !bankAccount || !address) {
      alert("Vyplňte všechna pole.");
      return;
    }

    if (editing) {
      try {
      const res = await fetch(`${GetBackendURL()}/business/updateRecord`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ ...formData, id: editing.id })
      });

      if (res.ok) {
        const updated = await res.json();
        console.log("✅ Záznam aktualizován:", updated);
           window.location.reload();
        setSuppliers(prev =>
          prev.map(s => (s.id === editing.id ? { ...formData, id: editing.id } : s))
        );

        resetForm();
      } else {
        const error = await res.text();
        alert("❌ Chyba při aktualizaci: " + error);
      }
    } catch (err) {
      console.error("Chyba při PUT požadavku:", err);
    }
    } else {
      const newSupplier = { id: Date.now(), ...formData };
      setSuppliers(prev => [...prev, newSupplier]);
     await CreteNewRecord(formData);
      window.location.reload();
    }
  
     console.log(formData); 

   // resetForm();
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

  const handleDelete = async (id) => {
  const confirmDelete = window.confirm('Opravdu chcete odstranit tohoto dodavatele?');
  if (!confirmDelete) return;

  try {
    const res = await fetch(`${GetBackendURL()}/business/deleteRecord`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id }) // ✅ correctly inside fetch
    });

    if (res.ok) {
      const result = await res.json();
      console.log("Dodavatel byl smazán:", result);
      setSuppliers(prev => prev.filter(s => s.id !== id)); // ✅ update UI
    } else {
      const error = await res.text();
      alert(`Chyba při mazání: ${error}`);
    }
  } catch (err) {
    console.error("Chyba při požadavku na smazání:", err);
    alert("Chyba serveru.");
  }
};



  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.email.toLowerCase().includes(query.toLowerCase()) ||
      s.phone.includes(query) ||
      s.ico.includes(query)
  );





  const CreteNewRecord = async (data) =>{
    try{
        const res = await fetch(`${GetBackendURL()}/business/createNewSupplierRecord`,{
          method:"POST",
          credentials:"include",
          headers:{
            "Content-Type":"application/json"
          },
          body:JSON.stringify({
            data
          })

        })
        if(!res.ok) {
         const errorText = await res.text();
        alert(errorText);
        }
        else{
          const result = await res.json();
        console.log("Úspěch:", result);
        }
    }
    catch(err) {
      throw new Error(err);
    }
  }



  const fetchIncomingData = async () =>{
    
    try{
      const res = await fetch(`${GetBackendURL()}/business/selectSuppliers`,{
        method:"GET",
        credentials:"include",
        headers:{
            "Content-Type": "application/json"
        }
      })
      if(res.ok) {
        const data = await  res.json();
        console.log(data);

            const formatedData = data.map((i, index) => ({
        id: i.id || index, // Add id if missing from backend
        name: i.name,
        email: i.email,
        phone: i.phone,
        ico: i.ico,
        
        bankAccount: i.bankAccount,
        address: i.address,
        note: i.note || ''
      }));

       
        setSuppliers(formatedData);
       
      }

      

      else{
 console.error("Failed to fetch data:", res.statusText);
      }
    }
    catch(err) {
      console.error(err);
    }
  }

useEffect(() => {
  const fetchData = async () => {
    await fetchIncomingData();
  };

  fetchData();
}, []);

 


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
  <div className="modal-overlay" onClick={resetForm}>
    <div id="modal" className="modal" onClick={(e) => e.stopPropagation()}>
      <h2>{editing ? "Upravit dodavatele" : "Nový dodavatel"}</h2>

      <form onSubmit={handleSubmit}>
        {/* Jméno + Bankovní účet */}
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="name">Jméno*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group half">
            <label htmlFor="bankAccount">Bankovní účet*</label>
            <input
              type="text"
              id="bankAccount"
              name="bankAccount"
              value={formData.bankAccount}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* E-mail */}
        <div className="form-group">
          <label htmlFor="email">E-mail*</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        {/* Telefon + IČO */}
        <div className="form-row">
          <div className="form-group half">
            <label htmlFor="phone">Telefon*</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              pattern="\+?[0-9\s\-]{7,15}"
              title="Zadejte platné telefonní číslo"
            />
          </div>

          <div className="form-group half">
            <label htmlFor="ico">IČO*</label>
            <input
              type="text"
              id="ico"
              name="ico"
              value={formData.ico}
              onChange={handleChange}
              required
              pattern="\d{8}"
              title="Zadejte 8místné IČO"
            />
          </div>
        </div>

        {/* Sídlo */}
        <div className="form-group">
          <label htmlFor="address">Sídlo*</label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
         <div className="form-group">
          <label>Poznámka</label>
          <textarea name="note" value={formData.note} onChange={handleChange} />
        </div>

        {/* Buttons */}
        <div className="modal-actions">
          <button  type="submit" className="btn save">Uložit</button>
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
