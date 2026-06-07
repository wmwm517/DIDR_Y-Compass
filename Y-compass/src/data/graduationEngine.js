import requirementsData from './requirements.json'
import requirements2Data from './requirements2.json'
import coursesData from './courses.json'

/* ------------------------------------------------------------------ */
/* Mapping helpers                                                      */
/* ------------------------------------------------------------------ */
const CAT_TO_TYPE = {
  '전공기초': '전기',
  '전공필수': '전필',
  '전공선택': '전선',
}

const TYPE_TO_NAME = {
  '전기': '전공기초',
  '전필': '전공필수',
  '전선': '전공선택',
}

// Normalize the 'major' field to canonical form
function normMajor(m) {
  if (m === '주전공') return '제1전공'
  if (m === '복수전공') return '제2전공'
  return m || '기타'
}

/* ------------------------------------------------------------------ */
/* Requirements lookup                                                  */
/* ------------------------------------------------------------------ */
function lookupMainReq(dept, admissionYear, multiMajorType) {
  const yr = admissionYear % 100
  const typeKey = multiMajorType === '복수전공' ? '복수전공_1전공' : '단일전공'
  return (
    requirementsData.find(
      r =>
        r.학과 === dept &&
        yr >= r.학번_from &&
        yr <= r.학번_to &&
        r.전공유형 === typeKey,
    ) || null
  )
}

function lookupDoubleReq(dept, admissionYear) {
  const yr = admissionYear % 100
  return (
    requirementsData.find(
      r =>
        r.학과 === dept &&
        yr >= r.학번_from &&
        yr <= r.학번_to &&
        r.전공유형 === '복수전공_2전공',
    ) || null
  )
}

// 연계전공 requirements from requirements2.json
function getLinkedReq(majorName) {
  const reqList = requirements2Data[`${majorName}_졸업요건`]
  if (!reqList) return { total: 36, 전필: 3, 전선: 33 }
  const totalEntry = reqList.find(r => r.항목 === '총 이수학점')
  const total = totalEntry ? (parseInt(totalEntry.내용.match(/\d+/)?.[0]) || 36) : 36
  return { total, 전필: 3, 전선: total - 3 }
}

/* ------------------------------------------------------------------ */
/* Build course search pool from JSON                                   */
/* ------------------------------------------------------------------ */
export function buildSearchPool(major1Dept, multiMajorType, major2, existingCodes) {
  const existing = new Set(existingCodes)
  const pool = []

  // Main major courses from courses.json
  coursesData
    .filter(c => c.dept === major1Dept && !existing.has(c.code))
    .forEach(c =>
      pool.push({
        code: c.code,
        name: c.name,
        credits: c.credits,
        type: CAT_TO_TYPE[c.category] || '전선',
        major: '제1전공',
      }),
    )

  // Second major courses
  if (multiMajorType === '연계전공' && major2) {
    const courseList = requirements2Data[`${major2}_과목목록`] || []
    const seen = new Set()
    courseList.forEach(c => {
      const code = c.학정번호
      if (!code || existing.has(code) || seen.has(code)) return
      seen.add(code)
      // Field name convention: {major}_인정구분 (e.g. 인지과학_인정구분)
      const typeField = `${major2}_인정구분`
      const rawType = c[typeField] || '전선'
      pool.push({
        code,
        name: c.교과목명,
        credits: c.학점,
        type: rawType === '전필' ? '전필' : '전선',
        major: '연계전공',
      })
    })
  } else if (multiMajorType === '복수전공' && major2) {
    coursesData
      .filter(c => c.dept === major2 && !existing.has(c.code))
      .forEach(c =>
        pool.push({
          code: c.code,
          name: c.name,
          credits: c.credits,
          type: CAT_TO_TYPE[c.category] || '전선',
          major: '제2전공',
        }),
      )
  }

  return pool
}

