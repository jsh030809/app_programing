import 
{useState}
from "react";
export default function LikeToggle() {
    const [liked, setLiked] = useState(false);
    return (
        <button onClick={() => setLiked(v => !v)}>
            {liked ? "*liked" : "Like"}
        </button>
    );
}