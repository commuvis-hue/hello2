import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { Crown, Play, Heart, Share2, ArrowRight, ShieldCheck, User, Check, AlertCircle, CreditCard, Landmark, Coins, ChevronRight, Lock } from 'lucide-react'
import Script from '../components/Script.jsx'
import { fundProjects, img, formatKRW } from '../data/mock.js'

const TABS = ['펀딩하기', '프로젝트 소개', '리워드', 'Q&A', '업데이트']
const PRESETS = [10000000, 50000000, 100000000]
const METHODS = [
  { id: 'card', label: '카드 결제', Icon: CreditCard },
  { id: 'vbank', label: '가상계좌', sub: '(무통장입금)', Icon: Landmark },
  { id: 'coin', label: '공식코인 결제', sub: 'HELLO COIN', Icon: Coins },
]

export default function FundDetail() {
  const { id } = useParams()
  const p = fundProjects.find((x) => x.id === id && x.vip) ?? fundProjects.find((x) => x.vip)
  const [tab, setTab] = useState(TABS[0])
  const [shot, setShot] = useState(0)
  const [mode, setMode] = useState('escrow')
  const [pay, setPay] = useState('card')
  const [amount, setAmount] = useState(50000000)
  const [custom, setCustom] = useState('')
  const [agree, setAgree] = useState(true)
  const [liked, setLiked] = useState(false)
  const [done, setDone] = useState(false)

  if (!p) return <Navigate to="/fund" replace />

  const percent = Math.round((p.raised / p.goal) * 100)
  const finalAmount = custom ? Number(custom.replace(/\D/g, '')) : amount
  const canInvest = agree && finalAmount > 0

  return (
    <div className="page detail">
      <section className="detail-hero" style={{ backgroundImage: `url(${img(p.gallery[shot], 1000, 600)})` }}>
        <span className="vip-chip"><Crown size={18} fill="currentColor" />VIP FUND</span>
        <span className="play-ring play-ring--lg"><Play size={36} fill="currentColor" /></span>
        <Script className="banner__script" lines={['Good', 'Stories', 'Change', 'The World']} />
        <div className="detail-hero__text">
          <h1>{p.title}</h1>
          <p>{p.tagline}</p>
          <div className="hash">{p.tags.map((t) => <span key={t}>#{t}</span>)}</div>
        </div>
        <div className="detail-hero__thumbs">
          {p.gallery.map((g, i) => (
            <button key={g} className={i === shot ? 'is-active' : ''} onClick={() => setShot(i)} aria-label={`장면 ${i + 1}`}>
              <img src={img(g, 160, 120)} alt="" />
            </button>
          ))}
        </div>
      </section>

      <section className="summary">
        <div className="summary__planner">
          <img src={img('me', 120, 120)} alt="" />
          <div><strong>{p.planner}</strong><span>기획자</span></div>
          <p>{p.summary}</p>
        </div>
        <dl className="summary__stats">
          <dt>목표 제작비</dt><dd>{formatKRW(p.goal)}</dd>
          <dt>현재 펀딩 금액</dt><dd>{formatKRW(p.raised)} <em>({percent}%)</em></dd>
          <dd className="summary__bar"><span className="bar"><span style={{ width: percent + '%' }} /></span></dd>
          <dt>남은 시간</dt><dd className="dday">D - {p.daysLeft}</dd>
        </dl>
        <div className="summary__actions">
          <div>
            <button className={'text-btn' + (liked ? ' is-on' : '')} onClick={() => setLiked(!liked)}>
              <Heart size={20} fill={liked ? 'currentColor' : 'none'} />{p.likes}
            </button>
            <button className="icon-btn" aria-label="공유"><Share2 size={20} /></button>
          </div>
          <button className="btn-outline" onClick={() => setTab('프로젝트 소개')}>프로젝트 보기 <ArrowRight size={16} /></button>
        </div>
      </section>

      <nav className="detail-tabs">
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'is-active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      {tab !== '펀딩하기' ? (
        <section className="tab-empty">
          <p>{tab} 내용이 준비 중입니다.</p>
          <button className="btn-outline" onClick={() => setTab('펀딩하기')}>펀딩하기로 돌아가기</button>
        </section>
      ) : (
        <>
          <div className="modes">
            <button className={'mode' + (mode === 'escrow' ? ' is-active' : '')} onClick={() => setMode('escrow')}>
              <span className="mode__icon"><ShieldCheck size={36} /></span>
              <span className="mode__head"><strong>플랫폼 에스크로 투자</strong><em>추천</em></span>
              <span className="mode__desc">안전한 거래, 플랫폼이 보증합니다.</span>
              <ul>
                {['플랫폼 보증으로 안전한 거래', 'PG사 결제 시스템', '프로젝트 성공 시 정산', '투명한 진행 상황 확인'].map((x) => (
                  <li key={x}><Check size={14} strokeWidth={3} />{x}</li>
                ))}
              </ul>
            </button>
            <button className={'mode mode--warn' + (mode === 'direct' ? ' is-active' : '')} onClick={() => setMode('direct')}>
              <span className="mode__icon"><User size={32} /></span>
              <span className="mode__head"><strong>일반 결제</strong></span>
              <span className="mode__desc">기획자 지정계좌로 직접 결제합니다.</span>
              <ul>
                {['플랫폼의 법적 책임이 없습니다.', '반드시 기획자 정보를 확인하세요.', '직접 계좌이체 후 기획자에게 확인이 필요합니다.', '분쟁 발생 시 플랫폼 중재가 불가합니다.'].map((x) => (
                  <li key={x}><AlertCircle size={14} strokeWidth={3} />{x}</li>
                ))}
              </ul>
            </button>
          </div>

          {mode === 'escrow' ? (
            <>
              <h3 className="form-label">결제 방법 선택</h3>
              <div className="pay-methods">
                {METHODS.map(({ id, label, sub, Icon }) => (
                  <button key={id} className={'pay' + (pay === id ? ' is-active' : '')} onClick={() => setPay(id)} aria-pressed={pay === id}>
                    <Icon size={36} />
                    <span><strong>{label}</strong>{sub && <small>{sub}</small>}</span>
                    <i className="radio">{pay === id && <Check size={14} strokeWidth={3} />}</i>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="direct-note">일반 결제는 기획자와 직접 진행됩니다. 기획자 계좌 정보는 프로젝트 소개 탭에서 확인하세요.</p>
          )}

          <h3 className="form-label">투자 금액 (KRW)</h3>
          <div className="amounts">
            {PRESETS.map((v) => (
              <button key={v} className={'amount' + (!custom && amount === v ? ' is-active' : '')} onClick={() => { setAmount(v); setCustom('') }}>
                {formatKRW(v)}
              </button>
            ))}
            <label className={'amount amount--input' + (custom ? ' is-active' : '')}>
              <input
                inputMode="numeric"
                placeholder="직접 입력"
                value={custom ? Number(custom).toLocaleString('ko-KR') : ''}
                onChange={(e) => setCustom(e.target.value.replace(/\D/g, ''))}
              />
              <span>₩</span>
            </label>
          </div>

          <div className="agree">
            <label>
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <i className="check">{agree && <Check size={16} strokeWidth={3} />}</i>
              투자 이용약관 및 에스크로 동의
            </label>
            <button className="text-btn">약관 보기 <ChevronRight size={16} /></button>
          </div>

          <button className="invest-btn" disabled={!canInvest} onClick={() => setDone(true)}>
            {canInvest ? `${formatKRW(finalAmount)} 즉시 투자하기` : agree ? '투자 금액을 입력하세요' : '약관에 동의해야 투자할 수 있습니다'}
            <i><ArrowRight size={22} /></i>
          </button>

          <footer className="escrow-foot">
            <div><Lock size={22} /><strong>HELLOOOO ESCROW</strong><span>안전한 콘텐츠 생태계를 만들어갑니다.</span></div>
            <div className="escrow-foot__badge"><ShieldCheck size={36} /><span>SAFE INVEST<br />BETTER STORIES</span></div>
          </footer>
        </>
      )}

      {done && (
        <div className="modal" role="dialog" aria-modal="true" onClick={() => setDone(false)}>
          <div className="modal__box" onClick={(e) => e.stopPropagation()}>
            <ShieldCheck size={44} />
            <h2>투자 신청 완료</h2>
            <p>{p.title}에 {formatKRW(finalAmount)} 투자를 신청했습니다.<br />{mode === 'escrow' ? '결제 금액은 프로젝트 성공 시 정산됩니다.' : '기획자 계좌로 이체 후 확인을 요청하세요.'}</p>
            <button className="invest-btn" onClick={() => setDone(false)}>확인</button>
          </div>
        </div>
      )}
    </div>
  )
}
