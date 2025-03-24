const menuItems = [
  {
    title: "MENU",
    items: [
    
      {
        icon: "/home.png",
        label: "Dashboard",
        href: "/page/dashboard",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      
      {
        icon: "/parent.png",
        label: "Purchase",
        href: "/transaction/purchase",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/parent.png",
        label: "Sales",
        href: "/transaction/sales",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/parent.png",
        label: "Transfer",
        href: "/transaction/transfer",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/teacher.png",
        label: "Configs",
        visible: ["admin", "company_admin"],
        subItems: [
          {
            icon: "/teacher.png",
            label: "Products",
            href: "/configs/products",
            visible: ["admin", "company_admin"],
          },
          {
            icon: "/teacher.png",
            label: "Stores",
            href: "/configs/stores",
            visible: ["admin", "company_admin"],
          },
          {
            icon: "/student.png",
            label: "Price",
            href: "/configs/prices",
            visible: ["admin", "company_admin"],
          },
        ]
      },
      {
        icon: "/teacher.png",
        label: "Report",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance"],
        subItems: [
          {
            icon: "/parent.png",
            label: "Balance",
        href: "/report/balance",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance"],
          },
          {
            icon: "/parent.png",
            label: "Sales",
            href: "/report/daily-sales",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance"],
          },
          {
            icon: "/parent.png",
            label: "Purchase",
            href: "/report/daily-purchase",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance"],
          },
          {
            icon: "/parent.png",
            label: "Transfer",
            href: "/report/transfer",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance"],
          },
          // Add more report types as needed
        ]
      },
      {
        icon: "/teacher.png",
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
        icon: "/profile.png",
        label: "User",
        visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
        subItems: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
            visible: ["admin", "company_admin", "storeMan", "barMan", "finance", "user"],
      },
      {
        icon: "/logout.png",
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
import React, { useState } from 'react';
import { role } from '@/lib/data';
import { useRouter } from 'next/router';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LogoutButton from './LogoutButton';

const Menu = ({ isExpanded }) => {
  const [expandedItems, setExpandedItems] = useState({});
  const router = useRouter();

  const toggleExpand = (label) => {
    setExpandedItems(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const isActive = (href) => router.pathname === href;

  return (
    <div className='mt-4 text-sm'>
      {menuItems.map(section => (
        <div className='flex flex-col' key={section.title}>
          <span className={`text-gray-400 font-light transition-all duration-300 
            ${isExpanded ? 'opacity-100' : 'opacity-0 h-0'}`}>
            {section.title}
          </span>
          {section.items.map((item) => {
            if (item.visible.includes(role)) {
              if (item.subItems) {
                // Render expandable item with subitems
                return (
                  <div key={item.label}>
                    <button
                      onClick={() => toggleExpand(item.label)}
                      className={`w-full flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} 
                        text-gray-500 py-1 px-2 rounded-md hover:bg-lamaSkyLight 
                        ${expandedItems[item.label] ? 'bg-lamaSkyLight' : ''}`}
                    >
                      <div className='flex items-center gap-1'>
                        <Image src={item.icon} alt='' width={20} height={20} />
                        <span className={`transition-all duration-300 
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
                        {item.subItems.map(subItem => {
                          if (subItem.visible.includes(role)) {
                            return (
                              <Link
                                href={subItem.href}
                                key={subItem.label}
                                onClick={subItem.onClick ? (e) => subItem.onClick(e, router) : undefined}
                                className={`flex items-center gap-1 text-gray-500 py-1 px-2 rounded-md 
                                  hover:bg-lamaSkyLight ${isActive(subItem.href) ? 'bg-lamaSkyLight text-blue-600' : ''}`}
                              >
                                <Image src={subItem.icon} alt='' width={16} height={16} />
                                <span className={`transition-all duration-300 
                                  ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                                  {subItem.label}
                                </span>
                              </Link>
                            );
                          }
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              // Render regular menu item
              return (
                <Link
                  href={item.href}
                  key={item.label}
                  className={`flex items-center ${isExpanded ? 'justify-start' : 'justify-center'} 
                    gap-1 text-gray-500 py-1 px-2 rounded-md hover:bg-lamaSkyLight 
                    ${isActive(item.href) ? 'bg-lamaSkyLight text-blue-600' : ''}`}
                >
                  <Image src={item.icon} alt='' width={20} height={20} />
                  <span className={`transition-all duration-300 
                    ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            }
          })}
        </div>
      ))}
    </div>
  );
};

export default Menu;