import './App.css';

import Map from './components/Map';
import Login from './components/Login';
import SignUp from './components/SignUp';
import {supabase} from './lib/supabaseClient';
import {useEffect, useState} from 'react';
import AppContext from './context/AppContext';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

const App = () => {
  const [userId, setUserId] = useState<string | null>(null);

  /**
   * gets id of user currently logged in
   * @returns {string | null} user id of logged in user
   */
  async function getCurrentUserId() : Promise<string | null> {
    const {data: {user}, error} = await supabase.auth.getUser();

    if (!user || error) {
      if (error) console.error('Error getting current user: ', error.message);
      setUserId(null);
      return null;
    }

    setUserId(user.id);
    return user.id;
  }

  useEffect(() => {
    getCurrentUserId();
  }, []);

  return (
    <AppContext value={{userId, setUserId, getCurrentUserId}}>
      <Router>
        <Routes>
          <Route path="/" element={<Map />}/>
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
      </Router>
    </AppContext>
  );
};

export default App;
