'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

export default function OrderSummaryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const productId = searchParams.get('product');
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);

    const [cart, setCart] = useState([]);
    const [hasAdded, setHasAdded] = useState(false);
    const [fullProducts, setFullProducts] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [shippings, setShippings] = useState([]);
    const [selectedShippingId, setSelectedShippingId] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(stored);
    }, []);

    useEffect(() => {
        if (productId && !hasAdded) {
            const idNum = Number(productId);
            setCart(prev => {
                const idx = prev.findIndex(i => i.id === idNum);
                let updated = [...prev];
                if (idx >= 0) updated[idx].quantity += quantity;
                else updated.push({ id: idNum, quantity });
                localStorage.setItem('cart', JSON.stringify(updated));
                return updated;
            });
            setHasAdded(true);
        }
    }, [productId, quantity, hasAdded]);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt_access');
            const valid = !!token && !isTokenExpired(token);
            setIsLoggedIn(valid);

            if (!valid && router.pathname !== '/login') {
                localStorage.removeItem('jwt_access');
                router.push('/login');
            }
        };

        checkAuth();
        const id = setInterval(checkAuth, 60000);

        return () => clearInterval(id);
    }, [router]);


    useEffect(() => {
        if (!isLoggedIn) return;
        (async () => {
            try {
                const token = localStorage.getItem('jwt_access');
                const res = await fetch('http://127.0.0.1:3341/api/cart/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { cart_orders } = await res.json();
                const formatted = cart_orders.flatMap(o =>
                    o.items.map(i => ({ id: i.product, quantity: i.quantity }))
                );
                setCart(formatted);
                localStorage.setItem('cart', JSON.stringify(formatted));
            } catch (e) {
                console.error(e);
            }
        })();
    }, [isLoggedIn]);


    useEffect(() => {
        if (!cart.length) return setFullProducts([]);
        (async () => {
            try {
                const details = await Promise.all(
                    cart.map(({ id }) =>
                        fetch(`http://127.0.0.1:3341/api/product/${id}/`)
                            .then(r => r.json())
                            .then(json => {
                                console.log(`Product ${id}:`, json);
                                return json;
                            })
                    )
                );
                console.log(details)
                const enriched = details.map((p, i) => ({
                    id: p.data.id,
                    name: p.data.name || '—',
                    image: p.data.image || '/images/placeholder.png',
                    price: Number(p.data.price) || 0,
                    quantity: cart[i].quantity,
                }));

                setFullProducts(enriched);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [cart]);

    useEffect(() => {
        (async () => {
            try {
                const token = localStorage.getItem('jwt_access');
                const headers = { Authorization: `Bearer ${token}` };
                const [ar, pr, sr] = await Promise.all([
                    fetch('http://127.0.0.1:3342/api/address/', { headers }),
                    fetch('http://127.0.0.1:3342/api/payment/', { headers }),
                    fetch('http://127.0.0.1:3341/api/shipping/', { headers }),
                ]);
                const { data: al = [] } = await ar.json(); setAddresses(al);
                const { data: pl = [] } = await pr.json(); setPayments(pl);
                const sj = await sr.json();
                const sl = Array.isArray(sj) ? sj : sj.data || [];
                setShippings(sl);
                if (sl.length) setSelectedShippingId(sl[0].id);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const updateQty = (id, qty) => {
        const updated = qty > 0
            ? cart.map(i => i.id === id ? { ...i, quantity: qty } : i)
            : cart.filter(i => i.id !== id);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const subtotal = fullProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const shipFee = shippings.find(s => s.id === Number(selectedShippingId))?.fee || 0;

    const handleConfirm = () => {
        alert('ยืนยันเรียบร้อย');
        localStorage.removeItem('cart');
        setCart([]);
        router.push('/');
    };

    return (
        <div className="flex flex-col min-h-screen bg-cover" style={{ backgroundImage: "url('/images/bg.png')" }}>
            {/* Navbar */}
            <header className="fixed top-0 w-full bg-[#fdf6e3] shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/logo.png" width={40} height={40} alt="Logo" />
                        <span className="font-bold text-gray-800">Meal of Hope</span>
                    </Link>
                    <nav className="flex gap-6">
                        {['Home', 'About Us', 'Product'].map((t, i) => (
                            <Link key={i} href={t === 'Home' ? '/' : t === 'About Us' ? '/about' : '/product-list'} className="text-gray-800 font-semibold hover:text-yellow-500 transition">{t}</Link>
                        ))}
                    </nav>
                    <div className="flex gap-4">
                        <Link href="/order" className="p-2 border rounded-full hover:bg-gray-100">🛒</Link>
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

            <main className="flex-grow container mx-auto p-4 mt-20 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-white/90 rounded-lg shadow">

                <div className="lg:col-span-2">
                    {fullProducts.length === 0 ? (
                        <div className="text-center text-red-500 py-10">ไม่มีสินค้าในตะกร้า</div>
                    ) : (
                        fullProducts.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-4 mb-4 border rounded bg-white shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-4">
                                    <Image src={item.image} width={60} height={60} alt={item.name} className="rounded" />
                                    <div>
                                        <h2 className="font-bold text-lg hover:text-yellow-600 transition">{item.name}</h2>
                                        <p className="text-gray-600">฿{item.price.toLocaleString()}</p>
                                        {console.log(item.name)}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQty(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50">−</button>
                                    <span className="font-medium">{item.quantity}</span>
                                    <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded hover:bg-gray-300">+</button>
                                    <button onClick={() => updateQty(item.id, 0)} className="ml-4 text-red-500 hover:text-red-700">✕</button>
                                </div>
                            </div>
                        ))
                    )}

                    {fullProducts.length > 0 && (
                        <div className="bg-white p-6 rounded shadow mt-6">
                            <h3 className="font-bold text-xl mb-4">สรุปคำสั่งซื้อ</h3>
                            <div className="flex justify-between mb-2"><span>รวมสินค้า</span><span>฿{subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between mb-4"><span>ค่าจัดส่ง</span><span>฿{shipFee.toLocaleString()}</span></div>
                            <div className="flex justify-between font-bold text-lg mb-4"><span>ยอดรวมทั้งหมด</span><span>฿{(subtotal + shipFee).toLocaleString()}</span></div>
                            <label className="flex items-center gap-2"><input type="checkbox" className="text-yellow-500" />ยอมรับเงื่อนไข</label>
                            <button onClick={handleConfirm} className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-bold transition">ยืนยันการสั่งซื้อ</button>
                        </div>
                    )}
                </div>


                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold text-lg mb-4">ข้อมูลการจัดส่ง</h3>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">ที่อยู่</label>
                        <select id="address" className="w-full border rounded p-2 mt-1 h-24">
                            {addresses.map(addr => (
                                <option key={addr.id} value={addr.id}>{addr.receiver_name} — {addr.district}, {addr.province}</option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">วิธีจัดส่ง</label>
                        <select className="w-full border rounded px-3 py-2" value={selectedShippingId || ''} onChange={e => setSelectedShippingId(Number(e.target.value))}>
                            {shippings.map(s => <option key={s.id} value={s.id}>{s.method} — ฿{s.fee}</option>)}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">วิธีชำระเงิน</label>
                        <select className="w-full border rounded px-3 py-2">
                            {payments.map(p => <option key={p.id} value={p.id}>**** **** **** {p.card_no.slice(-4)}</option>)}
                        </select>
                    </div>
                </div>
            </main>
            <footer className="bg-gray-100 py-6 text-center mt-auto">
                <div className="flex justify-center gap-2 mb-4">
                    {[...Array(4)].map((_, i) => <span key={i} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />)}
                </div>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center text-gray-600 px-4">
                    <span>About us</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline mt-2 sm:mt-0">Back to top ↑</button>
                </div>
            </footer>
        </div>
    );
}
