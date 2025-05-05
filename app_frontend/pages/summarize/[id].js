'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function SummarizePage() {
    const router = useRouter();
    const { id: orderIdParam } = router.query;
    const [orderData, setOrderData] = useState(null);
    const [orderId, setOrderId] = useState('');
    const [orderDate, setOrderDate] = useState('');
    const [loading, setLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt_access');
        if (!token || isTokenExpired(token)) {
            router.replace('/login');
        }
    }, [router]);

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
        if (!orderIdParam) return;
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('jwt_access');
            if (!token) { setLoading(false); return; }
            try {
                const res = await fetch(`http://127.0.0.1:3341/api/order/${orderIdParam}/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) throw new Error('การดึงคำสั่งซื้อล้มเหลว');
                const order = await res.json();
                setOrderId(order.id);
                setOrderDate(new Date(order.create_at).toLocaleDateString('th-TH', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }));

                const cart = order.items.map(item => ({
                    id: item.product,
                    name: item.name,
                    price: parseFloat(item.price),
                    quantity: item.quantity
                }));
                const shipping = parseFloat(order.shipping_fee);
                const totalPrice = parseFloat(order.total_price);
                let address = 'ไม่พบที่อยู่';
                if (order.shipping_address) {
                    const data_addr = await fetch(
                        `http://127.0.0.1:3342/api/address/${order.shipping_address}/`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (data_addr.ok) {
                        const { data: addr } = await data_addr.json();
                        address = `${addr.receiver_name}, ${addr.house_number}, ${addr.district}, ${addr.province} ${addr.post_code}`;
                    }
                }

                setOrderData({ cart, totalPrice, shipping, address, shippingMethod: order.shipping_method });
            } catch (err) {
                console.error(err);
                setOrderData(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [orderIdParam]);

    if (loading) return (
        <div className="min-h-screen flex justify-center items-center bg-[url('/images/bg.png')] bg-cover text-2xl text-yellow-700">
            กำลังโหลดข้อมูลคำสั่งซื้อ...
        </div>
    );
    if (!orderData) return (
        <div className="min-h-screen flex justify-center items-center text-red-600 bg-[url('/images/bg.png')] bg-cover">
            <div className="bg-white/80 p-6 rounded-lg shadow-lg backdrop-blur-md">ไม่พบข้อมูลคำสั่งซื้อ</div>
        </div>
    );

    const { cart, totalPrice, shipping, address, shippingMethod } = orderData;
    const grandTotal = totalPrice + shipping;

    return (
        <div className="relative flex flex-col min-h-screen bg-[url('/images/bg.png')] bg-cover bg-center">
            <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-0"></div>

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
                    <div className="flex gap-4">
                        {isLoggedIn ? (
                            <>
                                <Link href="/order" className="p-2 border border-[#8b4513] rounded-full hover:bg-[#f4d03f] transition-colors duration-200">🛒</Link>
                                <Link href="/myprofile" className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200">
                                    <Image src="/icons/user.png" alt="Profile" width={40} height={40} />
                                </Link>
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

            <main className="relative w-full max-w-6xl mx-auto py-16 px-8 animate-fade-in-down z-10">
                <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900">📦 ติดตามคำสั่งซื้อของคุณ</h1>

                <div className="mx-auto w-full max-w-4xl bg-white/90 p-8 rounded-3xl shadow-xl backdrop-blur-lg border border-white/40 space-y-8">
                    <div className="text-gray-900 space-y-2 text-lg">
                        <p>รหัสคำสั่งซื้อ: <span className="font-bold text-yellow-600">{orderId}</span></p>
                        <p>วันที่สั่งซื้อ: <span className="font-bold text-yellow-600">{orderDate}</span></p>
                    </div>

                    <div className="relative flex items-center justify-between gap-6 mt-8">
                        {[
                            { label: 'ชำระเงินแล้ว', icon: '💳' },
                            { label: 'เตรียมสินค้า', icon: '📦' },
                            { label: 'จัดส่งแล้ว', icon: '🚚' },
                            { label: 'สำเร็จ', icon: '✅' }
                        ].map((step, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center text-sm text-gray-800 relative z-10 group">
                                <div className={`w-20 h-20 flex items-center justify-center rounded-full text-3xl font-bold transition-all duration-500 ${idx <= 1 ? 'bg-yellow-500 text-white shadow-md' : 'bg-gray-200 text-gray-600'} group-hover:scale-110`}>
                                    {step.icon}
                                </div>
                                <span className="mt-4 font-semibold">{step.label}</span>
                            </div>
                        ))}
                        <div className="absolute top-10 left-20 right-20 h-2 bg-gray-200/50 rounded-full">
                            <div className="h-full bg-yellow-500 rounded-full w-1/2 transition-all duration-1000 ease-in-out"></div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow hover:shadow-lg">
                                <div className="flex items-center gap-4">
                                    <Image src={`/images/product-${item.id}.jpg`} width={80} height={80} alt={item.name} className="rounded-lg" />
                                    <div>
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-gray-600">฿{item.price.toLocaleString()} x {item.quantity}</p>
                                    </div>
                                </div>
                                <p className="font-semibold text-lg">฿{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                        ))}
                    </div>

                    <div className="text-right space-y-1 text-lg font-bold">
                        <p>รวมสินค้า: <span className="text-yellow-600">฿{totalPrice.toLocaleString()}</span></p>
                        <p>ค่าจัดส่ง: <span className="text-yellow-600">฿{shipping.toLocaleString()}</span></p>
                        <p className="text-2xl text-red-500">รวมทั้งหมด: ฿{grandTotal.toLocaleString()}</p>
                    </div>

                    <div className="space-y-2 text-base text-gray-900">
                        <p><span className="font-bold text-yellow-600">ที่อยู่จัดส่ง:</span> {address}</p>
                        <p><span className="font-bold text-yellow-600">วิธีการจัดส่ง:</span> {shippingMethod}</p>
                    </div>

                    <div className="text-center">
                        <Link href="/">
                            <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold shadow hover:shadow-lg transition">กลับหน้าหลัก</button>
                        </Link>
                    </div>
                </div>
            </main>

            <footer className="mx-auto w-full max-w-6xl bg-gray-800/90 py-8 mt-auto border-t-4 border-yellow-500 text-gray-200">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <p>Meal of Hope © 2025</p>
                    <div className="flex justify-center gap-4">
                        {['📘', '📸', '🐦'].map((icon, i) => <a key={i} href="#" className="hover:text-yellow-500 text-2xl transition">{icon}</a>)}
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes pulse-slow {
          0%,100%{transform:scale(1);}50%{transform:scale(1.05);}
        }
        .pulse-slow {animation:pulse-slow 2s infinite;}
      `}</style>
        </div>
    );
}
