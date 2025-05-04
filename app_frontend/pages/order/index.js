import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

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
        function checkAuth() {
            const token = localStorage.getItem('jwt_access');
            if (token && !isTokenExpired(token)) setIsLoggedIn(true);
            else { localStorage.removeItem('jwt_access'); setIsLoggedIn(false); }
        }
        checkAuth();
        const iv = setInterval(checkAuth, 60000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        const adding = sessionStorage.getItem('addingProduct');
        let existing = JSON.parse(localStorage.getItem('cart') || '[]');
        if (productId && adding === 'true' && !hasAdded) {
            const idx = existing.findIndex(i => i.id === Number(productId));
            if (idx >= 0) existing[idx].quantity += quantity;
            else existing.push({ id: Number(productId), quantity });
            sessionStorage.removeItem('addingProduct');
            localStorage.setItem('cart', JSON.stringify(existing));
            setHasAdded(true);
        }
        setCart(existing);
    }, [productId, quantity, hasAdded]);

    useEffect(() => {
        async function loadProducts() {
            if (!cart.length) return;
            try {
                const res = await fetch(`/api/products/bulk/?ids=${cart.map(i => i.id).join(',')}`);
                const data = await res.json();
                const enriched = cart.map(i => {
                    const p = data.find(d => d.id === i.id);
                    return p ? { ...p, quantity: i.quantity } : null;
                }).filter(Boolean);
                setFullProducts(enriched);
            } catch (e) { console.error(e); }
        }
        loadProducts();
    }, [cart]);

    useEffect(() => {
        async function loadUserData() {
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
            } catch (e) { console.error(e); }
        }
        loadUserData();
    }, []);

    const updateQty = (id, qty) => {
        const updated = qty > 0
            ? cart.map(i => i.id === id ? { ...i, quantity: qty } : i)
            : cart.filter(i => i.id !== id);
        setCart(updated);
        localStorage.setItem('cart', JSON.stringify(updated));
    };

    const subtotal = fullProducts.reduce((s, p) => s + p.price * p.quantity, 0);
    const selShip = shippings.find(s => s.id === Number(selectedShippingId));
    const shippingFee = selShip?.fee || 0;

    const handleConfirm = () => {
        alert('ยืนยันคำสั่งซื้อเรียบร้อยแล้ว');
        localStorage.removeItem('cart'); setCart([]);
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-no-repeat" style={{ backgroundImage: 'url("/images/background.jpg")' }}>
            {/* Header/Nav */}
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
                            {['Home', 'About Us', 'Product'].map((t, i) => (
                                <Link key={i} href={t === 'Home' ? '/' : t === 'About Us' ? '/about' : '/product-list'} className="relative text-gray-800 font-semibold group">
                                    <span className="relative inline-block px-1">
                                        {t}
                                        <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                                    </span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex gap-4 items-center">
                        <Link href="/order" className="relative p-2 border rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out">🛒</Link>
                        {isLoggedIn
                            ? <Link href="/profile" className="w-10 h-10 rounded-full overflow-hidden border hover:ring-2 ring-yellow-500 transition-all duration-200">
                                <Image src="/images/user-profile.jpg" alt="Profile" width={40} height={40} />
                            </Link>
                            : <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-full transition-colors duration-200">Sign In</Link>
                        }
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="mt-24 flex-grow container mx-auto px-4 py-8">
                <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    {/* Left Column: Cart Items */}
                    <div className="md:w-2/3 space-y-4">
                        {fullProducts.length === 0 ? (
                            <div className="text-yellow-600 font-semibold">ไม่มีสินค้าในตะกร้า</div>
                        ) : (
                            fullProducts.map(item => (
                                <div key={item.id} className="flex justify-between items-center border-b py-4">
                                    <div className="flex items-center gap-4">
                                        <Image src={item.image} width={60} height={60} alt={item.name} />
                                        <div>
                                            <h3 className="font-bold text-gray-800">{item.name}</h3>
                                            <p className="text-sm text-gray-600">฿{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQty(item.id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQty(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                    <button onClick={() => updateQty(item.id, 0)} className="px-3 py-1 border border-red-500 text-red-500 rounded hover:bg-red-50">Cancel</button>
                                </div>
                            ))
                        )}

                        {fullProducts.length > 0 && (
                            <div className="mt-6 bg-white p-4 rounded shadow">
                                <h4 className="font-bold mb-2">Payment Information:</h4>
                                <p>รวมการสั่งซื้อ: ฿{subtotal.toLocaleString()}</p>
                                <p>ค่าจัดส่ง: ฿{shippingFee.toLocaleString()}</p>
                                <p className="font-bold">ยอดชำระทั้งหมด: ฿{(subtotal + shippingFee).toLocaleString()}</p>
                                <div className="mt-2">
                                    <label className="inline-flex items-center">
                                        <input type="checkbox" className="form-checkbox text-yellow-500" />
                                        <span className="ml-2 text-sm text-gray-700">ยอมรับเงื่อนไขการให้บริการ</span>
                                    </label>
                                </div>
                                <button onClick={handleConfirm} className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-bold">Confirm</button>
                            </div>
                        )}
                    </div>

                    <div className="md:w-1/3 bg-white bg-opacity-95 p-4 rounded shadow space-y-4">
                        <div>
                            <label htmlFor="address" className="font-semibold">Address</label>
                            <select id="address" className="w-full border rounded p-2 mt-1 h-24">
                                {(addresses || []).map(addr => (
                                    <option key={addr.id} value={addr.id}>{addr.receiver_name} — {addr.district}, {addr.province}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="shipping" className="font-semibold">Shipping</label>
                            <select id="shipping" className="w-full border rounded p-2 mt-1 h-12" onChange={e => setSelectedShippingId(Number(e.target.value))} value={selectedShippingId || ''}>
                                {(shippings || []).map(ship => (
                                    <option key={ship.id} value={ship.id}>{ship.method} - ฿{ship.fee}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="payment" className="font-semibold">Payment</label>
                            <select id="payment" className="w-full border rounded p-2 mt-1 h-12">
                                {(payments || []).map(pay => (
                                    <option key={pay.id} value={pay.id}>**** **** **** {pay.card_no.slice(-4)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-gray-100 py-6">
                <div className="flex justify-center gap-2 mb-4">
                    {Array(4).fill().map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
                    <span>About us</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative text-gray-600 font-medium group mt-2 sm:mt-0">
                        <span className="relative inline-block px-1">Back to top ↑<span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gray-500 group-hover:w-full transition-all duration-300" /></span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
