import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TextField,
  Box,
  IconButton,
  Button,
} from '@mui/material';
import { Undo } from '@mui/icons-material';
import ExpertiseModal from './ExpertiseModal';

interface ParameterDetails {
  paramDefId: number;
  objectId: number;
  paramCaption: string;
  paramValue: string;
  isEditing?: boolean;
  tempValue?: string;
}

interface ParametersTableProps {
  onNewExpertise?: (objectId: number) => void;
  searchObject: string;
  setSearchObject: React.Dispatch<React.SetStateAction<string>>;
  parametersData: ParameterDetails[];
  setParametersData: React.Dispatch<React.SetStateAction<ParameterDetails[]>>;
  selectedObjectId: number | null;
  setSelectedObjectId: React.Dispatch<React.SetStateAction<number | null>>;
}

const ParametersTable: React.FC<ParametersTableProps> = ({
  onNewExpertise,
  searchObject,
  setSearchObject,
  parametersData,
  setParametersData,
  selectedObjectId,
  setSelectedObjectId,
}) => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [expertiseModalOpen, setExpertiseModalOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      if (!searchObject.trim()) {
        setParametersData([]);
        setSelectedObjectId(null);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get<ParameterDetails[]>(
          'https://localhost:7075/api/parameters/search',
          { params: { objectName: searchObject } }
        );

        setParametersData(response.data);
        setGlobalError('');

        if (response.data.length > 0) {
          setSelectedObjectId(response.data[0].objectId);
        } else {
          setSelectedObjectId(null);
        }
      } catch (err) {
        setGlobalError('Ошибка при загрузке данных');
        setParametersData([]);
        setSelectedObjectId(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchObject, setParametersData, setSelectedObjectId]);

  // Обработчик изменения параметра
  const handleValueChange = async (
    objectId: number,
    paramDefId: number,
    newValue: string
  ) => {
    if (newValue === parametersData.find(p => p.paramDefId === paramDefId)?.paramValue) return;

    setParametersData(prev =>
      prev.map(p =>
        p.paramDefId === paramDefId
          ? { ...p, isEditing: true }
          : p
      )
    );

    try {
      const response = await axios.put<ParameterDetails>(
        'https://localhost:7075/api/parameters/update',
        {
          ObjectId: objectId,
          ParamDefId: paramDefId,
          NewValue: newValue
        }
      );

      setParametersData(prev =>
        prev.map(p =>
          p.paramDefId === paramDefId
            ? { ...response.data, objectId, tempValue: undefined }
            : p
        )
      );
    } catch (err) {
      setGlobalError('Ошибка сохранения параметра');
      setParametersData(prev =>
        prev.map(p =>
          p.paramDefId === paramDefId
            ? { ...p, tempValue: p.paramValue }
            : p
        )
      );
    } finally {
      setParametersData(prev =>
        prev.map(p =>
          p.paramDefId === paramDefId
            ? { ...p, isEditing: false }
            : p
        )
      );
    }
  };

  // Рендер ячейки с значением
  const renderValueCell = (row: ParameterDetails) => {
    const currentValue = row.tempValue ?? row.paramValue;

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {row.isEditing && <CircularProgress size={20} />}

        <TextField
          value={currentValue}
          variant="standard"
          size="small"
          disabled={row.isEditing}
          onChange={(e) =>
            setParametersData(prev =>
              prev.map(p =>
                p.paramDefId === row.paramDefId
                  ? { ...p, tempValue: e.target.value }
                  : p
              )
            )
          }
          onBlur={() =>
            handleValueChange(row.objectId, row.paramDefId, currentValue)
          }
          sx={{
            width: 150,
            '& .MuiInputBase-input': {
              borderBottom: row.tempValue !== undefined
                ? '2px solid #1976d2'
                : '1px solid #ddd'
            }
          }}
        />

        {row.tempValue !== undefined && (
          <IconButton
            size="small"
            onClick={() =>
              setParametersData(prev =>
                prev.map(p =>
                  p.paramDefId === row.paramDefId
                    ? { ...p, tempValue: undefined }
                    : p
                )
              )
            }
          >
            <Undo fontSize="small" />
          </IconButton>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ margin: '1rem 0' }}>
      <TextField
        fullWidth
        label="Поиск объекта"
        variant="outlined"
        value={searchObject}
        onChange={(e) => setSearchObject(e.target.value)}
        placeholder="Начните вводить название объекта..."
        sx={{ mb: 4 }}
      />

      {globalError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {globalError}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell width={100}>ID параметра</TableCell>
              <TableCell>Название параметра</TableCell>
              <TableCell width={300}>Значение</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <CircularProgress sx={{ my: 3 }} />
                </TableCell>
              </TableRow>
            ) : parametersData.length > 0 ? (
              parametersData.map((row) => (
                <TableRow key={row.paramDefId}>
                  <TableCell>{row.paramDefId}</TableCell>
                  <TableCell>{row.paramCaption}</TableCell>
                  <TableCell>{renderValueCell(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  {searchObject ? 'Ничего не найдено' : 'Введите название объекта'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedObjectId !== null && (
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setExpertiseModalOpen(true)}
          >
            Просмотр экспертиз
          </Button>
          <Button
            variant="contained"
            onClick={() => onNewExpertise?.(selectedObjectId)}
          >
            Создать экспертизу
          </Button>
        </Box>
      )}

      {selectedObjectId !== null && (
        <ExpertiseModal
          open={expertiseModalOpen}
          onClose={() => setExpertiseModalOpen(false)}
          objectId={selectedObjectId}
        />
      )}
    </Box>
  );
};

export default ParametersTable;