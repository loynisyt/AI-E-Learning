'use client';
import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

export default function AIPanel() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('teacher'); // teacher or friend
  const [temperature, setTemperature] = useState(0.7); // 0.1 to 1.0
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
      const res = await fetch(`${BACKEND_URL}/api/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({ message: input, mode, temperature }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage = { role: 'ai', content: data.response };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        const aiMessage = { role: 'ai', content: 'Error: Failed to get AI response.' };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('AI chat error:', error);
      const aiMessage = { role: 'ai', content: 'Error: Unable to connect to AI service.' };
      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFunctionClick = (func) => {
    let prompt = '';
    switch (func) {
      case 'research':
        prompt = 'Please research and explain the following topic in detail: ';
        break;
      case 'generate-photo':
        prompt = 'Describe how to generate a photo using AI tools for the following concept: ';
        break;
      case 'give-link':
        prompt = 'Provide useful links and resources for learning about: ';
        break;
    }
    setInput(prompt);
  };

  return (
    <div className="box" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div className="level">
        <div className="level-left">
          <h3 className="title is-4">AI Assistant</h3>
        </div>
        <div className="level-right">
          <button
            className="button is-small is-info"
            onClick={() => setShowSettings(!showSettings)}
          >
            Settings
          </button>
        </div>
      </div>

      {showSettings && (
        <div className="box">
          <div className="field">
            <label className="label">Mode</label>
            <div className="control">
              <div className="select is-small">
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="teacher">Teacher</option>
                  <option value="friend">Friend</option>
                </select>
              </div>
            </div>
          </div>
          <div className="field">
            <label className="label">Creativity (Temperature)</label>
            <div className="control">
              <input
                className="slider is-small"
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
              />
              <p className="help">{temperature} ({temperature < 0.5 ? 'Conservative' : temperature < 0.8 ? 'Balanced' : 'Creative'})</p>
            </div>
          </div>
        </div>
      )}

      <div className="buttons are-small">
        <button className="button is-primary" onClick={() => handleFunctionClick('research')}>Research</button>
        <button className="button is-success" onClick={() => handleFunctionClick('generate-photo')}>Generate Photo</button>
        <button className="button is-link" onClick={() => handleFunctionClick('give-link')}>Give Link</button>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role === 'user' ? 'is-primary' : 'is-info'}`}>
            <div className="message-body">
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message is-loading">
            <div className="message-body">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <input
            className="input"
            type="text"
            placeholder="Ask about AI tools..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading}
          />
        </div>
        <div className="control">
          <button
            className={`button is-primary ${loading ? 'is-loading' : ''}`}
            onClick={sendMessage}
            disabled={!input.trim() || loading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
