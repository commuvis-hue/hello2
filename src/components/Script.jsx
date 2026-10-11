// 초안의 손글씨 문구 ("Stories Change People")
export default function Script({ lines, className = '' }) {
  return (
    <p className={'script ' + className} aria-hidden="true">
      {lines.map((l, i) => <span key={i} style={{ marginLeft: `${i * 0.7}em` }}>{l}</span>)}
    </p>
  )
}
