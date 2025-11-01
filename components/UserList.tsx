
import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  items: NavItem[];
  activePage: string;
  setActivePage: (pageId: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ items, activePage, setActivePage }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 bg-white border-t border-gray-200/80 flex justify-around items-center shadow-top">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActivePage(item.id)}
          className={`flex flex-col items-center justify-center text-xs w-full transition-colors h-full ${
            activePage === item.id ? 'text-brand-primary' : 'text-brand-text-secondary'
          }`}
        >
          <div className={`w-7 h-7 mb-1 ${activePage === item.id ? '[&>svg]:stroke-brand-primary' : '[&>svg]:stroke-brand-text-secondary'}`}>
            {item.icon}
          </div>
          <span className={activePage === item.id ? 'font-bold' : 'font-medium'}>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BottomNav;