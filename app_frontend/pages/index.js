'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

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
      <header className="fixed top-0 w-full bg-[#fdf6e3] shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between p-4">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Image src="/images/logo.png" width={40} height={40} alt="Logo" />
              <span className="relative text-xl font-bold text-gray-800 px-1">
                Meal of Hope
                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-hover:w-full transition-all duration-300" />
              </span>
            </Link>

            <nav className="flex gap-6">
              {['Home', 'About Us', 'Product'].map((text, idx) => {
                const href = text === 'Home' ? '/' : text === 'About Us' ? '/about' : '/product-list';
                return (
                  <Link key={idx} href={href} className="relative text-gray-800 font-semibold group">
                    <span className="relative inline-block px-1">
                      {text}
                      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex gap-4 items-center">
            <Link href="/order" className="relative p-2 border rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out">
              🛒
            </Link>
            {isLoggedIn ? (
              <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200">
                <Image src="/images/user-profile.jpg" alt="Profile" width={40} height={40} />
              </Link>
            ) : (
              <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200 ease-in-out text-white font-bold px-4 py-2 rounded-full">
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