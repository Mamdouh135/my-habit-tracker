import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';
import './App.css';

function App() {
  const { token } = useContext(AuthContext);
  return (
    <div className="app-container">
      <h1>Habit Tracker SaaS</h1>
      {token ? <Habits /> : <LoginRegister />}
    </div>
  );
}

export default App;
