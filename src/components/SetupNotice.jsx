import { t } from '../i18n/index.jsx'
// Supabase 환경 변수가 아직 없을 때 보여주는 안내
export default function SetupNotice() {
  return (
    <div className="setup-notice">
      <strong>{t('서버 연결 설정이 필요합니다')}</strong>
      <p>
        {t('회원가입과 영상 업로드를 쓰려면 Supabase 연결 정보가 필요합니다.')}{' '}
        {t('Vercel → Settings → Environment Variables 에 아래 두 값을 입력한 뒤 다시 배포해 주세요. (README 참고)')}{' '}
        <code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>
      </p>
    </div>
  )
}
