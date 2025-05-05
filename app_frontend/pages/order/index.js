'use client';

import { useEffect, useState, useRef } from 'react';
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
    const [accepted, setAccepted] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

            if (!valid) {
                localStorage.removeItem('jwt_access');
                localStorage.removeItem('cart');
                setCart([]);
                setFullProducts([]);
                router.push('/login');
            }
        };

        checkAuth();
        const id = setInterval(checkAuth, 60000);
        return () => clearInterval(id);
    }, [router]);

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
        router.push('/login');
    };

    useEffect(() => {
        if (!isLoggedIn) return;
        (async () => {
            try {
                const token = localStorage.getItem('jwt_access');
                const res = await fetch('http://127.0.0.1:3341/api/cart/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const { cart_orders } = await res.json();
                const fetched = cart_orders.flatMap(o =>
                    o.items.map(i => ({ id: i.product, quantity: i.quantity }))
                );
                setCart(fetched);
                localStorage.setItem('cart', JSON.stringify(fetched));
            } catch (e) {
                console.error(e);
            }
        })();
    }, [isLoggedIn, hasAdded]);


    useEffect(() => {
        if (!isLoggedIn) {
            setFullProducts([]);
            return;
        }
        if (!cart.length) return setFullProducts([]);

        (async () => {
            try {
                const details = await Promise.all(
                    cart.map(({ id }) =>
                        fetch(`http://127.0.0.1:3341/api/product/${id}/`)
                            .then(r => r.json())
                            .then(json => json)
                    )
                );
                const enriched = details.map((p, i) => ({
                    id: p.data.id,
                    name: p.data.name,
                    image: p.data.image || '/images/placeholder.png',
                    price: Number(p.data.price) || 0,
                    quantity: cart[i].quantity,
                    stock: p.data.stock || 0,
                }));
                setFullProducts(enriched);
            } catch (e) {
                console.error(e);
            }
        })();
    }, [cart, isLoggedIn]);

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
                const { data: al = [] } = await ar.json();
                const { data: pl = [] } = await pr.json();
                const sj = await sr.json();
                const sl = Array.isArray(sj) ? sj : sj.data || [];

                setAddresses(al);
                setPayments(pl);
                setShippings(sl);

                if (al.length) setSelectedAddressId(al[0].id);
                if (pl.length) setSelectedPaymentId(pl[0].id);
                if (sl.length) setSelectedShippingId(sl[0].id);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    const removeFromBackendCart = async (productId) => {
        try {
            const token = localStorage.getItem('jwt_access');
            const res = await fetch(`http://127.0.0.1:3341/api/cart/remove/${productId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to remove item');
        } catch (err) {
            console.error('Remove failed:', err);
        }
    };

    const updateBackendCart = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('jwt_access');
            await fetch(`http://127.0.0.1:3341/api/cart/update/${productId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ quantity }),
            });
        } catch (err) {
            console.error('Backend update failed:', err);
        }
    };

    const updateQty = async (id, newQty) => {
        try {
            if (newQty === 0) {
                await removeFromBackendCart(id);
            } else {
                await updateBackendCart(id, newQty);
            }

            const updated = newQty > 0
                ? cart.map(i => i.id === id ? { ...i, quantity: newQty } : i)
                : cart.filter(i => i.id !== id);
            setCart(updated);
            localStorage.setItem('cart', JSON.stringify(updated));
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const subtotal = fullProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const shipFee = shippings.find(s => s.id === Number(selectedShippingId))?.fee || 0;

    const handleConfirm = async () => {
        if (!selectedAddressId || !selectedPaymentId || !selectedShippingId) {
            alert('กรุณาเลือกที่อยู่ วิธีจัดส่ง และวิธีชำระเงิน');
            return;
        }
        try {
            const token = localStorage.getItem('jwt_access');
            const res = await fetch('http://127.0.0.1:3341/api/order/confirm/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    address_id: selectedAddressId,
                    payment_id: selectedPaymentId,
                    shipping_id: selectedShippingId
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Confirm failed');

            const orderId = data.order_id;
            alert('ยืนยันเรียบร้อย');

            localStorage.removeItem('cart');
            setCart([]);

            router.push(`/summarize/${orderId}`);
        } catch (err) {
            console.error(err);
            alert('ยืนยันคำสั่งซื้อไม่สำเร็จ: ' + err.message);
        }
    };


    return (
        <div className="flex flex-col min-h-screen bg-cover" style={{ backgroundImage: "url('/images/bg.png')" }}>
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
                                <Link href="/order" className="p-2 border border-[#8b4513] rounded-full hover:bg-[#f4d03f] transition-colors duration-200">🛒</Link>
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
                                    <button
                                        onClick={() => updateQty(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= item.stock}
                                        className={`w-8 h-8 flex items-center justify-center rounded 
                                        ${item.quantity >= item.stock ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-gray-200 hover:bg-gray-300'}`}
                                    >
                                        +
                                    </button>
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
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="text-yellow-500"
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                ยอมรับเงื่อนไข
                            </label>
                            <button
                                onClick={handleConfirm}
                                disabled={!accepted}
                                className={`mt-6 w-full py-3 rounded-lg font-bold transition 
                                ${accepted
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                            >
                                ยืนยันการสั่งซื้อ
                            </button>


                        </div>
                    )}
                </div>


                <div className="bg-white p-6 rounded shadow">
                    <h3 className="font-bold text-lg mb-4">ข้อมูลการจัดส่ง</h3>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">ที่อยู่</label>
                        <select
                            value={selectedAddressId || ''}
                            onChange={e => setSelectedAddressId(Number(e.target.value))}
                        >
                            {addresses.map(a => (
                                <option key={a.id} value={a.id}>
                                    {a.receiver_name} — {a.district}, {a.province}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">วิธีจัดส่ง</label>
                        <select
                            value={selectedShippingId || ''}
                            onChange={e => setSelectedShippingId(Number(e.target.value))}
                            className="w-full border rounded px-3 py-2"
                        >
                            {shippings.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.method} — ฿{s.fee.toLocaleString()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="mb-4">
                        <label className="block font-medium mb-1">วิธีชำระเงิน</label>
                        <select
                            value={selectedPaymentId || ''}
                            onChange={e => setSelectedPaymentId(Number(e.target.value))}
                            className="w-full border rounded px-3 py-2"
                        >
                            {payments.map(p => (
                                <option key={p.id} value={p.id}>
                                    **** **** **** {p.card_no.slice(-4)}
                                </option>
                            ))}
                        </select>
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
