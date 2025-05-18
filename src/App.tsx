import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, Typography, Grid, Box } from '@mui/material';
import IFCViewer from './components/IFCViewer';
import ParametersTable from './components/ParametersTable';
import NewExpertisePage from './pages/NewExpertisePage';

const MainPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Ведение ЭИМ
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid xs={12} md={6} {...({ item: true } as any)}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <IFCViewer />
            </Box>
          </Grid>
          <Grid xs={12} md={6} {...({ item: true } as any)}>
            <ParametersTable />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/expertise/new/:objectId" element={<NewExpertisePage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;