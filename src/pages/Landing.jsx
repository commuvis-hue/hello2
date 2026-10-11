import { Link } from 'react-router-dom'
import { Play, FileText, Users, Tag, ArrowRight } from 'lucide-react'
import Logo, { LogoMark } from '../components/Logo.jsx'
import Script from '../components/Script.jsx'
import { img } from '../data/mock.js'

const PILLARS = [
  { to: '/watch', en: 'WATCH', ko: '보고', Icon: Play, tone: 'pink' },
  { to: '/create', en: 'CREATE', ko: '만들고', Icon: FileText, tone: 'amber' },
  { to: '/fund', en: 'FUND', ko: '투자하고', Icon: Users, tone: 'violet' },
  { to: '/trade', en: 'TRADE', ko: '거래하다', Icon: Tag, tone: 'blue' },
]

const WALL = ['skate', 'guitar', 'night', 'dance', 'headphones', 'surf', 'city-dusk', 'cat', 'stars', 'ocean', 'coffee', 'walk']

export default function Landing() {
  return (
    <div className="landing">
      <div className="landing__bg" style={{ backgroundImage: `url(${img('hero-face', 1200, 1600)})` }} />
      <div className="landing__veil" />

      <div className="landing__corner landing__corner--tl">SHORT<br />IDEAS<br />BIG<br />TOMORROW</div>
      <div className="landing__corner landing__corner--tr">PEOPLE<br />CONTENT<br />INVESTMENT<br />A BRIGHTER<br />TOMORROW</div>

      <section className="landing__hero">
        <LogoMark size={150} />
        <Logo size="xl" to="/" />
        <p className="landing__copy">좋은 이야기는<br />세상을 바꿀 수 있습니다.</p>
      </section>

      <div className="landing__wall" aria-hidden="true">
        <div className="landing__wall-track">
          {[...WALL, ...WALL].map((s, i) => (
            <img key={i} src={img(s, 240, 320)} alt="" loading="lazy" />
          ))}
        </div>
        <Script className="landing__script" lines={['Stories', 'Change', 'People']} />
      </div>

      <nav className="pillars" aria-label="HELLOOOO에서 할 수 있는 일">
        {PILLARS.map(({ to, en, ko, Icon, tone }) => (
          <Link key={en} to={to} className={`pillar pillar--${tone}`}>
            <Icon size={40} fill={tone === 'blue' || tone === 'violet' ? 'currentColor' : 'none'} />
            <strong>{en}</strong>
            <i />
            <span>{ko}</span>
          </Link>
        ))}
      </nav>

      <Link to="/watch" className="landing__cta">
        START YOUR STORY <ArrowRight size={20} />
      </Link>

      <footer className="landing__foot">
        <span>GLOBAL<br />CONTENT ECOSYSTEM</span>
        <span className="landing__scroll">SCROLL</span>
        <span>HELLOOOO<br />A BRIGHTER TOMORROW</span>
      </footer>
    </div>
  )
}
