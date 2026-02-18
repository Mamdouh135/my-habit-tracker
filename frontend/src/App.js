import React, { useContext } from 'react';
import { AuthContext } from './AuthContext';
import LoginRegister from './LoginRegister';
import Habits from './Habits';

function App() {
  const { token } = useContext(AuthContext);
  return (
    <div>
      <h1>Habit Tracker SaaS</h1>
      {token ? <Habits /> : <LoginRegister />}
    </div>
  );
}

export default App;
