import { useState } from 'react'
import '../style/MyPage.css'
import Header from '../components/Header'
import logo from '../assets/logo.png'
import { useUser } from '../context/UserContext'

const MAJORS = [
  '도시공학과', '통합디자인학과', '실내건축학과', '아동가족학과',
  '식품영양학과', '의류환경학과', '언론홍보영상학부', '컴퓨터과학과',
  '경영학과', '심리학과', '데이터사이언스학과',
]
const LINKED_MAJORS = ['인지과학']
const MULTI_TYPES = ['없음', '복수전공', '부전공', '연계전공']

/* ------------------------------------------------------------------ */
/* 검색 가능한 전공 필드                                                 */
/* ------------------------------------------------------------------ */
function MajorSearchField({ label, value, list, onChange }) {
  const [query, setQuery] = useState(value)
  const [showDrop, setShowDrop] = useState(false)

  const filtered = (query
    ? list.filter(m => m.includes(query))
    : list
  ).filter(m => m !== value)

  const handleSelect = (m) => {
    setQuery(m)
    onChange(m)
    setShowDrop(false)
  }

  return (
    <div className="major-change-field">
      <label className="major-change-field-label">{label}</label>
      <div className="major-change-input-row">
        <input
          placeholder={`${label} 검색`}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(''); setShowDrop(true) }}
          onFocus={() => setShowDrop(true)}
          onBlur={() => setTimeout(() => setShowDrop(false), 150)}
        />
        <span className="major-change-search-icon">🔍</span>
      </div>
      {showDrop && filtered.length > 0 && (
        <div className="major-change-dropdown">
          {filtered.map(m => (
            <button
              key={m}
              className="major-change-dropdown-item"
              onMouseDown={() => handleSelect(m)}
            >
              {m}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 전공 변경 sub-page                                                   */
/* ------------------------------------------------------------------ */
function MajorChange({ onBack }) {
  const { profile, setProfile } = useUser()
  const [major1, setMajor1] = useState(profile.major1)
  const [multiType, setMultiType] = useState(profile.multiMajorType || '없음')
  const [major2, setMajor2] = useState(profile.multiMajorType !== '없음' ? profile.major2 : '')

  const major2List = multiType === '연계전공' ? LINKED_MAJORS : MAJORS

  const handleTypeChange = (t) => {
    setMultiType(t)
    setMajor2('')
  }

  const canSave = major1 && (multiType === '없음' || major2)

  const handleSave = () => {
    if (!canSave) return
    setProfile(prev => ({
      ...prev,
      major1,
      multiMajorType: multiType,
      major2: multiType === '없음' ? '' : major2,
    }))
    alert('전공 변경이 완료되었습니다.')
    onBack()
  }

  return (
    <div className="major-change-page">
      <div className="major-change-header">
        <button className="major-change-header__back" onClick={onBack}>‹</button>
        <img src={logo} alt="Y-Compass" className="major-change-header__logo" />
        <span className="major-change-header__title">전공 변경</span>
      </div>

      <div className="major-change-body">
        {/* 현재 전공 요약 */}
        <div className="major-change-current">
          <span className="major-change-current__label">현재</span>
          <span className="major-change-current__value">
            {profile.major1}
            {profile.multiMajorType !== '없음' && ` · ${profile.major2} (${profile.multiMajorType})`}
          </span>
        </div>

        {/* 제1전공 */}
        <div className="major-change-section">
          <div className="major-change-section-title">제1전공</div>
          <MajorSearchField label="학과명" value={major1} list={MAJORS} onChange={setMajor1} />
        </div>

        {/* 다전공 */}
        <div className="major-change-section">
          <div className="major-change-section-title">다전공 설정</div>

          <div className="major-change-type-row">
            {MULTI_TYPES.map(t => (
              <button
                key={t}
                className={`major-change-type-chip${multiType === t ? ' major-change-type-chip--active' : ''}`}
                onClick={() => handleTypeChange(t)}
              >
                {t}
              </button>
            ))}
          </div>

          {multiType !== '없음' && (
            <div className="major-change-second-field">
              <MajorSearchField
                label={multiType === '연계전공' ? '연계전공명' : '학과명'}
                value={major2}
                list={major2List}
                onChange={setMajor2}
              />
            </div>
          )}

          {multiType === '없음' && (
            <p className="major-change-none-note">단일전공으로 졸업 요건이 관리됩니다.</p>
          )}
        </div>

        {/* 변경 후 미리보기 */}
        {(major1 || major2) && (
          <div className="major-change-preview">
            <span className="major-change-preview__label">변경 후</span>
            <span className="major-change-preview__value">
              {major1 || profile.major1}
              {multiType !== '없음' && major2 && ` · ${major2} (${multiType})`}
            </span>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <div className="major-change-footer">
        <button
          className={`major-change-btn${!canSave ? ' major-change-btn--disabled' : ''}`}
          onClick={handleSave}
          disabled={!canSave}
        >
          변경 완료
        </button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MyPage main                                                          */
/* ------------------------------------------------------------------ */
const MENU_ITEMS = [
  { label: '환경설정',        key: 'settings' },
  { label: '개인정보 변경',   key: 'profile'  },
  { label: '전공 변경',       key: 'major'    },
  { label: '알림 설정',       key: 'alarm'    },
  { label: '서비스 이용약관', key: 'terms'    },
  { label: '개인정보 처리방침', key: 'privacy' },
  { label: '로그아웃',        key: 'logout'   },
  { label: '회원 탈퇴',       key: 'withdraw', danger: true },
]

export default function MyPage({ onLogout }) {
  const { profile } = useUser()
  const [subPage, setSubPage] = useState(null)

  if (subPage === 'major') {
    return <MajorChange onBack={() => setSubPage(null)} />
  }

  const handleMenuItem = (key) => {
    if (key === 'logout')   { onLogout(); return }
    if (key === 'major')    { setSubPage('major'); return }
    if (key === 'withdraw') {
      if (window.confirm('정말 회원 탈퇴하시겠습니까?')) onLogout()
      return
    }
  }

  return (
    <div className="mypage">
      <Header title="마이페이지" variant="light" showIcon />

      {/* Avatar */}
      <div className="mypage-avatar-section">
        <div className="mypage-avatar-wrap">
          <div className="mypage-avatar-box">
            <span className="mypage-avatar-icon">👤</span>
          </div>
          <div className="mypage-avatar-edit">✏️</div>
        </div>
        <div className="mypage-name">{profile.name}</div>
        <div className="mypage-chips">
          <span className="mypage-chip">{profile.major1}</span>
          {profile.multiMajorType !== '없음' && (
            <span className="mypage-chip">{profile.major2}</span>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="mypage-menu">
        {MENU_ITEMS.map(item => (
          <button
            key={item.key}
            className="mypage-menu-item"
            onClick={() => handleMenuItem(item.key)}
          >
            <span className={`mypage-menu-item__label${item.danger ? ' mypage-menu-item__label--danger' : ''}`}>
              {item.label}
            </span>
            <span className="mypage-menu-item__arrow">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
