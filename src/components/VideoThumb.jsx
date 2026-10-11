import { useRef, useState } from 'react'

const fmt = (sec) => {
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

// 영상 첫 장면을 썸네일로 보여주고, PC에서는 마우스를 올리면 소리 없이 미리보기 재생
export default function VideoThumb({ src, poster, fallbackDuration }) {
  const ref = useRef(null)
  const [duration, setDuration] = useState(null)

  const play = () => { const v = ref.current; if (v) v.play().catch(() => {}) }
  const stop = () => { const v = ref.current; if (v) { v.pause(); v.currentTime = 0.1 } }

  return (
    <>
      <video
        ref={ref}
        className="thumb-video"
        src={src + '#t=0.1'}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onMouseEnter={play}
        onMouseLeave={stop}
      />
      <span className="duration">{duration ? fmt(duration) : fallbackDuration}</span>
    </>
  )
}
