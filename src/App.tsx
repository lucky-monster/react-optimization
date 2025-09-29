import Parent from './components/Parent';
import ParentOptimized from './components/ParentOptimized';

function App() {
  return (
    <div className="App">
      <h1>最適化前</h1>
      <Parent/>
      
      <hr />
      
      <h1>最適化後</h1>
      <ParentOptimized />
    </div>
  );
}

export default App;