/* ------------------------------------------------------------------ */
/* Main graduation calculation                                          */
/* ------------------------------------------------------------------ */
export function calcGraduation(profile, userCourses) {
  const { major1, major2, multiMajorType, admissionYear } = profile

  const major1Courses = userCourses.filter(c => ['제1전공', '주전공'].includes(c.major))
  const major2Courses = userCourses.filter(c =>
    ['연계전공', '제2전공', '복수전공'].includes(c.major),
  )
  const liberalCourses = userCourses.filter(c => c.major === '교양')

  /* ---------- Major 1 ---------- */
  const req1 = lookupMainReq(major1, admissionYear, multiMajorType)
  const m1Nums = req1
    ? { 전기: req1.전공기초, 전필: req1.전공필수, 전선: req1.전공선택, total: req1.전공소계 }
    : { 전기: 3, 전필: 12, 전선: 36, total: 51 }

  const major1Areas = ['전기', '전필', '전선'].map(t => {
    const required = m1Nums[t]
    const earned = major1Courses
      .filter(c => c.type === t)
      .reduce((s, c) => s + c.credits, 0)
    return { name: TYPE_TO_NAME[t], required, earned, missing: Math.max(0, required - earned) }
  })
  const major1Earned = major1Areas.reduce((s, a) => s + a.earned, 0)
  const major1Required = m1Nums.total

  /* ---------- Major 2 ---------- */
  let major2Data = null
  let major2Required = 0
  const major2Earned = major2Courses.reduce((s, c) => s + c.credits, 0)

  if (multiMajorType === '연계전공' && major2) {
    const r2 = getLinkedReq(major2)
    major2Required = r2.total
    const areas = [
      { t: '전필', req: r2.전필 },
      { t: '전선', req: r2.전선 },
    ].map(({ t, req }) => {
      const earned = major2Courses.filter(c => c.type === t).reduce((s, c) => s + c.credits, 0)
      return { name: TYPE_TO_NAME[t], required: req, earned, missing: Math.max(0, req - earned) }
    })
    major2Data = { name: major2, required: major2Required, areas }
  } else if (multiMajorType === '복수전공' && major2) {
    const req2 = lookupDoubleReq(major2, admissionYear)
    if (req2) {
      major2Required = req2.전공소계
      const areas = ['전기', '전필', '전선'].map(t => {
        const key = { 전기: '전공기초', 전필: '전공필수', 전선: '전공선택' }[t]
        const required = req2[key]
        const earned = major2Courses.filter(c => c.type === t).reduce((s, c) => s + c.credits, 0)
        return { name: TYPE_TO_NAME[t], required, earned, missing: Math.max(0, required - earned) }
      })
      major2Data = { name: major2, required: major2Required, areas }
    }
  }

  /* ---------- Liberal arts ---------- */
  const liberalRequired = req1?.교양소계 ?? 38
  const liberalEarned = liberalCourses.reduce((s, c) => s + c.credits, 0)

  /* ---------- Totals ---------- */
  const totalRequired = req1?.총이수학점 ?? 126
  const totalEarned = userCourses.reduce((s, c) => s + c.credits, 0)
  const completionRate = Math.round(Math.min(100, (totalEarned / totalRequired) * 100))

  /* ---------- Checklist ---------- */
  const major1OK = major1Areas.every(a => a.missing === 0)
  const major2OK = !major2Data || major2Data.areas.every(a => a.missing === 0)
  const totalOK = totalEarned >= totalRequired

  return {
    /* GraduDiagno */
    completionRate,
    totalEarned,
    totalRequired,
    missingCreditsLabel: `${Math.max(0, totalRequired - totalEarned)}학점 부족`,
    remainingSemesters: Math.max(0, Math.ceil((totalRequired - totalEarned) / 18)),
    major1: { name: major1, required: major1Required, areas: major1Areas },
    major2: major2Data,
    liberalRequired,
    liberalEarned,
    liberalBasic: [
      { name: '글쓰기',  completed: liberalCourses.some(c => c.name.includes('글쓰기')) },
      { name: '채플',    completed: liberalCourses.some(c => c.name.includes('채플')) },
      { name: 'RC101',  completed: liberalCourses.some(c => c.name.includes('RC101') || c.name.includes('학교생활설계')) },
      { name: '사회참여', completed: liberalCourses.some(c => c.name.includes('사회참여') || c.name.includes('사회와봉사')) },
    ],
    liberalGeneral: [
      {
        name: `교양 이수현황 (${liberalEarned}/${liberalRequired})`,
        status: liberalEarned >= liberalRequired ? '이수완료' : `${liberalRequired - liberalEarned}학점 남음`,
        ok: liberalEarned >= liberalRequired,
      },
    ],
    checklist: [
      { text: `총 이수 학점 ${totalRequired}학점 달성`, status: totalOK ? '완료' : '미달', ok: totalOK },
      { text: `제1전공 (${major1}) 요건`, status: major1OK ? '완료' : '미달', ok: major1OK },
      ...(major2Data
        ? [{ text: `${multiMajorType} (${major2}) 요건`, status: major2OK ? '완료' : '미달', ok: major2OK }]
        : []),
      { text: '졸업 논문 / 어학 성적', status: '미제출', ok: false, warn: true },
    ],

    /* Home overview */
    overallRate: completionRate,
    earnedCredits: totalEarned,
    requiredCredits: totalRequired,
    missingCredits: Math.max(0, totalRequired - totalEarned),
    majorsOverview: [
      { name: `${major1} (제1전공)`, earned: major1Earned, required: major1Required },
      ...(major2Data
        ? [{ name: `${major2} (${multiMajorType})`, earned: major2Earned, required: major2Required }]
        : []),
    ],
  }
}
