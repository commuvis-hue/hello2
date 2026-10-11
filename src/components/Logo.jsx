import { Link } from 'react-router-dom'

export default function Logo({ size = 'md', to = '/' }) {
  return (
    <Link to={to} className={`logo logo--${size}`} aria-label="HELLOOOO 홈">
      <span className="logo__word">
        HELL<span className="logo__o">OOOO</span>
      </span>
      <span className="logo__sub">Shorts to the World</span>
    </Link>
  )
}

export function LogoMark({ size = 160 }) {
  return (
    <svg className="logo-mark" width={size} height={size * 1.15} viewBox="0 0 64 74" aria-hidden="true">
      <defs>
        <linearGradient id="lm-a" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffb02e" />
          <stop offset=".55" stopColor="#ff3d6e" />
          <stop offset="1" stopColor="#ff2ea6" />
        </linearGradient>
        <linearGradient id="lm-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff2e93" />
          <stop offset="1" stopColor="#3d3dff" />
        </linearGradient>
      </defs>
      <path d="M22 16 L58 33 C62 35 62 39 58 41 L22 58 Z" fill="url(#lm-b)" />
      <rect x="4" y="2" width="20" height="70" rx="10" fill="url(#lm-a)" opacity=".95" />
      <path d="M28 27 L44 37 L28 47 Z" fill="#fff" />
    </svg>
  )
}
