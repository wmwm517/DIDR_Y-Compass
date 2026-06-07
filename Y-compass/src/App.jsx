import { useState } from 'react'
import './App.css'
import { UserProvider, useUser } from './context/UserContext'
import Intro from './page/onboarding/Intro'
import Login from './page/onboarding/Login'
import Home from './page/Home'
import CourceManage from './page/CourceManage'
import FAQ from './page/FAQ'
import MyPage from './page/MyPage'
import BottomNav from './components/BottomNav'

function AppInner() {
  const [phase, setPhase] = useState('intro') // 'intro' | 'login' | 'app'
  const [page, setPage] = useState('home')
  const { setProfile, setCourses } = useUser()

  const handleLogin = (profileData) => {
    if (profileData) {
      setProfile(profileData)
      setCourses([]) // fresh course list for new signup
    }
    setPhase('app')
  }

  if (phase === 'intro') {
    return <Intro onDone={() => setPhase('login')} />
  }

  if (phase === 'login') {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      {page === 'home'    && <Home setPage={setPage} />}
      {page === 'courses' && <CourceManage />}
      {page === 'faq'     && <FAQ />}
      {page === 'mypage'  && <MyPage onLogout={() => setPhase('login')} />}
      <BottomNav page={page} setPage={setPage} />
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppInner />
    </UserProvider>
  )
}
