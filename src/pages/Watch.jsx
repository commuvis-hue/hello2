import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import VideoThumb from '../components/VideoThumb.jsx'
import { Eye, Heart } from 'lucide-react'
import Chips from '../components/Chips.jsx'
import Badge from '../components/Badge.jsx'
import Script from '../components/Script.jsx'
import { img, bannerVideoIds, vid } from '../data/mock.js'
import BannerVideo from '../components/BannerVideo.jsx'
import { Play } from 'lucide-react'
import { useWatchList } from '../lib/videos.js'

const FILTERS = ['전체', '인기', '신규', '조회수']
const num = (s) => parseFloat(s) * (s.endsWith('M') ? 1e6 : s.endsWith('K') ? 1e3 : 1)

export default function Watch() {
  const [filter, setFilter] = useState('전체')
  const { items: watchItems, error } = useWatchList()
  const [nowPlaying, setNowPlaying] = useState(null)

  const bannerItems = useMemo(() => {
    const picked = bannerVideoIds
      .map((id) => (id === 'banner' ? { id: null, video: vid('banner') } : watchItems.find((v) => v.id === id)))
      .filter((v) => v?.video)
    return picked.length ? picked : watchItems.filter((v) => v.video).slice(0, 3)
  }, [watchItems])

  const items = useMemo(() => {
    if (filter === '인기') return [...watchItems].sort((a, b) => num(b.likes) - num(a.likes))
    if (filter === '신규') return watchItems.filter((i) => i.badge === 'new')
    if (filter === '조회수') return [...watchItems].sort((a, b) => num(b.views) - num(a.views))
    return watchItems
  }, [filter, watchItems])

  return (
    <div className="page">
      <section className="banner banner--video" style={{ backgroundImage: `url(${img('watch-banner', 900, 460)})` }}>
        <BannerVideo items={bannerItems} onChange={setNowPlaying} />
        <p className="banner__stack">SHORT<br />IDEAS<br />BIG<br />TOMORROW</p>
        <Script className="banner__script" lines={['Stories', 'Change', 'People']} />
        {nowPlaying?.id && nowPlaying.title && (
          <Link to={`/play/watch/${nowPlaying.id}`} className="banner__now">
            <Play size={12} fill="currentColor" />{nowPlaying.title}
          </Link>
        )}
      </section>

      <Chips options={FILTERS} value={filter} onChange={setFilter} />

      {error && <p className="form__error" style={{ margin: '0 16px' }}>업로드된 영상을 불러오지 못했습니다: {error}</p>}

      <div className="wgrid">
        {items.map((v) => (
          <Link key={v.id} to={`/play/watch/${v.id}`} className="wcard" aria-label={`${v.title} 재생`}>
            {v.video
              ? <VideoThumb src={v.video} poster={v.poster} fallbackDuration={v.duration} />
              : <><img src={img(v.seed)} alt="" loading="lazy" /><span className="duration">{v.duration}</span></>}
            {filter === '전체' && v.rank
              ? <span className={`rank rank--${v.rank}`}>{v.rank}</span>
              : <Badge type={v.badge} />}
            <div className="wcard__overlay">
              <strong>{v.title}</strong>
              <span className="wcard__stats">
                <span><Eye size={14} />{v.views}</span>
                <span><Heart size={13} fill="currentColor" />{v.likes}</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
