import { NavLink } from 'react-router-dom';

const systems = [
  { label: 'POS', path: '/pos' },
  { label: 'Orders', path: '/orders' },
  { label: 'Print Orders', path: '/print-orders' },
  { label: 'Rental', path: '/rentals' },
  { label: 'Toga Rental', path: '/toga-rentals' },
  { label: 'ID Management', path: '/staff-management' },
];

const SystemNavigation = ({ dark = false, header = false }) => {
  if (header) {
    return (
      <nav aria-label="System navigation" className="flex items-center gap-1">
        {systems.map(({ label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `border-b-2 px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
              isActive
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-gray-500 hover:border-emerald-300 hover:text-gray-900'
            }`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    );
  }

  return (
    <div>
      <p className={`mb-1 text-sm font-semibold ${dark ? 'text-gray-400' : 'text-gray-700'}`}>System</p>
      <nav aria-label="System navigation" className="flex w-fit max-w-full flex-wrap overflow-hidden rounded-xl border-2 border-emerald-600 bg-white shadow-sm">
      {systems.map(({ label, path }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300 ${
            isActive
              ? 'bg-emerald-600 text-white'
              : 'text-gray-700 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          {label}
        </NavLink>
      ))}
      </nav>
    </div>
  );
};

export default SystemNavigation;
