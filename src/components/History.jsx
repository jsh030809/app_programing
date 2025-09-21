export default function History({ records }) {
  if (!records?.length) return null;
  return (
    <ul className="history">
      {records.map((r, idx) => (
        <li key={idx}>{r}</li> 
      ))}
    </ul>
  );
}
