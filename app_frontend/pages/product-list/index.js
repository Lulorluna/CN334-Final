import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
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
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

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

    const categories = [
        { label: 'Defect', icon: '/icons/apple.png' },
        { label: 'Nearly expired', icon: '/icons/expired.png' },
        { label: 'Raw', icon: '/icons/raw.png' },
        { label: 'Fish', icon: '/icons/fish.png' },
        { label: 'Seafood', icon: '/icons/seafood.png' },
        { label: 'Vegetable', icon: '/icons/vegetable.png' },
        { label: 'Fruit', icon: '/icons/fruit.png' },
        { label: 'Cereals', icon: '/icons/cereals.png' },
        { label: 'Drink', icon: '/icons/drink.png' },
        { label: 'Other', icon: '/icons/other.png' },
    ];

    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('http://127.0.0.1:3341/api/product/all/');
                const json = await res.json();
                const available = json.data.filter(item => item.available);
                setProducts(available);
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

    const filteredProducts = products.filter(item => {
        const matchesCategory = selectedCategory ? item.categories.includes(selectedCategory) : true;
        const term = searchTerm.toLowerCase();
        const nameMatch = item.name?.toLowerCase().includes(term);
        const detailMatch = (item.detail ?? '').toLowerCase().includes(term);
        return matchesCategory && (nameMatch || detailMatch);
    });

    return (
        <div className="min-h-screen flex flex-col bg-cover bg-no-repeat" style={{ backgroundImage: "url('/images/bg.png')" }}>
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
            <div className="h-20" />
            <main className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 flex-grow">
                <aside className="md:w-1/4 w-full bg-white rounded-xl shadow p-4">
                    <h2 className="text-lg font-bold text-gray-700 mb-4">ค้นหา / หมวดหมู่</h2>
                    <input type="text" placeholder="ค้นหาสินค้า..." className="w-full mb-4 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    <div className="flex flex-col gap-2">
                        {categories.map((cat, idx) => (
                            <button key={idx} onClick={() => setSelectedCategory(cat.label)} className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.label ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                <Image src={cat.icon} alt={cat.label} width={20} height={20} />{cat.label}
                            </button>
                        ))}
                        {selectedCategory && <button onClick={() => setSelectedCategory(null)} className="mt-3 text-red-600 text-sm hover:underline">ล้างการเลือก</button>}
                    </div>
                </aside>
                <section className="md:w-3/4 w-full">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(item => (
                                <div key={item.id} className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between">
                                    <div className="flex justify-center items-center h-32">
                                        <Image src={item.image || '/images/placeholder.png'} alt={item.name} width={100} height={100} className="object-contain" />
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <h3 className="text-gray-800 font-semibold text-md">{item.name}</h3>
                                        <span className="text-sm text-gray-500">Expire: {new Date(item.expiration_date).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{item.detail}</p>
                                    <p className="font-bold text-yellow-500 mt-2">฿ {item.price.toLocaleString()}</p>
                                    <Link
                                        href={`/product-detail?product=${item.id}`}
                                        className="mt-4 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full text-center"
                                    >
                                        เลือกซื้อสินค้า
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">ไม่พบสินค้าที่ตรงกับคำค้นหา หมวดหมู่ หรือสินค้าหมด</div>
                    )}
                </section>
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
