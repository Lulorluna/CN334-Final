import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

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
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        fullname: '',
        date_of_birth: '',
        sex: '',
        tel: '',
    })
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [errors, setErrors] = useState({})

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
                })
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [])

    const handleChange = e => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }


    const handleSubmit = async e => {
        e.preventDefault()
        setErrors({})

        const token = localStorage.getItem('jwt_access')
        const payload = {
            user: {
                username: formData.username,
                email: formData.email,
            },
            fullname: formData.fullname,
            date_of_birth: formData.date_of_birth,
            sex: formData.sex,
            tel: formData.tel,
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

            router.push('/info/me')
        } catch (err) {
            console.error('Fetch error:', err)
        }
    }


    if (loading) return <p>Loading…</p>

    return (
        <div className="max-w-md mx-auto p-4">
            <h1 className="text-2xl mb-4">My Profile</h1>

            {editing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label>Username</label>
                        <input
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.user?.username && <p className="text-red-500">{errors.user.username}</p>}
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.user?.email && <p className="text-red-500">{errors.user.email}</p>}
                    </div>

                    <div>
                        <label>Full Name</label>
                        <input
                            name="fullname"
                            value={formData.fullname}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.fullname && <p className="text-red-500">{errors.fullname}</p>}
                    </div>

                    <div>
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            name="date_of_birth"
                            value={formData.date_of_birth}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.date_of_birth && <p className="text-red-500">{errors.date_of_birth}</p>}
                    </div>
                    <div>
                        <label>Sex</label>
                        <select
                            name="sex"
                            value={formData.sex}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.sex && <p className="text-red-500">{errors.sex}</p>}
                    </div>

                    <div>
                        <label>Telephone</label>
                        <input
                            name="tel"
                            value={formData.tel}
                            onChange={handleChange}
                            className="w-full border rounded p-2"
                        />
                        {errors.tel && <p className="text-red-500">{errors.tel}</p>}
                    </div>

                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="ml-2 px-4 py-2 border rounded"
                    >
                        Cancel
                    </button>
                </form>
            ) : (
                <div className="space-y-2">
                    <p><strong>Username:</strong> {formData.username}</p>
                    <p><strong>Email:</strong>    {formData.email}</p>
                    <p><strong>Full Name:</strong> {formData.fullname}</p>
                    <p><strong>DOB:</strong>       {new Date(formData.date_of_birth).toLocaleDateString('th-TH')}</p>
                    <p><strong>Sex:</strong>       {formData.sex || '-'}</p>
                    <p><strong>Tel:</strong>       {formData.tel}</p>
                    <button
                        onClick={() => setEditing(true)}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Edit Profile
                    </button>
                </div>
            )}
        </div>
    )
}
