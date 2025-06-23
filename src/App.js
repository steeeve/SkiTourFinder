import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import SignInPage from './pages/signInPage';
import SignUpPage from './pages/signUpPage';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

      </Routes>
    </Router>
  );
}

export default App;
