import React, { useState, useContext, useEffect } from 'react';
import { register, login } from './api';
import { AuthContext } from './AuthContext';

export default function LoginRegister({ initial }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const { login: doLogin } = useContext(AuthContext);

  useEffect(() => {
    // allow hero CTA or App to pre-select the register/login tab via prop
    if (initial === 'register') setIsRegister(true);
    if (initial === 'login') setIsRegister(false);
  }, [initial]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegister) {
        await register(username, password);
        // mark that this browser should show the one-time Get Started tutorial
        try { localStorage.setItem('showGetStarted', 'true'); } catch (err) {}
        setIsRegister(false);
      } else {
        const res = await login(username, password);
        doLogin(res.data.token);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Error');
    }
  };

  return (
    <div>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <button className="auth-toggle" onClick={() => setIsRegister(r => !r)}>
        {isRegister ? 'Have an account? Login' : 'No account? Register'}
      </button>
      {error && <div className="error">{error}</div>}
    </div>
  );
}
