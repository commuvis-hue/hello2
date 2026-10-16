import { useEffect, useRef, useState } from 'react'

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// 배너 배경 영상: 여러 클립을 clipSeconds초씩 부드럽게 번갈아 재생 (소리 없음)
// 두 개의 <video>를 겹쳐 두고, 뒤쪽에 다음 클립을 미리 불러와 교차 페이드합니다.
export default function BannerVideo({ items, clipSeconds = 6, onChange }) {
  const n = items.length
  const [front, setFront] = useState(0) // 0 또는 1: 지금 보이는 레이어
  const [layers, setLayers] = useState(() => [0, n > 1 ? 1 : 0]) // 각 레이어가 재생할 items 인덱스
  const refs = [useRef(null), useRef(null)]
  const switching = useRef(false)
  const still = reducedMotion()

  const current = layers[front]
  useEffect(() => { onChange?.(items[current]) }, [current]) // eslint-disable-line react-hooks/exhaustive-deps

  const advance = () => {
    if (n < 2 || switching.current) return
    switching.current = true
    const back = 1 - front
    const v = refs[back].current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }
    setFront(back)
    // 페이드가 끝난 뒤, 숨겨진 레이어에 그다음 클립을 미리 불러오기
    setTimeout(() => {
      refs[front].current?.pause()
      setLayers((l) => {
        const next = [...l]
        next[front] = (l[back] + 1) % n
        return next
      })
      switching.current = false
    }, 1000)
  }

  const onTime = (e, layer) => {
    if (layer !== front) return
    if (e.currentTarget.currentTime >= clipSeconds) advance()
  }

  useEffect(() => {
    if (still) return
    refs[front].current?.play().catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (n === 0) return null

  return (
    <div className="banner__media" aria-hidden="true">
      {[0, 1].map((layer) => {
        const it = items[layers[layer]]
        return (
          <video
            key={layer}
            ref={refs[layer]}
            className={'banner__video' + (layer === front ? ' is-front' : '')}
            src={still ? it.video + '#t=0.5' : it.video}
            poster={it.poster}
            muted
            playsInline
            loop={n === 1}
            autoPlay={!still && layer === 0}
            preload="auto"
            onTimeUpdate={(e) => onTime(e, layer)}
            onEnded={() => layer === front && advance()}
          />
        )
      })}
    </div>
  )
}
