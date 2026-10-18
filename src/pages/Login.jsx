import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Check } from 'lucide-react'
import Logo from '../components/Logo.jsx'
import LangSwitcher from '../components/LangSwitcher.jsx'
import SetupNotice from '../components/SetupNotice.jsx'
import { useAuth, koError } from '../lib/auth.jsx'
import { t } from '../i18n/index.jsx'

export default function Login() {
  const { ready, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next') || '/watch'

  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const isSignup = mode === 'signup'

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setNotice('')
    if (isSignup && !agree) return setError(t('이용약관 및 개인정보 처리방침에 동의해 주세요.'))
    if (isSignup && nickname.trim().length < 2) return setError(t('닉네임은 2자 이상 입력해 주세요.'))
    setBusy(true)
    try {
      if (isSignup) {
        const { needsConfirm } = await signUp(email.trim(), password, nickname.trim())
        if (needsConfirm) {
          setNotice(t('{email} 로 인증 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.', { email }))
          setMode('login')
          return
        }
      } else {
        await signIn(email.trim(), password)
      }
      navigate(next, { replace: true })
    } catch (err) {
      setError(koError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="auth">
      <LangSwitcher className="lang--corner" />
      <div className="auth__box">
        <Logo size="lg" />
        <h1>{isSignup ? t('회원가입') : t('로그인')}</h1>

        {!ready ? <SetupNotice /> : (
          <form className="form" onSubmit={submit}>
            <label className="field">
              <span>{t('이메일')}</span>
              <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {isSignup && (
              <label className="field">
                <span>{t('닉네임')}</span>
                <input maxLength={20} required value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder={t('영상에 표시될 이름')} />
              </label>
            )}
            <label className="field">
              <span>{t('비밀번호')}</span>
              <input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isSignup ? t('6자 이상') : ''} />
            </label>

            {isSignup && (
              <label className="checkline">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                <i className="checkbox">{agree && <Check size={14} strokeWidth={3} />}</i>
                <span>{t('(필수) 이용약관 및 개인정보 처리방침에 동의합니다.')}</span>
              </label>
            )}

            {error && <p className="form__error" role="alert">{error}</p>}
            {notice && <p className="form__notice" role="status">{notice}</p>}

            <button className="btn-primary" disabled={busy}>
              {busy ? t('처리 중…') : isSignup ? t('가입하기') : t('로그인')}
            </button>
          </form>
        )}

        {ready && (
          <p className="auth__switch">
            {isSignup ? t('이미 회원이신가요?') : t('아직 회원이 아니신가요?')}{' '}
            <button type="button" onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setNotice('') }}>
              {isSignup ? t('로그인') : t('회원가입')}
            </button>
          </p>
        )}
        <Link to="/watch" className="auth__back">{t('둘러보기로 돌아가기')}</Link>
      </div>
    </div>
  )
}
