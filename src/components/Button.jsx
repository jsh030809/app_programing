export default function Button({label, onClick}) {
    // 연산자/특수 버튼 구분
    const isOperator = ["+", "-", "*", "/", "%"].includes(label);
    const isEqual = label === "=";
    const isClear = label === "C";
    const isReset = label === "reset";
    let className = "btn";
    if (isOperator || isReset) className += " btn-operator";
    if (isEqual) className += " btn-equal";
    if (isClear) className += " btn-clear";
    return (
        <button className={className} onClick={() => onClick(label)}>
            <span className="btn-label">{label}</span>
        </button>
    );
}