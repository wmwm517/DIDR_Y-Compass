import { useState, useEffect } from 'react'
import '../../style/Intro.css'
import symbol from '../../assets/symbol.png'
import logotype from '../../assets/logotype.png'

const DURATIONS = [1200, 1400, 1000]

export default function Intro({ onDone }) {
  const [step, setStep] = useState(1)

  useEffect(() => {
    const t = setTimeout(() => {
      if (step < 3) setStep(s => s + 1)
      else onDone()
    }, DURATIONS[step - 1])
    return () => clearTimeout(t)
  }, [step, onDone])

  return (
    <div className="intro-screen">
      {step === 1 && (
        <img key="s1" src={symbol} alt="" className="intro-screen__symbol" />
      )}

      {step === 2 && (
        <div key="s2" className="intro-screen__logo-group">
          <img src={symbol} alt="" className="intro-screen__sym-slide" />
          <img src={logotype} alt="Y-Compass" className="intro-screen__logotype" />
        </div>
      )}

      {step === 3 && (
        <div key="s3" className="intro-screen__step3">
          <p className="intro-screen__tagline">당신의 졸업을 가르키는 나침반,</p>
          <div className="intro-screen__logo-group">
            <img src={symbol} alt="" className="intro-screen__sym-static" />
            <img src={logotype} alt="Y-Compass" className="intro-screen__logotype intro-screen__logotype--static" />
          </div>
        </div>
      )}
    </div>
  )
}
