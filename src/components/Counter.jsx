import { useState } from "react";
export default function Counter() {
    const [count, setCount] = useState(0);
    return (
        <div className="card">
            <p>카운트: {count}  </p>
            <button onClick={() => setCount(c => c + 1)}>+1</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}