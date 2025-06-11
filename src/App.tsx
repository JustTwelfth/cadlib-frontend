import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, Typography, Box, Button, Stack, ThemeProvider } from '@mui/material';
import ParametersModal from './components/ParametersModal';
import NewExpertiseModal from './components/NewExpertiseModal';
import TestIfcViewer from './components/testifcviewer';
import theme from './theme';

interface ParameterDetails {
  paramDefId: number;
  objectId: number;
  paramCaption: string;
  paramValue: string;
  isEditing?: boolean;
  tempValue?: string;
}

const MainPage: React.FC = () => {
  const [isParametersModalOpen, setIsParametersModalOpen] = useState(false);
  const [newExpertiseObjectId, setNewExpertiseObjectId] = useState<number | null>(null);
  const [searchObject, setSearchObject] = useState('');
  const [parametersData, setParametersData] = useState<ParameterDetails[]>([]);
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [selectedCdeid, setSelectedCdeid] = useState<string | null>(null);

  return (
    <Container maxWidth="xl" sx={{ padding: '20px', bgcolor: 'background.default', minHeight: '100vh' }}>
      <Typography variant="h4" align="center" gutterBottom sx={{ color: 'text.primary' }}>
        Ведение ЭИМ
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => alert('Функционал профиля пока не реализован')}>
            Профиль
          </Button>
          <Button variant="contained" color="primary" onClick={() => setIsParametersModalOpen(true)}>
            Просмотр и добавление данных
          </Button>
        </Stack>
        <Box sx={{ width: { xs: '100%', md: '95%' }, mx: 'auto' }}>
          <TestIfcViewer setSelectedCdeid={setSelectedCdeid} />
        </Box>
      </Box>
      <ParametersModal
        open={isParametersModalOpen}
        onClose={() => setIsParametersModalOpen(false)}
        onNewExpertise={(objectId) => setNewExpertiseObjectId(objectId)}
        searchObject={searchObject}
        setSearchObject={setSearchObject}
        parametersData={parametersData}
        setParametersData={setParametersData}
        selectedObjectId={selectedObjectId}
        setSelectedObjectId={setSelectedObjectId}
        selectedCdeid={selectedCdeid}
      />
      {newExpertiseObjectId !== null && (
        <NewExpertiseModal
          open={!!newExpertiseObjectId}
          onClose={() => setNewExpertiseObjectId(null)}
          objectId={newExpertiseObjectId}
        />
      )}
    </Container>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <BrowserRouter>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<MainPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;