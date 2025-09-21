import Button from "./Button";

export default function Keypad({ onKey }) {
  const keys = [
    ["7", "8", "9", "+"],
    ["4", "5", "6", "-"],
    ["1", "2", "3", "*"],
    ["0", "C", "=", "/"],
    ["%"]
  ];

  return (
    <div className="keypad">
      {keys.map((row, i) => (
        <div className="keypad-row" key={i}>
          {row.map((key) => (
            <Button key={key} label={key} onClick={onKey} />
          ))}
        </div>
      ))}
    </div>
  );
}
