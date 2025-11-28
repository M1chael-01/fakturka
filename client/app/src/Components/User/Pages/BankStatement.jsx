import React, { useState, useEffect } from 'react';
import "../../../styles/admin/pages/BankStatement.css";


export default function BankStatement() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);

  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [note, setNote] = useState('');
  const [message, setMessage] = useState(null);
  const [sending, setSending] = useState(false);

  // Fetch transactions from backend
  const fetchTransactions = async () => {
    setLoadingTx(true);
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('Failed to fetch transactions');
      const data = await res.json();
      setTransactions(data);
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setLoadingTx(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Calculate balance
  const balance = transactions.reduce((acc, t) => acc + t.amount, 0);

  // Send money handler
  const handleSendMoney = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!recipient.trim()) {
      setMessage({ type: 'error', text: 'Please enter recipient account.' });
      return;
    }
    const amountNumber = Number(sendAmount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid positive amount.' });
      return;
    }
    if (amountNumber > balance) {
      setMessage({ type: 'error', text: 'Insufficient balance.' });
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/send-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, amount: amountNumber, note }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to send money');
      }
      const result = await res.json();
      setMessage({ type: 'success', text: result.message || 'Money sent successfully' });
      setRecipient('');
      setSendAmount('');
      setNote('');
      await fetchTransactions(); // refresh transactions after success
    } catch (e) {
      setMessage({ type: 'error', text: e.message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: 'auto', fontFamily: 'Arial, sans-serif' }}>
      <h2>Bank Statement</h2>

      <div style={{ marginBottom: 20 }}>
        <strong>Current Balance: </strong>
        <span style={{ color: balance < 0 ? 'red' : 'green' }}>
          {balance.toLocaleString()} CZK
        </span>
      </div>

      {loadingTx ? (
        <p>Loading transactions...</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount (CZK)</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map(({ id, date, amount, description }) => (
                <tr key={id}>
                  <td>{date}</td>
                  <td style={{ color: amount < 0 ? 'red' : 'green' }}>
                    {amount.toLocaleString()}
                  </td>
                  <td>{description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <h3 style={{ marginTop: 40 }}>Send Money</h3>
      <form onSubmit={handleSendMoney} style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 10 }}>
          <label>
            Recipient Account:{' '}
            <input
              type="text"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              placeholder="Account number"
              required
              disabled={sending}
            />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Amount (CZK):{' '}
            <input
              type="number"
              value={sendAmount}
              onChange={e => setSendAmount(e.target.value)}
              placeholder="Amount to send"
              min="0.01"
              step="0.01"
              required
              disabled={sending}
            />
          </label>
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>
            Note (optional):{' '}
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Note for the transaction"
              disabled={sending}
            />
          </label>
        </div>
        <button type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>

      {message && (
        <div
          style={{
            padding: 10,
            color: message.type === 'error' ? 'red' : 'green',
            border: `1px solid ${message.type === 'error' ? 'red' : 'green'}`,
            marginBottom: 20,
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
