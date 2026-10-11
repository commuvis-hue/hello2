import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CloudUpload, Film, X, Check, CheckCircle2 } from 'lucide-react'
import SetupNotice from '../components/SetupNotice.jsx'
import { useAuth } from '../lib/auth.jsx'
import { createVideo, inspectVideo, parseTags, formatDuration, MAX_BYTES } from '../lib/videos.js'

const mb = (b) => (b / 1024 / 1024).toFixed(1) + 'MB'

export default function Upload() {
  const { ready } = useAuth()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [info, setInfo] = useState(null) // { duration, width, height, poster }
  const [checking, setChecking] = useState(false)
  const [drag, setDrag] = useState(false)

  const [title, setTitle] = useState('')
  const [tags, setTags] = useState('')
  const [description, setDescription] = useState('')
  const [tradable, setTradable] = useState(false)
  const [price, setPrice] = useState('')

  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState('idle') // idle | uploading | done
  const [error, setError] = useState('')

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview) }, [preview])

  const pick = async (f) => {
    setError('')
    if (!f) return
    if (!f.type.startsWith('video/')) return setError('영상 파일만 올릴 수 있습니다.')
    if (f.size > MAX_BYTES) return setError(`파일이 너무 큽니다 (${mb(f.size)}). 50MB 이하로 줄여서 올려주세요.`)
    setChecking(true)
    try {
      const meta = await inspectVideo(f)
      if (preview) URL.revokeObjectURL(preview)
      setFile(f)
      setInfo(meta)
      setPreview(URL.createObjectURL(f))
      if (!title) setTitle(f.name.replace(/\.[^.]+$/, '').slice(0, 60))
    } catch (e) {
      setError(e.message)
    } finally {
      setChecking(false)
    }
  }

  const clear = () => {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null); setPreview(null); setInfo(null); setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!file) return setError('올릴 영상을 선택해 주세요.')
    if (!title.trim()) return setError('제목을 입력해 주세요.')
    const priceNum = Number(price.replace(/\D/g, ''))
    if (tradable && !priceNum) return setError('판매 가격을 입력해 주세요.')

    setError(''); setPhase('uploading'); setProgress(0)
    try {
      await createVideo({
        file,
        poster: info?.poster,
        meta: {
          title: title.trim(),
          description: description.trim(),
          tags: parseTags(tags),
          duration: info?.duration,
          tradable,
          price: priceNum,
        },
        onProgress: setProgress,
      })
      setPhase('done')
    } catch (err) {
      setError(err.message || '업로드에 실패했습니다.')
      setPhase('idle')
    }
  }

  if (!ready) {
    return <div className="page form-page"><h1 className="form-page__title">영상 업로드</h1><SetupNotice /></div>
  }

  if (phase === 'done') {
    return (
      <div className="page placeholder">
        <CheckCircle2 size={56} className="success-icon" />
        <h1>업로드 완료</h1>
        <p>"{title}" 영상이 WATCH에 공개되었습니다.</p>
        <div className="row-gap">
          <button className="btn-primary" onClick={() => navigate('/watch')}>WATCH에서 보기</button>
          <button className="btn-outline" onClick={() => { clear(); setTitle(''); setTags(''); setDescription(''); setTradable(false); setPrice(''); setPhase('idle') }}>하나 더 올리기</button>
        </div>
      </div>
    )
  }

  const uploading = phase === 'uploading'

  return (
    <div className="page form-page">
      <h1 className="form-page__title">영상 업로드</h1>

      <form className="form" onSubmit={submit}>
        {!file ? (
          <button
            type="button"
            className={'dropzone' + (drag ? ' is-drag' : '')}
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]) }}
            disabled={checking}
          >
            <CloudUpload size={48} />
            <strong>{checking ? '영상 확인 중…' : '영상 파일 선택'}</strong>
            <span>MP4 권장 · 최대 50MB · 세로 영상(9:16)이 가장 잘 보입니다</span>
          </button>
        ) : (
          <div className="upload-preview">
            <video src={preview} controls playsInline muted />
            <div className="upload-preview__meta">
              <Film size={18} />
              <span>{file.name}</span>
              <span className="muted">{mb(file.size)} · {formatDuration(info?.duration)} · {info?.width}×{info?.height}</span>
              {!uploading && <button type="button" className="icon-btn" onClick={clear} aria-label="다른 영상 선택"><X size={20} /></button>}
            </div>
          </div>
        )}
        <input ref={inputRef} type="file" accept="video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />

        <label className="field">
          <span>제목 <em>*</em></span>
          <input maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} disabled={uploading} placeholder="예) 오늘도 좋은 하루" />
        </label>
        <label className="field">
          <span>태그</span>
          <input value={tags} onChange={(e) => setTags(e.target.value)} disabled={uploading} placeholder="#강아지 #힐링 (최대 8개)" />
        </label>
        <label className="field">
          <span>설명</span>
          <textarea rows={3} maxLength={500} value={description} onChange={(e) => setDescription(e.target.value)} disabled={uploading} placeholder="영상에 대한 이야기를 적어주세요" />
        </label>

        <label className="checkline">
          <input type="checkbox" checked={tradable} onChange={(e) => setTradable(e.target.checked)} disabled={uploading} />
          <i className="checkbox">{tradable && <Check size={14} strokeWidth={3} />}</i>
          <span>TRADE에서 판매 가능한 영상으로 등록</span>
        </label>
        {tradable && (
          <label className="field">
            <span>판매 가격 (원)</span>
            <input
              inputMode="numeric"
              value={price ? Number(price).toLocaleString('ko-KR') : ''}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))}
              disabled={uploading}
              placeholder="3,500,000"
            />
          </label>
        )}

        <p className="form__hint">직접 촬영했거나 사용 권리가 있는 영상만 올려주세요. 타인의 저작물이나 초상권을 침해하는 영상은 삭제될 수 있습니다.</p>

        {error && <p className="form__error" role="alert">{error}</p>}

        {uploading ? (
          <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <span className="bar"><span style={{ width: `${progress * 100}%` }} /></span>
            <span>{Math.round(progress * 100)}% 업로드 중… 창을 닫지 마세요</span>
          </div>
        ) : (
          <button className="btn-primary" disabled={!file || checking}>업로드</button>
        )}
      </form>

      <Link to="/my" className="form-page__link">내가 올린 영상 보기</Link>
    </div>
  )
}
