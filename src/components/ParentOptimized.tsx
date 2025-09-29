import { useState, useMemo, useCallback } from 'react';
import Card from './Card';

function ParentOptimized() {
  const [count, setCount] = useState(0);
  
  // useMemoでオブジェクトをメモ化
  const cardData = useMemo(() => ({
    title: "カードタイトル",
    description: "説明文"
  }), []);
  
  // useCallbackで関数をメモ化
  const onClick = useCallback(() => {
    console.log("クリックされた");
  }, []);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        カウント: {count}
      </button>
      <Card data={cardData} onClick={onClick} />
    </div>
  );
}

export default ParentOptimized;