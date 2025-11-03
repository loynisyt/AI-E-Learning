'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Fab,
  Snackbar,
  Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import SmartToyIcon from '@mui/icons-material/SmartToy';

export default function AICoach() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Hello! I\'m your AI Coach. How can I help you with your learning today?',
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load settings from localStorage
    const savedVoiceOutput = localStorage.getItem('voiceOutputEnabled');
    if (savedVoiceOutput !== null) {
      setVoiceOutputEnabled(JSON.parse(savedVoiceOutput));
    }

    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setSnackbarMessage('Voice input not available. Please check your browser settings.');
        setSnackbarOpen(true);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    // Initialize speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'ai',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);

        // Speak the response if voice output is enabled
        if (voiceOutputEnabled && synthRef.current) {
          const utterance = new SpeechSynthesisUtterance(data.response);
          synthRef.current.speak(utterance);
        }
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I\'m having trouble connecting. Please try again later.',
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      setSnackbarMessage('Voice input is not supported in this browser.');
      setSnackbarOpen(true);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const toggleVoiceOutput = () => {
    const newValue = !voiceOutputEnabled;
    setVoiceOutputEnabled(newValue);
    localStorage.setItem('voiceOutputEnabled', JSON.stringify(newValue));
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: 'center', mb: 2 }}>
        AI Coach
      </Typography>

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          mb: 2,
          overflow: 'hidden',
        }}
      >
        <List sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {messages.map((message) => (
            <ListItem key={message.id} sx={{ alignItems: 'flex-start', mb: 1 }}>
              <Avatar sx={{ mr: 2, bgcolor: message.sender === 'ai' ? 'primary.main' : 'secondary.main' }}>
                {message.sender === 'ai' ? <SmartToyIcon /> : 'U'}
              </Avatar>
              <ListItemText
                primary={message.text}
                secondary={message.timestamp.toLocaleTimeString()}
                sx={{
                  '& .MuiListItemText-primary': {
                    bgcolor: message.sender === 'ai' ? 'grey.100' : 'primary.light',
                    p: 1,
                    borderRadius: 2,
                    color: message.sender === 'ai' ? 'text.primary' : 'primary.contrastText',
                  },
                }}
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ mr: 1 }}
        />
        <IconButton
          onClick={handleVoiceInput}
          color={isListening ? 'error' : 'primary'}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton
          onClick={toggleVoiceOutput}
          color={voiceOutputEnabled ? 'primary' : 'default'}
          aria-label={voiceOutputEnabled ? 'Disable voice output' : 'Enable voice output'}
        >
          {voiceOutputEnabled ? <VolumeUpIcon /> : <VolumeOffIcon />}
        </IconButton>
        <Fab
          color="primary"
          onClick={handleSendMessage}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <SendIcon />
        </Fab>
      </Box>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="warning" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
