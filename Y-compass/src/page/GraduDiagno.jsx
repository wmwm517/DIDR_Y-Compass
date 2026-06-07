import '../style/GraduDiagno.css'
import { useUser } from '../context/UserContext'
import { calcGraduation } from '../data/graduationEngine'

function ProgressBar({ value, max, height = 12 }) {
  const pct = Math.min(100, Math.round((value / max) * 100))
  return (
    <div style={{
      width: '100%', height, background: 'var(--primary-faint3)',
      borderRadius: 9999, overflow: 'hidden',
    }}>
      <div style={{
        height: '100%', width: `${pct}%`,
        background: 'var(--primary-dark)', borderRadius: 9999,
        transition: 'width 0.6s ease',
      }} />
    </div>
  )
}

function MajorTable({ label, data, isDark }) {
  const total = {
    required: data.areas.reduce((s, a) => s + a.required, 0),
    earned:   data.areas.reduce((s, a) => s + a.earned,   0),
    missing:  data.areas.reduce((s, a) => s + a.missing,  0),
  }
  return (
    <div>
      <div className="diag-section-heading">
        <span className="diag-section-heading__icon">{isDark ? '🏠' : '📚'}</span>
        <span className={`diag-section-heading__title${isDark ? '' : ' diag-section-heading__title--secondary'}`}>
          {label}: {data.name} ({data.required})
        </span>
      </div>
      <div className="diag-table-wrapper">
        <table className="diag-table">
          <thead>
            <tr>
              <th style={{ textAlign: 'left' }}>영역</th>
              <th>필요</th>
              <th>이수</th>
              <th>부족</th>
            </tr>
          </thead>
          <tbody>
            {data.areas.map((area, i) => (
              <tr key={i}>
                <td>
                  <button style={{ fontSize: 11, color: 'var(--primary-mid)', marginRight: 4 }}>↗</button>
                  {area.name}
                </td>
                <td>{area.required}</td>
                <td>{area.earned}</td>
                <td className={area.missing > 0 ? 'missing-cell' : ''}>{area.missing > 0 ? area.missing : '-'}</td>
              </tr>
            ))}
            <tr className={isDark ? 'total-row-dark' : 'total-row-light'}>
              <td>합계</td>
              <td>{total.required}</td>
              <td>{total.earned}</td>
              <td>{total.missing > 0 ? total.missing : '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function GraduDiagno() {
  const { profile, courses } = useUser()
  const d = calcGraduation(profile, courses)
  const pct = d.completionRate

  return (
    <div className="diag-container">
      {/* Summary card */}
      <div className="diag-summary-card">
        <div className="diag-rate-label">학점 이수율</div>
        <div className="diag-rate-row">
          <span className="diag-rate">{pct}%</span>
          <span className="diag-rate-missing">({d.missingCreditsLabel})</span>
        </div>
        <ProgressBar value={pct} max={100} height={12} />
        <div className="diag-stat-boxes">
          <div className="diag-stat-box">
            <div className="diag-stat-label">학점 현황</div>
            <div className="diag-stat-value">{d.totalEarned} / {d.totalRequired}</div>
          </div>
          <div className="diag-stat-box diag-stat-box--accent">
            <div className="diag-stat-label">남은 학기(예상)</div>
            <div className="diag-stat-value diag-stat-value--accent">{d.remainingSemesters}학기</div>
          </div>
        </div>
      </div>

      {/* Major 1 table */}
      <MajorTable label="전공" data={d.major1} isDark={true} />

      {/* Major 2 table */}
      {d.major2 && (
        <MajorTable label={profile.multiMajorType} data={d.major2} isDark={false} />
      )}

      {/* Liberal arts */}
      <div>
        <div className="diag-section-heading">
          <span className="diag-section-heading__icon">📖</span>
          <span className="diag-section-heading__title">교양 및 기타 요건</span>
        </div>

        {/* 교양기초 */}
        <div className="diag-liberal-card" style={{ marginBottom: 16 }}>
          <div className="diag-liberal-card__header">
            <span className="diag-liberal-card__title">교양기초 ({d.liberalBasic.length * 2})</span>
          </div>
          <div className="liberal-basic-grid">
            {d.liberalBasic.map((item, i) => (
              <div
                key={i}
                className={`liberal-basic-item${item.completed ? '' : ' liberal-basic-item--missing'}`}
              >
                <span className="liberal-basic-item__name">{item.name}</span>
                <div className={`liberal-basic-item__check liberal-basic-item__check--${item.completed ? 'ok' : 'no'}`}>
                  {item.completed ? '✓' : '✕'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 대학교양 */}
        <div className="diag-liberal-card">
          <div className="diag-liberal-card__header">
            <span className="diag-liberal-card__title">대학교양 (27)</span>
          </div>
          <table className="diag-general-table">
            <tbody>
              {d.liberalGeneral.map((item, i) => (
                <tr key={i} className={!item.ok ? '' : ''}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 400 }}>{item.name}</td>
                  <td className={item.ok ? 'status--ok' : item.status.includes('남') ? 'status--remaining' : 'status--pending'}>
                    {item.status}
                  </td>
                </tr>
              ))}
              <tr className="row--highlight">
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>잔여 영역 (5개 영역)</td>
                <td className="status--remaining">15학점 남음</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checklist */}
      <div className="grad-checklist">
        <div className="grad-checklist__title">
          📋 졸업 가능 여부 체크리스트
        </div>
        {d.checklist.map((item, i) => (
          <div key={i} className="grad-checklist-item">
            <span className="grad-checklist-item__icon">
              {item.warn ? '⚠️' : item.ok ? '✓' : '✕'}
            </span>
            <span className="grad-checklist-item__text">{item.text}</span>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#93BCFC', fontWeight: 500 }}>
              ({item.status})
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
