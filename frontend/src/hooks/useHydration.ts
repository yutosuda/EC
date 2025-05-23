import { useEffect, useState } from 'react';

/**
 * SSRハイドレーション対応フック
 * サーバーサイドでは初期値を返し、クライアントサイドでハイドレーション完了後に実際の値を返す
 */
export function useHydration() {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
}

/**
 * SSRセーフなZustandストア使用フック
 * @param useStore Zustandストアのフック
 * @param selector ストアから値を取得するセレクタ関数
 * @param fallback SSR時の初期値
 */
export function useSSRSafeStore<TState, TSelected>(
  useStore: (selector: (state: TState) => TSelected) => TSelected,
  selector: (state: TState) => TSelected,
  fallback: TSelected
): TSelected {
  const isHydrated = useHydration();
  
  if (!isHydrated) {
    return fallback;
  }
  
  return useStore(selector);
} 