import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import Bulletin from './pages/Bulletin'
import EventDetail from './pages/EventDetail'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import ProtectedRoute from './components/ProtectedRoute'
import NewEvent from './pages/NewEvent'
import Feed from './pages/Feed'
import CreateGroup from './pages/CreateGroup'
import Groups from './pages/Groups'
import GroupDetail from './pages/GroupDetail'

function AppLayout() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/" element={
          <ProtectedRoute><Bulletin /></ProtectedRoute>
        } />
        <Route path="/events/:id" element={
          <ProtectedRoute><EventDetail /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />
        <Route path="/new-event" element={
          <ProtectedRoute><NewEvent /></ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute><Feed /></ProtectedRoute>
        } />
        <Route path="/create-group" element={
          <ProtectedRoute><CreateGroup /></ProtectedRoute>
        } />
        <Route path="/groups" element={
          <ProtectedRoute><Groups /></ProtectedRoute>
        } />
        <Route path="/groups/:id" element={
          <ProtectedRoute><GroupDetail /></ProtectedRoute>
        } />
      </Routes>
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App