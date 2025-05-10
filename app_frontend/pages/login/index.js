// export default function Login() {
//     async function onLogin(event) {
//         event.preventDefault();
//         const formData = new FormData(event.target)
//         const response = await fetch('http://127.0.0.1:3342/api/token/', {
//             method: 'POST',
//             body: formData,
//         });
//         try {
//             const data = await response.json();
//             localStorage.setItem('jwt_access', data.access);
//             alert("Login success!")
//         } catch (error) {
//             alert("Your username/password are incorrect!");
//         }
//     }
//     return (
//         <main
//             className='flex min-h-screen flex-col items-center justify-between'
//         >
//             <div style={{ fontSize: "64px" }}
//                 className="w-full flex flex-col justify-center items-center dark:drop-shadow-[0_0_0.3rem_#ffffff70]">
//                 <div>CN334 Login form</div>
//                 <form onSubmit={onLogin} className="flex flex-col gap-1 text-3xl">
//                     <div><label>username : </label> <input name="username" className="p-1 rounded-lg text-black" type="text" placeholder="cn334" /></div>
//                     <div><label>Password : </label> <input name="password" className="p-1 rounded-lg text-black" type="password" placeholder="password" /></div>
//                     <button className="p-2 bg-green-400 rounded-xl my-2" type="submit">Login</button>
//                 </form>
//             </div>
//         </main>
//     );
// }

'use client';

import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [error, setError] = useState('');

    async function handleLogin(event) {
        event.preventDefault();
        setError('');
        const formData = new FormData(event.target);
        try {
            const response = await fetch('http://127.0.0.1:3342/api/token/', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok && data.access) {
                localStorage.setItem('jwt_access', data.access);
                alert('Login successful!');
                router.push('/');
            } else {
                throw new Error();
            }
        } catch {
            setError('Your username or password is incorrect.');
        }
    }

    return (

        <div className="login-page">
            <div className="slideshow-container">
                <div className="slide bg1"></div>
                <div className="slide bg2"></div>
                <div className="slide bg3"></div>
            </div>
            <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="flex flex-col items-center">
                    <Image src="/images/logo.png" width={72} height={72} alt="Logo" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">Welcome Back</h2>
                    <p className="mt-2 text-gray-600">Sign in to continue</p>
                </div>
                {error && <p className="text-red-500 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            name="username"
                            id="username"
                            type="text"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="your_username"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            name="password"
                            id="password"
                            type="password"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-2 px-4 bg-yellow-400 hover:bg-yellow-500 text-white font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition"
                    >
                        Sign In
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-medium text-yellow-600 hover:text-yellow-800">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
}



