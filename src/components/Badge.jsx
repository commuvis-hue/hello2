import { Flame } from 'lucide-react'

export default function Badge({ type }) {
  if (!type) return null
  if (type === 'hot') return <span className="badge badge--hot"><Flame size={13} fill="currentColor" />인기</span>
  return <span className="badge badge--new">NEW</span>
}
