import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function ProductListPage() {
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get('category');

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
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);

    const categories = [
        { label: 'Raw', icon: '/icons/raw.png' },
        { label: 'Vegetable', icon: '/icons/vegetable.png' },
        { label: 'Fruit', icon: '/icons/fruit.png' },
        { label: 'Seasoning', icon: '/icons/seasoning.png' },
        { label: 'RTE Food', icon: '/icons/rte.png' },
    ];

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('http://127.0.0.1:3341/api/product/all/');
                const json = await res.json();
                const availableProducts = json.data.filter((item) => item.available);
                setProducts(availableProducts);
            } catch (err) {
                console.error('Failed to load products', err);
            }
        }
        fetchProducts();
    }, []);

    useEffect(() => {
        const cat = searchParams.get('category');
        if (cat !== selectedCategory) {
            setSelectedCategory(cat);
        }
    }, [searchParams]);

    const handleSelectProduct = (productId) => {
        const product = products.find((p) => String(p.id) === productId);
        setSelectedProduct(product);
    };

    const filteredProducts = products.filter((item) => {
        const matchesCategory = selectedCategory ? item.categories.includes(selectedCategory) : true;
        const term = searchTerm.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(term);
        const detailMatch = (item.detail ?? '').toLowerCase().includes(term);
        return matchesCategory && (nameMatch || detailMatch);
    });

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-no-repeat" style={{ backgroundImage: "url('/images/bg.png')" }}>
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
                            <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 text-white font-bold px-4 py-2 rounded-full transition-colors duration-200">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div className="h-20" />

            <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
                <aside className="md:w-1/4 w-full bg-white rounded-xl shadow p-4">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">ค้นหา / หมวดหมู่</h2>
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        className="w-full mb-4 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="flex flex-col gap-2">
                        {categories.map((cat, idx) => (
                            <button
                                key={idx}
                                onClick={() => setSelectedCategory(cat.label)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition  ${selectedCategory === cat.label
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                <Image src={cat.icon} alt={cat.label} width={20} height={20} />
                                {cat.label}
                            </button>
                        ))}
                        {selectedCategory && (
                            <button onClick={() => setSelectedCategory(null)} className="mt-3 text-red-600 text-sm hover:underline">
                                ล้างการเลือก
                            </button>
                        )}
                    </div>
                </aside>

                <section className="md:w-3/4 w-full">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 cursor-pointer flex flex-col justify-between"
                                    onClick={() => handleSelectProduct(String(item.id))}
                                >
                                    <div className="flex justify-center items-center h-32">
                                        <Image src={item.image || '/images/placeholder.png'} alt={item.name} width={100} height={100} className="object-contain" />
                                    </div>
                                    <div className="mt-4">
                                        <h3 className="text-gray-800 font-semibold text-md">{item.name}</h3>
                                        <p className="text-sm text-gray-600">{item.detail}</p>
                                        <p className="font-bold text-yellow-500 mt-2">฿ {item.price.toLocaleString()}</p>
                                    </div>
                                    <button className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-full">
                                        เลือกซื้อ
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">ไม่พบสินค้าที่ตรงกับคำค้นหา หมวดหมู่ หรือสินค้าหมด</div>
                    )}
                </section>
            </main>

            {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

            <footer className="bg-gray-100 py-6">
                <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4].map((_, idx) => (
                        <span key={idx} className="w-4 h-4 bg-gray-400 rounded-full inline-block" />
                    ))}
                </div>
                <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-gray-600">
                    <span>About us</span>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="relative text-gray-600 font-medium group mt-2 sm:mt-0">
                        <span className="relative inline-block px-1">
                            Back to top ↑
                            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-yellow-500 group-hover:w-full transition-all duration-300" />
                        </span>
                    </button>
                </div>
            </footer>
        </div>
    );
}