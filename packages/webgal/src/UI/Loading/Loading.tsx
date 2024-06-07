import { useEffect, useState } from 'react';
import styles from './loading.module.scss';

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

  return (
    <div className={styles.Loading_container}>
      <svg xmlns="http://www.w3.org/2000/svg" width="116" height="116" viewBox="0 0 116 116" fill="none">
        <g filter="url(#filter0_f_44_50)">
          <path d="M58 33V43" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M58 73V83" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M83 58H73" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M43 58H33" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path
            d="M40.3223 40.3224L47.3933 47.3934"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M68.6067 68.6067L75.6777 75.6777"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M75.6777 40.3224L68.6067 47.3934"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M47.3933 68.6067L40.3223 75.6777"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <path d="M58 33V43" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 73V83" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M83 58H73" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M43 58H33" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M40.3223 40.3224L47.3933 47.3934"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M68.6067 68.6067L75.6777 75.6777"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M75.6777 40.3224L68.6067 47.3934"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M47.3933 68.6067L40.3223 75.6777"
          stroke="white"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <filter
            id="filter0_f_44_50"
            x="0.5"
            y="0.5"
            width="115"
            height="115"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="15" result="effect1_foregroundBlur_44_50" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
