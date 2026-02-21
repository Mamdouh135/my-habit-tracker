import React, { useState, useEffect, useRef } from 'react';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_p1h0j0t';
const EMAILJS_TEMPLATE_ID = 'template_s5km4ws';
const EMAILJS_PUBLIC_KEY = '7UPlEA_fxJEQPUZ3P';

// Anti-spam: minimum time before form can be submitted (ms)
const MIN_SUBMIT_TIME = 3000;
// Rate limit: minimum time between submissions (ms)
const RATE_LIMIT_TIME = 60000;

export default function ContactMe() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  
  // Anti-spam: honeypot field (bots will fill this)
  const [honeypot, setHoneypot] = useState('');
  // Anti-spam: track when form was loaded
  const formLoadTime = useRef(Date.now());

  // Reset load time when component mounts
  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');

    // Anti-spam check 1: Honeypot - if filled, it's a bot
    if (honeypot) {
      // Silently pretend success to confuse bots
      setSent(true);
      return;
    }

    // Anti-spam check 2: Time-based - form submitted too quickly
    const timeSpent = Date.now() - formLoadTime.current;
    if (timeSpent < MIN_SUBMIT_TIME) {
      setError('Please take a moment to write your message.');
      return;
    }

    // Anti-spam check 3: Rate limiting
    const lastSubmit = localStorage.getItem('lastContactSubmit');
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < RATE_LIMIT_TIME) {
      const waitTime = Math.ceil((RATE_LIMIT_TIME - (Date.now() - parseInt(lastSubmit))) / 1000);
      setError(`Please wait ${waitTime} seconds before sending another message.`);
      return;
    }

    // Basic validation
    if (!message || message.trim().length < 10) {
      setError('Please write a message (at least 10 characters).');
      return;
    }

    // Anti-spam check 4: Check for excessive links (common in spam)
    const linkCount = (message.match(/https?:\/\//gi) || []).length;
    if (linkCount > 3) {
      setError('Too many links in your message.');
      return;
    }

    setSending(true);
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_email: email || 'Anonymous',
          message: message,
        },
        EMAILJS_PUBLIC_KEY
      );
      localStorage.setItem('lastContactSubmit', Date.now().toString());
      setSent(true);
    } catch (err) {
      setError('Failed to send message. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <h2>Get in Touch</h2>
      <div style={{textAlign:'center', color:'#a100ff', fontWeight:600, fontSize:'1.15rem', marginBottom:'18px', letterSpacing:'1px', filter:'drop-shadow(0 1px 8px #00fff7aa)'}}>Let's connect — cyberpunk style!</div>
      <form onSubmit={handleSend}>
        {/* Honeypot field - hidden from humans, bots will fill it */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={e => setHoneypot(e.target.value)}
          style={{ position: 'absolute', left: '-9999px', opacity: 0 }}
          tabIndex={-1}
          autoComplete="off"
        />
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
        <button type="submit" disabled={sending || sent}>
          {sending ? 'Sending...' : sent ? 'Sent!' : 'Send'}
        </button>
        {error && <div style={{color:'#00fff7', marginTop:'8px', fontWeight:500}}>{error}</div>}
        {sent && <div style={{color:'#a100ff', marginTop:'8px', fontWeight:500}}>Message sent!</div>}
      </form>
    </>
  );
}
