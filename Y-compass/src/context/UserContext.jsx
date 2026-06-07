import { createContext, useContext, useState } from 'react'
import { currentUser, allCourses } from '../data/dummyData'

const UserContext = createContext(null)

export const defaultProfile = {
  name: currentUser.name,
  studentId: currentUser.studentId,
  email: currentUser.email,
  admissionYear: currentUser.admissionYear,
  major1: currentUser.major1.name,
  multiMajorType: currentUser.major2.type, // '연계전공' | '복수전공' | '부전공' | '없음'
  major2: currentUser.major2.name,         // '' if '없음'
}

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile)
  const [courses, setCourses] = useState(allCourses)

  return (
    <UserContext.Provider value={{ profile, setProfile, courses, setCourses }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
