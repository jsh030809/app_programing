import { useEffect, useMemo, useRef, useState } from "react";
import {
	getByCity,
	getByCoords,
	iconUrl,
	getForecastByCity,
	getForecastByCoords,
} from "../services/weather";
import { loadCache, saveCache } from "../services/cache";

// 간단한 스타일 유틸
const box = {
	maxWidth: 680,
	margin: "24px auto",
	padding: 16,
};

const row = {
	display: "flex",
	gap: 8,
	alignItems: "center",
	flexWrap: "wrap",
};

const btn = {
	padding: "10px 14px",
	border: "1px solid #ddd",
	background: "#fff",
	borderRadius: 8,
	cursor: "pointer",
};

const pill = (active) => ({
	...btn,
	borderColor: active ? "#2b74e4" : "#ddd",
	background: active ? "#e8f1ff" : "#fff",
});

export default function Weather() {
	const [query, setQuery] = useState(""); // 사용자가 입력한 도시명
	const [units, setUnits] = useState("metric"); // "metric" | "imperial"
	const [data, setData] = useState(null); // 현재 날씨 응답
	const [forecast, setForecast] = useState(null); // 5일 예보 응답
	const [loading, setLoading] = useState(false); // 전체 로딩(검색/단위 변경 등)
	const [error, setError] = useState("");
	const [elapsed, setElapsed] = useState(null); // ms
	const lastSourceRef = useRef(null); // { type: 'city'|'coords', value: string|{lat,lon} }
	const inflightRef = useRef(null); // AbortController
	const debTimerRef = useRef(null); // 디바운스 타이머
	const [notice, setNotice] = useState(""); // 스크린리더 공지
  const weatherTimerRef = useRef(null);
  const forecastTimerRef = useRef(null);

	const unitSymbol = useMemo(() => (units === "metric" ? "°C" : "°F"), [units]);

	// 공통: 기존 요청 취소 + 시간 측정 (현재날씨/예보 동시 fetch)
	const runAll = async (source) => {
		if (inflightRef.current) inflightRef.current.abort();
		const ac = new AbortController();
		inflightRef.current = ac;
		setLoading(true);
		setError("");
		setElapsed(null);
		setNotice("");

		const t0 = performance.now();
		try {
			// TTL 설정
			const TTL_WEATHER = 5 * 60 * 1000; // 5분
			const TTL_FORECAST = 30 * 60 * 1000; // 30분

			const baseKey = `${source.type}:$${
				source.type === "city" ? source.value : `${source.value.lat},${source.value.lon}`
			}:${units}`.replace("$", "");

			// 이미 예약된 갱신 타이머가 있으면 해제
			if (weatherTimerRef.current) clearTimeout(weatherTimerRef.current);
			if (forecastTimerRef.current) clearTimeout(forecastTimerRef.current);

			// 1) 현재 날씨 캐시 확인
			const wKey = baseKey + ":current";
			const wCached = loadCache(wKey, TTL_WEATHER);
			if (wCached?.data) setData(wCached.data);

			// 2) 5일 예보 캐시 확인
			const fKey = baseKey + ":forecast";
			const fCached = loadCache(fKey, TTL_FORECAST);
			if (fCached?.data) setForecast(fCached.data);
			if (wCached?.data || fCached?.data) {
				setNotice("저장된 결과를 먼저 표시합니다. 만료 시 자동으로 최신 데이터로 갱신됩니다.");
			}

			const now = Date.now();
			const wRemain = wCached ? Math.max(0, TTL_WEATHER - (now - wCached.ts)) : 0;
			const fRemain = fCached ? Math.max(0, TTL_FORECAST - (now - fCached.ts)) : 0;

			const fetchWeatherNow = async (signal) => {
				const json =
					source.type === "city"
						? await getByCity(source.value, { units }, { signal })
						: await getByCoords(source.value.lat, source.value.lon, { units }, { signal });
				saveCache(wKey, json);
				setData(json);
				return json;
			};

			const fetchForecastNow = async (signal) => {
				const json =
					source.type === "city"
						? await getForecastByCity(source.value, { units }, { signal })
						: await getForecastByCoords(source.value.lat, source.value.lon, { units }, { signal });
				saveCache(fKey, json);
				setForecast(json);
				return json;
			};

			// 즉시 필요한 요청들 실행, 나머지는 TTL 경과 후 자동 실행
			const tasks = [];
			if (wRemain === 0) tasks.push(fetchWeatherNow(ac.signal));
			else weatherTimerRef.current = setTimeout(() => fetchWeatherNow(), wRemain);
			if (fRemain === 0) tasks.push(fetchForecastNow(ac.signal));
			else forecastTimerRef.current = setTimeout(() => fetchForecastNow(), fRemain);

			if (tasks.length > 0) {
				await Promise.all(
					tasks.map((p) =>
						p.catch((e) => {
							console.warn("refresh failed", e);
							return null;
						})
					)
				);
			}
		} catch (e) {
			setData(null);
			setForecast(null);
			setError(e?.message || "요청 중 오류가 발생했습니다.");
		} finally {
			const t1 = performance.now();
			setElapsed(Math.round(t1 - t0));
			setLoading(false);
		}
	};

	// 도시 검색 (즉시 실행)
	const handleSearch = (evt) => {
		evt?.preventDefault();
		const city = query.trim();
		if (!city) {
			setError("도시명을 입력하세요. 예) Seoul,KR");
			setData(null);
			setForecast(null);
			return;
		}
		lastSourceRef.current = { type: "city", value: city };
		runAll(lastSourceRef.current);
	};

	// 단위 전환 시, 마지막 검색 기준으로 재조회
	const toggleUnits = () => {
		setUnits((u) => (u === "metric" ? "imperial" : "metric"));
	};

	useEffect(() => {
		if (!lastSourceRef.current) return;
		runAll(lastSourceRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [units]);

	// 검색 디바운스: 입력이 멈춘 뒤 300ms 경과 시 자동 조회
	useEffect(() => {
		if (debTimerRef.current) clearTimeout(debTimerRef.current);
		const city = query.trim();
		if (!city) return; // 빈 값은 무시
		debTimerRef.current = setTimeout(() => {
			lastSourceRef.current = { type: "city", value: city };
			runAll(lastSourceRef.current);
		}, 300);
		return () => debTimerRef.current && clearTimeout(debTimerRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [query]);

	// 내 위치 가져오기 (현재 + 예보)
	const handleMyLocation = () => {
		if (!("geolocation" in navigator)) {
			setError("이 브라우저에서는 위치 기능을 지원하지 않습니다.");
			return;
		}
		setError("");
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				const { latitude: lat, longitude: lon } = pos.coords;
				lastSourceRef.current = { type: "coords", value: { lat, lon } };
				runAll(lastSourceRef.current);
			},
			(err) => {
				const msg =
					err.code === err.PERMISSION_DENIED
						? "위치 권한이 거부되었습니다."
						: "현재 위치를 가져오지 못했습니다.";
				setError(msg);
			},
			{ enableHighAccuracy: false, timeout: 8000 }
		);
	};

	// 표시에 필요한 필드 추출
	const view = useMemo(() => {
		if (!data) return null;
		const name = `${data.name}${data.sys?.country ? ", " + data.sys.country : ""}`;
		const w = data.weather?.[0];
		const temp = Math.round(data.main?.temp);
		const feels = Math.round(data.main?.feels_like);
		return {
			name,
			desc: w?.description,
			icon: w?.icon,
			temp,
			feels,
			humid: data.main?.humidity,
			wind: data.wind?.speed,
		};
	}, [data]);

	return (
		<div style={box}>
			<h2 style={{ marginBottom: 12 }}>날씨 조회</h2>

			{/* 검색/동작 영역 */}
			<form onSubmit={handleSearch} style={{ ...row, marginBottom: 12 }} aria-busy={loading}>
				<input
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder="도시명,국가코드 (예: Seoul,KR)"
					aria-label="도시 검색"
					style={{ flex: 1, minWidth: 220, padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
				/>
				<button type="submit" style={btn} disabled={loading}>
					검색
				</button>
				<button type="button" style={btn} onClick={handleMyLocation} disabled={loading}>
					내 위치
				</button>

				<div role="group" aria-label="단위 전환" style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
					<button
						type="button"
						onClick={toggleUnits}
						style={pill(true)}
						title="°C/°F 전환"
						disabled={loading}
					>
						{units === "metric" ? "°C" : "°F"}
					</button>
				</div>
			</form>

			{/* 상태 메시지 */}
			{loading && (
				<p style={{ padding: 8 }} role="status" aria-live="polite">
					불러오는 중…
				</p>
			)}
			{!loading && !data && !error && (
				<p style={{ padding: 8, color: "#666" }}>도시를 검색하거나 ‘내 위치’ 버튼을 눌러 시작하세요.</p>
			)}
			{!loading && error && (
				<p role="alert" style={{ padding: 8, color: "#b42318", background: "#fdecea", borderRadius: 8 }}>
					{error}
				</p>
			)}
			{notice && (
				<p role="alert" style={{ padding: 8, color: "#155724", background: "#e2f5e9", borderRadius: 8 }}>
					{notice}
				</p>
			)}

			{/* 결과 */}
			{!loading && view && (
				<div style={{ marginTop: 12, border: "1px solid #eee", borderRadius: 12, padding: 16 }}>
					<div style={row}>
						{view.icon && (
							<img src={iconUrl(view.icon)} alt={view.desc || "icon"} width={72} height={72} />
						)}
						<div style={{ flex: 1 }}>
							<div style={{ fontSize: 18, fontWeight: 700 }}>{view.name}</div>
							<div style={{ color: "#555", textTransform: "capitalize" }}>{view.desc}</div>
						</div>
						<div style={{ fontSize: 40, fontWeight: 800 }}>
							{view.temp}
							<span style={{ fontSize: 20, marginLeft: 4 }}>{unitSymbol}</span>
						</div>
					</div>

					<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: 8, marginTop: 12 }}>
						<Info label="체감" value={`${view.feels}${unitSymbol}`} />
						<Info label="습도" value={`${view.humid}%`} />
						<Info label="바람" value={`${view.wind}${units === "metric" ? " m/s" : " mph"}`} />
					</div>

					{elapsed != null && (
						<p style={{ marginTop: 8, color: "#666" }}>응답시간: {elapsed} ms</p>
					)}

					{/* 5일 예보 */}
					{forecast?.list && forecast.list.length > 0 && (
						<div style={{ marginTop: 16 }}>
							<h3 style={{ margin: "8px 0" }}>5일 예보 (3시간 간격)</h3>
							<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
								{forecast.list.slice(0, 16).map((it) => (
									<div key={it.dt} style={{ border: "1px solid #eee", borderRadius: 10, padding: 10 }}>
										<div style={{ fontSize: 12, color: "#555" }}>{new Date(it.dt * 1000).toLocaleString()}</div>
										<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
											{it.weather?.[0]?.icon && (
												<img
													src={iconUrl(it.weather[0].icon)}
													alt={it.weather[0].description || "icon"}
													width={42}
													height={42}
												/>
											)}
											<div style={{ fontWeight: 700 }}>
												{Math.round(it.main?.temp)}
												<span style={{ fontSize: 12, marginLeft: 2 }}>{unitSymbol}</span>
											</div>
										</div>
										<div style={{ color: "#666", textTransform: "capitalize" }}>{it.weather?.[0]?.description}</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			)}

			{/* 네트워크 확인 가이드 */}
			<details style={{ marginTop: 16 }}>
				<summary>확인 가이드</summary>
				<ul style={{ marginTop: 8 }}>
					<li>도시명 검색 시 현재 날씨가 표시되는지</li>
					<li>단위를 °C/°F 전환하면 값이 바뀌는지</li>
					<li>‘내 위치’ 버튼으로 현재 위치 날씨가 표시되는지 (권한 필요)</li>
					<li>로딩/에러/빈 상태 메시지가 적절히 표시되는지</li>
					<li>DevTools Network 탭에서 상태코드/응답시간/타임아웃 동작 확인</li>
				</ul>
			</details>
		</div>
	);
}

function Info({ label, value }) {
	return (
		<div style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
			<div style={{ fontSize: 12, color: "#666" }}>{label}</div>
			<div style={{ fontWeight: 700 }}>{value}</div>
		</div>
	);
}

