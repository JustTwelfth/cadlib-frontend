import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Input, CardMedia, Box } from '@mui/material';
import axios from 'axios';

interface NewExpertiseModalProps {
  open: boolean;
  onClose: () => void;
  objectId: number;
}

const NewExpertiseModal: React.FC<NewExpertiseModalProps> = ({ open, onClose, objectId }) => {
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [comment, setComment] = useState('');
  const [idFile, setIdFile] = useState('');
  const [hazardCategory, setHazardCategory] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Файл изображения слишком большой (максимум 5MB)');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setImageBase64(base64);
        setError('');
      };
      reader.onerror = () => setError('Ошибка чтения файла изображения');
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('Документ слишком большой (максимум 10MB)');
        return;
      }

      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setError('Недопустимый формат файла (разрешены PDF, DOC, DOCX)');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setDocumentBase64(base64);
        setDocumentFileName(file.name);
        setError('');
      };
      reader.onerror = () => setError('Ошибка чтения файла документа');
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!status.trim() || !message.trim()) {
      setError('Заполните обязательные поля: Статус и Сообщение');
      return;
    }

    if (hazardCategory.length > 100) {
      setError('Категория опасности не должна превышать 100 символов');
      return;
    }

    setLoading(true);
    try {
      await axios.post('https://localhost:7075/api/Expertise', {
        Status: status,
        Date: new Date().toISOString(),
        Message: message,
        Comment: comment,
        IdObject: objectId,
        IdFile: idFile ? parseInt(idFile) : null,
        IdNode: 0,
        ImageBase64: imageBase64,
        DocumentBase64: documentBase64,
        DocumentFileName: documentFileName,
        HazardCategory: hazardCategory || null,
      });
      setError('');
      setStatus('');
      setMessage('');
      setComment('');
      setIdFile('');
      setHazardCategory('');
      setImageBase64(null);
      setDocumentBase64(null);
      setDocumentFileName(null);
      onClose();
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      setError('Не удалось сохранить экспертизу');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          zIndex: 1250,
          bgcolor: 'background.paper', // #2C3E50
        },
      }}
    >
      <DialogTitle sx={{ color: 'text.primary' }}>Новый дефект объекта #{objectId}</DialogTitle>
      <DialogContent sx={{ bgcolor: 'background.paper' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {error && (
            <Typography color="error" sx={{ mb: 1 }}>
              {error}
            </Typography>
          )}

          <TextField
            label="Статус"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            required
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Сообщение"
            multiline
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Комментарий"
            multiline
            rows={2}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Категория опасности"
            value={hazardCategory}
            onChange={(e) => setHazardCategory(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 100 }}
            disabled={loading}
          />

          <TextField
            label="ID файла"
            value={idFile}
            onChange={(e) => setIdFile(e.target.value)}
            fullWidth
            disabled={loading}
          />

          <Input
            type="file"
            inputProps={{ accept: 'image/*' }}
            onChange={handleImageChange}
            disabled={loading}
            sx={{ color: 'text.primary' }}
          />

          {imageBase64 && (
            <CardMedia
              component="img"
              image={`data:image/jpeg;base64,${imageBase64}`}
              alt="Предпросмотр изображения"
              sx={{ maxWidth: 200, borderRadius: 1, border: '1px solid #BDC3C7' }}
            />
          )}

          <Input
            type="file"
            inputProps={{ accept: '.pdf,.doc,.docx' }}
            onChange={handleDocumentChange}
            disabled={loading}
            sx={{ color: 'text.primary' }}
          />

          {documentFileName && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Выбран документ: {documentFileName}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ bgcolor: 'background.paper' }}>
        <Button onClick={onClose} disabled={loading} color="secondary">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !status || !message}
        >
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewExpertiseModal;