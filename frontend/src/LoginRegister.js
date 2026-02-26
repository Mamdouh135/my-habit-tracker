import React, { useState, useContext, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReCAPTCHA from 'react-google-recaptcha';
import { register, login } from './api';
import { AuthContext } from './AuthContext';
import { useLanguage } from './LanguageContext';

const RECAPTCHA_SITE_KEY = '6LeRl3MsAAAAAJ7Z5Bz9_9Dtd1xAU-ebSZenhC5N';

// CAPTCHA TEMPORARILY DISABLED FOR CLOUDFLARE DEPLOYMENT
const CAPTCHA_ENABLED = false;

// Check if we're on localhost (where reCAPTCHA is configured)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export default function LoginRegister({ initial }) {
  const { t } = useLanguage();
  
  // Password strength checker
  const getPasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const passed = Object.values(checks).filter(Boolean).length;
    
    if (passed <= 2) return { level: 'weak', color: '#ff4444', text: t('weak') };
    if (passed === 3) return { level: 'fair', color: '#ffaa00', text: t('fair') };
    if (passed === 4) return { level: 'good', color: '#00cc66', text: t('good') };
    return { level: 'strong', color: '#00ff88', text: t('strong') };
  };

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const { login: doLogin } = useContext(AuthContext);

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    // allow hero CTA or App to pre-select the register/login tab via prop
    if (initial === 'register') setIsRegister(true);
    if (initial === 'login') setIsRegister(false);
  }, [initial]);

  // Reset captcha when switching between login/register
  useEffect(() => {
    setCaptchaToken(null);
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  }, [isRegister]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for registration
    if (isRegister) {
      // Check CAPTCHA (only when enabled)
      if (CAPTCHA_ENABLED && isLocalhost && !captchaToken) {
        setError(t('verifyCaptcha'));
        return;
      }

      // Check password strength
      if (passwordStrength.level === 'weak') {
        setError(t('weakPassword'));
        return;
      }
    }

    try {
      if (isRegister) {
        await register(username, password);
        // mark that this browser should show the one-time Get Started tutorial
        try { localStorage.setItem('showGetStarted', 'true'); } catch (err) {}
        setIsRegister(false);
        // Reset captcha after successful registration
        if (recaptchaRef.current) recaptchaRef.current.reset();
        setCaptchaToken(null);
      } else {
        const res = await login(username, password);
        // backend now returns profile along with token
        doLogin(res.data.token, res.data.profile);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error');
      // Reset captcha on error
      if (recaptchaRef.current) recaptchaRef.current.reset();
      setCaptchaToken(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.h2
        key={isRegister ? 'register' : 'login'}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {isRegister ? t('createAccount') : t('login')}
      </motion.h2>
      <form onSubmit={handleSubmit} autoComplete="on">
        <motion.input 
          placeholder={t('username')} 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          name="username"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        <motion.input 
          placeholder={t('password')} 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          name="password"
          whileFocus={{ scale: 1.02 }}
          transition={{ type: 'spring', stiffness: 300 }}
        />
        
        {/* Password strength indicator - only show during registration */}
        {isRegister && password && (
          <div style={{ marginTop: '8px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: '4px',
                    borderRadius: '2px',
                    background: i <= ['weak', 'fair', 'good', 'strong'].indexOf(passwordStrength.level) + 1
                      ? passwordStrength.color
                      : '#333',
                    transition: 'background 0.3s'
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: '0.85rem', color: passwordStrength.color, fontWeight: 500 }}>
              {t('passwordStrength')}: {passwordStrength.text}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
              {t('passwordHint')}
            </div>
          </div>
        )}

        {/* reCAPTCHA - only show during registration when enabled */}
        {CAPTCHA_ENABLED && isRegister && isLocalhost && (
          <div style={{ margin: '16px 0', display: 'flex', justifyContent: 'center' }}>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={RECAPTCHA_SITE_KEY}
              onChange={(token) => setCaptchaToken(token)}
              onExpired={() => setCaptchaToken(null)}
              theme="dark"
            />
          </div>
        )}

        <motion.button 
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400 }}
        >
          {isRegister ? t('createAccount') : t('login')}
        </motion.button>
      </form>
      <motion.button 
        className="auth-toggle" 
        onClick={() => setIsRegister(r => !r)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {isRegister ? t('haveAccount') : t('noAccount')}
      </motion.button>
      <AnimatePresence>
        {error && (
          <motion.div 
            className="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
