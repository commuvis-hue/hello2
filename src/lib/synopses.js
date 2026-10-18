import { supabase } from './supabase.js'
import { t, locale } from '../i18n/index.jsx'

export const GENRES = ['드라마', '코미디', '로맨스', '스릴러', '액션', '다큐', '브이로그', '애니메이션', '기타']
export const LENGTHS = ['15초', '30초', '60초', '3분 이내']
export const STATUSES = [
  { id: 'planning', label: '기획중', tone: 'violet' },
  { id: 'producing', label: '제작중', tone: 'amber' },
  { id: 'published', label: '공개됨', tone: 'green' },
]
export const statusOf = (id) => STATUSES.find((s) => s.id === id) ?? STATUSES[0]

// 쇼츠용 4단 구성 템플릿
export const FOUR_ACT = [
  { label: '도입', text: '', hint: '첫 3초 — 시선을 붙잡는 장면' },
  { label: '전개', text: '', hint: '상황이 커지거나 궁금증이 생기는 장면' },
  { label: '반전', text: '', hint: '예상을 뒤집는 순간' },
  { label: '결말', text: '', hint: '여운, 메시지, 또는 다음 편 예고' },
]

const COLUMNS = 'id, title, logline, genre, target_length, content, scenes, status, created_at, updated_at'

export async function fetchMySynopses() {
  const { data, error } = await supabase.from('synopses').select(COLUMNS).order('updated_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getSynopsis(id) {
  const { data, error } = await supabase.from('synopses').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createSynopsis(fields) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error(t('로그인이 필요합니다.'))
  const { data, error } = await supabase
    .from('synopses')
    .insert({ ...fields, owner_id: session.user.id })
    .select(COLUMNS)
    .single()
  if (error) throw error
  return data
}

export async function updateSynopsis(id, fields) {
  const { data, error } = await supabase.from('synopses').update(fields).eq('id', id).select(COLUMNS).single()
  if (error) throw error
  return data
}

export async function deleteSynopsis(id) {
  const { error } = await supabase.from('synopses').delete().eq('id', id)
  if (error) throw error
}

// 공유·복사용 텍스트
export function toPlainText(s) {
  const lines = [
    s.title || t('(제목 없음)'),
    s.logline && `${t('한 줄 요약')}: ${s.logline}`,
    [s.genre, s.target_length].filter(Boolean).map((x) => t(x)).join(' · '),
    '',
    s.content,
  ]
  if (s.scenes?.length) {
    lines.push('', `[${t('장면 구성')}]`)
    s.scenes.forEach((sc, i) => lines.push(`${i + 1}. ${sc.label}: ${sc.text}`))
  }
  return lines.filter((l) => l !== false && l !== undefined && l !== null).join('\n').trim()
}

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(locale(), { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\s/g, '').replace(/\.$/, '')
