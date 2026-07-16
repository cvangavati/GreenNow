import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Signup from './pages/Signup'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'

function Home() {
  const { user, signOut } = useAuth()
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>🌊 CleanBeach</h1>
      <p>Logged in as: {user?.email}</p>
      <button onClick={signOut}>Log Out</button>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App