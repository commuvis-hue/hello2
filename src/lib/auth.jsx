import { createContext, useContext, useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase, supabaseReady } from './supabase.js'

const AuthContext = createContext(null)

const KO_ERRORS = {
  'Invalid login credentials': '이메일 또는 비밀번호가 올바르지 않습니다.',
  'email rate limit exceeded': '메일 발송 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.',
  'User already registered': '이미 가입된 이메일입니다.',
  'Email not confirmed': '이메일 인증을 먼저 완료해 주세요. 받은편지함(스팸함 포함)을 확인하세요.',
  'Password should be at least 6 characters.': '비밀번호는 6자 이상이어야 합니다.',
}
export const koError = (e) => KO_ERRORS[e?.message] ?? e?.message ?? '알 수 없는 오류가 발생했습니다.'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(supabaseReady)

  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id
  useEffect(() => {
    if (!supabase || !userId) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [userId])

  const value = {
    ready: supabaseReady,
    loading,
    session,
    user: session?.user ?? null,
    profile,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    async signUp(email, password, nickname) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname }, emailRedirectTo: window.location.origin + '/my' },
      })
      if (error) throw error
      return { needsConfirm: !data.session }
    },
    async signOut() {
      await supabase.auth.signOut()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

// 로그인한 회원만 볼 수 있는 화면을 감쌉니다.
export function RequireAuth({ children }) {
  const { ready, loading, user } = useAuth()
  const { pathname } = useLocation()
  if (!ready) return children // 설정 전에는 각 화면이 안내 문구를 보여줌
  if (loading) return <div className="page placeholder"><p>불러오는 중…</p></div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(pathname)}`} replace />
  return children
}
