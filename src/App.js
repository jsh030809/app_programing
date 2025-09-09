import React, { useState } from "react";

function Greeting(props) {
  const [count, setCount] = useState(0);

  return (
    <div>
      <div>
        <h2> 안녕하십니까! 저는 {props.name}입니다.</h2>
      </div>

      <div>
        <h2> 학번은 {props.studentId}입니다.</h2>
      </div>

      <div>
        <h2> 전공은 {props.major}입니다.</h2>
      </div>

      <div>
        <p>좋아요 : {count}</p>
        <button onClick={() => setCount(count + 1)}>좋아요 버튼</button>
      </div>
    </div>
  );
}
export default function App() {
  return <Greeting name="전승훈" studentId="2022108148" major="인공지능전공" />;
}
