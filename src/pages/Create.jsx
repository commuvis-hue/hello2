import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FilePenLine, CloudUpload, Bot, Clapperboard, Users, Lightbulb, ArrowRight, ChevronRight, Play, Heart, MoreVertical } from 'lucide-react'
import Chips from '../components/Chips.jsx'
import Script from '../components/Script.jsx'
import { myProjects, projectStatus, img } from '../data/mock.js'

const TOOLS = [
  { Icon: Bot, title: 'AI 시놉시스 도우미', desc: '아이디어를\n구체화해보세요', tone: 'violet' },
  { Icon: Clapperboard, title: '기획 템플릿', desc: '장르별 템플릿으로\n쉽게 시작', tone: 'blue' },
  { Icon: Users, title: '콜라보 찾기', desc: '함께 만들\n크리에이터를 만나보세요', tone: 'indigo' },
  { Icon: Lightbulb, title: '아이디어 보관함', desc: '떠오른 아이디어를\n저장하세요', tone: 'amber' },
]
const FILTERS = ['전체', '기획중', '제작중', '공개됨']

export default function Create() {
  const [filter, setFilter] = useState('전체')
  const list = filter === '전체' ? myProjects : myProjects.filter((p) => projectStatus[p.status].label === filter)

  return (
    <div className="page">
      <section className="create-hero" style={{ backgroundImage: `url(${img('filmmaker', 900, 460)})` }}>
        <h1>당신의 이야기가<br />세상을 바꿉니다.</h1>
        <p>Create Today<br />A Bigger Tomorrow</p>
        <Script className="banner__script" lines={['Stories', 'Change', 'People']} />
      </section>

      <div className="create-main">
        <button className="create-big create-big--pink">
          <FilePenLine size={48} />
          <strong>시놉시스 작성</strong>
          <span>아이디어를 글로 시작하세요</span>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </button>
        <Link to="/upload" className="create-big create-big--violet">
          <CloudUpload size={48} />
          <strong>영상 업로드</strong>
          <span>완성된 영상을 공유하세요</span>
          <i className="arrow-ring"><ArrowRight size={22} /></i>
        </Link>
      </div>

      <div className="create-tools">
        {TOOLS.map(({ Icon, title, desc, tone }) => (
          <button key={title} className={`tool tool--${tone}`}>
            <Icon size={36} />
            <strong>{title}</strong>
            <span>{desc}</span>
          </button>
        ))}
      </div>

      <section className="partner" style={{ backgroundImage: `url(${img('set', 800, 200)})` }}>
        <p>좋은 아이디어는<br />좋은 파트너를 만날 때 완성됩니다.</p>
        <Link to="/create" className="btn-outline">크리에이터 찾기 <ArrowRight size={16} /></Link>
      </section>

      <section className="section">
        <div className="section__head">
          <h2>내 프로젝트</h2>
          <Link to="/library">전체 보기 <ChevronRight size={16} /></Link>
        </div>
        <Chips options={FILTERS} value={filter} onChange={setFilter} showFilter={false} size="sm" />
        <ul className="project-list">
          {list.map((p) => {
            const st = projectStatus[p.status]
            return (
              <li key={p.id} className="project">
                <img src={img(p.seed, 240, 120)} alt="" />
                <strong>{p.title}</strong>
                <span className={`status status--${st.tone}`}>{st.label}</span>
                <span className="project__date">{p.date} {p.status === 'published' ? '공개' : '수정'}</span>
                {p.views && (
                  <span className="project__stats">
                    <span><Play size={14} fill="currentColor" />{p.views}</span>
                    <span><Heart size={14} fill="currentColor" />{p.likes}</span>
                  </span>
                )}
                <button className="more" aria-label="더보기"><MoreVertical size={18} /></button>
              </li>
            )
          })}
          {list.length === 0 && <li className="empty">이 상태의 프로젝트가 없습니다. 시놉시스 작성으로 새 프로젝트를 시작하세요.</li>}
        </ul>
      </section>
    </div>
  )
}
