import './App.css';

import Map from './components/Map';
import Login from './components/Login';
import SignUp from './components/SignUp';
import {supabase} from './lib/supabaseClient';
import AppContext from './context/AppContext';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';

/**
 * gets id of user currently logged in
 * @returns {string | null} user id of logged in user
 */
async function getCurrentUserId() : Promise<string | null> {
  const {data: {user}, error} = await supabase.auth.getUser();

  if (error) {
    console.error('Error getting current user: ', error.message);
    return null;
  }

  if (user) {
    return user.id;
  } else {
    return null;
  }
}

const App = () => {
  return (
    <AppContext value={{getCurrentUserId}}>
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
