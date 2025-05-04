'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Date.now() >= payload.exp * 1000;
    } catch {
        return true;
    }
}

export default function AboutPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token && !isTokenExpired(token)) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, []);

    return (
        <div className="flex flex-col bg-[#fffdf5] min-h-screen">
            <div className="h-20" />
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
                                const href = text === 'Home' ? '/' : text === 'About Us' ? '/aboutus' : '/product-list';
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
                            <Link href="/login" className="bg-yellow-400 hover:bg-yellow-500 transition-colors duration-200 ease-in-out text-white font-bold px-4 py-2 rounded-full">
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <section className="container mx-auto px-4 mt-10">
                <h1 className="text-4xl font-bold mb-4 text-center text-yellow-700">About Us</h1>
                <p className="text-center max-w-2xl mx-auto text-gray-700 text-lg">
                    Meal of Hope คือเว็บไซต์ที่สร้างขึ้นเพื่อให้ทุกคนสามารถเข้าถึงอาหารสด สะอาด และมีคุณภาพในราคาที่เหมาะสม
                    เราเชื่อว่า "อาหารที่ดี คือจุดเริ่มต้นของชีวิตที่มีพลัง"
                </p>
            </section>

            <section className="container mx-auto px-4 mt-16">
                <h2 className="text-3xl font-bold mb-6 text-center text-yellow-700">Our Mission</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <p className="text-gray-700 text-lg">
                            เรามุ่งเน้นในการคัดสรรวัตถุดิบที่สดใหม่จากแหล่งเพาะปลูกที่เชื่อถือได้ และใช้เทคโนโลยีในการจัดส่งอย่างมีประสิทธิภาพ
                            เพื่อให้ผู้บริโภคมั่นใจได้ในทุกคำที่รับประทาน
                        </p>
                    </div>
                    <div className="relative w-full h-64">
                        <Image src="/images/mission.jpg" alt="Our Mission" fill className="object-cover rounded-lg shadow-md" />
                    </div>
                </div>
            </section>

            <section className="container mx-auto px-4 mt-16 mb-16">
                <h2 className="text-3xl font-bold mb-8 text-center text-yellow-700">ทีมงานของเรา (Our Team)</h2>
                <div className="flex flex-wrap justify-center gap-8">
                    {[
                        { name: 'ธนศักดิ์ ชนม์เรืองฉาย', id: '6610742410', position: 'System / Backend Developer' },
                        { name: 'ณัฏชนน วสุธวัช', id: '6610742279', position: 'Business / Backend Developer' },
                        { name: 'ธนภัทร์ แย้มบู่', id: '6610742113', position: 'Frontend Developer' },
                    ].map((member, idx) => (
                        <div
                            key={idx}
                            className="w-72 bg-white border rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 text-center"
                        >
                            <div className="w-24 h-24 mx-auto relative mb-4">
                                <Image
                                    src="/images/user-profile.jpg"
                                    alt={member.name}
                                    fill
                                    className="object-cover rounded-full border-2 border-yellow-400"
                                />
                            </div>
                            <h3 className="font-semibold text-lg text-gray-800">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.id}</p>
                            <p className="mt-2 text-sm text-gray-600">{member.position}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}