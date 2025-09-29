# Reactリレンダリングとパフォーマンス最適化ガイド

## 📌 概要

Reactでのパフォーマンス最適化について、レンダリング最適化を中心に解説する。useMemo、useCallback、React.memoの正しい使い方と、いつ使うべきかを理解するためのガイド。

⚠️ **重要:** React公式ドキュメントでも「**Don't optimize prematurely!**(早すぎる最適化はするな!)」と言っている。

## 📋 目次

- [Reactがリレンダリングされるタイミング](#reactがリレンダリングされるタイミング)
- [レンダリング最適化の3つのツール](#レンダリング最適化の3つのツール)
  - [useCallback](#usecallback)
  - [useMemo](#usememo)
  - [Reactmemo](#reactmemo)
- [useCallbackとuseMemoを使ってもリレンダリングが発生する理由](#usecallbackとusememoを使ってもリレンダリングが発生する理由)
- [具体例で理解する](#具体例で理解する)
- [結論](#結論)

---

## Reactがリレンダリングされるタイミング

最適化を試みる前に、コンポーネントがいつリレンダリングされるかを正確に知る必要がある。

| タイミング | 説明 |
|-----------|------|
| **1. propsやstateの変更** | コンポーネントのpropsまたはstateが変更された時 |
| **2. 親のリレンダリング** | 親コンポーネントがリレンダリングされると、子コンポーネントも一緒にリレンダリング |
| **3. contextの変更** | contextが変更された時、contextを使用する子コンポーネントもリレンダリング |
| **4. 強制リレンダリング** | forceUpdateを使用した時(非推奨) |

💡 **Note:** forceUpdateはクラス型コンポーネントで使用されるメソッドで、Reactのライフサイクルメソッドをスキップするため、パフォーマンスに影響を与える可能性がある。使用は推奨されない。

---

## レンダリング最適化の3つのツール

### useCallback

特定の関数を新しく生成せず、再利用できるようにする(関数をキャッシュする)。

#### 構文
const cachedFn = useCallback(fn, dependencies)

#### 動作原理
- 依存性配列に入れた値が変更された時のみ、関数を新しく生成する
- 依存性配列に入れた値をReactの比較アルゴリズムで前の値と比較
- 変更があれば関数を新しく生成、変更がなければキャッシュされた関数を使用

#### 使用場面
- 不要なレンダリングを減らして、パフォーマンスを改善する時
- 子コンポーネントのpropsとして関数を渡す時

#### ⚠️ 注意点
- 関数が簡単だったり、依存性がない時は使用しない方が良い場合もある
- メモ化自体がコストになる可能性がある

---

### useMemo

useCallbackが関数をメモ化するなら、useMemoは**結果値をキャッシュ**する。

#### 構文
const cachedValue = useMemo(calculateValue, dependencies)

#### 動作原理
- コールバック関数と依存性配列を引数として受け取る
- コールバック関数がreturnする値がuseMemoがreturnする値になる
- 依存性配列に入れた値が変更された時のみ、useMemoを更新する

#### 使用場面
- 同じ結果値を使用する関数を何度も呼び出す場合
- 同じ値を使用する演算が多く実行される場合

---

### React.memo

ReactのHOC(高次コンポーネント)の一つで、最適化されたコンポーネント(メモ化されたコンポーネント)を返す。

#### 動作原理
- React.memoで囲んだコンポーネントのpropsが変更されたかを確認
- 変更がない場合は前のレンダリング結果を再利用する
- propsの変更有無を**浅い比較(shallow comparison)**で判断

#### ⚠️ 制限事項
- **propsの変化のみを検知**するため、state、contextが変更された時のリレンダリングは防げない

⚠️ **重要:** メモ化はメモリを使用するので、無分別な使用はかえって毒になる。

---

## useCallbackとuseMemoを使ってもリレンダリングが発生する理由

useCallback、useMemoを使用しても、リレンダリングされることがある。  
この場合、**下位コンポーネントをReact.memoで囲む必要がある**。

### Reactレンダリングプロセス

Reactのレンダリングプロセスには**Render Phase**と**Commit Phase**が存在する。

#### Render Phase
- 以前のVDOMと現在のVDOMの差異を比較してチェック
- diffアルゴリズムを使用して変更点を識別

#### Commit Phase
- Render Phaseで識別した変更点を実際のDOMに反映

### 理解すべきポイント

関数コンポーネントの「レンダリング」= **関数が呼び出されること**

関数が呼び出されると:
1. 内部の変数や関数が新しく生成される
2. Reactのレンダリングプロセスを経る
3. useCallbackやuseMemoで囲んでも、**親のリレンダリングによる子のリレンダリングは防げない**

---

## 具体例で理解する

### 問題状況

カウントボタンを押すと、親とCardコンポーネントが両方リレンダリングされる問題。

#### 親コンポーネント

```tsx
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
```

#### 子コンポーネント(Card)

```tsx
function Card({ data, onClick }) {
  console.log("Cardコンポーネントレンダリング");
  
  return (
    <div onClick={onClick}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
}
```

**結果:** カウントボタンを押すと、関係ないCardコンポーネントまでリレンダリングされる ❌

---

### 原因分析と解決策

#### 🔍 犯人1: cardData(オブジェクト)

**問題点:**
- 親コンポーネントがリレンダリングされる時、この変数が新しく生成される
- **レファレンス型**なので、値ではなくアドレスを比較
- 見た目は同じだが、アドレスが異なるため、違うcardDataだと認識される

**解決策:** useMemoを使用
```tsx
const cardData = useMemo(() => ({
  title: "カードタイトル",
  description: "説明文"
}), []);
```
---

#### 🔍 犯人2: onClick(関数)

**問題点:**
- リレンダリング時に関数が新しく生成される

**解決策:** useCallbackを使用
```tsx
const onClick = useCallback(() => {
  console.log("クリックされた");
}, []);
```
---

#### 🔍 それでもリレンダリングされる理由

変数と関数をメモ化しても、**親コンポーネントがリレンダリングされる時、子コンポーネントのリレンダリングは防げない**。

**最終解決策:** 子コンポーネントをReact.memoで囲む
```tsx
const Card = React.memo(({ data, onClick }) => {
  console.log("Cardコンポーネントレンダリング");
  
  return (
    <div onClick={onClick}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
});
```

**結果:** カウントボタンを押しても、Cardコンポーネントはリレンダリングされない ✅

---

### 完成コード
```tsx
function Parent() {
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
```

```
// React.memoでコンポーネントをメモ化
const Card = React.memo(({ data, onClick }) => {
  console.log("Cardコンポーネントレンダリング");
  
  return (
    <div onClick={onClick}>
      <h3>{data.title}</h3>
      <p>{data.description}</p>
    </div>
  );
});
```

💡 **Note:** React.memoは **浅い比較(shallow comparison)** を行う。深い比較をすると、オブジェクトの場合は再帰的に入っていく必要があるため、パフォーマンス上の問題が発生する可能性がある。

---

## 結論

### ✅ すべきこと

- **パフォーマンスが遅いと体感された時**、レンダリング最適化を検討する
- レンダリング以外の部分で最適化できる部分を先に検討する
- 必要な場合にのみ、3つのツールを組み合わせて使用する

### ❌ すべきでないこと

- 無条件にレンダリング最適化から始める
- 全ての子コンポーネントが新しく生成されるのが気になるという理由だけで最適化する
- メモ化ツールを無分別に使用する(メモリコストを考慮)

### 🎯 最適化の正しいアプローチ

1. **測定する** - 実際にパフォーマンス問題があるか確認
2. **原因を特定する** - どのコンポーネントが問題か分析
3. **適切なツールを選択する** - useCallback / useMemo / React.memoを組み合わせて使用
4. **検証する** - 最適化後のパフォーマンスを確認

---

## 📚 参考資料

- [React公式ドキュメント - useCallback](https://react.dev/reference/react/useCallback)
- [React公式ドキュメント - useMemo](https://react.dev/reference/react/useMemo)
- [React公式ドキュメント - memo](https://react.dev/reference/react/memo)
- [React公式ドキュメント - Render and Commit](https://react.dev/learn/render-and-commit)
