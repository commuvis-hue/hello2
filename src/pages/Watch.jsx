import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VideoThumb from '../components/VideoThumb.jsx'
import { Eye, Heart, Copyright, MoreVertical } from 'lucide-react'
import Chips from '../components/Chips.jsx'
import Badge from '../components/Badge.jsx'
import Script from '../components/Script.jsx'
import { img } from '../data/mock.js'
import { useWatchList } from '../lib/videos.js'

const FILTERS = ['전체', '인기', '신규', '조회수']
const num = (s) => parseFloat(s) * (s.endsWith('M') ? 1e6 : s.endsWith('K') ? 1e3 : 1)

export default function Watch() {
  const [filter, setFilter] = useState('전체')
  const { items: watchItems, error } = useWatchList()

  const items = useMemo(() => {
    if (filter === '인기') return [...watchItems].sort((a, b) => num(b.likes) - num(a.likes))
    if (filter === '신규') return watchItems.filter((i) => i.badge === 'new')
    if (filter === '조회수') return [...watchItems].sort((a, b) => num(b.views) - num(a.views))
    return watchItems
  }, [filter, watchItems])

  return (
    <div className="page">
      <section className="banner" style={{ backgroundImage: `url(${img('watch-banner', 900, 460)})` }}>
        <p className="banner__stack">SHORT<br />IDEAS<br />BIG<br />TOMORROW</p>
        <Script className="banner__script" lines={['Stories', 'Change', 'People']} />
      </section>

      <Chips options={FILTERS} value={filter} onChange={setFilter} />

      {error && <p className="form__error" style={{ margin: '0 16px' }}>업로드된 영상을 불러오지 못했습니다: {error}</p>}

      <div className="grid3">
        {items.map((v) => (
          <article key={v.id} className="vcard">
            <Link to={`/play/watch/${v.id}`} className="vcard__thumb" aria-label={`${v.title} 재생`}>
              {v.video
                ? <VideoThumb src={v.video} poster={v.poster} fallbackDuration={v.duration} />
                : <><img src={img(v.seed)} alt="" loading="lazy" /><span className="duration">{v.duration}</span></>}
              {filter === '전체' && v.rank
                ? <span className={`rank rank--${v.rank}`}>{v.rank}</span>
                : <Badge type={v.badge} />}
              <div className="vcard__stats">
                <span><Eye size={16} />{v.views}</span>
                <span><Heart size={15} fill="currentColor" />{v.likes}</span>
              </div>
            </Link>
            <div className="vcard__body">
              <h3>{v.title}</h3>
              <p className="tags">{v.tags.map((t) => '#' + t).join(' ')}</p>
              <div className="vcard__foot">
                <span className={'pill ' + (v.tradable ? 'pill--on' : 'pill--off')}>
                  <Copyright size={14} />{v.tradable ? '거래가능' : '거래불가'}
                </span>
                <button className="more" aria-label="더보기"><MoreVertical size={18} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
