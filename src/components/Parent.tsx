import { useState } from 'react';
import Card from './Card';

function Parent() {
  const [count, setCount] = useState(0);
  
  const cardData = {
    title: "カードタイトル",
    description: "説明文"
  };
  
  const onClick = () => {
    console.log("クリックされた");
  };
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        カウント: {count}
      </button>
      <Card data={cardData} onClick={onClick} />
    </div>
  );
}

export default Parent;
