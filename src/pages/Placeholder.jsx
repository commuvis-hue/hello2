import { Link } from 'react-router-dom'
import { t } from '../i18n/index.jsx'

export default function Placeholder({ title, desc }) {
  return (
    <div className="page placeholder">
      <h1>{t(title)}</h1>
      <p>{t(desc)}</p>
      <Link to="/watch" className="btn-outline">{t('쇼츠 둘러보기')}</Link>
    </div>
  )
}
