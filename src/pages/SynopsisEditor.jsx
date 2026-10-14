import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2, Copy, LayoutList, X } from 'lucide-react'
import SetupNotice from '../components/SetupNotice.jsx'
import { useAuth } from '../lib/auth.jsx'
import {
  GENRES, LENGTHS, STATUSES, FOUR_ACT,
  getSynopsis, createSynopsis, updateSynopsis, deleteSynopsis, toPlainText,
} from '../lib/synopses.js'

const EMPTY = { title: '', logline: '', genre: '', target_length: '', content: '', scenes: [], status: 'planning' }
const CONTENT_MAX = 5000
const pick = (r) => ({
  title: r.title ?? '', logline: r.logline ?? '', genre: r.genre ?? '', target_length: r.target_length ?? '',
  content: r.content ?? '', scenes: Array.isArray(r.scenes) ? r.scenes : [], status: r.status ?? 'planning',
})
const hasContent = (f) => Boolean(f.title.trim() || f.logline.trim() || f.content.trim() || f.scenes.some((s) => s.text.trim()))
const time = (d) => d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

export default function SynopsisEditor() {
  const { ready } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const navRef = useRef(navigate)
  navRef.current = navigate

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(id !== 'new')
  const [notFound, setNotFound] = useState(false)
  const [saveState, setSaveState] = useState('idle') // idle | dirty | saving | saved | error
  const [savedAt, setSavedAt] = useState(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const formRef = useRef(form)
  formRef.current = form
  const rowIdRef = useRef(id === 'new' ? null : id)
  const createdIdRef = useRef(null)
  const dirtyRef = useRef(false)
  const inFlight = useRef(false)
  const queued = useRef(false)

  // 기존 시놉시스 불러오기
  useEffect(() => {
    if (!ready || id === 'new' || id === createdIdRef.current) return
    let alive = true
    setLoading(true)
    getSynopsis(id)
      .then((row) => {
        if (!alive) return
        if (!row) { setNotFound(true); return }
        rowIdRef.current = row.id
        setForm(pick(row))
        setSavedAt(new Date(row.updated_at))
        setSaveState('saved')
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [id, ready])

  const save = useCallback(async () => {
    if (!dirtyRef.current) return
    if (inFlight.current) { queued.current = true; return }
    const data = formRef.current
    if (!rowIdRef.current && !hasContent(data)) { dirtyRef.current = false; setSaveState('idle'); return }

    inFlight.current = true
    dirtyRef.current = false
    setSaveState('saving')
    try {
      const payload = { ...data, genre: data.genre || null, target_length: data.target_length || null }
      if (!rowIdRef.current) {
        const row = await createSynopsis(payload)
        rowIdRef.current = row.id
        createdIdRef.current = row.id
        navRef.current(`/synopsis/${row.id}`, { replace: true })
      } else {
        await updateSynopsis(rowIdRef.current, payload)
      }
      setSavedAt(new Date())
      setSaveState(dirtyRef.current ? 'dirty' : 'saved')
      setError('')
    } catch (e) {
      dirtyRef.current = true
      setSaveState('error')
      setError(e.message || '저장하지 못했습니다.')
    } finally {
      inFlight.current = false
      if (queued.current) { queued.current = false; save() }
    }
  }, [])

  // 입력이 멈추고 1.5초 뒤 자동 저장
  useEffect(() => {
    if (saveState !== 'dirty') return
    const t = setTimeout(save, 1500)
    return () => clearTimeout(t)
  }, [form, saveState, save])

  // 저장 안 된 채로 창을 닫으려 하면 경고, 화면을 떠날 때는 마지막 내용 저장
  useEffect(() => {
    const warn = (e) => { if (dirtyRef.current) { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn); if (dirtyRef.current) save() }
  }, [save])

  const update = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    dirtyRef.current = true
    setSaveState('dirty')
  }
  const setScene = (i, patch) => update({ scenes: form.scenes.map((s, j) => (j === i ? { ...s, ...patch } : s)) })
  const addScene = () => update({ scenes: [...form.scenes, { label: `장면 ${form.scenes.length + 1}`, text: '' }] })
  const removeScene = (i) => update({ scenes: form.scenes.filter((_, j) => j !== i) })
  const applyTemplate = () => {
    if (form.scenes.some((s) => s.text.trim()) && !window.confirm('작성한 장면 구성을 4단 구성 템플릿으로 바꿀까요?')) return
    update({ scenes: FOUR_ACT.map((s) => ({ ...s })) })
  }

  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(toPlainText(form))
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      alert('복사하지 못했습니다. 브라우저 권한을 확인해 주세요.')
    }
  }

  const remove = async () => {
    if (!rowIdRef.current) { navigate('/create'); return }
    if (!window.confirm('이 시놉시스를 삭제할까요? 되돌릴 수 없습니다.')) return
    try {
      dirtyRef.current = false
      await deleteSynopsis(rowIdRef.current)
      navigate('/create', { replace: true })
    } catch (e) {
      alert('삭제하지 못했습니다: ' + e.message)
    }
  }

  if (!ready) return <div className="page form-page"><h1 className="form-page__title">시놉시스 작성</h1><SetupNotice /></div>
  if (loading) return <div className="page placeholder"><p>불러오는 중…</p></div>
  if (notFound) {
    return (
      <div className="page placeholder">
        <h1>시놉시스를 찾을 수 없습니다</h1>
        <p>삭제되었거나 다른 회원의 문서입니다.</p>
        <Link to="/create" className="btn-outline">CREATE로 돌아가기</Link>
      </div>
    )
  }

  const statusText = {
    idle: '',
    dirty: '입력 중…',
    saving: '저장 중…',
    saved: savedAt ? `저장됨 · ${time(savedAt)}` : '저장됨',
    error: '저장 실패',
  }[saveState]

  return (
    <div className="page form-page synopsis">
      <div className="synopsis__bar">
        <Link to="/create" className="synopsis__back"><ArrowLeft size={20} />CREATE</Link>
        <span className={`save-state save-state--${saveState}`} role="status">{statusText}</span>
        <button className="btn-primary btn-sm" onClick={save} disabled={saveState === 'saving' || (saveState !== 'dirty' && saveState !== 'error')}>저장</button>
      </div>

      <input
        className="synopsis__title"
        value={form.title}
        onChange={(e) => update({ title: e.target.value })}
        maxLength={60}
        placeholder="제목을 입력하세요"
        aria-label="제목"
      />

      <label className="field">
        <span>한 줄 요약 (로그라인)</span>
        <input
          value={form.logline}
          onChange={(e) => update({ logline: e.target.value })}
          maxLength={120}
          placeholder="예) 매일 같은 길을 걷던 강아지가 처음으로 다른 길을 선택한다"
        />
      </label>

      <div className="field">
        <span>장르</span>
        <div className="choice-row">
          {GENRES.map((g) => (
            <button key={g} type="button" className={'chip chip--sm' + (form.genre === g ? ' is-active' : '')}
              onClick={() => update({ genre: form.genre === g ? '' : g })} aria-pressed={form.genre === g}>{g}</button>
          ))}
        </div>
      </div>

      <div className="field">
        <span>목표 길이</span>
        <div className="choice-row">
          {LENGTHS.map((l) => (
            <button key={l} type="button" className={'chip chip--sm' + (form.target_length === l ? ' is-active' : '')}
              onClick={() => update({ target_length: form.target_length === l ? '' : l })} aria-pressed={form.target_length === l}>{l}</button>
          ))}
        </div>
      </div>

      <label className="field">
        <span>시놉시스</span>
        <textarea
          className="synopsis__content"
          rows={10}
          maxLength={CONTENT_MAX}
          value={form.content}
          onChange={(e) => update({ content: e.target.value })}
          placeholder={'누가, 어디서, 무엇을 원하고, 무엇이 그것을 가로막는지 적어보세요.\n짧은 영상일수록 하나의 감정, 하나의 사건에 집중하는 것이 좋습니다.'}
        />
        <small className="counter">{form.content.length.toLocaleString()} / {CONTENT_MAX.toLocaleString()}</small>
      </label>

      <div className="field">
        <div className="field__head">
          <span>장면 구성</span>
          <button type="button" className="text-btn" onClick={applyTemplate}><LayoutList size={16} />4단 구성 템플릿</button>
        </div>
        {form.scenes.length === 0 && <p className="form__hint">장면을 나눠 적으면 촬영 계획을 세우기 쉬워집니다.</p>}
        <ol className="scenes">
          {form.scenes.map((sc, i) => (
            <li key={i} className="scene">
              <div className="scene__head">
                <span className="scene__no">{i + 1}</span>
                <input className="scene__label" value={sc.label} maxLength={20} onChange={(e) => setScene(i, { label: e.target.value })} aria-label={`장면 ${i + 1} 이름`} />
                <button type="button" className="icon-btn" onClick={() => removeScene(i)} aria-label={`장면 ${i + 1} 삭제`}><X size={18} /></button>
              </div>
              <textarea rows={2} maxLength={300} value={sc.text} onChange={(e) => setScene(i, { text: e.target.value })} placeholder={sc.hint || '이 장면에서 일어나는 일'} />
            </li>
          ))}
        </ol>
        {form.scenes.length < 12 && (
          <button type="button" className="btn-outline btn-dashed" onClick={addScene}><Plus size={16} />장면 추가</button>
        )}
      </div>

      <div className="field">
        <span>진행 상태</span>
        <div className="choice-row">
          {STATUSES.map((s) => (
            <button key={s.id} type="button" className={`status-pick status-pick--${s.tone}` + (form.status === s.id ? ' is-active' : '')}
              onClick={() => update({ status: s.id })} aria-pressed={form.status === s.id}>{s.label}</button>
          ))}
        </div>
      </div>

      {error && <p className="form__error" role="alert">{error}</p>}

      <div className="synopsis__actions">
        <button type="button" className="btn-outline" onClick={copyText} disabled={!hasContent(form)}>
          <Copy size={16} />{copied ? '복사됨' : '텍스트 복사'}
        </button>
        <button type="button" className="btn-outline btn-danger" onClick={remove}><Trash2 size={16} />삭제</button>
      </div>
    </div>
  )
}
