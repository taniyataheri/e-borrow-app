import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css'
import Signin from './components/Signin/Signin';
import Home from './components/Home/Home';
import History from './components/History/History';
import Signup from './components/Signup/Signup';
import Maintenance from './components/Maintenance/Maintenance';
import TestFont from "./components/TestFont";
import ReturnHistory from "./components/ReturnHistory";
import CancelledRequests from "./components/CancelledRequests";
import Approve from './components/Approve/ApproveUser';
import ForgotPasswird from './components/Forgot/Forgotpassword';



function App() {
  
  return (
      <Router>
        <Routes>
          <Route path='/test' element={<TestFont />} />
          <Route path='/' element={<Signin/>}></Route>
          <Route path='/Home' element={<Home/>}></Route>
          <Route path='/History' element={<History/>}></Route>
          <Route path='/Maintenance' element={<Maintenance/>}></Route>
          <Route path='/Signup' element={<Signup/>}></Route>
          <Route path="/return-history" element={<ReturnHistory />} />
          <Route path="/cancelled-requests" element={<CancelledRequests/>}></Route>
          <Route path="/Approve" element={<Approve/>}></Route>
          <Route path="/ForgotPassword" element={<ForgotPasswird />} />
        </Routes>
      </Router>
  )
}

export default App
