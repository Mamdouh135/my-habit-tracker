import React, { useState } from 'react';
import axios from 'axios';

export default function ContactMe() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    if (!message) {
      setError('Message cannot be empty.');
      return;
    }
    try {
      await axios.post('http://localhost:4000/contact', { email, message });
      setSent(true);
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    }
  };

  return (
    <>
      <h2>Get in Touch</h2>
      <div style={{textAlign:'center', color:'#a100ff', fontWeight:600, fontSize:'1.15rem', marginBottom:'18px', letterSpacing:'1px', filter:'drop-shadow(0 1px 8px #00fff7aa)'}}>Let's connect — cyberpunk style!</div>
      <form onSubmit={handleSend}>
        <input
          type="email"
          placeholder="Your email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <textarea
          placeholder="Your message"
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
        {error && <div style={{color:'#00fff7', marginTop:'8px', fontWeight:500}}>{error}</div>}
        {sent && <div style={{color:'#a100ff', marginTop:'8px', fontWeight:500}}>Message sent!</div>}
      </form>
    </>
  );
