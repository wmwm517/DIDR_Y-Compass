import { useState, useRef } from 'react'
import '../style/FAQ.css'
import Header from '../components/Header'
import faqItems from '../data/faq.json'
import initialInquiries from '../data/inquiries.json'

const CATEGORIES = ['전체', '수강신청', '졸업요건', '장학금', '기타']

function FAQAccordion({ items }) {
  const [openId, setOpenId] = useState(null)
  return (
    <div className="faq-accordion">
      {items.map(item => (
        <div key={item.id} className="faq-accordion-item">
          <button
            className="faq-accordion__question"
            onClick={() => setOpenId(openId === item.id ? null : item.id)}
          >
            <span className="faq-accordion__q-text">{item.question}</span>
            <span className="faq-accordion__chevron">
              {openId === item.id ? '︿' : '﹀'}
            </span>
          </button>
          {openId === item.id && (
            <div className="faq-accordion__answer">{item.answer}</div>
          )}
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* InquiryCard                                                          */
/* ------------------------------------------------------------------ */
function InquiryCard({ inquiry, isMine, onClick }) {
  const isAnswered = inquiry.status === '답변완료'
  const displayTitle = isMine && inquiry.realTitle ? inquiry.realTitle : inquiry.title
  const displayPreview = isMine && inquiry.content
    ? inquiry.content.slice(0, 45) + (inquiry.content.length > 45 ? '...' : '')
    : inquiry.preview

  return (
    <div className="inquiry-card" onClick={onClick}>
      <div className="inquiry-card__status-row">
        <span className={isAnswered ? 'badge--success-outline' : 'badge--review'}>
          {inquiry.status}
        </span>
        <span className="inquiry-card__date">{inquiry.date}</span>
      </div>
      <div className="inquiry-card__title">
        {inquiry.isPrivate && <span className="inquiry-card__lock">🔒 </span>}
        {displayTitle}
      </div>
      <div className="inquiry-card__preview">{displayPreview}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* InquiryDetailPage                                                    */
/* ------------------------------------------------------------------ */
function InquiryDetailPage({ inquiry, onBack }) {
  const isMine = inquiry.isMine === true
  const displayTitle = (isMine || !inquiry.isPrivate)
    ? (inquiry.realTitle || inquiry.title)
    : inquiry.title
  const displayContent = (isMine || !inquiry.isPrivate)
    ? (inquiry.content || inquiry.preview)
    : '비공개 문의입니다.'
  const isAnswered = inquiry.status === '답변완료'

  return (
    <div className="inq-detail">
      <div className="inq-detail__header">
        <button className="inq-detail__back" onClick={onBack}>‹</button>
        <span className="inq-detail__header-title">문의 상세</span>
        <div style={{ width: 36 }} />
      </div>

      <div className="inq-detail__body">
        <div className="inq-detail__meta">
          <span className={isAnswered ? 'badge--success-outline' : 'badge--review'}>
            {inquiry.status}
          </span>
          <span className="inq-detail__category">{inquiry.category}</span>
          <span className="inq-detail__date">{inquiry.date}</span>
        </div>

        <div className="inq-detail__title">
          {inquiry.isPrivate && <span className="inq-detail__lock">🔒 </span>}
          {displayTitle}
        </div>

        <div className="inq-detail__section">
          <div className="inq-detail__section-label">문의 내용</div>
          <div className="inq-detail__content">{displayContent}</div>
        </div>

        <div className="inq-detail__answer-wrap">
          {isAnswered && inquiry.answer ? (
            <div className="inq-detail__answer">
              <div className="inq-detail__answer-header">
                <span className="inq-detail__answer-icon">💬</span>
                <span className="inq-detail__answer-label">학사지원팀 답변</span>
              </div>
              <div className="inq-detail__answer-content">
                {inquiry.answer.split('\n').map((line, i) => (
                  <span key={i}>{line}{i < inquiry.answer.split('\n').length - 1 && <br />}</span>
                ))}
              </div>
            </div>
          ) : (
            <div className="inq-detail__pending">
              <span className="inq-detail__pending-icon">⏳</span>
              <span className="inq-detail__pending-text">
                검토 중입니다. 빠른 시일 내에 답변드리겠습니다.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* AllInquiriesPage                                                     */
/* ------------------------------------------------------------------ */
function AllInquiriesPage({ inquiries: allInqs, onBack, onWrite, onSelect }) {
  return (
    <div>
      <div className="all-inq-header">
        <button className="all-inq-header__back" onClick={onBack}>‹</button>
        <span className="all-inq-header__title">학생 문의 리스트</span>
        <button className="all-inq-header__write" onClick={onWrite}>✏️</button>
      </div>
      <div className="all-inq-body">
        {allInqs.length > 0 ? (
          allInqs.map(inq => (
            <InquiryCard
              key={inq.id}
              inquiry={inq}
              isMine={inq.isMine}
              onClick={() => onSelect(inq)}
            />
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            문의 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* WriteModal                                                           */
/* ------------------------------------------------------------------ */
function WriteModal({ onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('졸업요건')
  const [isPrivate, setIsPrivate] = useState(false)

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }
    onSubmit({ title, content, category, isPrivate })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__header">
          <span className="modal-sheet__title">문의 작성</span>
          <button className="modal-sheet__close" onClick={onClose}>✕</button>
        </div>

        <div className="form-caution">
          ⚠️ 졸업 요건 및 학사 관련 문의만 작성해주세요.
        </div>

        <div className="form-group">
          <label className="form-label">카테고리</label>
          <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
            {['수강신청', '졸업요건', '장학금', '기타'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">제목</label>
          <input
            className="form-input"
            placeholder="문의 제목을 입력하세요"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">내용</label>
          <textarea
            className="form-textarea"
            placeholder="문의 내용을 상세히 작성해주세요"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div className="form-group">
          <div className="form-toggle-row">
            <label className="form-label" style={{ margin: 0 }}>비공개 설정</label>
            <button
              onClick={() => setIsPrivate(p => !p)}
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: isPrivate ? 'var(--primary-mid)' : 'var(--border)',
                position: 'relative', transition: 'background 0.2s',
              }}
            >
              <span style={{
                position: 'absolute', top: 2, left: isPrivate ? 22 : 2,
                width: 20, height: 20, borderRadius: '50%', background: 'white',
                transition: 'left 0.2s', display: 'block',
              }} />
            </button>
          </div>
          {isPrivate && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
              비공개 설정 시 &#39;비밀 문의입니다&#39;로 표시됩니다.
            </div>
          )}
        </div>

        <button className="submit-btn" onClick={handleSubmit}>문의 등록하기</button>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* MyInquiriesModal                                                     */
/* ------------------------------------------------------------------ */
function MyInquiriesModal({ myInquiries, onClose, onDelete, onSelect }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-sheet__header">
          <span className="modal-sheet__title">내가 쓴 문의</span>
          <button className="modal-sheet__close" onClick={onClose}>✕</button>
        </div>
        {myInquiries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            작성한 문의가 없습니다.
          </div>
        ) : (
          myInquiries.map(inq => (
            <div key={inq.id} className="my-inq-item">
              <InquiryCard inquiry={inq} isMine={true} onClick={() => onSelect(inq)} />
              <div className="my-inq-item__actions">
                <button
                  className="my-inq-item__delete"
                  onClick={e => { e.stopPropagation(); onDelete(inq.id) }}
                >
                  삭제
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Main FAQ page                                                        */
/* ------------------------------------------------------------------ */
export default function FAQ() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('전체')
  const [showWrite, setShowWrite] = useState(false)
  const [showMyInquiries, setShowMyInquiries] = useState(false)
  const [showAllInquiries, setShowAllInquiries] = useState(false)
  const [allInquiries, setAllInquiries] = useState(initialInquiries)
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [detailFrom, setDetailFrom] = useState(null)
  const nextId = useRef(100)

  const filteredFAQs = faqItems.filter(f => {
    const matchCat = activeCategory === '전체' || f.category === activeCategory
    const matchSearch = !searchQuery || f.question.includes(searchQuery)
    return matchCat && matchSearch
  })

  const filteredInquiries = allInquiries.filter(inq => {
    const matchCat = activeCategory === '전체' || inq.category === activeCategory
    const matchSearch = !searchQuery || inq.title.includes(searchQuery)
    return matchCat && matchSearch
  })

  const handleSubmit = ({ title, content, category, isPrivate }) => {
    nextId.current += 1
    const now = new Date()
    const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`
    setAllInquiries(prev => [{
      id: nextId.current,
      title: isPrivate ? '비밀 문의입니다.' : title,
      realTitle: title,
      preview: isPrivate
        ? '이 문의는 작성자와 관리자만 확인할 수 있습니다.'
        : content.slice(0, 45) + (content.length > 45 ? '...' : ''),
      content,
      date: dateStr,
      status: '검토중',
      category,
      isPrivate,
      isMine: true,
      answer: null,
    }, ...prev])
  }

  const handleDelete = (id) => {
    if (window.confirm('문의를 삭제할까요?')) {
      setAllInquiries(prev => prev.filter(i => i.id !== id))
    }
  }

  const handleSelectInquiry = (inq, from) => {
    setSelectedInquiry(inq)
    setDetailFrom(from)
    if (from === 'my') setShowMyInquiries(false)
  }

  const handleDetailBack = () => {
    const from = detailFrom
    setSelectedInquiry(null)
    setDetailFrom(null)
    if (from === 'my') setShowMyInquiries(true)
  }

  const myInquiries = allInquiries.filter(i => i.isMine)

  /* ---- render priority ---- */
  if (selectedInquiry) {
    return <InquiryDetailPage inquiry={selectedInquiry} onBack={handleDetailBack} />
  }

  if (showAllInquiries) {
    return (
      <div>
        <AllInquiriesPage
          inquiries={allInquiries}
          onBack={() => setShowAllInquiries(false)}
          onWrite={() => { setShowAllInquiries(false); setShowWrite(true) }}
          onSelect={(inq) => handleSelectInquiry(inq, 'all')}
        />
        {showWrite && (
          <WriteModal onClose={() => setShowWrite(false)} onSubmit={handleSubmit} />
        )}
      </div>
    )
  }

  return (
    <div>
      <Header title="상담/FAQ" variant="light" />

      <div className="page-content">
        {/* Search + My Inquiries */}
        <div className="faq-search-row">
          <div className="search-bar" style={{ flex: 1 }}>
            <span className="search-bar__icon">🔍</span>
            <input
              className="search-bar__input"
              placeholder="도움말 또는 FAQ 검색"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="my-inquiry-btn" onClick={() => setShowMyInquiries(true)}>
            ↩ 내가 쓴 문의
          </button>
        </div>

        {/* Category chips */}
        <div className="faq-chip-row">
          <div className="chip-row">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`chip chip--${activeCategory === cat ? 'active' : 'inactive'}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ list */}
        {filteredFAQs.length > 0 && (
          <div className="faq-section">
            <div className="faq-section-title">자주 묻는 질문 (FAQ)</div>
            <FAQAccordion items={filteredFAQs} />
          </div>
        )}

        {/* Inquiry list */}
        <div className="inquiry-section">
          <div className="inquiry-section__header">
            <span className="inquiry-section__title">학생 문의 리스트</span>
            <button className="section__link" onClick={() => setShowAllInquiries(true)}>전체보기 ›</button>
          </div>
          {filteredInquiries.length > 0 ? (
            filteredInquiries.slice(0, 3).map(inq => (
              <InquiryCard
                key={inq.id}
                inquiry={inq}
                isMine={inq.isMine}
                onClick={() => handleSelectInquiry(inq, 'main')}
              />
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 14 }}>
              문의 내역이 없습니다.
            </div>
          )}
        </div>

        {/* Help banner */}
        <div className="inquiry-actions">
          <div className="help-banner">
            <div className="help-banner__title">원하는 답변을 찾지 못하셨나요?</div>
            <div className="help-banner__desc">학사지원팀 1:1 문의를 통해 정확한 상담을 받아보세요.</div>
            <div className="help-banner__actions">
              <button className="help-banner__btn" onClick={() => setShowWrite(true)}>문의 작성하기</button>
            </div>
          </div>
        </div>
      </div>

      {/* FAB */}
      <button className="faq-fab" onClick={() => setShowWrite(true)} title="문의 작성">✎</button>

      {showWrite && (
        <WriteModal onClose={() => setShowWrite(false)} onSubmit={handleSubmit} />
      )}
      {showMyInquiries && (
        <MyInquiriesModal
          myInquiries={myInquiries}
          onClose={() => setShowMyInquiries(false)}
          onDelete={handleDelete}
          onSelect={(inq) => handleSelectInquiry(inq, 'my')}
        />
      )}
    </div>
  )
}
