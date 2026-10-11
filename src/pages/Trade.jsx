import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VideoThumb from '../components/VideoThumb.jsx'
import { Heart, Play, ShoppingCart, CheckCircle2, MoreVertical } from 'lucide-react'
import Chips from '../components/Chips.jsx'
import { tradeItems, img, formatKRW } from '../data/mock.js'

const FILTERS = ['전체', '거래가능', '거래완료', '인기', '최신']
const SLIDES = ['sunset-girl', 'dog', 'skate', 'another-me', 'anime', 'city-car']
const likeNum = (s) => parseFloat(s) * (s.endsWith('K') ? 1e3 : 1)

export default function Trade() {
  const [filter, setFilter] = useState('전체')
  const [active, setActive] = useState(2)

  const items = useMemo(() => {
    switch (filter) {
      case '거래가능': return tradeItems.filter((i) => !i.sold)
      case '거래완료': return tradeItems.filter((i) => i.sold)
      case '인기': return [...tradeItems].sort((a, b) => likeNum(b.likes) - likeNum(a.likes))
      case '최신': return [...tradeItems].reverse()
      default: return tradeItems
    }
  }, [filter])

  return (
    <div className="page">
      <section className="coverflow">
        <div className="coverflow__stage">
          {SLIDES.map((s, i) => {
            const off = i - active
            return (
              <button
                key={s}
                className="coverflow__card"
                style={{
                  transform: `translateX(${off * 34}%) scale(${1 - Math.min(Math.abs(off), 3) * 0.12}) rotateY(${off * -14}deg)`,
                  zIndex: 10 - Math.abs(off),
                  opacity: Math.abs(off) > 3 ? 0 : 1,
                }}
                onClick={() => setActive(i)}
                aria-label={`${i + 1}번째 작품 보기`}
              >
                <img src={img(s, 360, 540)} alt="" />
                {off === 0 && (
                  <span className="coverflow__caption">
                    <span className="play-ring"><Play size={24} fill="currentColor" /></span>
                    <em>순간이<br />작품이 되는 곳</em>
                    <small>HELLOOOO<br />TRADE ORIGINALS</small>
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <div className="coverflow__side">
          <p>SHORTS<br />CREATE<br />TRADE<br />A BIGGER<br />TOMORROW</p>
          <span>좋은 콘텐츠가<br />더 멀리, 더 크게</span>
        </div>
        <div className="dots">
          {SLIDES.map((_, i) => (
            <button key={i} className={i === active ? 'is-active' : ''} onClick={() => setActive(i)} aria-label={`슬라이드 ${i + 1}`} />
          ))}
        </div>
      </section>

      <Chips options={FILTERS} value={filter} onChange={setFilter} size="sm" />

      <div className="grid3">
        {items.map((t) => (
          <article key={t.id} className="vcard vcard--trade">
            <Link to={`/play/trade/${t.id}`} className="vcard__thumb vcard__thumb--short" aria-label={`${t.title} 재생`}>
              {t.video
                ? <VideoThumb src={t.video} poster={t.poster} fallbackDuration={t.duration} />
                : <><img src={img(t.seed)} alt="" loading="lazy" /><span className="duration">{t.duration}</span></>}
              {t.badge && <span className={`badge badge--${t.badge}`}>{t.badge === 'new' ? 'New' : 'Hot'}</span>}
              {!t.sold && <span className="thumb-play"><Play size={20} fill="currentColor" /></span>}
              <span className="vcard__like"><Heart size={14} fill="currentColor" />{t.likes}</span>
            </Link>
            <div className="vcard__body">
              <h3>{t.title}</h3>
              <p className="tags">{t.tags.map((x) => '#' + x).join(' ')}</p>
              <p className="owner"><img src={img('u-' + t.owner, 40, 40)} alt="" />{t.owner}</p>
              {!t.sold && <p className="price">{formatKRW(t.price)}</p>}
              <div className="vcard__foot">
                {t.sold
                  ? <span className="pill pill--off"><CheckCircle2 size={15} />거래완료</span>
                  : <button className="pill pill--buy"><ShoppingCart size={15} />거래가능</button>}
                <button className="more" aria-label="더보기"><MoreVertical size={18} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
