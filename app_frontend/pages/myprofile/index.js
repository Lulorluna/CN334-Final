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
                    }
                })
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

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

    const ParticleBackground = () => {
        const canvasRef = useRef(null);

        useEffect(() => {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            let particles = [];
            let mouse = { x: null, y: null };

            const resizeCanvas = () => {
                canvas.width = canvas.offsetWidth;
                canvas.height = canvas.offsetHeight;
            };

            const createParticle = (x, y) => {
                return {
                    x,
                    y,
                    size: Math.random() * 2 + 1,
                    speedX: Math.random() * 0.5 - 0.25,
                    speedY: Math.random() * 0.5 - 0.25,
                };
            };

            const initParticles = () => {
                particles = [];
                for (let i = 0; i < 50; i++) {
                    particles.push(
                        createParticle(
                            Math.random() * canvas.width,
                            Math.random() * canvas.height
                        )
                    );
                }
            };

            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach((particle, i) => {
                    particle.x += particle.speedX;
                    particle.y += particle.speedY;

                    if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
                    if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;

                    ctx.beginPath();
                    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    ctx.fillStyle = '#f4d03f';
                    ctx.globalAlpha = 0.6;
                    ctx.fill();

                    if (mouse.x && mouse.y) {
                        const dx = mouse.x - particle.x;
                        const dy = mouse.y - particle.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(mouse.x, mouse.y);
                            ctx.strokeStyle = '#f4d03f';
                            ctx.globalAlpha = 0.2;
                            ctx.stroke();
                        }
                    }

                    for (let j = i + 1; j < particles.length; j++) {
                        const dx = particle.x - particles[j].x;
                        const dy = particle.y - particles[j].y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        if (distance < 100) {
                            ctx.beginPath();
                            ctx.moveTo(particle.x, particle.y);
                            ctx.lineTo(particles[j].x, particles[j].y);
                            ctx.strokeStyle = '#f4d03f';
                            ctx.globalAlpha = 0.1;
                            ctx.stroke();
                        }
                    }
                });
                ctx.globalAlpha = 1;
                requestAnimationFrame(animate);
            };

            const handleMouseMove = (e) => {
                const rect = canvas.getBoundingClientRect();
                mouse.x = e.clientX - rect.left;
                mouse.y = e.clientY - rect.top;
            };

            window.addEventListener('resize', resizeCanvas);
            canvas.addEventListener('mousemove', handleMouseMove);
            resizeCanvas();
            initParticles();
            animate();

            return () => {
                window.removeEventListener('resize', resizeCanvas);
                canvas.removeEventListener('mousemove', handleMouseMove);
            };
        }, []);

        return (
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
            />
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#fdf6e3] animate-fade-in">
            {/* Google Fonts */}
            <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');
      `}</style>

            {/* Background with Custom Image or Gradient */}
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

            {/* Background Upload */}
            <div className="relative z-10 p-4">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="p-2 border border-[#8b4513] rounded bg-[#fff8e1] text-[#8b4513] file:bg-[#f4d03f] file:text-[#8b4513] file:border-none file:rounded file:px-4 file:py-2"
                />
            </div>

            {/* Navbar */}
            <header className="fixed top-0 w-full bg-[#fff8e1] shadow-md z-50">
                <div className="container mx-auto flex items-center justify-between p-4">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/images/logo.png" width={40} height={40} alt="Logo" />
                        <span className="font-bold text-[#8b4513]">Meal of Hope</span>
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
                        <Link
                            href="/order"
                            className="p-2 border border-[#8b4513] rounded-full hover:bg-[#f4d03f] transition-colors duration-200"
                        >
                            🛒
                        </Link>
                        <Link
                            href="/login"
                            className="bg-[#f4d03f] hover:bg-[#e6c02f] text-[#8b4513] font-bold px-4 py-2 rounded-full transition-colors duration-200"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 relative z-10 pt-24 pb-32">
                {/* Sidebar */}
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

                {/* Form Section */}
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
                                </>
                            )}

                            {activeTab === 'address' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                            Receiver Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="receiverName"
                                            value={formData.address.receiverName}
                                            onChange={handleChange}
                                            required
                                            className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                House Number *
                                            </label>
                                            <input
                                                type="text"
                                                name="houseNumber"
                                                value={formData.address.houseNumber}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Postcode *
                                            </label>
                                            <input
                                                type="text"
                                                name="postcode"
                                                value={formData.address.postcode}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                District *
                                            </label>
                                            <input
                                                type="text"
                                                name="district"
                                                value={formData.address.district}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Province *
                                            </label>
                                            <input
                                                type="text"
                                                name="province"
                                                value={formData.address.province}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'history' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Customer *
                                            </label>
                                            <input
                                                type="text"
                                                name="customer"
                                                value={formData.history.customer}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Created At *
                                            </label>
                                            <input
                                                type="date"
                                                name="createdAt"
                                                value={formData.history.createdAt}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Status *
                                            </label>
                                            <input
                                                type="text"
                                                name="status"
                                                value={formData.history.status}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Total Price *
                                            </label>
                                            <input
                                                type="text"
                                                name="totalPrice"
                                                value={formData.history.totalPrice}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'payment' && (
                                <>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Method *
                                            </label>
                                            <input
                                                type="text"
                                                name="method"
                                                value={formData.payment.method}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Expired *
                                            </label>
                                            <input
                                                type="month"
                                                name="expired"
                                                value={formData.payment.expired}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Card No *
                                            </label>
                                            <input
                                                type="text"
                                                name="cardNo"
                                                value={formData.payment.cardNo}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[#8b4513] mb-2">
                                                Holder Name *
                                            </label>
                                            <input
                                                type="text"
                                                name="holderName"
                                                value={formData.payment.holderName}
                                                onChange={handleChange}
                                                required
                                                className="w-full p-3 border border-[#8b4513]/50 rounded-lg bg-[#fdf6e3] text-[#8b4513] focus:ring-[#f4d03f] focus:border-[#f4d03f]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            {activeTab === 'account' && (
                                <div className="text-right">
                                    <Link
                                        href="/change-password"
                                        className="text-[#8b4513] hover:text-[#f4d03f] transition-colors duration-200"
                                    >
                                        Change Password
                                    </Link>
                                </div>
                            )}

                            <div className="text-right">
                                <button
                                    type="submit"
                                    className="bg-[#f4d03f] text-[#8b4513] px-6 py-3 rounded-lg hover:bg-[#e6c02f] transition-colors duration-200 font-semibold"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="relative bg-gradient-to-b from-gray-900 to-gray-800 py-6 w-full mt-auto border-t-4 border-[#f4d03f] z-10 overflow-hidden">
                <ParticleBackground />
                <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-r from-[#f4d03f] via-[#8b4513] to-transparent transform -skew-y-3 shadow-lg"></div>
                <div className="max-w-6xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col sm:flex-row justify-between items-center text-gray-200 mb-4">
                        <span className="text-xl font-bold font-['Playfair_Display'] tracking-wide animate-glow">
                            Meal of Hope © 2025
                        </span>
                        <div className="flex gap-4 mt-2 sm:mt-0">
                            <a
                                href="#"
                                className="text-gray-200 hover:text-[#f4d03f] transition-all duration-300 transform hover:scale-110 hover:rotate-6 hover:shadow-[0_0_15px_#f4d03f]"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-200 hover:text-[#f4d03f] transition-all duration-300 transform hover:scale-110 hover:rotate-6 hover:shadow-[0_0_15px_#f4d03f]"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                                </svg>
                            </a>
                            <a
                                href="#"
                                className="text-gray-200 hover:text-[#f4d03f] transition-all duration-300 transform hover:scale-110 hover:rotate-6 hover:shadow-[0_0_15px_#f4d03f]"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.04c-5.5 0-10 4.5-10 10 0 4.4 3.6 8 8 8.9v-6.3h-2.4v-2.6h2.4v-2c0-2.4 1.5-3.7 3.6-3.7 1 0 1.9.1 2.1.2v2.4h-1.4c-1.1 0-1.3.5-1.3 1.3v1.7h2.6l-.3 2.6h-2.3v6.3c4.4-.9 8-4.5 8-8.9 0-5.5-4.5-10-10-10z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                    <div className="flex justify-center gap-2">
                        {[1, 2, 3, 4].map((_, idx) => (
                            <span
                                key={idx}
                                className="w-2 h-2 bg-[#f4d03f] rounded-full inline-block animate-constellation"
                                style={{ animationDelay: `${idx * 0.2}s` }}
                            ></span>
                        ))}
                    </div>
                    <div className="flex justify-center items-center gap-4 mt-4">
                        <a
                            href="#"
                            className="text-gray-200 hover:text-[#f4d03f] transition font-['Playfair_Display'] font-semibold"
                        >
                            Back to top ↑
                        </a>
                        <button
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            className="bg-[#f4d03f] text-[#8b4513] px-4 py-2 rounded-full font-['Playfair_Display'] font-bold animate-pulse hover:bg-[#e6c02f] transition-all duration-300 shadow-[0_0_10px_#f4d03f]"
                        >
                            Fill the Form Now!
                        </button>
                    </div>
                </div>
            </footer>

            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes glow {
          0%, 100% {
            text-shadow: 0 0 5px #f4d03f, 0 0 10px #f4d03f;
          }
          50% {
            text-shadow: 0 0 10px #f4d03f, 0 0 20px #f4d03f;
          }
        }
        .animate-glow {
          animation: glow 2s infinite;
        }
        @keyframes constellation {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(5px, -5px) scale(1.2);
            opacity: 1;
          }
        }
        .animate-constellation {
          animation: constellation 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 10px #f4d03f;
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 20px #f4d03f;
          }
        }
        .animate-pulse {
          animation: pulse 2s infinite;
        }
      `}</style>
        </div>
    );
}