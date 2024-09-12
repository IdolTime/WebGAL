import React, { MediaHTMLAttributes, useEffect, useRef } from 'react';
import flvjs from 'flv.js';
import { decryptVideo } from '@/Core/Modules/video';

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

          let videoBlob;
          if (isEncrypted) {
            const encryptedData = dataBuffer.slice(markerLength);
            const key = '40e6ad429a13020a07be290c5ef1d7dc7e45e5c4bf34d54a5664282627946e4d';
            const iv = '9d6bac74c64ee8714e7959cef75271d0';
            videoBlob = await decryptVideo(encryptedData, key, iv, videoType);
          } else {
            videoBlob = new Blob([new Uint8Array(dataBuffer)], {
              type: `video/${videoType === 'mp4' ? 'mp4' : 'x-flv'}`,
            });
          }

          const flvPlayer = flvjs.createPlayer({
            type: url.endsWith('.mp4') ? 'mp4' : 'flv',
            url: URL.createObjectURL(videoBlob),
          });
          if (videoPlayerRef) {
            videoPlayerRef.current = flvPlayer;
          }
          flvPlayer.attachMediaElement(videoRef.current as HTMLVideoElement);
          flvPlayer.load();
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

  return <video ref={videoRef} {...otherProps} style={{ width: '100%', height: 'auto' }} />;
};

export default FlvPlayer;
