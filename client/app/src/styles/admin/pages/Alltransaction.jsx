import { useEffect, useState } from 'react';
import GetBackendURL from '../../../Components/GetBackendURL';
import Navigation from '../../../Components/User/Nav';
import getUserSetting from '../../../fetchAPI/GeneralSetting';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  Button,
  CssBaseline,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

const AllTransaction = () => {
  const [transactionData, setTransactionData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [showChart, setShowChart] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // importnant
  const [darkMode, setDarkMode] = useState(true);

  const fetchData = async () => {
      const data = await getUserSetting();
      if (data) {
        setDarkMode(data.dark)
    };
  }

  useEffect(() =>{
    fetchData();
  },[darkMode])

  const rowsPerPage = 10;

  const fetchedAllData = async () => {
    try {
      const res = await fetch(`${GetBackendURL()}/cashflow/allData`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();

        const enrichedData = data.map(item => ({
          ...item,
          type: item.operation === 'income' ? 'Příjem' : 'Výdaj',
          amount: Number(item.amount),
        }));

        const sortedData = [
          ...enrichedData.filter(d => d.type === 'Výdaj').sort((a, b) => b.amount - a.amount),
          ...enrichedData.filter(d => d.type === 'Příjem').sort((a, b) => b.amount - a.amount),
        ];

        setTransactionData(sortedData);

        const groupedByDate = sortedData.reduce((acc, curr) => {
          const date = new Date(curr.date).toLocaleDateString('cs-CZ');
          const existing = acc.find(item => item.date === date);

          if (existing) {
            if (curr.type === 'Příjem') existing.income += curr.amount;
            else existing.expense += curr.amount;
          } else {
            acc.push({
              date: date,
              income: curr.type === 'Příjem' ? curr.amount : 0,
              expense: curr.type === 'Výdaj' ? curr.amount : 0,
            });
          }

          return acc;
        }, []);

        setChartData(groupedByDate);
      } else {
        console.error('Server error:', res.status);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchedAllData();
  }, []);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const displayedRows = transactionData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalIncome = transactionData
    .filter(t => t.type === 'Příjem')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactionData
    .filter(t => t.type === 'Výdaj')
    .reduce((sum, t) => sum + t.amount, 0);

  // Theme configuration
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <section className="content">
        <Navigation />
        <Box
          p={4}
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
            color: 'text.primary',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" fontWeight={600}>
              Přehled financí
            </Typography>
            
             
          
          </Box>

          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6">Celkové příjmy</Typography>
                <Typography variant="h4" color="success.main">
                  {totalIncome.toLocaleString('cs-CZ')} Kč
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6">Celkové výdaje</Typography>
                <Typography variant="h4" color="error.main">
                  {totalExpense.toLocaleString('cs-CZ')} Kč
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box display="flex" gap={2} mb={3}>
            <Button
              variant={showChart ? 'contained' : 'outlined'}
              onClick={() => setShowChart(true)}
            >
              Zobrazit graf
            </Button>
            <Button
              variant={!showChart ? 'contained' : 'outlined'}
              onClick={() => setShowChart(false)}
            >
              Zobrazit tabulku
            </Button>
          </Box>

          {showChart ? (
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h6" mb={2}>
                Vývoj financí
              </Typography>
              <Box sx={{ width: '100em', height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <Line type="monotone" dataKey="income" stroke="#4caf50" name="Příjmy" />
                    <Line type="monotone" dataKey="expense" stroke="#f44336" name="Výdaje" />
                    <CartesianGrid stroke="#8884d8" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ) : (
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" mb={2}>
                Transakce
              </Typography>
              <Box sx={{ overflowX: 'auto' }}>
                <Table sx={{ width: '100em' }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Typ</TableCell>
                      <TableCell>Kategorie</TableCell>
                      <TableCell>Částka</TableCell>
                      <TableCell>Datum</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {displayedRows.map((tx, index) => (
                      <TableRow key={index}>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.categorie}</TableCell>
                        <TableCell
                          sx={{
                            color: tx.type === 'Příjem' ? 'success.main' : 'error.main',
                          }}
                        >
                          {tx.type === 'Příjem' ? '+' : '-'}{' '}
                          {tx.amount.toLocaleString('cs-CZ')} Kč
                        </TableCell>
                        <TableCell>
                          {new Date(tx.date).toLocaleDateString('cs-CZ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>

              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={Math.ceil(transactionData.length / rowsPerPage)}
                  page={currentPage}
                  onChange={handleChangePage}
                  color="primary"
                />
              </Box>
            </Paper>
          )}
        </Box>
      </section>
    </ThemeProvider>
  );
};

export default AllTransaction;
