import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Users, Crown, ArrowRight, ChevronRight, Heart } from 'lucide-react'
import Script from '../components/Script.jsx'
import { fundProjects, trendingSeeds, img } from '../data/mock.js'

const HERO = ['fund-hero', 'fund-hero-2', 'fund-hero-3']
const pct = (p) => p.percent ?? Math.round((p.raised / p.goal) * 100)

export default function Fund() {
  const [slide, setSlide] = useState(0)
  const [liked, setLiked] = useState({})
  const vip = fundProjects.find((p) => p.vip)

  return (
    <div className="page">
      <section className="fund-hero" style={{ backgroundImage: `url(${img(HERO[slide], 900, 560)})` }}>
        <p className="banner__stack">IDEAS<br />PEOPLE<br />A BRIGHTER<br />TOMORROW</p>
        <Link to={`/fund/${vip.id}`} className="play-ring play-ring--lg" aria-label="대표 프로젝트 영상 보기">
          <Play size={40} fill="currentColor" />
        </Link>
        <Script className="banner__script" lines={['Good', 'Stories', 'Change', 'The World']} />
        <div className="dots dots--bar">
          {HERO.map((_, i) => (
            <button key={i} className={i === slide ? 'is-active' : ''} onClick={() => setSlide(i)} aria-label={`슬라이드 ${i + 1}`} />
          ))}
        </div>
      </section>

      <div className="fund-entry">
        <Link to="/fund" className="fund-card fund-card--together" style={{ backgroundImage: `url(${img('camera-dusk', 500, 360)})` }}>
          <Users size={44} />
          <strong>FUND<br />TOGETHER</strong>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </Link>
        <Link to={`/fund/${vip.id}`} className="fund-card fund-card--vip" style={{ backgroundImage: `url(${img('vip-woman', 500, 360)})` }}>
          <Crown size={44} fill="currentColor" />
          <strong>VIP<br />FUND</strong>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </Link>
      </div>

      <section className="section">
        <div className="section__head section__head--caps">
          <h2>FEATURED PROJECTS</h2>
          <Link to="/fund">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="hscroll">
          {fundProjects.map((p) => (
            <Link key={p.id} to={`/fund/${p.id}`} className="fcard">
              <img src={img(p.seed, 300, 380)} alt={p.title} loading="lazy" />
              <Users size={20} className="fcard__icon" />
              <button
                className={'fcard__like' + (liked[p.id] ? ' is-on' : '')}
                aria-label="관심 프로젝트"
                onClick={(e) => { e.preventDefault(); setLiked((s) => ({ ...s, [p.id]: !s[p.id] })) }}
              >
                <Heart size={20} fill={liked[p.id] ? 'currentColor' : 'none'} />
              </button>
              <span className="play-ring"><Play size={20} fill="currentColor" /></span>
              <span className="fcard__progress">
                <span className="bar"><span style={{ width: pct(p) + '%' }} /></span>
                {pct(p)}%
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section__head section__head--caps">
          <h2>TRENDING NOW</h2>
          <Link to="/watch">View All <ChevronRight size={16} /></Link>
        </div>
        <div className="hscroll hscroll--sm">
          {trendingSeeds.map((s) => (
            <Link key={s} to="/watch" className="tcard">
              <img src={img(s, 220, 220)} alt="" loading="lazy" />
              <Play size={18} fill="currentColor" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
