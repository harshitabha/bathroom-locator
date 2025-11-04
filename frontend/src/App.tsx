import Map from "./components/Map";
import Login from './components/Login';
import SignUp from "./components/SignUp";
import {Button} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <div>
            <Map />
            <Link to="/login">
              <Button variant="contained" size="small">
                Log In
              </Button>
            </Link>
          </div>
        }/>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<SignUp/>} />
      </Routes>
    </Router>
  );
}

export default App;
