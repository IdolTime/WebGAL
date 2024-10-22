import React, { MediaHTMLAttributes, useEffect, useRef } from 'react';
import flvjs from 'flv.js';
import { decryptVideo, decryptVideoInChunks } from '@/Core/Modules/video';

const FlvPlayer = ({
  url,
  videoPlayerRef,
  ...otherProps
}: { url: string; videoPlayerRef?: { current: flvjs.Player | null } } & MediaHTMLAttributes<HTMLVideoElement>) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let flvPlayer: flvjs.FlvPlayer;
    if (flvjs.isSupported() && videoRef.current) {
      const videoType = url.endsWith('.flv') ? 'flv' : 'mp4';

      fetch(url)
        .then((res) => {
          if (res.status > 200) {
            return null;
          }
          return res.arrayBuffer();
        })
        .then(async (dataBuffer) => {
          if (!dataBuffer) {
            return;
          }

          const marker = 'ENCRYPTED';
          const markerLength = marker.length;
          const signatureArray = new Uint8Array(dataBuffer.slice(0, markerLength));

          let isEncrypted = false;
          for (let i = 0; i < markerLength; i++) {
            if (String.fromCharCode(signatureArray[i]) !== marker[i]) {
              isEncrypted = false;
              break;
            }
            isEncrypted = true;
          }

          const worker = new Worker(new URL('../../../public/worker.js', import.meta.url), { type: 'module' });

          const onVideoDecodedCallback = (videoBlob: any) => {
            const flvPlayer = flvjs.createPlayer({
              type: url.endsWith('.mp4') ? 'mp4' : 'flv',
              url: URL.createObjectURL(videoBlob),
            });
            if (videoPlayerRef) {
              videoPlayerRef.current = flvPlayer;
            }
            flvPlayer.attachMediaElement(videoRef.current as HTMLVideoElement);
            flvPlayer.load();
          };

          if (isEncrypted) {
            const encryptedData = dataBuffer.slice(markerLength);

            if (window.crypto?.subtle) {
              const key = new Uint8Array([
                0x40, 0xe6, 0xad, 0x42, 0x9a, 0x13, 0x02, 0x0a, 0x07, 0xbe, 0x29, 0x0c, 0x5e, 0xf1, 0xd7, 0xdc, 0x7e,
                0x45, 0xe5, 0xc4, 0xbf, 0x34, 0xd5, 0x4a, 0x56, 0x64, 0x28, 0x26, 0x27, 0x94, 0x6e, 0x4d,
              ]);
              const iv = new Uint8Array([
                0x9d, 0x6b, 0xac, 0x74, 0xc6, 0x4e, 0xe8, 0x71, 0x4e, 0x79, 0x59, 0xce, 0xf7, 0x52, 0x71, 0xd0,
              ]);
              worker.postMessage({ encryptedData, key, iv, type: videoType, supportCrypto: true });
            } else {
              const key = '40e6ad429a13020a07be290c5ef1d7dc7e45e5c4bf34d54a5664282627946e4d';
              const iv = '9d6bac74c64ee8714e7959cef75271d0';
              worker.postMessage({ encryptedData, key, iv, type: videoType, supportCrypto: false });
            }

            worker.onmessage = (event) => {
              if (event.data.blobData) {
                onVideoDecodedCallback(event.data.blobData);
              } else if (event.data.errorMessage) {
                console.error(event.data.errorMessage + '：' + event.data.error.message);
              }
            };
          } else {
            const videoBlob = new Blob([new Uint8Array(dataBuffer)], {
              type: `video/${videoType === 'mp4' ? 'mp4' : 'x-flv'}`,
            });
            onVideoDecodedCallback(videoBlob);
          }
        });
    }

    return () => {
      if (flvPlayer) {
        flvPlayer.destroy();
        if (videoPlayerRef) {
          videoPlayerRef.current = null;
        }
      }
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      {...otherProps}
      style={{ width: '100%', height: 'auto' }}
      onClick={(e) => {
        e.stopPropagation();
        // e.preventDefault();
        if (otherProps.onClick) {
          otherProps.onClick(e);
        }
      }}
    />
  );
};

export default FlvPlayer;
