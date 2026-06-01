import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home'
import Login from './pages/Login'
import Doctor from './pages/Doctor'
import About from './pages/About'
import Contact from './pages/Contact'
import Myprofile from './pages/Myprofile'
import Myapp from './pages/Myapp'
import Footer from './components/Footer.jsx'
import Appointment from './pages/Appointment'
import AppContextProvider from './context/AppContext.jsx'
import {ToastContainer , toast} from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <Navbar />
        <Home />
        <Footer />
      </>
    ),
  },
  {
    path: '/doctor',
    element: (
      <>
        <Navbar />
        <Doctor />
        <Footer />
      </>
    ),
  },
  {
    path: '/doctor/:speciality',
    element: (
      <>
        <Navbar />
        <Doctor />
        <Footer />
      </>
    ),
  },
  {
    path: '/login',
    element: (
      <>
        <Navbar />
        <Login />
        <Footer />
      </>
    ),
  },
  {
    path: '/about',
    element: (
      <>
        <Navbar />
        <About />
        <Footer />
      </>
    ),
  },
  {
    path: '/contact',
    element: (
      <>
        <Navbar />
        <Contact />
        <Footer />
      </>
    ),
  },
  {
    path: '/my-profile',
    element: (
      <>
        <Navbar />
        <Myprofile />
        <Footer />
      </>
    ),
  },
  {
    path: '/my-appointment',
    element: (
      <>
        <Navbar />
        <Myapp />
        <Footer />
      </>
    ),
  },
  {
    path: '/appointment/:docId',
    element: (
      <>
        <Navbar />
        <Appointment />
        <Footer />
      </>
    ),
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppContextProvider>
  <RouterProvider router={router} />
  <ToastContainer />
</AppContextProvider>
  </StrictMode>
)