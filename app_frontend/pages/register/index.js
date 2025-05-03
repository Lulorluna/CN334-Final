import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

const Register = () => {
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

        const data = {
            username,
            password,
            email,
            fullname,
            date_of_birth: dateOfBirth,
            sex,
            tel,
        };

        try {
            await axios.post('http://127.0.0.1:3342/api/register', data);
            router.push('/login/');
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full">
                <h2 className="text-2xl font-semibold text-center mb-6">Create an Account</h2>

                {error && <div className="text-red-500 text-center mb-4">{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="fullname">Full Name</label>
                        <input
                            type="text"
                            id="fullname"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="dob">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="sex">Sex</label>
                        <select
                            id="sex"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={sex}
                            onChange={(e) => setSex(e.target.value)}
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700" htmlFor="tel">Phone Number</label>
                        <input
                            type="tel"
                            id="tel"
                            className="w-full p-2 border border-gray-300 rounded mt-1 text-black"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4 text-center">
                        <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600">Register</button>
                    </div>
                </form>

                <div className="text-center mt-4">
                    <p>Already have an account? <a href="/login" className="text-blue-500">Login</a></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
