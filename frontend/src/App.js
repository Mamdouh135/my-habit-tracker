function App() {
  const { token } = useContext(AuthContext);
  const [page, setPage] = useState('home');
  return (
    <>
      <header className="site-header">Habit Tracker SaaS</header>
      <nav className="site-nav">
        <button onClick={() => setPage('home')}>Home</button>
        <button onClick={() => setPage('about')}>About Me</button>
      </nav>
      <div className="main-content">
        {page === 'about' ? <AboutMe /> : (token ? <Habits /> : <LoginRegister />)}
      </div>
    </>
  );
}

export default App;
