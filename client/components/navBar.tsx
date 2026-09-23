"use client";
import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, User, LayoutDashboard, LogIn, LogOut, Menu, X, MessageCircle } from 'lucide-react';
import { useAuth } from "@/context/authContext";
import Logo from './logo'

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

 /* const navItems = [
    { label: "Home", icon: Home, href: "/", onClick: null },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      onClick: null,
    },
    { label: "Profile", icon: User, href: "/profile", onClick: null },
    user
      ? { label: "Logout", icon: LogOut, href: null, onClick: logout }
      : { label: "Login", icon: LogIn, href: "/login", onClick: null },
  ];*/

  const navItems = [
    { label: "Home", icon: Home, href: "/", onClick: null },
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      onClick: null,
    },
    { label: "Profile", icon: User, href: "/profile", onClick: null },
    ...(user
      ? [
          {
            label: "Support",
            icon: MessageCircle,
            href: "/chat",
            onClick: null,
          },
        ]
      : []),
    user
      ? { label: "Logout", icon: LogOut, href: null, onClick: logout }
      : { label: "Login", icon: LogIn, href: "/login", onClick: null },
  ];


  
  return (
    <nav className="w-full bg-black text-white px-4 py-3 flex items-center justify-between relative z-50">
      
      <Logo />

      {/* Desktop nav */}
      <div className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <NavButton key={item.label} item={item} />
        ))}
      </div>

      {/* Mobile toggle */}
      <button className="md:hidden" onClick={() => setOpen(!open)}>
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 w-full bg-black flex flex-col gap-2 p-4 md:hidden"
          >
            {navItems.map((item) => (
              <NavButton
                key={item.label}
                item={item}
                onNavigate={() => setOpen(false)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function NavButton({
  item,
  onNavigate,
}: {
  item: {
    label: string;
    icon: any;
    href: string | null;
    onClick: (() => void) | null;
  };
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  const content = (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
    >
      <Icon size={18} className="text-orange-500" />
      <span className="text-sm font-medium">{item.label}</span>
    </motion.div>
  );

  if (item.href) {
    return (
      <Link href={item.href} onClick={onNavigate}>
        {content}
      </Link>
    );
  }

  return (
    <button
      onClick={() => {
        item.onClick?.();
        onNavigate?.();
      }}
    >
      {content}
    </button>
  );
}
