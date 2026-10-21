import logo from '../logo.js'
import { NavIcon } from './NavIcon.jsx'

export function SideNavigation({
  activeRoute,
  items,
  model,
  onNavigate,
  onSwitchFolder,
  quick,
}) {
  return (
    <nav className="side-navigation" aria-label="Main navigation">
      <img className="side-nav-logo" src={logo} alt={model.appName} />

      {/* Quick memory: the button turns into "Close" while its menu is open */}
      <div className="quick-memory">
        <button
          aria-expanded={quick.open}
          className={`new-memory-button${quick.open ? ' is-open' : ''}`}
          onClick={quick.onToggle}
          type="button"
        >
          {quick.open ? (
            <>
              <NavIcon name="close" size={16} />
              {quick.model.closeLabel}
            </>
          ) : (
            <>
              <span aria-hidden="true">+</span> {model.newMemoryLabel}
            </>
          )}
        </button>

        {quick.open && (
          <div className="quick-menu" role="menu">
            <div className="quick-menu-title">{quick.model.title}</div>
            {quick.model.options.map((option) => (
              <button
                className="quick-option"
                key={option.id}
                onClick={() => quick.onPick(option)}
                role="menuitem"
                type="button"
              >
                <span className={`quick-option-tile quick-option-tile--${option.id}`}>
                  <NavIcon name={option.icon} size={18} />
                </span>
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <ul className="side-nav-list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              aria-current={item.id === activeRoute ? 'page' : undefined}
              className={`nav-item${item.id === activeRoute ? ' nav-item--active' : ''}`}
              onClick={() => onNavigate(item.id)}
              type="button"
            >
              <span className="nav-item-icon">
                <NavIcon name={item.icon} />
              </span>
              {item.label}
            </button>
          </li>
        ))}
      </ul>

      <button className="folder-switcher" onClick={onSwitchFolder} type="button">
        <span className="folder-switcher-avatar" aria-hidden="true">{model.childInitial}</span>
        <span className="folder-switcher-text">
          <strong>{model.childName}</strong>
          <small>{model.switchFolderLabel}</small>
        </span>
        <span aria-hidden="true">⇅</span>
      </button>
    </nav>
  )
}
