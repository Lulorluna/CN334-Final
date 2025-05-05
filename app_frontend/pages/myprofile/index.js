import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router'
import Link from 'next/link';
import Image from 'next/image';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return Date.now() >= payload.exp * 1000
    } catch {
        return true
    }
}

export default function ProfilePage() {
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [activeTab, setActiveTab] = useState('account');
    const [formData, setFormData] = useState({
        account: {
            username: '',
            email: '',
            fullname: '',
            dateOfBirth: '',
            sex: '',
            telephone: ''
        },
        address: {
            receiverName: '',
            houseNumber: '',
            district: '',
            province: '',
            postcode: ''
        },
        history: {
            customer: '',
            status: '',
            totalPrice: '',
            createdAt: ''
        },
        payment: {
            method: '',
            cardNo: '',
            expired: '',
            holderName: ''
        },
    });
    const [errors, setErrors] = useState({})
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/images/bg1.jpeg');
    const [historyList, setHistoryList] = useState([]);

    useEffect(() => {
        if (isLoggedIn && activeTab === 'history') {
            const token = localStorage.getItem('jwt_access');
            fetch('http://127.0.0.1:3341/api/history/', {
                headers: { Authorization: `Bearer ${token}` }
            })
                .then(res => res.json())
                .then(json => {
                    setHistoryList(json.orders || []);
                })
                .catch(err => console.error('Error fetching history:', err));
        }
    }, [isLoggedIn, activeTab]);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('jwt_access');
            const valid = !!token && !isTokenExpired(token);
            setIsLoggedIn(valid);

            if (!valid) {
                localStorage.removeItem('jwt_access');
                router.push('/login');
            }
        };

        checkAuth();
        const id = setInterval(checkAuth, 60000);
        return () => clearInterval(id);
    }, [router]);

    useEffect(() => {
        async function fetchProfile() {
            const token = localStorage.getItem('jwt_access')
            if (!token || isTokenExpired(token)) return;

            try {
                const res = await fetch('http://127.0.0.1:3342/api/myinfo/', {
                    headers: { Authorization: `Bearer ${token}` }
                })
                if (!res.ok) throw new Error()
                const { data } = await res.json()
                setFormData({
                    account: {
                        username: data.user.username,
                        email: data.user.email,
                        fullname: data.fullname,
                        date_of_birth: data.date_of_birth,
                        sex: data.sex === 'Male'
                            ? 'Male'
                            : data.sex === 'Female'
                                ? 'Female'
                                : 'Other',
                        tel: data.tel,
                    }, address: {
                        receiverName: '',
                        houseNumber: '',
                        district: '',
                        province: '',
                        postcode: ''
                    },
                    history: {
                        customer: '',
                        status: '',
                        totalPrice: '',
                        createdAt: ''
                    },
                    payment: {
                        method: '',
                        cardNo: '',
                        expired: '',
                        holderName: ''
                    },
                })
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isLoggedIn) {
            fetchProfile();
        }
    }, [isLoggedIn]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [activeTab]: { ...prev[activeTab], [name]: value },
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault()
        setErrors({})

        const token = localStorage.getItem('jwt_access')
        const payload = {
            user: {
                username: formData.account.username,
                email: formData.account.email,
            },
            fullname: formData.account.fullname,
            date_of_birth: formData.account.date_of_birth,
            sex: formData.account.sex,
            tel: formData.account.tel,
        }

        try {
            const res = await fetch('http://127.0.0.1:3342/api/myinfo/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            })
            const data = await res.json()

            if (!res.ok) {
                console.log('Validation errors from API:', data)
                setErrors(data)
                return
            }

            router.push('/myprofile')
        } catch (err) {
            console.error('Fetch error:', err)
        }
        alert("บันทึกข้อมูลเรียบร้อยแล้ว!");
    }

    const handleBackgroundUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setBackgroundImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const navLinks = [
        { name: 'Account', href: '/profile', tab: 'account', active: activeTab === 'account' },
        { name: 'Address', href: '/address', tab: 'address', active: activeTab === 'address' },
        { name: 'History', href: '/history', tab: 'history', active: activeTab === 'history' },
        { name: 'Payment', href: '/payment', tab: 'payment', active: activeTab === 'payment' },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-[#fdf6e3] animate-fade-in">
            Google Fonts
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      `}</style>
            <div
                className="fixed inset-0 bg-cover bg-center transition-opacity duration-300 z-0"
                style={{
                    backgroundImage: backgroundImage
                        ? `url(${backgroundImage})`
                        : 'linear-gradient(to bottom, #f4d03f, #fdf6e3)',
                }}
            >
                <div className="absolute inset-0 bg-[#8b4513]/10"></div>
            </div>
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

            <div className="flex flex-1 relative z-10 pt-24 pb-32">
                <aside className="w-64 bg-[#fff8e1] p-6 fixed h-[calc(100vh-6rem)] top-24 border-r border-[#8b4513]/30">
                    <h2 className="text-2xl font-semibold text-[#8b4513] mb-6">My Account</h2>
                    <nav className="space-y-3">
                        {navLinks.map((link, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveTab(link.tab)}
                                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 ${link.active
                                    ? 'bg-[#f4d03f] text-[#8b4513] font-semibold'
                                    : 'text-[#8b4513] hover:bg-[#f4d03f]/50'
                                    }`}
                            >
                                {link.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className="flex-1 ml-64 p-6">
                    <div className="max-w-3xl mx-auto bg-[#fff8e1] p-8 border border-[#8b4513]/30 rounded-lg shadow-md">
                        <h1 className="text-3xl font-bold text-[#8b4513] mb-6">
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {activeTab === 'account' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Username *
                                            </label>
                                            <input
                                                type="text"
                                                name="username"
                                                value={formData.account.username}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                            {errors.user?.username && <p className="text-red-500">{errors.user.username}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Telephone *
                                            </label>
                                            <input
                                                type="tel"
                                                name="telephone"
                                                value={formData.account.tel}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                            {errors.tel && <p className="text-red-500">{errors.tel}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                            Fullname *
                                        </label>
                                        <input
                                            type="text"
                                            name="fullname"
                                            value={formData.account.fullname}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Date of Birth *
                                            </label>
                                            <input
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.account.date_of_birth}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                            {errors.date_of_birth && <p className="text-red-500">{errors.date_of_birth}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Sex *
                                            </label>
                                            <select
                                                name="sex"
                                                value={formData.account.sex}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            >
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            {errors.sex && <p className="text-red-500">{errors.sex}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                            Email *
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.account.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                        />
                                    </div>
                                    <div className="text-right">
                                        <Link
                                            href="/change-password"
                                            className="text-[#8b4513] hover:text-[#f4d03f] transition-colors duration-200"
                                        >
                                            Change Password
                                        </Link>
                                    </div>
                                    <div className="text-right">
                                        <button
                                            type="submit"
                                            className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                        >
                                            Save
                                        </button>
                                    </div>
                                </>
                            )}

                            {activeTab === 'address' && (
                                <>
                                </>
                            )}

                            {activeTab === 'history' && (
                                <>
                                    <div className="space-y-4">
                                        {historyList.length === 0 ? (
                                            <p className="text-gray-500">ยังไม่มีรายการสั่งซื้อ</p>
                                        ) : (
                                            historyList.map(order => (
                                                <div key={order.id} className="p-4 border rounded-lg bg-white">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-semibold">Order #{order.id}</span>
                                                        <span className="text-sm px-2 py-1 rounded-full 
                          {order.status === 'paid' ? 'bg-green-200 text-green-800' :
                           order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                           'bg-gray-200 text-gray-800'}">
                                                            {order.status}
                                                        </span>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="font-medium">Total:</span> ฿{order.total_price}
                                                    </div>
                                                    <div className="space-y-1">
                                                        {order.items.map(item => (
                                                            <div key={item.id} className="flex justify-between">
                                                                <span>{item.product_name} x{item.quantity}</span>
                                                                <span>฿{item.total_price}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <Link href={`/order/${order.id}`} className="inline-block mt-3 text-sm text-[#8b4513] hover:underline">
                                                        ดูรายละเอียดเพิ่มเติม →
                                                    </Link>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}

                            {activeTab === 'payment' && (
                                <>
                                </>
                            )}
                        </form>
                    </div>
                </main>
            </div>
            <footer className="relative z-10 bg-gray-100 py-6">
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