import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수가 없으면 null → 사이트는 목업 데이터로 계속 동작하고, 업로드·로그인 화면에 설정 안내가 표시됩니다.
export const supabaseReady = Boolean(url && key)
export const supabase = supabaseReady ? createClient(url, key) : null
export const SUPABASE_URL = url
export const SUPABASE_KEY = key
export const BUCKET = 'videos'
