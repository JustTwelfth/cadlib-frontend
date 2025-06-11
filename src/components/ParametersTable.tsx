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
  selectedCdeid: string | null;
}

const ParametersTable: React.FC<ParametersTableProps> = ({
  onNewExpertise,
  searchObject,
  setSearchObject,
  parametersData,
  setParametersData,
  selectedObjectId,
  setSelectedObjectId,
  selectedCdeid,
}) => {
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [expertiseModalOpen, setExpertiseModalOpen] = useState(false);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [paramErrors, setParamErrors] = useState<{ [key: number]: string }>({});

  const filteredParametersData = isEditingMode
    ? parametersData
    : parametersData.filter(
        (row) => row.paramValue !== '' && row.paramValue !== null && row.paramValue !== undefined
      );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (selectedCdeid) {
          const response = await axios.get<ParameterDetails[]>(
            'https://localhost:7075/api/parameters/search-by-cdeid',
            { params: { cdeid: selectedCdeid } }
          );
          setParametersData(response.data);
          setGlobalError('');
          if (response.data.length > 0) {
            setSelectedObjectId(response.data[0].objectId);
          } else {
            setSelectedObjectId(null);
          }
        } else if (searchObject.trim()) {
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
        } else {
          setParametersData([]);
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
  }, [selectedCdeid, searchObject, setParametersData, setSelectedObjectId]);

  const handleValueChange = async (
    objectId: number,
    paramDefId: number,
    newValue: string
  ) => {
    if (newValue === parametersData.find((p) => p.paramDefId === paramDefId)?.paramValue) return;

    setParametersData((prev) =>
      prev.map((p) =>
        p.paramDefId === paramDefId ? { ...p, isEditing: true } : p
      )
    );
    setParamErrors((prev) => ({ ...prev, [paramDefId]: '' }));

    try {
      const response = await axios.put<ParameterDetails>(
        'https://localhost:7075/api/parameters/update',
        {
          ObjectId: objectId,
          ParamDefId: paramDefId,
          NewValue: newValue,
        }
      );

      setParametersData((prev) =>
        prev.map((p) =>
          p.paramDefId === paramDefId
            ? { ...p, paramValue: response.data.paramValue, tempValue: undefined }
            : p
        )
      );
    } catch (err: any) {
      const errorMessage = err.response?.data || 'Ошибка при сохранении параметра';
      setParamErrors((prev) => ({ ...prev, [paramDefId]: errorMessage }));
      setParametersData((prev) =>
        prev.map((p) =>
          p.paramDefId === paramDefId ? { ...p, tempValue: p.paramValue } : p
        )
      );
    } finally {
      setParametersData((prev) =>
        prev.map((p) =>
          p.paramDefId === paramDefId ? { ...p, isEditing: false } : p
        )
      );
    }
  };

  const renderValueCell = (row: ParameterDetails) => {
    const currentValue = row.tempValue ?? row.paramValue;
    const error = paramErrors[row.paramDefId];

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.isEditing && <CircularProgress size={20} sx={{ color: 'primary.main' }} />}
          <TextField
            value={currentValue}
            variant="standard"
            size="small"
            disabled={!isEditingMode}
            inputProps={{ readOnly: !isEditingMode }}
            onChange={(e) =>
              isEditingMode &&
              setParametersData((prev) =>
                prev.map((p) =>
                  p.paramDefId === row.paramDefId ? { ...p, tempValue: e.target.value } : p
                )
              )
            }
            onBlur={() => isEditingMode && handleValueChange(row.objectId, row.paramDefId, currentValue)}
            sx={{
              width: 150,
              '& .MuiInputBase-input': {
                color: 'text.primary',
                borderBottom:
                  row.tempValue !== undefined ? '2px solid #3498DB' : '1px solid #BDC3C7',
              },
            }}
          />
          {row.tempValue !== undefined && isEditingMode && (
            <IconButton
              size="small"
              onClick={() =>
                setParametersData((prev) =>
                  prev.map((p) =>
                    p.paramDefId === row.paramDefId ? { ...p, tempValue: undefined } : p
                  )
                )
              }
              sx={{ color: 'text.secondary' }}
            >
              <Undo fontSize="small" />
            </IconButton>
          )}
        </Box>
        {error && (
          <Typography color="error" variant="caption">
            {error}
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ margin: '1rem 0' }}>
      {!selectedCdeid && (
        <TextField
          fullWidth
          label="Поиск объекта"
          variant="outlined"
          value={searchObject}
          onChange={(e) => setSearchObject(e.target.value)}
          sx={{ mb: 4 }}
        />
      )}

      {globalError && (
        <Typography color="error" sx={{ mb: 2 }}>
          {globalError}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
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
                  <CircularProgress sx={{ my: 3, color: 'primary.main' }} />
                </TableCell>
              </TableRow>
            ) : filteredParametersData.length > 0 ? (
              filteredParametersData.map((row) => (
                <TableRow key={row.paramDefId}>
                  <TableCell>{row.paramDefId}</TableCell>
                  <TableCell>{row.paramCaption}</TableCell>
                  <TableCell>{renderValueCell(row)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ color: 'text.secondary' }}>
                  {selectedCdeid ? 'Данные не найдены' : (searchObject ? 'Ничего не найдено' : 'Введите название объекта')}
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
            color="primary"
            onClick={() => setExpertiseModalOpen(true)}
          >
            Просмотр дефектов
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onNewExpertise?.(selectedObjectId)}
          >
            Записать дефект
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsEditingMode((prev) => !prev)}
          >
            {isEditingMode ? 'Завершить редактирование' : 'Редактировать'}
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