import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  src: string;
  type?: string;
  autoplay?: boolean;
  controls?: boolean;
  fluid?: boolean;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  type = 'application/x-mpegURL',
  autoplay = true,
  controls = true,
  fluid = true,
  onTimeUpdate,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = videojs(videoRef.current, {
      autoplay,
      controls,
      fluid,
      sources: [{ src, type }],
    });

    if (onTimeUpdate) {
      playerRef.current.on('timeupdate', () => {
        onTimeUpdate(
          playerRef.current.currentTime(),
          playerRef.current.duration()
        );
      });
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
      }
    };
  }, [src, type, autoplay, controls, fluid, onTimeUpdate]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" />
    </div>
  );
};

export default VideoPlayer;