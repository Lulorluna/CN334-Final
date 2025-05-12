'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    function checkAuth() {
      const token = localStorage.getItem('jwt_access');
      if (token && !isTokenExpired(token)) {
        setIsLoggedIn(true);
      } else {
        localStorage.removeItem('jwt_access');
        setIsLoggedIn(false);
      }
    }
    checkAuth();
    const interval = setInterval(checkAuth, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function updateCount() {
      const stored = JSON.parse(localStorage.getItem('cart') || '[]');
      const total = stored.reduce((sum, item) => sum + (item.quantity || 0), 0);
      setCartCount(total);
    }
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);


  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwt_access');
    setIsLoggedIn(false);
    router.push('/');
  };

  const categories = [
    { label: 'Raw', icon: '/icons/raw.png', href: '/product-list?category=Raw' },
    { label: 'Vegetable', icon: '/icons/vegetable.png', href: '/product-list?category=Vegetable' },
    { label: 'Fruit', icon: '/icons/fruit.png', href: '/product-list?category=Fruit' },
    { label: 'Seasoning', icon: '/icons/seasoning.png', href: '/product-list?category=Seasoning' },
    { label: 'RTE Food', icon: '/icons/rte.png', href: '/product-list?category=RTE%20Food' },
  ];

  const promotions = [
    { title: 'Ready to Eat', img: '/images/rte.jpg' },
    { title: 'Drink', img: '/images/drink.jpg' },
    { title: 'Fresh Food', img: '/images/fresh.jpg' },
  ];

  return (
    <div className="flex flex-col">
      <header className="fixed top-0 w-full bg-[#fff8e1] shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 relative group">
            <Image src="/images/logo.png" width={40} height={40} alt="Logo" />
            <span className="font-bold text-[#8b4513] relative">
              Meal of Hope
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-[#f4d03f] transition-all duration-300 group-hover:w-full"></span>
            </span>
          </Link>
          <nav className="flex gap-6">
            {['Home', 'About Us', 'Product'].map((text, idx) => {
              const href = text === 'Home' ? '/' : text === 'About Us' ? '/about' : '/product-list';
              return (
                <Link
                  key={idx}
                  href={href}
                  className="relative text-[#8b4513] font-semibold group"
                >
                  <span>
                    {text}
                    <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#f4d03f] group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
              );
            })}
          </nav>
          <div className="flex gap-4 items-center">
            {isLoggedIn ? (
              <>
                <Link
                  href="/order"
                  className="relative p-2 border border-[#8b4513] rounded-full hover:bg-[#f4d03f] transition-colors duration-200"
                >
                  🛒
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200"
                  >
                    <Image src="/icons/user.png" alt="Profile" width={40} height={40} />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border rounded-md shadow-lg z-50">
                      <Link
                        href="/myprofile"
                        className="block px-4 py-2 text-yellow-700 hover:bg-gray-100"
                        onClick={() => setDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-[#f4d03f] hover:bg-[#e6c02f] text-[#8b4513] font-bold px-4 py-2 rounded-full transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="h-20" />

      <section className="relative h-[600px] w-full">
        <Image src="/images/banner.jpg" alt="Banner" fill className="object-cover" />
      </section>

      <section className="container mx-auto px-4 mt-10">
        <h3 className="text-2xl font-bold mb-6">Promotion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {promotions.map((promo, idx) => (
            <div key={idx} className="rounded-lg overflow-hidden shadow hover:shadow-md transition-shadow duration-200">
              <Image src={promo.img} alt={promo.title} width={400} height={250} className="w-full h-auto" />
              <div className="p-4 text-center">
                <div className="font-bold">Category</div>
                <div>{promo.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12">
        <h3 className="text-2xl font-bold mb-6">Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-items-center">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              href={cat.href}
              className="flex flex-col items-center hover:text-yellow-500 transform hover:scale-105 transition-transform duration-200"
            >
              <div className="w-16 h-16 relative">
                <Image src={cat.icon} alt={cat.label} fill className="object-contain" />
              </div>
              <span className="mt-2 text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 mt-12 mb-12">
        <h3 className="text-2xl font-bold mb-6">Reviews</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="border rounded-lg p-4 shadow">
              <div className="font-bold mb-2">Username</div>
              <p>Comment</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-100 py-6">
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4].map((_, idx) => (
            <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
          ))}
        </div>
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
          <span>About us</span>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="relative text-gray-600 font-medium group mt-2 sm:mt-0"
          >
            <span className="relative inline-block px-1">
              Back to top ↑
              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gray-500 group-hover:w-full transition-all duration-300" />
            </span>
          </button>
        </div>
      </footer>
    </div>
  );
}