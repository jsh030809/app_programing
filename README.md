# Weather 데모 실행 안내

이 프로젝트에는 OpenWeather 기반의 간단한 날씨 페이지(`/weather`)가 포함되어 있습니다.

- 환경 변수 설정: 프로젝트 루트에 `.env` 파일을 만들고 다음을 설정하세요.

```
REACT_APP_OW_KEY=여기에_본인_OpenWeather_API_Key
# 선택: 기본 API 베이스 변경 시
# REACT_APP_OW_BASE=https://api.openweathermap.org
```

- 실행 후 브라우저에서 http://localhost:3000/weather 로 이동합니다.
	- 도시 검색: `Seoul,KR` 형식 권장
	- 단위 전환: 버튼으로 °C/°F 전환 시 자동 재조회
	- 내 위치: 권한 허용 시 현재 위치 날씨 조회
	- 로딩/에러/빈 상태 메시지 확인 가능

## 기술 메모 (에러/로딩/타임아웃)

- 네트워크 타임아웃: 각 요청은 8초 타임아웃을 적용하여 지연 시 `"요청이 시간 초과되었습니다."`로 처리합니다. (`src/services/weather.js`)
- 로딩 상태: 요청 중 `aria-busy`와 `role="status"`를 활용해 시각적/스크린리더 모두 로딩을 안내합니다. (`src/pages/Weather.jsx`)
- 에러 처리: HTTP 에러 메시지/상태코드를 파싱해 사용자 친화적으로 표시하고, SR용 `role="alert"`도 함께 적용합니다.
- 캐시 전략: localStorage에 현재 5분, 예보 30분 TTL로 저장 후 즉시 표시하고, TTL 만료 시점에 자동으로 최신 데이터로 갱신합니다.
- 접근성: 안내/오류는 `role="alert"`, 진행상황은 `role="status"`로 노출하여 보조공학에서도 상태 변화를 인지할 수 있습니다.

아래는 CRA 기본 문서입니다.

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
