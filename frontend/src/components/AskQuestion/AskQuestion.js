import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, CircularProgress, Box, Typography, LinearProgress, Divider } from '@mui/material';

export default function AskQuestion({ onDocumentsUpdate }) {
  const [file, setFile] = useState(null);  // Para armazenar o arquivo
  const [loading, setLoading] = useState(false); // Para mostrar o loader durante a requisição
  const [uploadProgress, setUploadProgress] = useState(0); // Para a barra de progresso
  const [question, setQuestion] = useState('');  // Para armazenar a pergunta do usuário
  const [answer, setAnswer] = useState('');  // Para armazenar a resposta gerada pela LLM
  const [context, setContext] = useState('');  // O texto extraído do boleto
  const [uploadStatus, setUploadStatus] = useState('');  // Status do upload (sucesso ou erro)

  // Função para enviar o arquivo
  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);  // Ativa o loader enquanto espera a resposta
    setUploadStatus(''); // Reseta o status do upload
    setUploadProgress(0); // Reseta o progresso da barra

    try {
      const response = await axios.post('http://localhost:3000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress); // Atualiza a barra de progresso
        }
      });

      // Armazena o conteúdo extraído do boleto
      setContext(response.data.extractedText);
      console.log('Conteúdo extraído:', response.data.extractedText);

      // Após o upload, mostra a caixa de perguntas
      setUploadStatus('success');
      onDocumentsUpdate();
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      setUploadStatus('error');
    } finally {
      setLoading(false);  // Desativa o loader
    }
  };

  // Função para enviar a pergunta sobre o boleto para o backend
  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);  // Ativa o loader enquanto espera a resposta

    try {
      const response = await axios.post('http://localhost:3000/ask', {
        question,
        context,  // Envia o conteúdo extraído do boleto junto com a pergunta
      });

      setAnswer(response.data.answer);  // Exibe a resposta gerada pela LLM
    } catch (error) {
      console.error('Erro ao enviar a pergunta:', error);
      setAnswer('Desculpe, houve um erro ao processar sua pergunta.');
    } finally {
      setLoading(false);  // Desativa o loader
    }
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h4" gutterBottom>
        Faça perguntas sobre o Boleto
      </Typography>

      {/* Formulário de Upload */}
      <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          fullWidth
          variant="outlined"
          label="Selecione o Boleto"
          inputProps={{ accept: '.pdf,.jpg,.png,.jpeg' }}
          disabled={loading}
        />
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Enviar Boleto'}
        </Button>

        {/* Barra de progresso */}
        {loading && (
          <Box sx={{ marginTop: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </Box>

      {/* Exibir conteúdo extraído do boleto */}
      {context && (
        <Box sx={{ marginTop: 4 }}>
          <Typography variant="h6">Conteúdo Extraído:</Typography>
          <Typography variant="body1" sx={{ marginTop: 2 }}>
            {context}
          </Typography>
        </Box>
      )}

      {/* Status do upload */}
      {uploadStatus === 'success' && (
        <Typography variant="body1" color="success.main" sx={{ marginTop: 2 }}>
          Documento carregado com sucesso!
        </Typography>
      )}
      {uploadStatus === 'error' && (
        <Typography variant="body1" color="error.main" sx={{ marginTop: 2 }}>
          Houve um erro ao carregar o documento.
        </Typography>
      )}

      {/* Caixa de Perguntas - Sempre Exibe a Caixa */}
      <Box component="form" onSubmit={handleQuestionSubmit} sx={{ marginTop: 4 }}>
        <TextField
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          fullWidth
          variant="outlined"
          label="Digite sua pergunta"
          disabled={loading}  // Desabilita quando estiver carregando
        />
        <Button
          variant="contained"
          color="secondary"
          type="submit"
          fullWidth
          sx={{ marginTop: 2 }}
          disabled={loading}  // O botão está sempre habilitado, exceto quando carregando
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Perguntar'}
        </Button>
      </Box>

      {/* Exibir a resposta gerada pela LLM */}
      {answer && (
        <Box sx={{ marginTop: 4 }}>
          <Divider sx={{ marginBottom: 2 }} />
          <Typography variant="h6">Resposta:</Typography>
          <Typography variant="body1">{answer}</Typography>
        </Box>
      )}
    </Box>
  );
}