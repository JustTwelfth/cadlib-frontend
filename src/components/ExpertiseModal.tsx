import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Modal,
  Box,
  Typography,
  Button,
  CircularProgress,
  Divider,
  Alert,
  CardMedia,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface Expertise {
  idNode: number;
  status: string | null;
  date: string | null;
  message: string;
  comment: string | null;
  idObject: number;
  idFile?: number | null;
  imageBase64?: string | null;
  documentBase64?: string | null;
  documentFileName?: string | null;
  hazardCategory?: string | null;
}

interface ExpertiseModalProps {
  open: boolean;
  onClose: () => void;
  objectId: number | null;
}

const ExpertiseModal: React.FC<ExpertiseModalProps> = ({ open, onClose, objectId }) => {
  const [expertises, setExpertises] = useState<Expertise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExpertises = async () => {
      if (!open || !objectId) return;

      setLoading(true);
      setError('');

      try {
        const response = await axios.get<Expertise[]>(
          `https://localhost:7075/api/expertise/by-object/${objectId}`
        );
        setExpertises(response.data);
      } catch (err) {
        setError('Не удалось загрузить экспертизы');
        console.error('Ошибка запроса:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpertises();
  }, [open, objectId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не указана';

    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Некорректная дата';
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="expertise-modal-title"
      sx={{ zIndex: 1350 }}
    >
      <Box
        sx={{
          bgcolor: 'background.paper', // #2C3E50
          p: 4,
          maxWidth: { xs: '90%', md: 800 },
          margin: '5% auto',
          borderRadius: 2,
          maxHeight: '80vh',
          overflowY: 'auto',
          color: 'text.primary', // #ECF0F1
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          id="expertise-modal-title"
        >
          Экспертизы объекта #{objectId}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        ) : expertises.length === 0 ? (
          <Typography sx={{ color: 'text.secondary' }}>
            Нет доступных экспертиз для этого объекта
          </Typography>
        ) : (
          expertises.map((expertise, index) => (
            <Box key={expertise.idNode} sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  #{expertise.idNode}
                </Typography>
                <Typography variant="subtitle1">
                  {expertise.status || 'Без статуса'}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Сообщение:</strong> {expertise.message}
              </Typography>

              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Дата:</strong> {formatDate(expertise.date)}
              </Typography>

              {expertise.comment && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 1 }}
                >
                  <strong>Комментарий:</strong> {expertise.comment}
                </Typography>
              )}

              {expertise.hazardCategory && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Категория опасности:</strong> {expertise.hazardCategory}
                </Typography>
              )}

              {expertise.idFile && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  Прикреплён файл: #{expertise.idFile}
                </Typography>
              )}

              {expertise.imageBase64 && (
                <CardMedia
                  component="img"
                  image={`data:image/jpeg;base64,${expertise.imageBase64}`}
                  alt={`Изображение экспертизы #${expertise.idNode}`}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: 200,
                    mt: 2,
                    borderRadius: 1,
                    border: '1px solid #BDC3C7',
                  }}
                />
              )}

              {expertise.documentBase64 && expertise.documentFileName && (
                <Typography
                  variant="caption"
                  display="block"
                  sx={{ mt: 1, color: 'text.secondary' }}
                >
                  <strong>Документ:</strong>{' '}
                  <Link
                    href={`data:application/octet-stream;base64,${expertise.documentBase64}`}
                    download={expertise.documentFileName}
                  >
                    Скачать {expertise.documentFileName}
                  </Link>
                </Typography>
              )}

              {index < expertises.length - 1 && (
                <Divider sx={{ mt: 2, mb: 2 }} />
              )}
            </Box>
          ))
        )}

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={onClose}
          >
            Закрыть
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExpertiseModal;