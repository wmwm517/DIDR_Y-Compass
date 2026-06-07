import symbol from '../assets/symbol.png'

export default function Header({ title, brandPrefix, showIcon = true, variant = 'light', onBell }) {
  return (
    <header className={`header header--${variant}`}>
      <div className="header__brand">
        {showIcon && !brandPrefix && (
          <img src={symbol} alt="Y-Compass" className="header__icon" />
        )}
        {brandPrefix && (
          <span className="header__brand-prefix">{brandPrefix}</span>
        )}
        <span className="header__title">{title}</span>
      </div>
      {onBell && (
        <button className="header__bell" onClick={onBell} aria-label="알림">
          🔔
        </button>
      )}
    </header>
  )
}
