'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

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
        if (!id) return;
        async function fetchProduct() {
            try {
                const response = await axios.get(`http://127.0.0.1:3341/api/product/${id}/`);
                setProduct(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Product not found');
                setLoading(false);
            }
        }
        fetchProduct();
    }, [id]);

    const handleConfirm = () => {
        if (!isLoggedIn) {
            router.push('/login');
        } else if (product?.available && product.stock > 0) {
            router.push(`/order?product=${product.id}&quantity=${quantity}`);
        }
    };

    if (loading) return <p className="p-6">Loading...</p>;
    if (error) return <p className="p-6 text-red-600">{error}</p>;

    return (
        <div className="flex flex-col min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/images/bg.png')" }}>
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

                        <label className="inline-flex items-center mt-2 space-x-2">
                            <input type="checkbox" className="form-checkbox" disabled={!product.available} />
                            <span>Add to Cart</span>
                        </label>

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