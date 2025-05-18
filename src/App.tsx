import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container } from '@mui/material';
import ParametersTable from './components/ParametersTable';
import NewExpertisePage from './pages/NewExpertisePage';

function MainPage() {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ padding: '20px' }}>
        <ParametersTable />
      </Container>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route 
          path="/expertise/new/:objectId" 
          element={<NewExpertisePage />} 
        />
      </Routes>
    </BrowserRouter>
  );
}