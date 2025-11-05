// components/AIpanel.js
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { getAuthInstance, signOut as firebaseSignOut } from '@/lib/firebaseClient';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export default function AIPanel() {
  const auth = getAuthInstance();
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('teacher');
  const [temperature, setTemperature] = useState(0.7);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, [auth]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // After popup, send idToken to server to create session cookie
      const idToken = await result.user.getIdToken();
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
    } catch (err) {
      console.error('Sign-in error', err);
    }
  };

  const signUserOut = async () => {
    try {
      await firebaseSignOut();
      setMessages([]);
      await fetch('/api/auth/session', { method: 'DELETE' }).catch(()=>{});
    } catch (err) {
      console.error('Sign-out error', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    const text = input;
    setInput('');
    setLoading(true);

    try {
      // Use server session cookie or current firebase id token as fallback
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers = { 'Content-Type': 'application/json' };
      if (idToken) headers['Authorization'] = `Bearer ${idToken}`;

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: text, mode, temperature }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.response || data.error || 'No response' }]);
    } catch (err) {
      console.error('sendMessage error', err);
      setMessages(prev => [...prev, { role: 'ai', content: 'Connection error' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFunctionClick = (func) => {
    const prompts = {
      research: 'Please research and explain the following topic in detail: ',
      'generate-photo': 'Describe how to generate a photo using AI tools for the following concept: ',
      'give-link': 'Provide useful links and resources for learning about: ',
    };
    setInput(prompts[func] || '');
  };

  return (
    <div className="box" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <div className="level">
        <div className="level-left"><h3 className="title is-4">AI Assistant</h3></div>
        <div className="level-right" style={{ display: 'flex', gap: 8 }}>
          {user ? (
            <>
              <div style={{ fontSize: 12 }}>{user.email}</div>
              <button className="button is-small is-danger" onClick={signUserOut}>Sign out</button>
            </>
          ) : (
            <button className="button is-small is-info" onClick={signIn}>Sign in with Google</button>
          )}
          <button className="button is-small is-info" onClick={() => setShowSettings(s => !s)}>Settings</button>
        </div>
      </div>

      {showSettings && (
        <div className="box">
          <div className="field">
            <label className="label">Mode</label>
            <div className="select is-small">
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                <option value="teacher">Teacher</option>
                <option value="friend">Friend</option>
              </select>
            </div>
          </div>
          <div className="field">
            <label className="label">Creativity (Temperature)</label>
            <input className="slider is-small" type="range" min="0.1" max="1.0" step="0.1"
              value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} />
            <p className="help">{temperature} ({temperature < 0.5 ? 'Conservative' : temperature < 0.8 ? 'Balanced' : 'Creative'})</p>
          </div>
        </div>
      )}

      <div className="buttons are-small">
        <button className="button is-primary" onClick={() => handleFunctionClick('research')}>Research</button>
        <button className="button is-success" onClick={() => handleFunctionClick('generate-photo')}>Generate Photo</button>
        <button className="button is-link" onClick={() => handleFunctionClick('give-link')}>Give Link</button>
      </div>

      <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', marginBottom: '10px' }}>
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role === 'user' ? 'is-primary' : 'is-info'}`} style={{ marginBottom: 6 }}>
            <div className="message-body">{m.content}</div>
          </div>
        ))}
        {loading && <div className="message is-loading"><div className="message-body">AI is thinking...</div></div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="field has-addons">
        <div className="control is-expanded">
          <input className="input" type="text" placeholder={auth.currentUser ? 'Ask about AI tools...' : 'Sign in to ask the AI...'}
                 value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} disabled={!auth.currentUser || loading} />
        </div>
        <div className="control">
          <button className={`button is-primary ${loading ? 'is-loading' : ''}`} onClick={sendMessage} disabled={!input.trim() || loading || !auth.currentUser}>Send</button>
        </div>
      </div>
    </div>
  );
}
