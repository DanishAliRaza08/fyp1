 
import { BrowserRouter, Route, Router, Routes } from 'react-router-dom'
import './App.css'
import Signup from './component/Signup'
import { Toaster } from 'react-hot-toast'
import Login from './component/Login'
import ChatMain from './page/ChatMain'
import Chatgroup from './component/Chatgroup'

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ChatMain />} />
        <Route path="/chat/:id" element={<ChatMain />} />
        {/* <Route path="/group/:id" element={<Chatgroup />} /> */}
      </Routes>
    </BrowserRouter>
   
    <Toaster />
    </>
  )
}

export default App
