import { supabase } from './supabase.js'

export const PAY_METHODS = [
  { id: 'card', label: '신용·체크카드', sub: '국내 모든 카드 · 할부 가능' },
  { id: 'easy', label: '간편결제', sub: '카카오페이 · 네이버페이 · 토스페이' },
  { id: 'vbank', label: '가상계좌', sub: '발급된 계좌로 입금 후 확정' },
]
export const EASY_PAYS = ['카카오페이', '네이버페이', '토스페이']
export const payLabel = (method, easy) => (method === 'easy' ? easy : PAY_METHODS.find((m) => m.id === method)?.label ?? method)

// 인증서 코드: HLO-20261012-7K4P-Q2XM (헷갈리는 0/O, 1/I 제외)
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
export function generateCode(date = new Date()) {
  const bytes = crypto.getRandomValues(new Uint8Array(8))
  const chars = [...bytes].map((b) => ALPHABET[b % ALPHABET.length]).join('')
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `HLO-${ymd}-${chars.slice(0, 4)}-${chars.slice(4)}`
}

// 영상 파일의 SHA-256 지문: 인증서가 어떤 파일에 대한 것인지 증명
export async function videoFingerprint(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const hash = await crypto.subtle.digest('SHA-256', buf)
    return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return null
  }
}

const COLS = 'code, video_ref, video_title, seller_name, buyer_name, amount, pay_method, video_hash, is_test, issued_at'

export async function issueCertificate(fields) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('로그인이 필요합니다.')
  for (let attempt = 0; attempt < 3; attempt++) {
    const { data, error } = await supabase
      .from('certificates')
      .insert({ ...fields, code: generateCode(), buyer_id: session.user.id })
      .select(COLS)
      .single()
    if (!error) return data
    if (error.code !== '23505') throw error // 23505 = 코드 중복 → 새 코드로 재시도
  }
  throw new Error('인증서 코드를 만들지 못했습니다. 다시 시도해 주세요.')
}

export async function fetchMyCertificates() {
  const { data, error } = await supabase.from('certificates').select(COLS).order('issued_at', { ascending: false })
  if (error) throw error
  return data
}

// 누구나 코드로 진위 확인 (금액 등 민감 정보는 제외하고 반환)
export async function verifyCertificate(code) {
  const { data, error } = await supabase.rpc('verify_certificate', { p_code: code })
  if (error) throw error
  return data?.[0] ?? null
}
