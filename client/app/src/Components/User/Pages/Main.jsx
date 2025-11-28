import {
  Box,
  Typography,
  Paper,
  Grid
} from "@mui/material";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import React from "react";
import { FaSearch, FaPlus, FaDownload } from "react-icons/fa";
import Navigation from "../Nav";
import "../../../styles/admin/pages/Dashboard.css";

const Main = () => {
  const [summary] = React.useState({
    income: { amount: 12345, currency: "Kč", description: "Celkové příjmy za tento měsíc" },
    expenses: { amount: 6789, currency: "Kč", description: "Celkové výdaje za tento měsíc" },
    customers: { count: 25, description: "Počet aktivních odběratelů" },
    suppliers: { count: 10, description: "Počet aktivních dodavatelů" },
    today: new Date(),
  });

  // Data pro spojené grafy
  const customersSuppliersData = [
    { month: "Leden", customers: 5, suppliers: 2 },
    { month: "Únor", customers: 8, suppliers: 4 },
    { month: "Březen", customers: 6, suppliers: 3 },
    { month: "Duben", customers: 10, suppliers: 5 },
    { month: "Květen", customers: 7, suppliers: 6 },
  ];

  const invoicesData = [
    { month: "Leden", issued: 15, received: 12 },
    { month: "Únor", issued: 20, received: 14 },
    { month: "Březen", issued: 18, received: 10 },
    { month: "Duben", issued: 25, received: 16 },
    { month: "Květen", issued: 22, received: 15 },
  ];

  const formatDate = (date) =>
    date.toLocaleDateString("cs-CZ", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    });

  return (
    <section className="dashboard-content">
      <Navigation />

      <main className="main">
        {/* Header */}
        <header className="main-header">
          <div>
            <h1>Faktury & Přehled</h1>
            <p className="subtitle">Spravujte faktury a sledujte finanční přehled</p>
          </div>
          
        </header>

        {/* Overview cards */}
        <section className="dashboard-overview">
          <div className="card">
            <h3>Příjmy</h3>
            <p className="amount">{summary.income.amount.toLocaleString("cs-CZ")} {summary.income.currency}</p>
            <small>{summary.income.description}</small>
          </div>
          <div className="card">
            <h3>Výdaje</h3>
            <p className="amount">{summary.expenses.amount.toLocaleString("cs-CZ")} {summary.expenses.currency}</p>
            <small>{summary.expenses.description}</small>
          </div>
          <div className="card">
            <h3>Odběratelé</h3>
            <p className="amount">{summary.customers.count}</p>
            <small>{summary.customers.description}</small>
          </div>
          <div className="card">
            <h3>Dodavatelé</h3>
            <p className="amount">{summary.suppliers.count}</p>
            <small>{summary.suppliers.description}</small>
          </div>
          <div className="card">
            <h3>Dnešní datum</h3>
            <p className="amount">{formatDate(summary.today)}</p>
          </div>
        </section>

        {/* Spojené grafy */}
        <Box mt={4}>
          <Grid container spacing={3}>
            {/* Odběratelé + Dodavatelé */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 420 , width:"60em"}}>
                <Typography variant="h6" gutterBottom>
                  Odběratelé & Dodavatelé
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={customersSuppliersData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="customers" name="Odběratelé" stroke="#007bff" strokeWidth={2} />
                    <Line type="monotone" dataKey="suppliers" name="Dodavatelé" stroke="#28a745" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Faktury vydané + přijaté */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 420 , width:"60em" }}>
                <Typography variant="h6" gutterBottom>
                  Faktury vydané & přijaté
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={invoicesData}>
                    <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="issued" name="Vydané faktury" stroke="#ffc107" strokeWidth={2} />
                    <Line type="monotone" dataKey="received" name="Přijaté faktury" stroke="#dc3545" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </main>
    </section>
  );
};

export default Main;
