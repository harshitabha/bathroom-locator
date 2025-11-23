import './App.css';

import Map from './components/Map';
import Login from './components/Login';
import SignUp from './components/SignUp';

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            <Map />
          </>
        }/>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </Router>
  );
};

export default App;
