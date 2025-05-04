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
  {
    title: "USER",
    items: [
      {
        icon: "/menu-icon/user.svg",
        label: "User",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
        subItems: [
      {
        icon: "/menu-icon/profile.svg",
        label: "Profile",
        href: "/profile",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/menu-icon/logout.svg",
        label: "Logout",
            href: "#",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
            onClick: async (e, router) => {
              e.preventDefault();
              try {
                console.log("Logging out...");
                const response = await fetch('/api/users/logout', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' }
                });
                
                if (response.ok) {
                  const result = await response.json();
                  
                  // Force page reload to clear state
                  window.location.href = '/login';
                } else {
                  console.error('Logout failed:', response.status);
                  // Fallback to redirect even if the API fails
                  window.location.href = '/login';
                }
              } catch (error) {
                console.error('Logout error:', error);
                // Fallback to redirect even if there's an error
                window.location.href = '/login';
              }
            }
          }
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

  if (!mounted) {
    return <div className="mt-4"></div>;
  }

  return (
    <div className='mt-4 text-sm'>
      {menuItems.map(section => (
        <div className='flex flex-col gap-1.5' key={section.title}>
          <span className={`text-[#0d3761] font-light transition-all duration-300 
            ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
            {section.title}
          </span>
          {section.items.map((item) => {
            // Only render if user has permission
            if (isVisible(item.visible)) {
              if (item.subItems) {
                // Filter subItems based on visibility
                const visibleSubItems = item.subItems.filter(subItem => 
                  isVisible(subItem.visible)
                );

                // Only render if there are visible subItems
                if (visibleSubItems.length > 0) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleExpand(item.label)}
                        className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} 
                          text-gray-500 py-1 px-2 rounded-md hover:bg-lamaSkyLight 
                          ${expandedItems[item.label] ? 'bg-primary-50' : ''}`}
                      >
                        <div className='flex items-center gap-1'>
                          <Image src={item.icon} alt='' width={20} height={20} color='#135392'/>
                          <span className={`transition-all duration-300 text-[#135392] font-semibold
                            ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                            {item.label}
                          </span>
                        </div>
                        {isExpanded && (
                          <span>
                            {expandedItems[item.label] ? 
                              <KeyboardArrowUpIcon fontSize="small" /> : 
                              <KeyboardArrowDownIcon fontSize="small" />
                            }
                          </span>
                        )}
                      </button>
                      {expandedItems[item.label] && isExpanded && (
                        <div className='ml-7 lg:ml-8 flex flex-col'>
                          {visibleSubItems.map(subItem => (
                            <Link
                              href={subItem.href}
                              key={subItem.label}
                              onClick={subItem.onClick ? (e) => subItem.onClick(e, router) : undefined}
                              className={`flex items-center gap-1 text-gray-500 py-1 px-2 rounded-md 
                                hover:bg-lamaSkyLight ${isActive(subItem.href) ? 'bg-lamaSkyLight text-[#739dc7]' : ''}`}
                            >
                              <Image src={subItem.icon} alt='' width={16} height={16} color='#135392'/>
                              <span className={`transition-all duration-300 
                                ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                {subItem.label}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
              } else {
                // Regular menu item
                return (
                  <Link
                    href={item.href}
                    key={item.label}
                    className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} 
                      gap-1 text-[#114a82] font-semibold text-[16px] py-1 px-2 rounded-md hover:bg-primary-50 
                      tracking-wide ${isActive(item.href) ? 'bg-primary-50 text-blue-600' : ''}`}
                  >
                    <Image src={item.icon} alt='' width={25} height={25} />
                    <span className={`transition-all duration-300 
                      ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              }
            }
            return null; // Don't render items user doesn't have access to
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;