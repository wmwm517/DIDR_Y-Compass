import { createContext, useContext, useState } from 'react'
import defaultProfile from '../data/user.json'
import rawUserCourses from '../data/userCourses.json'
import { enrichUserCourses } from '../data/graduationEngine'

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [profile, setProfile] = useState(defaultProfile)
  const [courses, setCourses] = useState(() => enrichUserCourses(rawUserCourses))

  return (
    <UserContext.Provider value={{ profile, setProfile, courses, setCourses }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
