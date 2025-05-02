import { useState, useEffect } from 'react'
export default function myInfo() {
    const [info, setInfo] = useState(null)
    const [info_list, setInfoList] = useState(null)
    useEffect(() => {
        let token = localStorage.getItem("jwt_access");
        const res = fetch(`http://127.0.0.1:3342/api/myinfo`,
            { headers: { Authorization: `Bearer ${token}` } }).then((res) =>
                (res.json())).then(
                    (data) => {
                        setInfo(data);
                        setInfoList(Object.keys(data.data).map((info_key) => <li key={info_key}>{data.data[info_key]}</li>));
                    });
    }, [])
    if (!info) return <p>No profile data</p>
    else return (
        <main
            className='flex min-h-screen flex-col items-center justify-between'
        >
            <div style={{ fontSize: "64px" }}
                className="w-full flex flex-col justify-center items-center dark:drop-shadow-[0_0_0.3rem_#ffffff70]">
                <div>{info.data['fullname']} Info</div>
                <div>
                    {info_list}
                </div>
            </div>
        </main>);
}
