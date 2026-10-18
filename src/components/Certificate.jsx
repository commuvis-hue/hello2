import { formatKRW } from '../data/mock.js'
import { t, locale } from '../i18n/index.jsx'

const when = (d) => new Date(d).toLocaleString(locale(), { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })

// HELLOOOO 저작권 인증서 (화면·인쇄 공용)
export default function Certificate({ cert, showAmount = false }) {
  const verifyUrl = `${window.location.origin}/certificate/${cert.code}`
  return (
    <article className="certificate" aria-label={t('HELLOOOO 저작권 인증서')}>
      {cert.is_test && <span className="certificate__test">{t('TEST · 테스트 결제로 발급')}</span>}
      <header className="certificate__head">
        <span className="certificate__brand">HELL<span>OOOO</span></span>
        <h2>{t('저작권 인증서')}</h2>
        <p>Certificate of Copyright Transfer</p>
      </header>

      <p className="certificate__lead">
        {t('아래 영상 저작물의 저작재산권이 HELLOOOO 플랫폼을 통해')}{' '}
        <strong>{cert.buyer_name}</strong>{t(' 님에게 이전되었음을 증명합니다.')}
      </p>

      <dl className="certificate__table">
        <dt>{t('작품명')}</dt><dd>{cert.video_title}</dd>
        <dt>{t('이전 권리자')}</dt><dd>{cert.seller_name ? '@' + cert.seller_name : '—'}</dd>
        <dt>{t('신규 권리자')}</dt><dd>{cert.buyer_name}</dd>
        <dt>{t('이전 일시')}</dt><dd>{when(cert.issued_at)}</dd>
        {showAmount && cert.amount != null && <><dt>{t('거래 금액')}</dt><dd>{formatKRW(cert.amount)}</dd></>}
        {showAmount && cert.pay_method && <><dt>{t('결제 수단')}</dt><dd>{t(cert.pay_method)}</dd></>}
        <dt>{t('영상 지문')}</dt>
        <dd className="certificate__hash" title={cert.video_hash || ''}>
          {cert.video_hash ? `SHA-256 ${cert.video_hash.slice(0, 16)}…${cert.video_hash.slice(-8)}` : '—'}
        </dd>
      </dl>

      <div className="certificate__code">
        <span>{t('인증서 코드')}</span>
        <strong>{cert.code}</strong>
        <small>{t('진위 확인')}: {verifyUrl}</small>
      </div>

      <footer className="certificate__foot">
        <span className="certificate__seal" aria-hidden="true">HELLOOOO<br />VERIFIED</span>
        <p>{t('본 인증서는 HELLOOOO 플랫폼 내 거래 사실을 증명합니다. 제3자에 대한 법적 대항력을 갖추려면 한국저작권위원회에 저작권 양도 등록을 별도로 하시기 바랍니다.')}</p>
      </footer>
    </article>
  )
}
