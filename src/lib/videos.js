import { useEffect, useMemo, useState } from 'react'
import { supabase, supabaseReady, SUPABASE_URL, SUPABASE_KEY, BUCKET } from './supabase.js'
import { watchItems } from '../data/mock.js'

// 거래 가능 여부: 판매가가 있고, 거래불가로 지정되지 않았고, 이미 팔리지 않은 영상
export const canTrade = (it) => Boolean(it.price) && it.tradable !== false && !it.sold

export const MAX_BYTES = 50 * 1024 * 1024 // Supabase 무료 요금제 파일당 한도에 맞춤

const compact = (n) => new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n ?? 0)
export const formatDuration = (sec) => {
  if (!sec && sec !== 0) return ''
  const s = Math.round(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
export const publicUrl = (path) => (path ? supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl : undefined)

// DB 행 → 화면 카드 형식 (mock.js 항목과 같은 모양)
export const toCard = (r) => ({
  id: r.id,
  title: r.title,
  tags: r.tags ?? [],
  video: publicUrl(r.video_path),
  poster: publicUrl(r.poster_path),
  duration: formatDuration(r.duration),
  views: compact(r.views),
  likes: compact(r.likes),
  tradable: r.tradable,
  price: r.price,
  owner: r.profiles?.nickname,
  ownerId: r.owner_id,
  description: r.description,
  badge: Date.now() - new Date(r.created_at).getTime() < 3 * 86400000 ? 'new' : undefined,
  status: r.status,
  createdAt: r.created_at,
  raw: r,
})

export async function fetchPublishedVideos() {
  const { data, error } = await supabase
    .from('videos')
    .select('*, profiles(nickname)')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(60)
  if (error) throw error
  return data.map(toCard)
}

export async function fetchMyVideos(userId) {
  const { data, error } = await supabase
    .from('videos')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map(toCard)
}

export async function deleteVideo(row) {
  const { error } = await supabase.from('videos').delete().eq('id', row.id)
  if (error) throw error
  await supabase.storage.from(BUCKET).remove([row.video_path, row.poster_path].filter(Boolean))
}

// 업로드 진행률을 보여주기 위해 XMLHttpRequest로 Supabase Storage에 직접 올립니다.
function uploadWithProgress(path, blob, accessToken, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`)
    xhr.setRequestHeader('apikey', SUPABASE_KEY)
    xhr.setRequestHeader('Content-Type', blob.type || 'application/octet-stream')
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=31536000')
    xhr.upload.onprogress = (e) => { if (e.lengthComputable && onProgress) onProgress(e.loaded / e.total) }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve()
      let msg = `업로드 실패 (${xhr.status})`
      try { const j = JSON.parse(xhr.responseText); msg = j.message || j.error || msg } catch { /* 무시 */ }
      if (xhr.status === 413 || /maximum allowed size/i.test(msg)) msg = '파일이 너무 큽니다. 50MB 이하로 줄여서 올려주세요.'
      reject(new Error(msg))
    }
    xhr.onerror = () => reject(new Error('네트워크 오류로 업로드에 실패했습니다.'))
    xhr.send(blob)
  })
}

export async function createVideo({ file, poster, meta, onProgress }) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('로그인이 필요합니다.')
  const userId = session.user.id
  const id = crypto.randomUUID()
  const ext = (file.name.split('.').pop() || 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4'
  const videoPath = `${userId}/${id}.${ext}`
  const posterPath = poster ? `${userId}/${id}.jpg` : null

  await uploadWithProgress(videoPath, file, session.access_token, (p) => onProgress?.(p * 0.95))
  if (poster) await uploadWithProgress(posterPath, poster, session.access_token)
  onProgress?.(0.98)

  const { error } = await supabase.from('videos').insert({
    id,
    owner_id: userId,
    title: meta.title,
    description: meta.description || null,
    tags: meta.tags,
    video_path: videoPath,
    poster_path: posterPath,
    duration: meta.duration,
    tradable: meta.tradable,
    price: meta.tradable ? meta.price : null,
  })
  if (error) {
    await supabase.storage.from(BUCKET).remove([videoPath, posterPath].filter(Boolean))
    throw error
  }
  onProgress?.(1)
  return id
}

// 브라우저에서 영상 길이를 읽고 첫 장면을 썸네일(JPG)로 만듭니다.
export function inspectVideo(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const v = document.createElement('video')
    v.muted = true
    v.playsInline = true
    v.preload = 'auto'
    v.src = url
    const fail = () => {
      URL.revokeObjectURL(url)
      reject(new Error('이 브라우저에서 재생할 수 없는 영상 형식입니다. 아이폰 영상(HEVC)이라면 H.264 MP4로 변환한 뒤 올려주세요.'))
    }
    v.onerror = fail
    v.onloadedmetadata = () => {
      if (!v.videoWidth) return fail() // 소리만 재생되고 화면이 안 나오는 코덱
      v.currentTime = Math.min(0.5, (v.duration || 1) / 2)
    }
    v.onseeked = () => {
      const scale = Math.min(1, 720 / v.videoWidth)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(v.videoWidth * scale)
      canvas.height = Math.round(v.videoHeight * scale)
      canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((poster) => {
        URL.revokeObjectURL(url)
        resolve({ duration: v.duration, width: v.videoWidth, height: v.videoHeight, poster })
      }, 'image/jpeg', 0.82)
    }
  })
}

export const parseTags = (s) =>
  [...new Set(s.split(/[\s,#]+/).map((t) => t.trim()).filter(Boolean))].slice(0, 8)

// WATCH 목록: 회원이 올린 영상(최신순) + 기존 샘플 영상
export function useWatchList() {
  const [dbItems, setDbItems] = useState([])
  const [loading, setLoading] = useState(supabaseReady)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabaseReady) return
    let alive = true
    fetchPublishedVideos()
      .then((d) => alive && setDbItems(d))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const items = useMemo(() => [...dbItems, ...watchItems], [dbItems])
  return { items, loading, error }
}
