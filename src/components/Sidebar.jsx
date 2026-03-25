import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: "📋" },
  { to: "/folders", label: "Folders", icon: "📁" },
  { to: "/rules", label: "Rules", icon: "⚙️" },
  { to: "/history", label: "History", icon: "🕐" },
  { to: "/settings", label: "Settings", icon: "🔧" },
];

export default function Sidebar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-brand">DeskButler</div>
      <ul className="sidebar-links">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " active" : "")
              }
              end={link.to === "/"}
            >
              <span className="sidebar-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
