import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import Weather from "./pages/Weather.jsx";

export default function App() {
  return (
    <>
      {/* 간단한 네비게이션 (활성 탭 굵게 표시) */}
      <nav style={{ display: "flex", gap: 12, padding: 12, borderBottom: "1px solid #eee" }}>
        <NavLink
          to="/weather"
          style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400 })}
        >
          Weather
        </NavLink>
      </nav>

      {/* 라우팅 */}
      <Routes>
        {/* 기본 루트 → /weather 로 이동 */}
        <Route path="/" element={<Navigate to="/weather" replace />} />
        <Route path="/weather" element={<Weather />} />
        {/* 알수없는 경로 처리 */}
        <Route path="*" element={<p style={{padding:16}}>Not Found</p>} />
      </Routes>
    </>
  );
}
