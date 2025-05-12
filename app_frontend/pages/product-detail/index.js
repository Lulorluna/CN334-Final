'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { getProductUrl } from '@/baseurl';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function ProductDetailPage() {
    const router = useRouter();
    const { product: id } = router.query;

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0)
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
            const stored = JSON.parse(localStorage.getItem('cart') || '[]')
            const total = stored.reduce((sum, i) => sum + (i.quantity || 0), 0)
            setCartCount(total)
        }
        updateCount()
        window.addEventListener('storage', updateCount)
        return () => window.removeEventListener('storage', updateCount)
    }, [])

    useEffect(() => {
        if (!id) return;
        async function fetchProduct() {
            try {
                const response = await axios.get(`${getProductUrl()}/api/product/${id}/`);
                setProduct(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Product not found');
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

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

    const handleConfirm = async () => {
        if (!isLoggedIn) {
            router.push('/login');
        } else if (product?.available && product.stock > 0) {
            try {
                const token = localStorage.getItem('jwt_access');
                await axios.post(
                    `${getProductUrl()}/api/cart/add/`,
                    {
                        product_id: product.id,
                        quantity: quantity,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const prev = JSON.parse(localStorage.getItem('cart') || '[]')
                const idx = prev.findIndex(i => i.id === product.id)
                if (idx >= 0) {
                    prev[idx].quantity += quantity
                } else {
                    prev.push({ id: product.id, quantity })
                }
                localStorage.setItem('cart', JSON.stringify(prev))
                alert('เพิ่มสินค้าลงตะกร้าเรียบร้อยแล้ว');
            } catch (err) {
                alert('ไม่สามารถเพิ่มสินค้าได้');
                console.error(err);
            }
            router.push('/product-list');
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/bg.png')" }}>
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
                                    className="relative p-2 border rounded-full hover:bg-[#f4d03f]"
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

            <main className="flex-grow pt-28 px-6">
                <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    <div className="flex justify-center items-center w-full md:w-1/2">
                        <Image src={product.image || '/images/placeholder.png'} alt={product.name} width={300} height={300} className="rounded-lg" />
                    </div>
                    <div className="flex flex-col space-y-4 w-full md:w-1/2">
                        <h2 className="text-2xl font-bold">{product.name}</h2>
                        <p className="bg-gray-100 p-4 rounded-lg text-center">{product.detail}</p>
                        <p>Exp: <span>{new Date(product.expiration_date).toLocaleDateString()}</span></p>
                        <p className={`font-bold ${product.available ? 'text-green-600' : 'text-red-600'}`}>
                            {product.available ? 'มีสินค้า' : 'สินค้าหมด'}
                        </p>
                        <p className="text-red-600 font-bold text-xl">฿ {product.price.toLocaleString()}</p>

                        <div className="flex items-center space-x-4">
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                disabled={!product.available || quantity <= 1}
                            >-</button>
                            <span className="px-4">{quantity}</span>
                            <button
                                className="px-3 py-1 border rounded disabled:opacity-50"
                                onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                disabled={!product.available || quantity >= product.stock}
                            >+</button>
                        </div>

                        <button
                            className="bg-green-500 hover:bg-green-600 text-white py-2 rounded-full font-bold disabled:opacity-50"
                            onClick={handleConfirm}
                            disabled={!product.available || product.stock <= 0}
                        >
                            ยืนยันสินค้า
                        </button>
                    </div>
                </div>
            </main>

            <footer className="bg-gray-100 mt-10 py-6 text-center text-sm text-gray-600">
                <div className="flex justify-center space-x-2 mb-3">
                    {[1, 2, 3, 4].map(i => (
                        <span key={i} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
                    <span>About us</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline relative inline-block px-1 group">
                        Back to top ↑
                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gray-500 group-hover:w-full transition-all duration-300" />
                    </button>
                </div>
            </footer>
        </div>
    );
}