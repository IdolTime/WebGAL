import { useEffect, useState } from 'react';
import styles from './loading.module.scss';
import { loadingSVGStr } from '../Components/LoadingSvg';

export function Loading() {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // @ts-ignore
    const dispose = window.pubsub.subscribe('loading', ({ loading }: { loading: boolean }) => {
      setLoading(loading);
    });

    return dispose;
  }, []);

  if (!loading) return null;

  return <div className={styles.Loading_container} dangerouslySetInnerHTML={{ __html: loadingSVGStr }} />;
}
