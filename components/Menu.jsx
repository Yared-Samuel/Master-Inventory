"use client";

const menuItems = [
  {
    title: "MENU",
    items: [
    
      {
        icon: "/menu-icon/home.svg" ,
        label: "Dashboard",
        href: "/page/dashboard",
        visible: ["admin", "company_admin"],
      },
      
      {
        icon: "/menu-icon/purchase.svg",
        label: "Purchase",
        href: "/transaction/purchase",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/menu-icon/sales.svg",
        label: "Sales",
        href: "/transaction/sales",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/menu-icon/use.svg",
        label: "Use",
        href: "/transaction/use",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/menu-icon/transfer.svg",
        label: "Transfer",
        href: "/transaction/transfer",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/menu-icon/setting.svg",
        label: "Configs",
        visible: ["admin", "company_admin"],
        subItems: [
          {
            icon: "/menu-icon/config.svg",
            label: "Products",
            href: "/configs/products",
            visible: ["admin", "company_admin"],
          },
          {
            icon: "/menu-icon/store-config.svg",
            label: "Stores",
            href: "/configs/stores",
            visible: ["admin", "company_admin"],
          },
          // {
          //   icon: "/menu-icon/price-config.svg",
          //   label: "Price",
          //   href: "/configs/prices",
          //   visible: ["admin", "company_admin"],
          // },
        ]
      },
      {
        icon: "/menu-icon/report.svg",
        label: "Report",
        visible: ["admin", "company_admin"],
        subItems: [
          {
            icon: "/menu-icon/balance.svg",
            label: "Balance",
        href: "/report/balance",
            visible: ["admin", "company_admin"],
          },
          {
            icon: "/menu-icon/sales.svg",
            label: "Sales",
            href: "/report/daily-sales",
            visible: ["admin", "company_admin"],
          },
          {
            icon: "/menu-icon/purchase.svg",
            label: "Purchase",
            href: "/report/daily-purchase",
            visible: ["admin", "company_admin"],
          },
         
          // Add more report types as needed
        ]
      },
      {
        icon: "/menu-icon/admin.svg",
        label: "Admin",
        visible: ["admin"],
        subItems: [
          {
            icon: "/teacher.png", 
            label: "Companies",
            href: "/admin/companies",
            visible: ["admin"],
          },
          {
            icon: "/teacher.png",
            label: "Users",
            href: "/admin/users",
            visible: ["admin"],
          },
          {
            icon: "/teacher.png",
            label: "System Settings",
            href: "/admin/settings",
            visible: ["admin"],
          },
        ]
      },
    ],
  },
];
import Image from 'next/image';
import Link from 'next/link';
import React, { useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AuthContext from '@/pages/context/AuthProvider';
  
const Menu = ({ isExpanded }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const router = useRouter();
  const { auth } = useContext(AuthContext);
  const userRole = auth.role;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isActive = (href) => router.pathname === href;

  // Check if an item should be visible for the current user's role
  const isVisible = (allowedRoles) => {
   
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  // Logout handler
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      window.location.href = '/login';
    } catch (error) {
      window.location.href = '/login';
    }
  };

  if (!mounted) {
    return <div className="mt-4"></div>;
  }

  return (
    <aside
      className={`h-full ${isExpanded ? 'w-64' : 'w-20'} bg-gradient-to-b from-blue-50 to-white shadow-xl rounded-xl flex flex-col transition-all duration-300 border border-blue-100`}
      aria-label="Sidebar navigation"
    >
      {/* Logo/Header is now handled by Layout */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar pt-2">
        {menuItems.map(section => (
          <div className="mb-3" key={section.title}>
            <span className={`block text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2 px-2 transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>{section.title}</span>
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                if (isVisible(item.visible)) {
                  if (item.subItems) {
                    const visibleSubItems = item.subItems.filter(subItem => isVisible(subItem.visible));
                    if (visibleSubItems.length > 0) {
                      return (
                        <div key={item.label} className="">
                          <button
                            onClick={() => toggleExpand(item.label)}
                            className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} text-blue-700 py-2 px-3 rounded-lg hover:bg-blue-100/70 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 ${expandedItems[item.label] ? 'bg-blue-100/80' : ''}`}
                            aria-expanded={expandedItems[item.label]}
                            aria-label={item.label}
                          >
                            <div className={`flex items-center gap-2 ${!isExpanded ? 'justify-center w-full' : ''}`}>
                              <Image src={item.icon} alt="" width={22} height={22} />
                              {isExpanded && (
                                <span className="transition-all duration-300 text-blue-900 font-medium">{item.label}</span>
                              )}
                            </div>
                            {isExpanded && (
                              <span>
                                {expandedItems[item.label] ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                              </span>
                            )}
                          </button>
                          {expandedItems[item.label] && isExpanded && (
                            <div className="ml-7 lg:ml-8 flex flex-col border-l border-blue-100 pl-3 mt-1">
                              {visibleSubItems.map(subItem => (
                                <Link
                                  href={subItem.href}
                                  key={subItem.label}
                                  onClick={subItem.onClick ? (e) => subItem.onClick(e, router) : undefined}
                                  className={`flex items-center gap-2 text-blue-700 py-1.5 px-2 rounded-md hover:bg-blue-50 transition-colors duration-200 ${isActive(subItem.href) ? 'bg-blue-100 text-blue-900 font-semibold' : ''}`}
                                  aria-label={subItem.label}
                                >
                                  <Image src={subItem.icon} alt='' width={16} height={16} />
                                  {isExpanded && (
                                    <span className="transition-all duration-300">{subItem.label}</span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                  } else {
                    return (
                      <Link
                        href={item.href}
                        key={item.label}
                        className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} gap-2 text-blue-800 font-medium text-base py-2 px-3 rounded-lg hover:bg-blue-100/70 transition-colors duration-200 tracking-wide ${isActive(item.href) ? 'bg-blue-100 text-blue-900 font-semibold' : ''}`}
                        aria-label={item.label}
                        tabIndex={0}
                        title={!isExpanded ? item.label : undefined}
                      >
                        <span className="flex items-center justify-center w-8 h-8">
                          <Image src={item.icon} alt='' width={22} height={22} />
                        </span>
                        {isExpanded && (
                          <span className="transition-all duration-300">{item.label}</span>
                        )}
                      </Link>
                    );
                  }
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {/* User info and actions at the bottom, now inside scrollable nav */}
        <div className="pt-4 border-t border-blue-100 flex flex-col items-center gap-2 px-2 pb-2">
          <span className="flex items-center justify-center w-10 h-10">
            <Image src="/menu-icon/user.svg" alt="User" width={32} height={32} className="rounded-full border border-blue-200" />
          </span>
          {isExpanded && (
            <>
              <div className="flex flex-col items-center transition-all duration-300 mb-2">
                <span className="text-blue-900 font-semibold text-sm truncate max-w-[120px]">{auth?.name}</span>
                <span className="text-xs text-blue-500 truncate max-w-[120px]">{auth?.role}</span>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-blue-700 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors duration-200 w-full"
                  aria-label="Profile"
                >
                  <Image src="/menu-icon/user.svg" alt="Profile" width={16} height={16} />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-blue-700 py-1 px-2 rounded-md hover:bg-blue-50 transition-colors duration-200 w-full"
                  aria-label="Logout"
                >
                  <Image src="/menu-icon/logout.svg" alt="Logout" width={16} height={16} />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </nav>
    </aside>
  );
};

export default Menu;