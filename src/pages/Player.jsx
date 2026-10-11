import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, Share2, Volume2, VolumeX, Play, ShoppingCart } from 'lucide-react'
import { tradeItems, formatKRW } from '../data/mock.js'
import { useWatchList } from '../lib/videos.js'

// 쇼츠 재생 화면: 위아래로 넘기면 다음 영상이 자동 재생됩니다.
export default function Player() {
  const { list = 'watch', id } = useParams()
  const watch = useWatchList()

  if (list === 'watch' && watch.loading) {
    return <div className="player player--empty"><p>불러오는 중…</p></div>
  }
  const source = list === 'trade' ? tradeItems : watch.items
  // key: 다른 영상 목록으로 바뀌면 재생 상태를 새로 시작
  return <PlayerFeed key={list + ':' + id} list={list} id={id} items={source.filter((i) => i.video)} />
}

function PlayerFeed({ list, id, items }) {
  const navigate = useNavigate()
  const startIndex = Math.max(0, items.findIndex((i) => i.id === id))

  const feedRef = useRef(null)
  const videoRefs = useRef([])
  const [current, setCurrent] = useState(startIndex)
  const [muted, setMuted] = useState(true) // 브라우저 정책상 첫 자동재생은 음소거로 시작
  const [paused, setPaused] = useState(false)
  const [liked, setLiked] = useState({})

  // 처음 누른 영상 위치로 이동
  useEffect(() => {
    feedRef.current?.children[startIndex]?.scrollIntoView({ block: 'start' })
  }, [startIndex])

  // 화면에 60% 이상 보이는 영상을 현재 영상으로
  useEffect(() => {
    const root = feedRef.current
    if (!root) return
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setCurrent(Number(e.target.dataset.index))
      }),
      { root, threshold: 0.6 }
    )
    Array.from(root.children).forEach((c) => io.observe(c))
    return () => io.disconnect()
  }, [items.length])

  // 현재 영상만 재생, 나머지는 정지
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return
      if (i === current) {
        v.muted = muted
        v.play().catch(() => { v.muted = true; setMuted(true); v.play().catch(() => {}) })
      } else {
        v.pause()
        v.currentTime = 0
      }
    })
    setPaused(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current])

  useEffect(() => {
    const v = videoRefs.current[current]
    if (v) v.muted = muted
  }, [muted, current])

  const togglePlay = (i) => {
    const v = videoRefs.current[i]
    if (!v) return
    if (v.paused) { v.play().catch(() => {}); setPaused(false) }
    else { v.pause(); setPaused(true) }
  }

  const share = async (item) => {
    const url = window.location.origin + `/play/${list}/${item.id}`
    try {
      if (navigator.share) await navigator.share({ title: item.title, url })
      else { await navigator.clipboard.writeText(url); alert('링크를 복사했습니다.') }
    } catch { /* 사용자가 공유 취소 */ }
  }

  if (items.length === 0) {
    return (
      <div className="player player--empty">
        <p>재생할 영상이 없습니다.</p>
        <button className="btn-outline" onClick={() => navigate('/watch')}>돌아가기</button>
      </div>
    )
  }

  return (
    <div className="player">
      <div className="player__top">
        <button aria-label="뒤로" onClick={() => navigate(list === 'trade' ? '/trade' : '/watch')}><ArrowLeft size={26} /></button>
        <button aria-label={muted ? '소리 켜기' : '소리 끄기'} onClick={() => setMuted((m) => !m)}>
          {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
      </div>

      <div className="player__feed" ref={feedRef}>
        {items.map((it, i) => (
          <section key={it.id} className="player__slide" data-index={i}>
            <video
              ref={(el) => { videoRefs.current[i] = el }}
              src={it.video}
              poster={it.poster}
              playsInline
              loop
              muted
              preload={Math.abs(i - current) <= 1 ? 'auto' : 'metadata'}
              onClick={() => togglePlay(i)}
            />
            {paused && i === current && (
              <span className="player__paused" aria-hidden="true"><Play size={44} fill="currentColor" /></span>
            )}

            <div className="player__info">
              {it.owner && <p className="player__owner">@{it.owner}</p>}
              <h2>{it.title}</h2>
              <p className="player__tags">{it.tags.map((t) => '#' + t).join(' ')}</p>
              {it.price && !it.sold && (
                <button className="player__buy"><ShoppingCart size={16} />{formatKRW(it.price)} 구매하기</button>
              )}
            </div>

            <div className="player__side">
              <button className={liked[it.id] ? 'is-on' : ''} onClick={() => setLiked((s) => ({ ...s, [it.id]: !s[it.id] }))} aria-label="좋아요">
                <Heart size={30} fill={liked[it.id] ? 'currentColor' : 'none'} />
                <span>{it.likes}</span>
              </button>
              <button onClick={() => share(it)} aria-label="공유">
                <Share2 size={28} />
                <span>공유</span>
              </button>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
