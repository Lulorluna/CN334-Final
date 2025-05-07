import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [fullname, setFullname] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [sex, setSex] = useState('');
    const [tel, setTel] = useState('');
    const [error, setError] = useState(null);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        const data = { username, password, email, fullname, date_of_birth: dateOfBirth, sex, tel };
        try {
            await axios.post('http://127.0.0.1:3342/api/register/', data);
            router.push('/login');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong.');
        }
    };

    return (

        <div className="login-page">
            <div className="slideshow-container">
                <div className="slide bg1"></div>
                <div className="slide bg2"></div>
                <div className="slide bg3"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 space-y-6">
                <div className="flex flex-col items-center">
                    <Image src="/images/logo.png" width={72} height={72} alt="Logo" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create Account</h2>
                    <p className="mt-2 text-gray-600">Fill in your details to register</p>
                </div>
                {error && <div className="text-red-500 text-center">{error}</div>}
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            id="username"
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="your_username"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="••••••••"
                        />
                    </div>
                    <div>
                        <label htmlFor="fullname" className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            id="fullname"
                            type="text"
                            required
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Your full name"
                        />
                    </div>
                    <div>
                        <label htmlFor="dob" className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                            id="dob"
                            type="date"
                            required
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        />
                    </div>
                    <div>
                        <label htmlFor="sex" className="block text-sm font-medium text-gray-700">Sex</label>
                        <select
                            id="sex"
                            required
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="tel" className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            id="tel"
                            type="tel"
                            required
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="Your phone number"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-800">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
