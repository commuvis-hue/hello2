import { Link } from 'react-router-dom'

export default function Placeholder({ title, desc }) {
  return (
    <div className="page placeholder">
      <h1>{title}</h1>
      <p>{desc}</p>
      <Link to="/watch" className="btn-outline">쇼츠 둘러보기</Link>
    </div>
  )
}
