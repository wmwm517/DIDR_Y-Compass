import { useState, useMemo, useRef } from 'react'
import '../style/CourceManage.css'
import Header from '../components/Header'
import GraduDiagno from './GraduDiagno'
import semesters from '../data/semesters.json'
import { useUser } from '../context/UserContext'
import { buildSearchPool } from '../data/graduationEngine'

/* ---- SVG icons ---- */
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ display:'block' }}>
    <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

const TrashIcon = ({ active }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M2 4h12M5.333 4V2.667a.667.667 0 0 1 .667-.667h4a.667.667 0 0 1 .667.667V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333A.667.667 0 0 0 4.667 14h6.666a.667.667 0 0 0 .667-.667L12.667 4"
      stroke={active ? '#BA1A1A' : 'var(--primary-dark)'}
      strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

/* ---- Filter modal ---- */
const FILTER_SEMESTERS = ['2026-1', '2025-2', '2025-1', '2024-2', '2024-1', '2023-2', '2023-1', '2022-2', '2022-1']
const FILTER_TYPES = ['전공 필수', '전공 기초', '전공 선택']
const FILTER_MAJORS = ['제1전공', '제2전공', '연계전공', '교양', '기타']

function FilterModal({ filters, onApply, onClose }) {
  const [local, setLocal] = useState({ ...filters })

  const toggle = (key, value) => {
    setLocal(prev => {
      const arr = prev[key] || []
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      }
    })
  }

  const reset = () => setLocal({ semesters: [], types: [], majors: [] })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="filter-modal" onClick={e => e.stopPropagation()}>
        <div className="filter-modal__header">
          <span className="filter-modal__title">필터링</span>
          <button onClick={onClose} className="filter-modal__close">✕</button>
        </div>

        <div className="filter-modal__section">
          <div className="filter-modal__section-title">학기</div>
          <div className="filter-modal__chips">
            {FILTER_SEMESTERS.map(s => (
              <button
                key={s}
                className={`filter-chip${local.semesters.includes(s) ? ' filter-chip--active' : ''}`}
                onClick={() => toggle('semesters', s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-modal__section">
          <div className="filter-modal__section-title">이수 구분</div>
          <div className="filter-modal__chips">
            <button
              className={`filter-chip${local.types.length === 0 ? ' filter-chip--active' : ''}`}
              onClick={() => setLocal(prev => ({ ...prev, types: [] }))}
            >
              전체
            </button>
            {FILTER_TYPES.map(t => (
              <button
                key={t}
                className={`filter-chip${local.types.includes(t) ? ' filter-chip--active' : ''}`}
                onClick={() => toggle('types', t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-modal__section">
          <div className="filter-modal__section-title">전공 분류</div>
          <div className="filter-modal__chips">
            <button
              className={`filter-chip${local.majors.length === 0 ? ' filter-chip--active' : ''}`}
              onClick={() => setLocal(prev => ({ ...prev, majors: [] }))}
            >
              전체
            </button>
            {FILTER_MAJORS.map(m => (
              <button
                key={m}
                className={`filter-chip${local.majors.includes(m) ? ' filter-chip--active' : ''}`}
                onClick={() => toggle('majors', m)}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-modal__footer">
          <button className="filter-modal__reset" onClick={reset}>초기화</button>
          <button className="filter-modal__apply" onClick={() => { onApply(local); onClose() }}>적용</button>
        </div>
      </div>
    </div>
  )
}

/* ---- Type badge with dropdown ---- */
const TYPE_MAP = {
  '전필': { label: '전필', cls: '전필' },
  '전기': { label: '전기', cls: '전기' },
  '전선': { label: '전선', cls: '전선' },
  '교양': { label: '교양', cls: '교양' },
}

function TypeBadge({ type, onChange }) {
  const types = ['전필', '전기', '전선', '교양']
  const [open, setOpen] = useState(false)
  const cls = TYPE_MAP[type]?.cls || 'default'

  return (
    <div style={{ position: 'relative' }}>
      <button
        className={`course-card__type-btn course-card__type-btn--${cls}`}
        onClick={() => setOpen(o => !o)}
      >
        {type}
        <span className="type-btn__chevron"><ChevronDown /></span>
      </button>
      {open && (
        <div className="type-dropdown">
          {types.map(t => (
            <button
              key={t}
              className={`type-dropdown__item type-dropdown__item--${TYPE_MAP[t]?.cls || 'default'}`}
              onClick={() => { onChange(t); setOpen(false) }}
            >
              {t}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ---- Course card ---- */
function CourseCard({ course, onDelete, onTypeChange }) {
  const [pendingDelete, setPendingDelete] = useState(false)

  const handleDeleteClick = () => {
    if (pendingDelete) {
      onDelete(course.id)
      setPendingDelete(false)
    } else {
      setPendingDelete(true)
    }
  }

  return (
    <div className="course-card" onClick={() => pendingDelete && setPendingDelete(false)}>
      <div className="course-card__top">
        <span className="course-card__code">{course.code}</span>
        <div className="course-card__controls">
          <TypeBadge type={course.type} onChange={t => onTypeChange(course.id, t)} />
          <button
            className={`course-card__delete${pendingDelete ? ' course-card__delete--active' : ''}`}
            onClick={e => { e.stopPropagation(); handleDeleteClick() }}
            title={pendingDelete ? '한 번 더 클릭하면 삭제됩니다' : '삭제'}
          >
            <TrashIcon active={pendingDelete} />
          </button>
        </div>
      </div>
      <div className="course-card__name">{course.name}</div>
      <div className="course-card__meta-row">
        <div className="course-card__meta">
          <span className="course-card__meta-icon">📊</span>
          {course.credits}학점 | {course.grade !== '-' ? course.grade : '학년 미정'}
        </div>
        <span className="course-card__status">
          {course.status === 'completed' ? '수강 완료' : '수강 예정'}
        </span>
      </div>
      {pendingDelete && (
        <div className="course-card__delete-hint">한 번 더 클릭하면 삭제됩니다</div>
      )}
    </div>
  )
}

/* ---- CourseList ---- */
function CourseList() {
  const { profile, courses, setCourses } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ semesters: [], types: [], majors: [] })
  const [selectedSemester, setSelectedSemester] = useState(semesters[semesters.length - 1])
  const nextId = useRef(10000)

  const majorLabel = profile.multiMajorType === '없음'
    ? `${profile.major1} (제1전공)`
    : `${profile.major1} (제1전공) | ${profile.major2} (${profile.multiMajorType})`

  const existingCodes = useMemo(() => courses.map(c => c.code), [courses])
  const searchPool = useMemo(
    () => buildSearchPool(profile.major1, profile.multiMajorType, profile.major2, existingCodes),
    [profile.major1, profile.multiMajorType, profile.major2, existingCodes],
  )

  const filteredCourses = useMemo(() => {
    const majorMap = {
      '주전공': '제1전공', '제1전공': '제1전공',
      '복수전공': '제2전공', '제2전공': '제2전공',
      '연계전공': '연계전공',
      '교양': '교양',
    }
    return courses.filter(c => {
      if (searchQuery && !c.name.includes(searchQuery) && !c.code.includes(searchQuery)) return false
      if (filters.semesters.length > 0) {
        const semYear = c.semester.replace('년 ', '-').replace('학기', '').trim()
        if (!filters.semesters.includes(semYear)) return false
      }
      if (filters.types.length > 0) {
        const typeMap = { '전필': '전공 필수', '전기': '전공 기초', '전선': '전공 선택' }
        if (!filters.types.includes(typeMap[c.type] || '')) return false
      }
      if (filters.majors.length > 0) {
        if (!filters.majors.includes(majorMap[c.major] || '기타')) return false
      }
      return true
    })
  }, [courses, searchQuery, filters])

  const activeFilterCount = filters.semesters.length + filters.types.length + filters.majors.length

  const handleDelete = (id) => {
    setCourses(prev => prev.filter(c => c.id !== id))
  }

  const handleTypeChange = (id, newType) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, type: newType } : c))
  }

  const handleAddCourse = (pool) => {
    const newCourse = {
      ...pool,
      id: (nextId.current += 1),
      semester: selectedSemester,
      grade: '-',
      status: 'inProgress',
      major: pool.major || '주전공',
    }
    setCourses(prev => [...prev, newCourse])
    setShowSearch(false)
    setSearchInput('')
  }

  const searchResults = useMemo(() => {
    if (!searchInput) return searchPool
    return searchPool.filter(c =>
      c.name.includes(searchInput) || c.code.includes(searchInput)
    )
  }, [searchInput, searchPool])

  const totalCredits = filteredCourses.reduce((s, c) => s + c.credits, 0)

  return (
    <div>
      {/* Search + Filter */}
      <div className="course-search-area">
        <div className="search-bar">
          <span className="search-bar__icon">🔍</span>
          <input
            className="search-bar__input"
            placeholder="과목명 또는 과목코드 검색"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="filter-btn" onClick={() => setShowFilter(true)}>
          필터링
          {activeFilterCount > 0 && (
            <span className="filter-btn__count">{activeFilterCount}</span>
          )}
          <span className="filter-btn__icon">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M3 7h8M5 11h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </span>
        </button>
      </div>

      {/* Dept label */}
      <div className="course-dept-label">
        <span className="course-dept-label__icon">🎓</span>
        <span className="course-dept-label__text">{majorLabel}</span>
      </div>
      <div className="course-list-title">이수 목록 관리</div>

      {/* Course cards */}
      {filteredCourses.length > 0 ? (
        <div className="course-card-list">
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onDelete={handleDelete}
              onTypeChange={handleTypeChange}
            />
          ))}
          {/* Credits bar inside list with bottom padding for FAB */}
          <div className="course-credits-bar">
            <span className="course-credits-bar__label">전체 합계</span>
            <span className="course-credits-bar__value">{totalCredits}학점</span>
          </div>
          <div style={{ height: 80 }} />
        </div>
      ) : (
        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 14 }}>
          {searchQuery || activeFilterCount > 0 ? '조건에 맞는 과목이 없습니다.' : '등록된 과목이 없습니다.'}
        </div>
      )}

      {/* FAB */}
      <button className="course-fab" onClick={() => setShowSearch(true)} title="과목 추가">＋</button>

      {/* Filter modal */}
      {showFilter && (
        <FilterModal
          filters={filters}
          onApply={setFilters}
          onClose={() => setShowFilter(false)}
        />
      )}

      {/* Add course panel */}
      {showSearch && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 88 }}
            onClick={() => setShowSearch(false)}
          />
          <div className="course-search-panel">
            <div className="course-search-panel__header">
              <span className="course-search-panel__title">과목 추가</span>
              <button onClick={() => setShowSearch(false)} style={{ fontSize: 20, color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* 학기 선택 */}
            <div className="add-semester-section">
              <div className="add-semester-label">담을 학기</div>
              <div className="add-semester-chips">
                {[...semesters].reverse().map(sem => (
                  <button
                    key={sem}
                    className={`add-semester-chip${selectedSemester === sem ? ' add-semester-chip--active' : ''}`}
                    onClick={() => setSelectedSemester(sem)}
                  >
                    {sem}
                  </button>
                ))}
              </div>
            </div>

            <div className="search-bar" style={{ marginBottom: 12 }}>
              <span className="search-bar__icon">🔍</span>
              <input
                className="search-bar__input"
                placeholder="과목명 또는 코드로 검색"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                autoFocus
              />
            </div>
            {searchResults.map((c, i) => (
              <div key={i} className="course-search-result">
                <div className="course-search-result__info">
                  <div className="course-search-result__code">{c.code}</div>
                  <div className="course-search-result__name">{c.name}</div>
                  <div className="course-search-result__meta">{c.credits}학점 · {c.type}</div>
                </div>
                <button className="add-btn" onClick={() => handleAddCourse(c)}>담기</button>
              </div>
            ))}
            {searchResults.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-muted)', fontSize: 14 }}>
                검색 결과가 없습니다
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function CourceManage() {
  const [activeTab, setActiveTab] = useState('list')

  return (
    <div>
      <Header title="수업관리" variant="light" />

      <div className="page-content">
        <div className="tab-bar">
          <button
            className={`tab-bar__item${activeTab === 'list' ? ' tab-bar__item--active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            이수 목록
          </button>
          <button
            className={`tab-bar__item${activeTab === 'diagnosis' ? ' tab-bar__item--active' : ''}`}
            onClick={() => setActiveTab('diagnosis')}
          >
            졸업 진단
          </button>
        </div>

        {activeTab === 'list' ? <CourseList /> : <GraduDiagno />}
      </div>
    </div>
  )
}
