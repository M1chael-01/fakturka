import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/admin/Nav.css';
import { useEffect } from 'react';



const navItems = [
  { label: 'Přehled', path: '/app' },
  { label: 'Odběratele', path: '/odberatele' },
  { label: 'Dodavatelé', path: '/dodavatele' },
  {
    label: 'Faktury',
    submenu: [
      { label: 'Faktury přijaté', path: '/faktury-prijate' },
      { label: 'Faktury vydané', path: '/faktury-vydane' },
    ],
  },
  {
    label: 'Transakce',
    submenu: [
      { label: 'Všechny transakce', path: '/transakce/vsechny' },
      { label: 'Příjmy', path: '/transakce/prijmy' },
      { label: 'Výdaje', path: '/transakce/vydaje' },
      { label: 'Export dat', path: '/transakce/export' },
    ],
  },
  {
    label: 'Můj účet',
    submenu: [
      { label: 'Nastavení účtu', path: '/moj-ucet/nastaveni' },
      { label: 'Odhlásit se', path: '/logout' },
      { label: 'Platba', path: '/platba-predplatne' },
    ],
  },
  {
    label: 'Nastavení',
    submenu: [
      { label: 'Obecná nastavení', path: '/nastaveni/obecna' },
      { label: 'Můj plán', path: '/nastaveni/integrace' },
    ],
  },
];






export default function Navigation() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2><span>FA</span>KTURKA</h2>
        <p>tvrikmichael@gmail.com</p>
      </div>

      <nav className="nav-container" aria-label="Hlavní navigace">
        <ul className="nav-list">
          {navItems.map(({ label, path, submenu }) => (
            <li key={label} className={`nav-item ${submenu ? 'has-submenu' : ''}`}>
              {path ? (
                <NavLink
                  to={path}
                  className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                  end
                >
                  {label}
                </NavLink>
              ) : (
                <span className="nav-link" role="button" tabIndex={0}>{label}</span>
              )}

              {submenu && (
                <ul className="submenu">
                  {submenu.map(({ label: subLabel, path: subPath }) => (
                    <li key={subLabel} className="submenu-item">
                      <NavLink
                        to={subPath}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                        end
                      >
                        {subLabel}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
