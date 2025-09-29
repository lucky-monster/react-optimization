import { memo } from 'react';

// React.memoでコンポーネントをメモ化
const Card = memo(({ data, onClick }: {
  data: { title: string; description: string };
  onClick: () => void;
}) => {
  console.log("Cardコンポーネントレンダリング");
  
  return (
    <div 
      onClick={onClick}
      style={{
        border: '1px solid #ccc',
        padding: '20px',
        margin: '10px',
        borderRadius: '8px',
        cursor: 'pointer'
      }}
    >
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
});

export default Card;
