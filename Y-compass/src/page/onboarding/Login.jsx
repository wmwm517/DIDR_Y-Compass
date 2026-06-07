import { useState } from 'react'
import '../../style/Login.css'
import symbol from '../../assets/symbol.png'
import logo from '../../assets/logo.png'

const MAJOR_LIST = ['통합디자인학과', '실내건축학과', '의류환경학과']
const LINKED_MAJOR_LIST = ['인지과학']
const MULTI_TYPES = ['없음', '복수전공', '연계전공', '부전공']

function AuthHeader({ title, onBack, centerTitle }) {
  return (
    <div className={`auth-header${centerTitle ? ' auth-header--center' : ''}`}>
      <button className="auth-header__back" onClick={onBack}>‹</button>
      {!centerTitle && <img src={symbol} alt="Y-Compass" className="auth-header__logo" />}
      <span className="auth-header__title">{title}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step 1 — 기본 정보                                                    */
/* ------------------------------------------------------------------ */
function SignupStep1({ onNext, onBack }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [userId, setUserId] = useState('')
  const [pw, setPw] = useState('')
  const [pwConfirm, setPwConfirm] = useState('')
  const [agreed, setAgreed] = useState(false)

  const handleNext = () => {
    if (!name || !phone || !userId || !pw || !pwConfirm) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    if (pw !== pwConfirm) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }
    if (!agreed) {
      alert('이용약관에 동의해주세요.')
      return
    }
    onNext({ name })
  }

  return (
    <div className="auth-page">
      <AuthHeader title="회원가입" onBack={onBack} />
      <div className="auth-body">
        <div className="auth-field">
          <label className="auth-label">이름</label>
          <input className="auth-input" placeholder="실명을 입력해주세요 (예: 김연세)"
            value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="auth-field">
          <label className="auth-label">전화번호</label>
          <div className="auth-input-row">
            <input className="auth-input" placeholder="010-XXXX-XXXX"
              value={phone} onChange={e => setPhone(e.target.value)} />
            <button className="auth-inline-btn">인증</button>
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">아이디</label>
          <div className="auth-input-row">
            <input className="auth-input" placeholder="영문 아이디를 입력해주세요."
              value={userId} onChange={e => setUserId(e.target.value)} />
            <button className="auth-inline-btn">중복 확인</button>
          </div>
        </div>
        <div className="auth-field">
          <label className="auth-label">비밀번호</label>
          <input className="auth-input" type="password"
            placeholder="영문, 숫자, 특수문자(@,#,$,*) 포함 6자 이상"
            value={pw} onChange={e => setPw(e.target.value)} />
        </div>
        <div className="auth-field">
          <label className="auth-label">비밀번호 확인</label>
          <input className="auth-input" type="password"
            placeholder="비밀번호를 다시 입력해주세요."
            value={pwConfirm} onChange={e => setPwConfirm(e.target.value)} />
        </div>
        <div className="auth-terms-row">
          <input type="checkbox" id="terms" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
          <label htmlFor="terms" className="auth-terms-text">
            <strong>개인정보, 이용약관</strong> 및 <strong>개인정보처리방침</strong>에 동의합니다.
          </label>
        </div>
      </div>
      <div className="auth-footer">
        <button className="auth-btn" onClick={handleNext}>다음 단계 · 학적 인증</button>
        <p className="auth-footer__link">기존 계정이 있으신가요?<button onClick={onBack}>로그인</button></p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step 2 — 학적 정보                                                    */
/* ------------------------------------------------------------------ */
function SignupStep2({ onNext, onBack }) {
  const [dept, setDept] = useState('')
  const [studentId, setStudentId] = useState('')
  const [email, setEmail] = useState('')
  const [showDeptDrop, setShowDeptDrop] = useState(false)

  const filteredDepts = dept
    ? MAJOR_LIST.filter(m => m.includes(dept))
    : MAJOR_LIST

  const handleNext = () => {
    if (!dept || !studentId || !email) {
      alert('모든 항목을 입력해주세요.')
      return
    }
    const admissionYear = parseInt(studentId.substring(0, 4)) || new Date().getFullYear()
    onNext({ major1: dept, studentId, email, admissionYear })
  }

  return (
    <div className="auth-page">
      <AuthHeader title="회원가입" onBack={onBack} centerTitle />
      <div className="auth-body">
        <div className="auth-field" style={{ position: 'relative' }}>
          <label className="auth-label">소속 학과 (제1전공)</label>
          <div className="auth-input-row">
            <input className="auth-input"
              placeholder="학과명을 입력하거나 선택해주세요."
              value={dept}
              onChange={e => { setDept(e.target.value); setShowDeptDrop(true) }}
              onFocus={() => setShowDeptDrop(true)}
              onBlur={() => setTimeout(() => setShowDeptDrop(false), 150)}
            />
            <span className="auth-input-icon">🔍</span>
          </div>
          {showDeptDrop && filteredDepts.length > 0 && (
            <div className="auth-dept-dropdown">
              {filteredDepts.map(m => (
                <button key={m} className="auth-dept-item"
                  onMouseDown={() => { setDept(m); setShowDeptDrop(false) }}>
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="auth-field">
          <label className="auth-label">학번</label>
          <input className="auth-input" placeholder="학번을 입력해주세요. (예: 2022160492)"
            value={studentId} onChange={e => setStudentId(e.target.value)} />
        </div>
        <div className="auth-field">
          <label className="auth-label">학교 이메일</label>
          <input className="auth-input" type="email"
            placeholder="교내 이메일을 입력해주세요. (예: compass@yonsei.ac.kr)"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="auth-field">
          <label className="auth-label">학적 인증</label>
          <div className="auth-upload-area">
            <p className="auth-upload-area__text">
              온/오프라인 학생증 / 재학증명서 / 성적증명서를 제출해주세요<br />
              (jpg, png, pdf 파일 형식만 가능합니다.)
            </p>
            <button className="auth-upload-btn">파일 업로드하기</button>
          </div>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="auth-footer">
        <button className="auth-btn" onClick={handleNext}>다음 단계 · 다전공 설정</button>
        <p className="auth-footer__link">기존 계정이 있으신가요?<button onClick={onBack}>로그인</button></p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Step 3 — 다전공 설정                                                  */
/* ------------------------------------------------------------------ */
function SignupStep3({ onDone, onBack }) {
  const [multiType, setMultiType] = useState('없음')
  const [major2, setMajor2] = useState('')
  const [showDrop, setShowDrop] = useState(false)

  const getSecondMajorList = () => {
    if (multiType === '연계전공') return LINKED_MAJOR_LIST
    return MAJOR_LIST
  }

  const filteredMajors = major2
    ? getSecondMajorList().filter(m => m.includes(major2))
    : getSecondMajorList()

  const handleDone = () => {
    if (multiType !== '없음' && !major2) {
      alert('다전공 학과를 선택해주세요.')
      return
    }
    onDone({ multiMajorType: multiType, major2: multiType === '없음' ? '' : major2 })
  }

  return (
    <div className="auth-page">
      <AuthHeader title="회원가입" onBack={onBack} centerTitle />
      <div className="auth-body">
        <div className="auth-field">
          <label className="auth-label">다전공 여부</label>
          <div className="auth-multi-type-row">
            {MULTI_TYPES.map(t => (
              <button
                key={t}
                className={`auth-multi-chip${multiType === t ? ' auth-multi-chip--active' : ''}`}
                onClick={() => { setMultiType(t); setMajor2('') }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {multiType !== '없음' && (
          <div className="auth-field" style={{ position: 'relative' }}>
            <label className="auth-label">
              {multiType === '연계전공' ? '연계전공 선택' : `${multiType} 학과 선택`}
            </label>
            <div className="auth-input-row">
              <input
                className="auth-input"
                placeholder={multiType === '연계전공' ? '연계전공명을 입력하세요.' : '학과명을 입력하세요.'}
                value={major2}
                onChange={e => { setMajor2(e.target.value); setShowDrop(true) }}
                onFocus={() => setShowDrop(true)}
                onBlur={() => setTimeout(() => setShowDrop(false), 150)}
              />
              <span className="auth-input-icon">🔍</span>
            </div>
            {showDrop && filteredMajors.length > 0 && (
              <div className="auth-dept-dropdown">
                {filteredMajors.map(m => (
                  <button key={m} className="auth-dept-item"
                    onMouseDown={() => { setMajor2(m); setShowDrop(false) }}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {multiType !== '없음' && major2 && (
          <div className="auth-confirm-box">
            <span className="auth-confirm-box__label">선택된 다전공</span>
            <span className="auth-confirm-box__value">{multiType} · {major2}</span>
          </div>
        )}

        {multiType === '없음' && (
          <div className="auth-info-box">
            다전공 없이 단일전공으로 졸업 요건을 관리합니다.<br />
            나중에 마이페이지에서 변경할 수 있습니다.
          </div>
        )}
      </div>
      <div style={{ flex: 1 }} />
      <div className="auth-footer">
        <button className="auth-btn" onClick={handleDone}>가입 완료</button>
        <p className="auth-footer__link">기존 계정이 있으신가요?<button onClick={onBack}>로그인</button></p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Login screen                                                         */
/* ------------------------------------------------------------------ */
function LoginScreen({ onLogin, onSignup }) {
  const [id, setId] = useState('')
  const [pw, setPw] = useState('')

  const handleLogin = () => {
    if (id.trim() && pw.trim()) onLogin()
    else alert('아이디와 비밀번호를 입력해주세요.')
  }

  return (
    <div className="auth-page">
      <AuthHeader title="로그인" onBack={() => {}} />
      <div className="auth-logo-box">
        <img src={logo} alt="Y-Compass" className="auth-logo-box__img" />
      </div>
      <div className="auth-body">
        <div className="auth-field">
          <label className="auth-label">아이디</label>
          <input className="auth-input"
            placeholder="영문 아이디 혹은 메일 주소를 입력해주세요."
            value={id} onChange={e => setId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="auth-field">
          <label className="auth-label">비밀번호</label>
          <input className="auth-input" type="password"
            placeholder="영문, 숫자, 특수문자(@,#,$,*) 포함 6자 이상 입력해주세요."
            value={pw} onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>
        <div className="auth-links">
          <span className="auth-links__item">아이디 찾기</span>
          <span className="auth-links__divider">|</span>
          <span className="auth-links__item">비밀번호 찾기</span>
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div className="auth-footer">
        <button className="auth-btn" onClick={handleLogin}>로그인</button>
        <p className="auth-footer__link">처음 이용하시나요?<button onClick={onSignup}>회원가입하기</button></p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Root export — manages which step is shown                            */
/* ------------------------------------------------------------------ */
export default function Login({ onLogin }) {
  const [view, setView] = useState('login')
  const [step1Data, setStep1Data] = useState({})
  const [step2Data, setStep2Data] = useState({})

  const handleStep1Next = (data) => { setStep1Data(data); setView('signup2') }
  const handleStep2Next = (data) => { setStep2Data(data); setView('signup3') }
  const handleStep3Done = (data) => {
    // Build full profile from all 3 steps
    const profile = {
      name: step1Data.name || '',
      studentId: step2Data.studentId || '',
      email: step2Data.email || '',
      admissionYear: step2Data.admissionYear || new Date().getFullYear(),
      major1: step2Data.major1 || '',
      multiMajorType: data.multiMajorType || '없음',
      major2: data.major2 || '',
    }
    onLogin(profile)
  }

  if (view === 'signup1') {
    return <SignupStep1 onNext={handleStep1Next} onBack={() => setView('login')} />
  }
  if (view === 'signup2') {
    return <SignupStep2 onNext={handleStep2Next} onBack={() => setView('signup1')} />
  }
  if (view === 'signup3') {
    return <SignupStep3 onDone={handleStep3Done} onBack={() => setView('signup2')} />
  }

  return (
    <LoginScreen
      onLogin={() => onLogin(null)}
      onSignup={() => setView('signup1')}
    />
  )
}
