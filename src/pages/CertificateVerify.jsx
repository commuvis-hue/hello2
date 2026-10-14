import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ShieldCheck, ShieldX, Search } from 'lucide-react'
import SetupNotice from '../components/SetupNotice.jsx'
import Certificate from '../components/Certificate.jsx'
import { useAuth } from '../lib/auth.jsx'
import { verifyCertificate } from '../lib/certificates.js'

// 인증서 진위 확인 (로그인 없이 누구나)
export default function CertificateVerify() {
  const { code } = useParams()
  const { ready } = useAuth()
  const navigate = useNavigate()
  const [input, setInput] = useState(code ?? '')
  const [state, setState] = useState(code ? 'loading' : 'idle') // idle | loading | found | missing | error
  const [cert, setCert] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!ready || !code) return
    setState('loading')
    verifyCertificate(code)
      .then((c) => { setCert(c); setState(c ? 'found' : 'missing') })
      .catch((e) => { setError(e.message); setState('error') })
  }, [code, ready])

  const submit = (e) => {
    e.preventDefault()
    const c = input.trim().toUpperCase()
    if (c) navigate(`/certificate/${c}`)
  }

  return (
    <div className="page form-page">
      <h1 className="form-page__title">인증서 진위 확인</h1>
      {!ready ? <SetupNotice /> : (
        <>
          <form className="verify-form" onSubmit={submit}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="HLO-20261012-XXXX-XXXX" aria-label="인증서 코드" autoCapitalize="characters" />
            <button className="btn-primary btn-sm"><Search size={16} />확인</button>
          </form>

          {state === 'loading' && <p className="muted">확인 중…</p>}
          {state === 'error' && <p className="form__error">{error}</p>}
          {state === 'missing' && (
            <div className="verify-result verify-result--bad">
              <ShieldX size={28} />
              <div><strong>등록되지 않은 인증서입니다</strong><span>코드를 다시 확인해 주세요. 위조되었거나 잘못 입력된 코드일 수 있습니다.</span></div>
            </div>
          )}
          {state === 'found' && cert && (
            <>
              <div className="verify-result verify-result--ok">
                <ShieldCheck size={28} />
                <div><strong>HELLOOOO에서 발급한 정식 인증서입니다</strong><span>{cert.is_test ? '단, 테스트 결제로 발급된 인증서입니다.' : '아래 내용이 플랫폼 기록과 일치합니다.'}</span></div>
              </div>
              <Certificate cert={cert} />
            </>
          )}
        </>
      )}
    </div>
  )
}
