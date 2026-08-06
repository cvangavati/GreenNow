import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import NavBar from './components/NavBar'
import ProtectedRoute from './components/ProtectedRoute'
import Moderation from './pages/Moderation'

const Bulletin = lazy(() => import('./pages/Bulletin'))
const EventDetail = lazy(() => import('./pages/EventDetail'))
const Profile = lazy(() => import('./pages/Profile'))
const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))
const ResetPassword = lazy(() => import('./pages/ResetPassword'))
const NewEvent = lazy(() => import('./pages/NewEvent'))
const Feed = lazy(() => import('./pages/Feed'))
const CreateGroup = lazy(() => import('./pages/CreateGroup'))
const Groups = lazy(() => import('./pages/Groups'))
const GroupDetail = lazy(() => import('./pages/GroupDetail'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const ReportSite = lazy(() => import('./pages/ReportSite'))
const MapView = lazy(() => import('./pages/MapView'))
const Gallery = lazy(() => import('./pages/Gallery'))
const CreateCampaign = lazy(() => import('./pages/CreateCampaign'))
const Campaigns = lazy(() => import('./pages/Campaigns'))
const CampaignDetail = lazy(() => import('./pages/CampaignDetail'))
const GetVerified = lazy(() => import('./pages/GetVerified'))
const USRepLookup = lazy(() => import('./pages/USRepLookup'))
const ContactRep = lazy(() => import('./pages/ContactRep'))

function RouteFallback() {
  return (
    <div className="page-shell" style={{ paddingTop: '1.2rem' }}>
      <div className="page-card" style={{ minHeight: '11rem', display: 'grid', placeItems: 'center' }}>
        Loading experience…
      </div>
    </div>
  )
}

function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="page-shell">
        <Suspense fallback={<RouteFallback />}>
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
            <Route path="/leaderboard" element={
              <ProtectedRoute><Leaderboard /></ProtectedRoute>
            } />
            <Route path="/report-site" element={
              <ProtectedRoute><ReportSite /></ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute><MapView /></ProtectedRoute>
            } />
            <Route path="/gallery" element={
              <ProtectedRoute><Gallery /></ProtectedRoute>
            } />
            <Route path="/create-campaign" element={
              <ProtectedRoute><CreateCampaign /></ProtectedRoute>
            } />
            <Route path="/campaigns" element={
              <ProtectedRoute><Campaigns /></ProtectedRoute>
            } />
            <Route path="/campaigns/:id" element={
              <ProtectedRoute><CampaignDetail /></ProtectedRoute>
            } />
            <Route path="/get-verified" element={
              <ProtectedRoute><GetVerified /></ProtectedRoute>
            } />
            <Route path="/find-reps" element={
              <ProtectedRoute><USRepLookup /></ProtectedRoute>
            } />
            <Route path="/campaigns/:id/contact-rep" element={
              <ProtectedRoute><ContactRep /></ProtectedRoute>
            } />
            <Route path="/moderation" element={
              <ProtectedRoute><Moderation /></ProtectedRoute>
            } />
          </Routes>
        </Suspense>
      </main>
    </div>
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