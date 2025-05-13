'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getUserUrl, getProductUrl } from '@/baseurl';

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
    const [paymentMethod, setPaymentMethod] = useState('credit_card');
    const [qrVerified, setQrVerified] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
        const total = cart.reduce((sum, i) => sum + (i.quantity || 0), 0);
        setCartCount(total);
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

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

    useEffect(() => {
        if (!isLoggedIn) return;
        (async () => {
            try {
                const token = localStorage.getItem('jwt_access');
                const res = await fetch(`${getProductUrl()}/api/cart/`, {
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
                        fetch(`${getProductUrl()}/api/product/${id}/`)
                            .then(r => r.json())
                            .then(json => json)
                    )
                );
                const enriched = details.map((p, i) => {
                    const fileName =
                        p.data.name
                            .toLowerCase()
                            .trim()
                        + '.jpg';

                    return {
                        id: p.data.id,
                        name: p.data.name,
                        image: `/images/${fileName}`,
                        price: Number(p.data.price) || 0,
                        quantity: cart[i].quantity,
                        stock: p.data.stock || 0,
                    };
                });
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
                    fetch(`${getUserUrl()}/api/address/`, { headers }),
                    fetch(`${getUserUrl()}/api/payment/`, { headers }),
                    fetch(`${getProductUrl()}/api/shipping/`, { headers }),
                ]);
                const { data: addrlist = [] } = await ar.json();
                const { data: paylist = [] } = await pr.json();
                const sj = await sr.json();
                const sl = Array.isArray(sj) ? sj : sj.data || [];

                const sortedAddresses = [...addrlist].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));
                const sortedPayments = [...paylist].sort((a, b) => (b.is_default ? 1 : 0) - (a.is_default ? 1 : 0));

                setAddresses(sortedAddresses);
                setPayments(sortedPayments);
                setShippings(sl);

                if (sortedAddresses.length) setSelectedAddressId(sortedAddresses[0].id);
                if (sortedPayments.length) setSelectedPaymentId(sortedPayments[0].id);
                if (sl.length) setSelectedShippingId(sl[0].id);
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);


    const removeItemFromCart = async (productId) => {
        try {
            const token = localStorage.getItem('jwt_access');
            const res = await fetch(`${getProductUrl()}/api/cart/remove/${productId}/`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to remove item');
        } catch (err) {
            console.error('Remove failed:', err);
        }
    };

    const updateCart = async (productId, quantity) => {
        try {
            const token = localStorage.getItem('jwt_access');
            await fetch(`${getProductUrl()}/api/cart/update/${productId}/`, {
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
                await removeItemFromCart(id);
            } else {
                await updateCart(id, newQty);
            }

            const updated = newQty > 0
                ? cart.map(i => i.id === id ? { ...i, quantity: newQty } : i)
                : cart.filter(i => i.id !== id);
            setCart(updated);
        } catch (err) {
            console.error('Failed to update quantity:', err);
        }
    };

    const subtotal = fullProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const shipFee = shippings.find(s => s.id === Number(selectedShippingId))?.fee || 0;

    const canConfirm = accepted && (
        paymentMethod !== 'qr_code'
        || (paymentMethod === 'qr_code' && qrVerified)
    );

    const handleVerifyQR = () => {
        setQrVerified(true);
    };

    const handleConfirm = async () => {
        if (isSubmitting) return;

        if (!selectedAddressId || !selectedShippingId) {
            alert("กรุณาเลือกที่อยู่ และวิธีจัดส่ง");
            return;
        }
        if (paymentMethod === "credit_card" && !selectedPaymentId) {
            alert("กรุณาเลือกบัตรเครดิต/เดบิต");
            return;
        }
        if (paymentMethod === "qr_code" && !qrVerified) {
            alert("กรุณาตรวจสอบการชำระเงินก่อน");
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem("jwt_access");
            const res = await fetch(`${getProductUrl()}/api/order/confirm/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    address_id: selectedAddressId,
                    shipping_id: selectedShippingId,
                    payment_method: paymentMethod,
                    user_payment_method_id:
                        paymentMethod === "credit_card" ? selectedPaymentId : null,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Confirm failed");

            alert("ยืนยันเรียบร้อย");
            localStorage.removeItem("cart");
            router.push(`/summarize/${data.order_id}`);
        } catch (err) {
            console.error(err);
            alert("ยืนยันคำสั่งซื้อไม่สำเร็จ: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    };



    return (
        <div className="flex flex-col min-h-screen bg-cover" style={{ backgroundImage: "url('/images/bg.png')" }}>
            {isSubmitting && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-500"></div>
                </div>
            )}
            <header className="fixed top-0 w-full bg-[#fff8e1] shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2 relative group">
                        <Image src="/images/logo.png" width={65} height={40} alt="Logo" />
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
                                    onChange={e => setAccepted(e.target.checked)}
                                />
                                ยอมรับเงื่อนไข
                            </label>
                            <button
                                onClick={handleConfirm}
                                disabled={!canConfirm || isSubmitting}
                                className={`mt-6 w-full py-3 rounded-lg font-bold transition 
                                    ${!canConfirm || isSubmitting
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                    }`}
                            >
                                {isSubmitting ? 'กำลังส่งคำสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
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
                            className="w-full border rounded px-3 py-2"
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
                            value={paymentMethod}
                            onChange={e => {
                                setPaymentMethod(e.target.value);
                                setQrVerified(false);
                            }}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="cash_on_delivery">เก็บเงินปลายทาง (COD)</option>
                            <option value="qr_code">สแกน QR Code</option>
                            <option value="credit_card">บัตรเครดิต/เดบิต</option>
                        </select>
                    </div>

                    {paymentMethod === "credit_card" && (
                        <div className="mb-4">
                            <label className="block font-medium mb-1">เลือกบัตร</label>
                            <select
                                value={selectedPaymentId || ""}
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
                    )}
                    {paymentMethod === 'qr_code' && (
                        <div className="mb-6 flex flex-col items-center">
                            <Image
                                src="/images/qrcode.jpg"
                                alt="QR Code"
                                width={200}
                                height={200}
                            />
                            <button
                                onClick={handleVerifyQR}
                                disabled={qrVerified}
                                className={`mt-4 px-4 py-2 rounded-lg font-medium transition
                                    ${qrVerified
                                        ? 'bg-green-200 text-green-800 cursor-default'
                                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    }`}
                            >
                                {qrVerified ? '✓ ชำระเงินเรียบร้อย' : 'ตรวจสอบการชำระเงิน'}
                            </button>
                        </div>
                    )}
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
