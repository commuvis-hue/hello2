import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, CreditCard, Smartphone, Landmark, ShieldCheck, Copy, Printer, AlertTriangle, Loader2 } from 'lucide-react'
import SetupNotice from '../components/SetupNotice.jsx'
import Certificate from '../components/Certificate.jsx'
import { useAuth } from '../lib/auth.jsx'
import { useWatchList, canTrade } from '../lib/videos.js'
import { tradeItems, formatKRW } from '../data/mock.js'
import { PAY_METHODS, EASY_PAYS, payLabel, videoFingerprint, issueCertificate } from '../lib/certificates.js'

const STEPS = ['소유권 고지', '결제 방식', '결제', '인증서']
const ICONS = { card: CreditCard, easy: Smartphone, vbank: Landmark }
const AGREEMENTS = [
  { id: 'notice', text: '위 소유권 이전 고지 내용을 모두 확인했습니다.' },
  { id: 'refund', text: '인증서 발급 후에는 단순 변심에 의한 환불이 불가함에 동의합니다.' },
  { id: 'record', text: '거래 정보 기록 및 저작권 인증서 발급에 동의합니다.' },
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export default function Purchase() {
  const { list = 'watch', id } = useParams()
  const { ready, user, profile } = useAuth()
  const watch = useWatchList()

  if (!ready) return <div className="page form-page"><h1 className="form-page__title">영상 거래</h1><SetupNotice /></div>
  if (list === 'watch' && watch.loading) return <div className="page placeholder"><p>불러오는 중…</p></div>

  const item = (list === 'trade' ? tradeItems : watch.items).find((i) => i.id === id)
  if (!item || !canTrade(item)) {
    return (
      <div className="page placeholder">
        <h1>거래할 수 없는 영상입니다</h1>
        <p>{item ? (item.sold ? '이미 거래가 완료된 영상입니다.' : '권리자가 거래를 허용하지 않은 영상입니다.') : '영상을 찾을 수 없습니다.'}</p>
        <Link to="/watch" className="btn-outline">WATCH로 돌아가기</Link>
      </div>
    )
  }
  if (item.ownerId && item.ownerId === user?.id) {
    return (
      <div className="page placeholder">
        <h1>내가 올린 영상입니다</h1>
        <p>본인 소유의 영상은 구매할 수 없습니다.</p>
        <Link to="/my" className="btn-outline">마이페이지로</Link>
      </div>
    )
  }

  const buyerName = profile?.nickname || user.email.split('@')[0]
  return <PurchaseFlow item={item} list={list} buyerName={buyerName} />
}

function PurchaseFlow({ item, list, buyerName }) {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [agreed, setAgreed] = useState({})
  const [method, setMethod] = useState('card')
  const [easy, setEasy] = useState(EASY_PAYS[0])
  const [paying, setPaying] = useState(false)
  const [error, setError] = useState('')
  const [cert, setCert] = useState(null)
  const [copied, setCopied] = useState(false)

  const allAgreed = AGREEMENTS.every((a) => agreed[a.id])
  const toggleAll = () => {
    const next = !allAgreed
    setAgreed(Object.fromEntries(AGREEMENTS.map((a) => [a.id, next])))
  }

  const pay = async () => {
    setError('')
    setPaying(true)
    try {
      // 실제 서비스: 여기서 PG 결제창 호출 → 서버에서 결제 승인 확인 → 서버가 인증서 발급
      const [hash] = await Promise.all([videoFingerprint(item.video), sleep(1400)])
      const issued = await issueCertificate({
        video_ref: `${list}:${item.id}`,
        video_title: item.title,
        seller_name: item.owner ?? null,
        buyer_name: buyerName,
        amount: item.price,
        pay_method: payLabel(method, easy),
        video_hash: hash,
      })
      setCert(issued)
      setStep(3)
      window.scrollTo(0, 0)
    } catch (e) {
      setError(e.message || '결제를 완료하지 못했습니다.')
    } finally {
      setPaying(false)
    }
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cert.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { /* 무시 */ }
  }

  const back = () => (step === 0 ? navigate(-1) : setStep(step - 1))

  return (
    <div className="page form-page purchase">
      <div className="purchase__bar">
        {step < 3 && <button className="synopsis__back" onClick={back}><ArrowLeft size={20} />{step === 0 ? '뒤로' : '이전'}</button>}
        <h1>영상 거래</h1>
      </div>

      <ol className="stepper" aria-label="거래 진행 단계">
        {STEPS.map((s, i) => (
          <li key={s} className={i < step ? 'is-done' : i === step ? 'is-current' : ''} aria-current={i === step ? 'step' : undefined}>
            <span>{i < step ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>

      {step < 3 && (
        <section className="order-card">
          <video src={item.video + '#t=0.1'} poster={item.poster} muted playsInline preload="metadata" />
          <div>
            <strong>{item.title}</strong>
            <span>판매자 {item.owner ? '@' + item.owner : 'HELLOOOO'}{item.duration ? ` · ${item.duration}` : ''}</span>
            <em>{formatKRW(item.price)}</em>
          </div>
        </section>
      )}

      {/* 1단계: 소유권 이전 고지 */}
      {step === 0 && (
        <>
          <section className="notice">
            <h2><ShieldCheck size={20} />소유권 이전 고지</h2>
            <ol>
              <li>
                <strong>이전되는 권리</strong>
                결제가 완료되면 이 영상의 저작재산권(복제권, 공연권, 공중송신권, 전시권, 배포권, 대여권, 2차적저작물작성권)이 구매자에게 양도됩니다.
              </li>
              <li>
                <strong>이전되지 않는 권리</strong>
                저작인격권(공표권, 성명표시권, 동일성유지권)은 원작자에게 남습니다. 구매 후에도 원작자 표시를 지우거나 원작자의 명예를 해치는 방식으로 변형할 수 없습니다.
              </li>
              <li>
                <strong>판매자의 보증</strong>
                판매자는 이 영상의 정당한 권리자이며, 영상에 포함된 인물의 초상권·음원·타인의 저작물에 대한 사용 권리를 확보했음을 보증합니다. 권리 문제가 확인되면 거래는 취소되고 전액 환불됩니다.
              </li>
              <li>
                <strong>거래 확정과 환불</strong>
                결제 완료와 동시에 저작권 인증서가 발급되며 거래가 확정됩니다. 인증서 발급 후에는 단순 변심에 의한 환불이 불가합니다.
              </li>
              <li>
                <strong>기록과 진위 확인</strong>
                거래 내역과 인증서 코드는 HELLOOOO에 기록되며, 누구나 인증서 코드로 진위를 확인할 수 있습니다. (거래 금액은 공개되지 않습니다.)
              </li>
              <li>
                <strong>법적 등록 안내</strong>
                HELLOOOO 인증서는 플랫폼 내 거래 사실을 증명합니다. 저작권 양도를 제3자에게 주장하려면 한국저작권위원회에 양도 등록을 별도로 해야 합니다.
              </li>
            </ol>
          </section>

          <div className="agree-box">
            <label className="checkline checkline--all">
              <input type="checkbox" checked={allAgreed} onChange={toggleAll} />
              <i className="checkbox">{allAgreed && <Check size={14} strokeWidth={3} />}</i>
              <span>전체 동의</span>
            </label>
            {AGREEMENTS.map((a) => (
              <label key={a.id} className="checkline">
                <input type="checkbox" checked={!!agreed[a.id]} onChange={(e) => setAgreed((s) => ({ ...s, [a.id]: e.target.checked }))} />
                <i className="checkbox">{agreed[a.id] && <Check size={14} strokeWidth={3} />}</i>
                <span>(필수) {a.text}</span>
              </label>
            ))}
          </div>

          <button className="btn-primary" disabled={!allAgreed} onClick={() => setStep(1)}>
            {allAgreed ? '동의하고 다음' : '필수 항목에 모두 동의해 주세요'}
          </button>
        </>
      )}

      {/* 2단계: 결제 방식 선택 */}
      {step === 1 && (
        <>
          <div className="methods" role="radiogroup" aria-label="결제 방식">
            {PAY_METHODS.map((m) => {
              const Icon = ICONS[m.id]
              return (
                <button key={m.id} role="radio" aria-checked={method === m.id} className={'method' + (method === m.id ? ' is-active' : '')} onClick={() => setMethod(m.id)}>
                  <Icon size={28} />
                  <span><strong>{m.label}</strong><small>{m.sub}</small></span>
                  <i className="radio">{method === m.id && <Check size={14} strokeWidth={3} />}</i>
                </button>
              )
            })}
          </div>
          {method === 'easy' && (
            <div className="choice-row">
              {EASY_PAYS.map((e) => (
                <button key={e} className={'chip chip--sm' + (easy === e ? ' is-active' : '')} onClick={() => setEasy(e)} aria-pressed={easy === e}>{e}</button>
              ))}
            </div>
          )}
          {method === 'vbank' && (
            <p className="form__hint">가상계좌는 실제 서비스에서 입금이 확인된 뒤에 인증서가 발급됩니다. 테스트에서는 바로 발급됩니다.</p>
          )}
          <button className="btn-primary" onClick={() => setStep(2)}>다음</button>
        </>
      )}

      {/* 3단계: 결제 */}
      {step === 2 && (
        <>
          <div className="test-banner"><AlertTriangle size={18} />테스트 결제입니다. 실제 금액이 청구되지 않습니다.</div>
          <dl className="summary-table">
            <dt>작품명</dt><dd>{item.title}</dd>
            <dt>구매자</dt><dd>{buyerName}</dd>
            <dt>결제 수단</dt><dd>{payLabel(method, easy)}</dd>
            <dt>작품 금액</dt><dd>{formatKRW(item.price)}</dd>
            <dt>플랫폼 수수료</dt><dd>₩ 0</dd>
            <dt className="total">최종 결제 금액</dt><dd className="total">{formatKRW(item.price)}</dd>
          </dl>
          {error && <p className="form__error" role="alert">{error}</p>}
          <button className="btn-primary btn-pay" onClick={pay} disabled={paying}>
            {paying ? <><Loader2 size={18} className="spin" />결제 진행 중…</> : `${formatKRW(item.price)} 결제하기`}
          </button>
        </>
      )}

      {/* 4단계: 인증서 */}
      {step === 3 && cert && (
        <>
          <div className="done-banner">
            <ShieldCheck size={36} />
            <div><strong>거래가 완료되었습니다</strong><span>HELLOOOO 저작권 인증서가 발급되었습니다.</span></div>
          </div>
          <Certificate cert={cert} showAmount />
          <div className="cert-actions">
            <button className="btn-outline" onClick={copyCode}><Copy size={16} />{copied ? '복사됨' : '인증서 코드 복사'}</button>
            <button className="btn-outline" onClick={() => window.print()}><Printer size={16} />인쇄 · PDF 저장</button>
          </div>
          <div className="row-gap">
            <Link to="/my" className="btn-primary">내 인증서 보기</Link>
            <Link to="/watch" className="btn-outline">WATCH로 돌아가기</Link>
          </div>
        </>
      )}
    </div>
  )
}
