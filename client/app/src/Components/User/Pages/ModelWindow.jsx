import React, { useState } from 'react';
import '../../../styles/layouts/ModelWindow.css';

const ModelWindow = ({ message, onConfirm, onCancel }) => {
  const [isChecked, setIsChecked] = useState(false);



  

  return (
    <div className="modal-overlay">
      <div className="modal-window" role="dialog" aria-modal="true">
        <div className="modal-header">
          <span className="modal-icon">⚠️</span>
          <h2>Změna plánu</h2>
        </div>

        <p className="modal-message">{message}</p>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="read-confirm"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
          />
          <label htmlFor="read-confirm">Potvrzuji, že jsem si přečetl(a) a souhlasím.</label>
        </div>

        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel}>
            Zrušit
          </button>
          <button
            className="modal-confirm"
            disabled={!isChecked}
            onClick={onConfirm}
          >
            Potvrdit výběr
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelWindow;
