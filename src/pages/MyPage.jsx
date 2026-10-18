import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, Trash2, Plus, ShieldCheck, ChevronRight } from 'lucide-react'
import SetupNotice from '../components/SetupNotice.jsx'
import { useAuth } from '../lib/auth.jsx'
import { fetchMyVideos, deleteVideo } from '../lib/videos.js'
import { fetchMyCertificates } from '../lib/certificates.js'
import { t, locale } from '../i18n/index.jsx'

const STATUS = {
  published: { label: '공개됨', tone: 'green' },
  pending: { label: '검수 대기', tone: 'amber' },
  rejected: { label: '반려됨', tone: 'violet' },
}

export default function MyPage() {
  const { ready, user, profile, signOut } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [certs, setCerts] = useState([])

  useEffect(() => {
    if (!ready || !user) return
    fetchMyVideos(user.id)
      .then(setVideos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
    fetchMyCertificates().then(setCerts).catch(() => setCerts([]))
  }, [ready, user])

  const remove = async (v) => {
    if (!window.confirm(t('"{title}" 영상을 삭제할까요? 되돌릴 수 없습니다.', { title: v.title }))) return
    try {
      await deleteVideo(v.raw)
      setVideos((list) => list.filter((x) => x.id !== v.id))
    } catch (e) {
      alert(t('삭제하지 못했습니다') + ': ' + e.message)
    }
  }

  if (!ready) return <div className="page form-page"><h1 className="form-page__title">{t('마이페이지')}</h1><SetupNotice /></div>

  return (
    <div className="page form-page">
      <section className="me">
        <div className="me__avatar">{(profile?.nickname || user.email)[0].toUpperCase()}</div>
        <div>
          <strong>{profile?.nickname ?? '…'}</strong>
          <span>{user.email}</span>
        </div>
        <button className="btn-outline" onClick={signOut}><LogOut size={16} />{t('로그아웃')}</button>
      </section>

      {certs.length > 0 && (
        <>
          <div className="section__head section__head--flush"><h2>{t('보유 저작권 인증서')}</h2></div>
          <ul className="cert-list">
            {certs.map((c) => (
              <li key={c.code}>
                <Link to={`/certificate/${c.code}`}>
                  <ShieldCheck size={24} />
                  <span>
                    <strong>{c.video_title}</strong>
                    <small>{c.code} · {new Date(c.issued_at).toLocaleDateString(locale())}{c.is_test ? ` · ${t('테스트')}` : ''}</small>
                  </span>
                  <ChevronRight size={18} />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="section__head section__head--flush">
        <h2>{t('내가 올린 영상')}</h2>
        <Link to="/upload" className="btn-outline"><Plus size={16} />{t('영상 올리기')}</Link>
      </div>

      {loading && <p className="muted">{t('불러오는 중…')}</p>}
      {error && <p className="form__error">{error}</p>}
      {!loading && videos.length === 0 && (
        <div className="empty-box">
          <p>{t('아직 올린 영상이 없습니다.')}</p>
          <Link to="/upload" className="btn-primary">{t('첫 영상 올리기')}</Link>
        </div>
      )}

      <ul className="my-videos">
        {videos.map((v) => {
          const st = STATUS[v.status] ?? STATUS.published
          return (
            <li key={v.id}>
              <Link to={`/play/watch/${v.id}`} className="my-videos__thumb">
                {v.poster ? <img src={v.poster} alt="" /> : <video src={v.video + '#t=0.1'} muted preload="metadata" />}
                <span className="duration">{v.duration}</span>
              </Link>
              <div className="my-videos__body">
                <strong>{v.title}</strong>
                <span className={`status status--${st.tone}`}>{t(st.label)}</span>
                <span className="muted">{new Date(v.createdAt).toLocaleDateString(locale())} · {t('조회')} {v.views} · {t('좋아요')} {v.likes}</span>
              </div>
              <button className="icon-btn" onClick={() => remove(v)} aria-label={t('{title} 삭제', { title: v.title })}><Trash2 size={20} /></button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
