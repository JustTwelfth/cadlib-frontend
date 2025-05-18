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
  Button
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

export default function ParametersTable() {
  const [data, setData] = useState<ParameterDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [searchObject, setSearchObject] = useState('');
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null);
  const [expertiseModalOpen, setExpertiseModalOpen] = useState(false);

  // Загрузка данных
  useEffect(() => {
    const fetchData = async () => {
      if (!searchObject.trim()) {
        setData([]);
        setSelectedObjectId(null);
        return;
      }

      setLoading(true);
      try {
        const response = await axios.get<ParameterDetails[]>(
          'https://localhost:7075/api/parameters/search',
          { params: { objectName: searchObject } }
        );

        setData(response.data);
        setGlobalError('');
        
        if (response.data.length > 0) {
          setSelectedObjectId(response.data[0].objectId);
        } else {
          setSelectedObjectId(null);
        }
      } catch (err) {
        setGlobalError('Ошибка при загрузке данных');
        setData([]);
        setSelectedObjectId(null);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchObject]);

  // Обработчик изменения параметра
  const handleValueChange = async (
    objectId: number,
    paramDefId: number,
    newValue: string
  ) => {
    if (newValue === data.find(p => p.paramDefId === paramDefId)?.paramValue) return;

    setData(prev => 
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

      setData(prev =>
        prev.map(p =>
          p.paramDefId === paramDefId
            ? { ...response.data, objectId, tempValue: undefined }
            : p
        )
      );
    } catch (err) {
      setGlobalError('Ошибка сохранения параметра');
      setData(prev =>
        prev.map(p =>
          p.paramDefId === paramDefId
            ? { ...p, tempValue: p.paramValue }
            : p
        )
      );
    } finally {
      setData(prev =>
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
            setData(prev =>
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
              setData(prev =>
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
    <Box sx={{ maxWidth: 1200, margin: '2rem auto', p: 3 }}>
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
            ) : data.length > 0 ? (
              data.map((row) => (
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
        <Button 
          variant="contained" 
          onClick={() => setExpertiseModalOpen(true)}
          sx={{ mt: 2 }}
        >
          Просмотр экспертиз
        </Button>
      )}

      <ExpertiseModal 
        open={expertiseModalOpen} 
        onClose={() => setExpertiseModalOpen(false)} 
        objectId={selectedObjectId}
      />
    </Box>
  );
}