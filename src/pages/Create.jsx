import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePenLine, CloudUpload, Bot, Clapperboard, Users, Lightbulb, ArrowRight, ChevronRight, Play, Heart, MoreVertical, Plus } from 'lucide-react'
import Chips from '../components/Chips.jsx'
import Script from '../components/Script.jsx'
import { myProjects, projectStatus, img } from '../data/mock.js'
import { useAuth } from '../lib/auth.jsx'
import { fetchMySynopses, statusOf, formatDate } from '../lib/synopses.js'
import { t } from '../i18n/index.jsx'

const TOOLS = [
  { Icon: Bot, title: 'AI 시놉시스 도우미', desc: '아이디어를\n구체화해보세요', tone: 'violet' },
  { Icon: Clapperboard, title: '기획 템플릿', desc: '장르별 템플릿으로\n쉽게 시작', tone: 'blue' },
  { Icon: Users, title: '콜라보 찾기', desc: '함께 만들\n크리에이터를 만나보세요', tone: 'indigo' },
  { Icon: Lightbulb, title: '아이디어 보관함', desc: '떠오른 아이디어를\n저장하세요', tone: 'amber' },
]
const FILTERS = ['전체', '기획중', '제작중', '공개됨']

export default function Create() {
  const [filter, setFilter] = useState('전체')

  return (
    <div className="page">
      <section className="create-hero" style={{ backgroundImage: `url(${img('filmmaker', 900, 460)})` }}>
        <h1>{t('당신의 이야기가')}<br />{t('세상을 바꿉니다.')}</h1>
        <p>Create Today<br />A Bigger Tomorrow</p>
        <Script className="banner__script" lines={['Stories', 'Change', 'People']} />
      </section>

      <div className="create-main">
        <Link to="/synopsis/new" className="create-big create-big--pink">
          <FilePenLine size={48} />
          <strong>{t('시놉시스 작성')}</strong>
          <span>{t('아이디어를 글로 시작하세요')}</span>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </Link>
        <Link to="/upload" className="create-big create-big--violet">
          <CloudUpload size={48} />
          <strong>{t('영상 업로드')}</strong>
          <span>{t('완성된 영상을 공유하세요')}</span>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </Link>
      </div>

      <div className="create-tools">
        {TOOLS.map(({ Icon, title, desc, tone }) => (
          <button key={title} className={`tool tool--${tone}`}>
            <Icon size={36} />
            <strong>{t(title)}</strong>
            <span>{t(desc)}</span>
          </button>
        ))}
      </div>

      <section className="partner" style={{ backgroundImage: `url(${img('set', 800, 200)})` }}>
        <p>{t('좋은 아이디어는')}<br />{t('좋은 파트너를 만날 때 완성됩니다.')}</p>
        <Link to="/create" className="btn-outline">{t('크리에이터 찾기')} <ArrowRight size={16} /></Link>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>{t('내 프로젝트')}</h2>
          <Link to="/synopsis/new">{t('새 시놉시스')} <Plus size={16} /></Link>
        </div>
        <Chips options={FILTERS} value={filter} onChange={setFilter} showFilter={false} size="sm" />
        <MyProjects filter={filter} />
      </section>
    </div>
  )
}

// 로그인 + 서버 연결 시 실제 시놉시스, 아니면 예시 목록
function MyProjects({ filter }) {
  const { ready, user, loading: authLoading } = useAuth()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const live = ready && user

  useEffect(() => {
    if (!live) return
    fetchMySynopses().then(setRows).catch((e) => setError(e.message))
  }, [live])

  if (ready && authLoading) return null

  if (!live) {
    const list = filter === '전체' ? myProjects : myProjects.filter((p) => projectStatus[p.status].label === filter)
    return (
      <>
        <p className="form__hint project-hint">
          {ready ? <><Link to="/login?next=/create">{t('로그인')}</Link>{t('하면 내 시놉시스가 여기에 저장됩니다. 아래는 예시입니다.')}</> : t('아래는 예시 프로젝트입니다.')}
        </p>
        <ul className="project-list">
          {list.map((p) => {
            const st = projectStatus[p.status]
            return (
              <li key={p.id} className="project">
                <img src={img(p.seed, 240, 120)} alt="" />
                <strong>{p.title}</strong>
                <span className={`status status--${st.tone}`}>{t(st.label)}</span>
                <span className="project__date">{p.date} {p.status === 'published' ? t('공개') : t('수정')}</span>
                {p.views && (
                  <span className="project__stats">
                    <span><Play size={14} fill="currentColor" />{p.views}</span>
                    <span><Heart size={14} fill="currentColor" />{p.likes}</span>
                  </span>
                )}
                <button className="more" aria-label={t('더보기')}><MoreVertical size={18} /></button>
              </li>
            )
          })}
        </ul>
      </>
    )
  }

  if (error) return <p className="form__error project-hint">{t('시놉시스를 불러오지 못했습니다')}: {error}</p>
  if (!rows) return <p className="form__hint project-hint">{t('불러오는 중…')}</p>

  const list = filter === '전체' ? rows : rows.filter((r) => statusOf(r.status).label === filter)
  if (rows.length === 0) {
    return (
      <div className="empty-box project-hint">
        <p>{t('아직 작성한 시놉시스가 없습니다.')}</p>
        <Link to="/synopsis/new" className="btn-primary">{t('첫 시놉시스 쓰기')}</Link>
      </div>
    )
  }

  return (
    <ul className="project-list">
      {list.length === 0 && <li className="empty">{t('이 상태의 프로젝트가 없습니다.')}</li>}
      {list.map((r) => {
        const st = statusOf(r.status)
        return (
          <li key={r.id}>
            <Link to={`/synopsis/${r.id}`} className="project">
              <span className="project__tile">{t(r.genre || '시놉시스')}</span>
              <strong>{r.title || t('제목 없음')}</strong>
              <span className={`status status--${st.tone}`}>{t(st.label)}</span>
              <span className="project__date">{formatDate(r.updated_at)} {t('수정')}{r.target_length ? ` · ${t(r.target_length)}` : ''}</span>
              <ChevronRight size={18} className="more" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
