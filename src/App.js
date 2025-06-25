import './App.css';
import {BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages';
import SignInPage from './pages/signInPage';
import SignUpPage from './pages/signUpPage';
import Welcome from './pages/welcomePage';
import Profile from './Components/Profile';
import PartyDetailsPage from './pages/partyDetailsPage';
import CreatePartyPage from './pages/createPartyPage';

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/party/:id" element={<PartyDetailsPage />} />
        <Route path="/createparty" element={<CreatePartyPage />} />
      </Routes>
    </Router>
  );
}

export default App;
