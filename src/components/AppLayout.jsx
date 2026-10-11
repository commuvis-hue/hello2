import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Header from './Header.jsx'
import BottomNav from './BottomNav.jsx'

export default function AppLayout() {
  const { pathname } = useLocation()
  // 펀딩 상세(투자) 화면은 초안대로 라이트 테마를 사용
  const light = /^\/fund\/.+/.test(pathname)

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  return (
    <div className={'app' + (light ? ' theme-light' : '')}>
      <div className="app__shell">
        <Header />
        <main className="app__main">
          <Outlet />
        </main>
        <BottomNav />
      </div>
    </div>
  )
}
