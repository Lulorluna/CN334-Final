// import { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';

// const Register = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [email, setEmail] = useState('');
//     const [fullname, setFullname] = useState('');
//     const [dateOfBirth, setDateOfBirth] = useState('');
//     const [sex, setSex] = useState('');
//     const [tel, setTel] = useState('');
//     const [error, setError] = useState(null);
//     const router = useRouter();

//     const handleRegister = async (e) => {
//         e.preventDefault();

//         const data = {
//             username,
//             password,
//             email,
//             fullname,
//             date_of_birth: dateOfBirth,
//             sex,
//             tel,
//         };

//         try {
//             await axios.post('http://127.0.0.1:3342/api/register', data);
//             router.push('/login/');
//         } catch (err) {
//             setError(err.response?.data?.error || 'Something went wrong');
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
//                 <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>

//                 {error && <div className="text-red-500 text-center mb-4">{error}</div>}

//                 <form onSubmit={handleRegister}>
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
//                         <input
//                             type="text"
//                             id="username"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
//                         <input
//                             type="email"
//                             id="email"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
//                         <input
//                             type="password"
//                             id="password"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="fullname">Full Name</label>
//                         <input
//                             type="text"
//                             id="fullname"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={fullname}
//                             onChange={(e) => setFullname(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="dob">Date of Birth</label>
//                         <input
//                             type="date"
//                             id="dob"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={dateOfBirth}
//                             onChange={(e) => setDateOfBirth(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="sex">Sex</label>
//                         <select
//                             id="sex"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={sex}
//                             onChange={(e) => setSex(e.target.value)}
//                             required
//                         >
//                             <option value="">Select Gender</option>
//                             <option value="male">Male</option>
//                             <option value="female">Female</option>
//                         </select>
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="tel">Phone Number</label>
//                         <input
//                             type="tel"
//                             id="tel"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={tel}
//                             onChange={(e) => setTel(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4 text-center">
//                         <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Register</button>
//                     </div>
//                 </form>

//                 <div className="text-center mt-4">
//                     <p>Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;

// import { useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/router';

// const Register = () => {
//     const [username, setUsername] = useState('');
//     const [password, setPassword] = useState('');
//     const [email, setEmail] = useState('');
//     const [fullname, setFullname] = useState('');
//     const [dateOfBirth, setDateOfBirth] = useState('');
//     const [sex, setSex] = useState('');
//     const [tel, setTel] = useState('');
//     const [error, setError] = useState(null);
//     const router = useRouter();

//     const handleRegister = async (e) => {
//         e.preventDefault();

//         const data = {
//             username,
//             password,
//             email,
//             fullname,
//             date_of_birth: dateOfBirth,
//             sex,
//             tel,
//         };

//         try {
//             await axios.post('http://127.0.0.1:3342/api/register', data);
//             router.push('/login/');
//         } catch (err) {
//             setError(err.response?.data?.error || 'Something went wrong');
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
//                 <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>

//                 {error && <div className="text-red-500 text-center mb-4">{error}</div>}

//                 <form onSubmit={handleRegister}>
//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
//                         <input
//                             type="text"
//                             id="username"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
//                         <input
//                             type="email"
//                             id="email"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
//                         <input
//                             type="password"
//                             id="password"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="fullname">Full Name</label>
//                         <input
//                             type="text"
//                             id="fullname"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={fullname}
//                             onChange={(e) => setFullname(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="dob">Date of Birth</label>
//                         <input
//                             type="date"
//                             id="dob"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={dateOfBirth}
//                             onChange={(e) => setDateOfBirth(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="sex">Sex</label>
//                         <select
//                             id="sex"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={sex}
//                             onChange={(e) => setSex(e.target.value)}
//                             required
//                         >
//                             <option value="">Select Gender</option>
//                             <option value="male">Male</option>
//                             <option value="female">Female</option>
//                         </select>
//                     </div>

//                     <div className="mb-4">
//                         <label className="block text-sm font-medium text-gray-700" htmlFor="tel">Phone Number</label>
//                         <input
//                             type="tel"
//                             id="tel"
//                             className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
//                             value={tel}
//                             onChange={(e) => setTel(e.target.value)}
//                             required
//                         />
//                     </div>

//                     <div className="mb-4 text-center">
//                         <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Register</button>
//                     </div>
//                 </form>

//                 <div className="text-center mt-4">
//                     <p>Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Register;

// 'use client';

// import { useState } from 'react';
// import Link from 'next/link';
// import Image from 'next/image';

// export default function RegisterPage() {
//     const [username, setUsername] = useState('');
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');

//     const handleRegister = async (e) => {
//         e.preventDefault();
//         const payload = { username, email, password };

//         try {
//             const res = await fetch('/api/register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(payload),
//             });

//             if (!res.ok) throw new Error('Register failed');
//             alert('Registration successful!');
//         } catch {
//             alert('Registration failed');
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-200 px-4">
//             <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6">
//                 <div className="flex flex-col items-center mb-6">
//                     <Image src="/images/logo.png" width={72} height={72} alt="Logo" />
//                     <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Create Account</h2>
//                     <p className="mt-2 text-gray-600">Sign up to get started</p>
//                 </div>
//                 <form onSubmit={handleRegister} className="space-y-5">
//                     <div>
//                         <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
//                         <input
//                             id="username"
//                             type="text"
//                             required
//                             value={username}
//                             onChange={(e) => setUsername(e.target.value)}
//                             className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                             placeholder="your_username"
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
//                         <input
//                             id="email"
//                             type="email"
//                             required
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                             placeholder="you@example.com"
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
//                         <input
//                             id="password"
//                             type="password"
//                             required
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
//                             placeholder="••••••••"
//                         />
//                     </div>
//                     <button
//                         type="submit"
//                         className="w-full flex justify-center py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition"
//                     >
//                         Register
//                     </button>
//                 </form>
//                 <p className="mt-6 text-center text-sm text-gray-600">
//                     Already have an account?{' '}
//                     <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-800">
//                         Sign In
//                     </Link>
//                 </p>
//             </div>
//         </div>
//     );
// }

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
            await axios.post('http://127.0.0.1:3342/api/register', data);
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
