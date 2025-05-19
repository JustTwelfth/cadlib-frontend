import React, { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, Container, Typography, Box, Button, Stack } from '@mui/material';
import IFCViewer from './components/IFCViewer';
import ParametersModal from './components/ParametersModal';
import NewExpertiseModal from './components/NewExpertiseModal';

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

  return (
    <Container maxWidth="xl" sx={{ padding: '20px' }}>
      <Typography variant="h4" align="center" gutterBottom>
        Ведение ЭИМ
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mb: 2 }}>
          <Button variant="contained" onClick={() => alert('Функционал профиля пока не реализован')}>
            Профиль
          </Button>
          <Button variant="contained" onClick={() => setIsParametersModalOpen(true)}>
            Просмотр и добавление данных
          </Button>
        </Stack>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <IFCViewer />
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
    <BrowserRouter>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<MainPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;