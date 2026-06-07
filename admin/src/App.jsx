import { useContext } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AdminContext } from './context/AdminContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Appointment from './pages/Appointment'
import ListDoctor from './pages/ListDoctor'
import AddDoctor from './pages/AddDoctor'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import EditProfile from './pages/EditProfile'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DoctorContext } from './context/DoctorContext'
import DocAppoint from './Doctor/DocAppoint'
import Docdash from './Doctor/Docdash'
import DocProfile from './Doctor/DocProfile'


const App = () => {
  const { atoken } = useContext(AdminContext)
  const {dtoken} = useContext(DoctorContext)

  return  (
    <BrowserRouter>
      <ToastContainer />
      {atoken || dtoken ? (
        <>
          <Navbar />
          <div className='flex items-start'>
            <Sidebar />
            <Routes>
              <Route path='/' element={<Dashboard />} />
              <Route path='/admin-dashboard' element={<Dashboard />} />
              <Route path='/all-appointment' element={<Appointment />} />
              <Route path='/doctor-list' element={<ListDoctor />} />
              <Route path='/add-doctor' element={<AddDoctor />} />
              <Route path='/edit-doctor' element ={<EditProfile />} />

              <Route path='/doctor-dashboard' element ={<Docdash />} />
              <Route path='/doctor-appointment' element={<DocAppoint />} />
              <Route path='/edit-profile' element ={<EditProfile />} />
               <Route path='/doctor-profile' element ={<DocProfile />} />
              
            </Routes>
          </div>
        </>
      ) : (
        <Login />
      )}
    </BrowserRouter>
  )
}

export default App