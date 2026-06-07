import { useState } from 'react'
import '../style//Home.css'
import Header from '../components/Header'
import archiveDocs from '../data/archive.json'
import { useUser } from '../context/UserContext'
import { calcGraduation } from '../data/graduationEngine'

function MajorProgressBar({ value, max, secondary }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div className="progress-bar">
      <div
        className={`progress-bar__fill${secondary ? ' progress-bar__fill--secondary' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function ArchiveCard({ doc }) {
  const isPdf = doc.type === 'PDF'
  return (
    <div className="archive-card">
      <div className="archive-card__top">
        <span style={{ fontSize: 28 }}>{isPdf ? '📄' : '🔗'}</span>
        <span className={`archive-card__type-badge archive-card__type-badge--${isPdf ? 'pdf' : 'external'}`}>
          {doc.type}
        </span>
      </div>
      <div className="archive-card__title">{doc.title}</div>
      <div className="archive-card__subtitle">{doc.subtitle}</div>
      <div className="archive-card__action">
        {isPdf ? '↓ 다운로드' : '↗ 바로가기'}
      </div>
    </div>
  )
}

export default function Home({ setPage }) {
  const { profile, courses } = useUser()
  const { overallRate, earnedCredits, requiredCredits, missingCredits, majorsOverview } = calcGraduation(profile, courses)
  const expectedGrad = `${profile.admissionYear + 4}년 2월`

  return (
    <div>
      <Header
        brandPrefix="연세대"
        title="대시보드"
        showIcon={false}
        variant="light"
      />

      <div className="page-content">
        {/* Greeting */}
        <div className="home-greeting">
          <div className="home-greeting__text">
            <div className="home-greeting__welcome">반가워요!</div>
            <div className="home-greeting__name">{profile.name} 학생님</div>
            <div className="home-greeting__badges">
              <span className="badge badge--primary">{profile.major1}</span>
              {profile.multiMajorType !== '없음' && (
                <span className="badge badge--secondary">{profile.major2} {profile.multiMajorType}</span>
              )}
            </div>
          </div>
          <div className="home-greeting__avatar">👩🏻‍🎓</div>
        </div>

        {/* Graduation progress card */}
        <div className="overview-card">
          <div className="overview-card__header">
            <div>
              <div className="overview-card__title">전체 졸업 요건 충족률</div>
              <div className="overview-card__subtitle">{expectedGrad} 졸업 예정</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="overview-card__rate">{overallRate}%</div>
              <button className="overview-card__detail-link" onClick={() => setPage('courses')}>
                자세히 보기 ›
              </button>
            </div>
          </div>

          {/* Main progress bar */}
          <div className="progress-bar progress-bar--main">
            <div className="progress-bar__fill" style={{ width: `${overallRate}%` }} />
          </div>

          {/* Credit boxes */}
          <div className="overview-card__credits">
            <div className="credit-box">
              <div className="credit-box__label">
                <span className="credit-box__label-icon">✅</span> 취득 학점
              </div>
              <div className="credit-box__value">
                {earnedCredits}<span> / {requiredCredits}</span>
              </div>
            </div>
            <div className="credit-box credit-box--warn">
              <div className="credit-box__label">
                <span className="credit-box__label-icon">⚠️</span> 부족 학점
              </div>
              <div className="credit-box__value" style={{ color: 'var(--error)' }}>
                {missingCredits} <span style={{ color: 'var(--text-secondary)' }}>학점</span>
              </div>
            </div>
          </div>

          {/* Per-major progress */}
          <div className="major-progress-section">
            <div className="major-progress-section__title">전공별 이수 현황</div>
            {majorsOverview.map((m, i) => (
              <div key={i} className="major-progress-item">
                <div className="major-progress-item__header">
                  <span className="major-progress-item__name">{m.name}</span>
                  <span className="major-progress-item__credits">{m.earned} / {m.required}</span>
                </div>
                <MajorProgressBar value={m.earned} max={m.required} secondary={i > 0} />
              </div>
            ))}
          </div>
        </div>

        {/* Archive section */}
        <div className="archive-section">
          <div className="archive-section__header">
            <span className="archive-section__title">졸업 요람 및 규정</span>
            <button className="section__link">아카이브 전체보기 ›</button>
          </div>
          {archiveDocs.slice(0, 2).map(doc => (
            <ArchiveCard key={doc.id} doc={doc} />
          ))}
        </div>

        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}
