import { useState } from "react";
export default function Greeter() {
    const [count, setCount] = useState(0);
    return (
        <div className="card">
            <input placeholder="이름 입력" value={name} onChange={e => setName(e.target.value)}></input>
            <p>안녕하세요, {name || "익명"}님!</p>
        </div>
    );
}