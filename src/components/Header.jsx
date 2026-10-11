import { NavLink, Link } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import Logo from './Logo.jsx'
import { useAuth } from '../lib/auth.jsx'

const TABS = [
  { to: '/watch', label: 'WATCH' },
  { to: '/create', label: 'CREATE' },
  { to: '/fund', label: 'FUND' },
  { to: '/trade', label: 'TRADE' },
]

export default function Header() {
  const { user, profile } = useAuth()
  const initial = (profile?.nickname || user?.email || '?')[0].toUpperCase()
  return (
    <header className="header">
      <div className="header__bar">
        <Logo to="/" />
        <div className="header__actions">
          <button className="icon-btn" aria-label="검색"><Search size={24} /></button>
          <button className="icon-btn icon-btn--dot" aria-label="알림 (새 알림 있음)"><Bell size={24} /></button>
          {user ? (
            <NavLink to="/my" className="avatar avatar--initial" aria-label="마이페이지">{initial}</NavLink>
          ) : (
            <Link to="/login" className="login-pill">로그인</Link>
          )}
        </div>
      </div>
      <nav className="top-tabs" aria-label="주요 메뉴">
        {TABS.map((t) => (
          <NavLink key={t.to} to={t.to} className={({ isActive }) => 'top-tabs__item' + (isActive ? ' is-active' : '')}>
            {t.label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
