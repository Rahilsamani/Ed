import "./App.css";
import { Route, Routes } from "react-router-dom";

import Navbar from "./components/common/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Error from "./pages/Error";
import UpdatePassword from "./pages/UpdatePassword";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup />} />
        <Route path="login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="update-password/:id" element={<UpdatePassword />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </div>
  );
}

export default App;
