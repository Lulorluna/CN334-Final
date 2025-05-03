export default function Login() {
    async function onLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.target)
        const response = await fetch('http://127.0.0.1:3342/api/token/', {
            method: 'POST',
            body: formData,
        });
        try {
            const data = await response.json();
            localStorage.setItem('jwt_access', data.access);
            alert("Login success!")
        } catch (error) {
            alert("Your username/password are incorrect!");
        }
    }
    return (
        <main
            className='flex min-h-screen flex-col items-center justify-between'
        >
            <div style={{ fontSize: "64px" }}
                className="w-full flex flex-col justify-center items-center dark:drop-shadow-[0_0_0.3rem_#ffffff70]">
                <div>CN334 Login form</div>
                <form onSubmit={onLogin} className="flex flex-col gap-1 text-3xl">
                    <div><label>username : </label> <input name="username" className="p-1 rounded-lg text-black" type="text" placeholder="cn334" /></div>
                    <div><label>Password : </label> <input name="password" className="p-1 rounded-lg text-black" type="password" placeholder="password" /></div>
                    <button className="p-2 bg-green-400 rounded-xl my-2" type="submit">Login</button>
                </form>
            </div>
        </main>
    );
}
