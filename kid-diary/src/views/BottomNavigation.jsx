export function BottomNavigation({ activeRoute, items, onNavigate }) {
  return (
    <nav className="bottom-navigation" aria-label="Main navigation">
      {items.map((item) => (
        <button
          className="nav-item"
          key={item.id}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </nav>
  )
}