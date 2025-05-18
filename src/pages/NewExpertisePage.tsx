import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { TextField, Button, Container, Typography, Input, CardMedia } from '@mui/material';

const NewExpertisePage: React.FC = () => {
  const { objectId } = useParams<{ objectId: string }>();
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [comment, setComment] = useState('');
  const [idFile, setIdFile] = useState('');
  const [hazardCategory, setHazardCategory] = useState(''); // Новое состояние
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [documentBase64, setDocumentBase64] = useState<string | null>(null);
  const [documentFileName, setDocumentFileName] = useState<string | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Файл слишком большой (максимум 5MB)');
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
    try {
      if (hazardCategory.length > 100) {
        setError('Категория опасности не должна превышать 100 символов');
        return;
      }

      await axios.post('https://localhost:7075/api/Expertise', {
        Status: status,
        Date: new Date().toISOString(),
        Message: message,
        Comment: comment,
        IdObject: parseInt(objectId!),
        IdFile: idFile ? parseInt(idFile) : null,
        IdNode: 0,
        ImageBase64: imageBase64,
        DocumentBase64: documentBase64,
        DocumentFileName: documentFileName,
        HazardCategory: hazardCategory || null
      });
      navigate(-1);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setError('Не удалось сохранить экспертизу');
    }
  };

  return (
    <Container sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Typography variant="h5">Новая экспертиза для объекта #{objectId}</Typography>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TextField
        label="Статус"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Сообщение"
        multiline
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
        fullWidth
      />

      <TextField
        label="Комментарий"
        multiline
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        fullWidth
      />

      <TextField
        label="Категория опасности"
        value={hazardCategory}
        onChange={(e) => setHazardCategory(e.target.value)}
        fullWidth
        inputProps={{ maxLength: 100 }}
      />

      <TextField
        label="ID файла"
        value={idFile}
        onChange={(e) => setIdFile(e.target.value)}
        fullWidth
      />

      <Input
        type="file"
        inputProps={{ accept: 'image/*' }}
        onChange={handleImageChange}
        sx={{ mt: 2 }}
      />

      {imageBase64 && (
        <CardMedia
          component="img"
          image={`data:image/jpeg;base64,${imageBase64}`}
          alt="Предпросмотр изображения"
          sx={{ maxWidth: 200, mt: 2, borderRadius: 1 }}
        />
      )}

      <Input
        type="file"
        inputProps={{ accept: '.pdf,.doc,.docx' }}
        onChange={handleDocumentChange}
        sx={{ mt: 2 }}
      />

      {documentFileName && (
        <Typography variant="caption" sx={{ mt: 1 }}>
          Выбран документ: {documentFileName}
        </Typography>
      )}

      <Button 
        variant="contained" 
        onClick={handleSubmit}
        sx={{ alignSelf: 'flex-start' }}
        disabled={!status || !message}
      >
        Сохранить
      </Button>
    </Container>
  );
};

export default NewExpertisePage;