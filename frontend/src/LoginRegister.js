import React, { useState, useContext, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { register, login } from './api';
import { AuthContext } from './AuthContext';

const RECAPTCHA_SITE_KEY = '6LeRl3MsAAAAAJ7Z5Bz9_9Dtd1xAU-ebSZenhC5N';

// Password strength checker
function getPasswordStrength(password) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  const passed = Object.values(checks).filter(Boolean).length;
  
  if (passed <= 2) return { level: 'weak', color: '#ff4444', text: 'Weak' };
  if (passed === 3) return { level: 'fair', color: '#ffaa00', text: 'Fair' };
  if (passed === 4) return { level: 'good', color: '#00cc66', text: 'Good' };
  return { level: 'strong', color: '#00ff88', text: 'Strong' };
}

export default function LoginRegister({ initial }) {
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
      // Check CAPTCHA
      if (!captchaToken) {
        setError('Please complete the CAPTCHA verification.');
        return;
      }

      // Check password strength
      if (passwordStrength.level === 'weak') {
        setError('Password is too weak. Use at least 8 characters with uppercase, lowercase, numbers, and special characters.');
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
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit} autoComplete="on">
        <input 
          placeholder="Username" 
          value={username} 
          onChange={e => setUsername(e.target.value)}
          autoComplete="username"
          name="username"
        />
        <input 
          placeholder="Password" 
          type="password" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          autoComplete={isRegister ? "new-password" : "current-password"}
          name="password"
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
              Password strength: {passwordStrength.text}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
              Use 8+ characters with uppercase, lowercase, numbers & symbols
            </div>
          </div>
        )}

        {/* reCAPTCHA - only show during registration */}
        {isRegister && (
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

        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button className="auth-toggle" onClick={() => setIsRegister(r => !r)}>
        {isRegister ? 'Have an account? Login' : 'No account? Register'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
