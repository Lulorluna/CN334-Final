import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function OrderSummaryPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const productId = searchParams.get('product');
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);
    const [cart, setCart] = useState([]);
    const [hasAdded, setHasAdded] = useState(false);

    useEffect(() => {
        const addingProduct = sessionStorage.getItem('addingProduct');
        let existingCart = JSON.parse(localStorage.getItem('cart') || '[]');

        if (productId && addingProduct === 'true' && !hasAdded) {
            const index = existingCart.findIndex(item => item.id === Number(productId));
            if (index >= 0) {
                existingCart[index].quantity += quantity;
            } else {
                existingCart.push({ id: Number(productId), quantity });
            }
            sessionStorage.removeItem('addingProduct');
            localStorage.setItem('cart', JSON.stringify(existingCart));
            setHasAdded(true);
        }

        setCart(existingCart);
    }, [productId, quantity, hasAdded]);

    const updateQuantity = (id, newQty) => {
        let updatedCart;
        if (newQty <= 0) {
            updatedCart = cart.filter(item => item.id !== id);
        } else {
            updatedCart = cart.map(item => (item.id === id ? { ...item, quantity: newQty } : item));
        }
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const products = [];

    const fullProducts = cart
        .map(item => {
            const product = products.find(p => p.id === item.id);
            return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean);

    const totalPrice = fullProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const shipping = 30;

    const handleConfirm = () => {
        alert('ยืนยันคำสั่งซื้อเรียบร้อยแล้ว');
        localStorage.removeItem('cart');
        setCart([]);
        router.push('/');
    };

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-no-repeat" style={{ backgroundImage: 'url("/images/background.jpg")' }}>
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
                        <Link href="/order" className="relative p-2 border rounded-full hover:bg-gray-100 transition-colors duration-200 ease-in-out">🛒</Link>
                        <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-full transition-colors duration-200">
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            <div className="mt-24 flex-grow container mx-auto px-4 py-8">
                <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 flex flex-col md:flex-row gap-6">
                    <div className="md:w-2/3">
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
                                        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                        <span>{item.quantity}</span>
                                        <button className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                            ))
                        )}

                        {fullProducts.length > 0 && (
                            <div className="mt-6 bg-white p-4 rounded shadow">
                                <h4 className="font-bold mb-2">Payment Information:</h4>
                                <p>รวมการสั่งซื้อ: ฿{totalPrice.toLocaleString()}</p>
                                <p>ค่าจัดส่ง: ฿{shipping.toLocaleString()}</p>
                                <p className="font-bold">ยอดชำระทั้งหมด: ฿{(totalPrice + shipping).toLocaleString()}</p>
                                <div className="mt-2">
                                    <label className="inline-flex items-center">
                                        <input type="checkbox" className="form-checkbox text-yellow-500" />
                                        <span className="ml-2 text-sm text-gray-700">ยอมรับเงื่อนไขการให้บริการ</span>
                                    </label>
                                </div>
                                <button onClick={handleConfirm} className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded font-bold">
                                    Confirm
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="md:w-1/3 bg-white bg-opacity-95 p-4 rounded shadow space-y-4">
                        <div>
                            <label htmlFor="address" className="font-semibold">Address</label>
                            <textarea id="address" className="w-full border rounded p-2 mt-1" rows={4} />
                        </div>
                        <div>
                            <label htmlFor="shipping" className="font-semibold">Shipping</label>
                            <input id="shipping" className="w-full border rounded p-2 mt-1" />
                        </div>
                        <div>
                            <label htmlFor="payment" className="font-semibold">Payment</label>
                            <input id="payment" className="w-full border rounded p-2 mt-1" />
                        </div>
                    </div>
                </div>
            </div>

            <footer className="bg-gray-100 py-6">
                <div className="flex justify-center gap-2 mb-4">
                    {Array(4).fill().map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block"></span>
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
                    <span>About us</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative text-gray-600 font-medium group mt-2 sm:mt-0">
                        <span className="relative inline-block px-1">
                            Back to top ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-grey-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}
