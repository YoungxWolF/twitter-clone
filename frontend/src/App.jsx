
import { Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import Sidebar from './components/common/Sidebar'
import RightPanel from './components/common/RightPanel'
import Profile from './pages/Profile'
import Notification from './pages/Notification'
import { Toaster } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import LoadingSpinner from './components/common/LoadingSpinner'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
function App() {

 const {data:authUser,isLoading} = useQuery({
  queryKey: ['authUser'],
  queryFn: async () => {
    try {
      const res = await fetch('/api/auth/me')
      const data = await res.json()
      if(data.error) return null
      if(!res.ok || data.error) {
        throw new Error(data.error || "something went wrong")
      }
      // console.log(data);
      return data
    } catch (error) {
      throw new Error(error)
    }
  },
  retry:false
 })

 if(isLoading){
  return <div className='h-screen flex justify-center items-center'>
    <LoadingSpinner size='lg' />
  </div>
 }

  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/>}
    <Routes>
      <Route path='/' element={authUser ? <Home/> : <Navigate to={'/login'} />} />
      <Route path='/signup' element={!authUser ? <SignUp/> : <Navigate to={'/'} />} />
      <Route path='/login' element={!authUser ? <Login/> : <Navigate to={'/'} />} />
      <Route path={`/profile/:username`} element={authUser ? <Profile/> : <Navigate to={'/login'} />} />
      <Route path='/notifications' element={authUser ? <Notification/> : <Navigate to={'/login'} />} />
    </Routes>
    {authUser && <RightPanel/>}
    <ReactQueryDevtools initialIsOpen={true} />
    <Toaster/>
  </div>
  )
}


export default App

