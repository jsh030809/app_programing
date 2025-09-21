import { useState, useEffect } from "react";
import { evaluate, format } from "mathjs";
import Display from "./components/Display";
import Keypad from "./components/Keypad";
import History from "./components/History";
import "./App.css";
import "./components/app.css";

export default function App() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);

  // 키보드 입력 지원
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key;
      if ((key >= '0' && key <= '9') || ["+", "-", "*", "/", "%", "."].includes(key)) {
        setInput((prev) => prev + key);
      } else if (key === 'Enter' || key === '=') {
        handleClick("=");
      } else if (key === 'c' || key === 'C') {
        handleClick("C");
      } else if (key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClick = (value) => {
    // C: 초기화 (p.20)
    if (value === "C") {
      setInput("");
      return;
    }

    // =: 계산 실행 + 기록 추가 (math.js 사용, 소수점 정확도 개선)
    if (value === "=") {
      try {
        // % 연산 math.js에서 지원 (modulo)
        let expr = input.replace(/%/g, ' mod ');
        let result = evaluate(expr);
        // 소수점 10자리까지, 불필요한 0 제거
        result = format(result, {precision: 14, lowerExp: -10, upperExp: 20});
        setInput(result);
        setHistory((prev) => [ `${input} = ${result}`, ...prev ].slice(0, 5));
      } catch {
        setInput("Error");
      }
      return;
    }

    // 일반 입력 누적 (p.15)
    setInput((prev) => prev + value);
  };

  const handleClearHistory = () => {
    if (window.confirm("정말로 기록을 모두 삭제하시겠습니까?")) {
      setHistory([]);
    }
  };

  return (
    <div className="container">
      <h1>React 계산기</h1>
      <Display value={input} />
      {/* 오류 조건부 렌더링 예시 (p.26) */}
      {input === "Error" && <p style={{ color: "red" }}>잘못된 수식!</p>}

      <Keypad onKey={handleClick} />
      <button className="btn btn-clear-history" onClick={handleClearHistory} style={{marginTop:5, marginBottom:5}}>reset</button>
      <History records={history} />
    </div>
  );
}
