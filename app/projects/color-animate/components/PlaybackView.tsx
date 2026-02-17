"use client";

import { useState, useEffect, useRef } from "react";
import { ProcessingStep } from "../lib/types";
import Image from "next/image";

interface PlaybackViewProps {
  steps: ProcessingStep[];
  videoUrl?: string;
  onRestart?: () => void;
}

export default function PlaybackView({ steps, videoUrl, onRestart }: PlaybackViewProps) {
  const [currentFrame, setCurrentFrame] = useState(steps.length - 1); // Start from last (white)
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackComplete, setPlaybackComplete] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Reverse array to go from white back to colored
  const reversedSteps = [...steps].reverse();

  const startPlayback = () => {
    setIsPlaying(true);
    setPlaybackComplete(false);
    setCurrentFrame(0);

    let frame = 0;
    intervalRef.current = setInterval(() => {
      frame++;
      if (frame >= reversedSteps.length) {
        clearInterval(intervalRef.current!);
        setIsPlaying(false);
        setPlaybackComplete(true);
        // Auto-play video after playback
        if (videoUrl) {
          setTimeout(() => setShowVideo(true), 500);
        }
      } else {
        setCurrentFrame(frame);
      }
    }, 800); // 800ms per frame
  };

  const stopPlayback = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  };

  const restart = () => {
    stopPlayback();
    setCurrentFrame(0);
    setPlaybackComplete(false);
    setShowVideo(false);
    if (onRestart) {
      onRestart();
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (showVideo && videoUrl) {
    return (
      <div className="flex flex-col gap-6">
        <div className="rounded-2xl border border-border overflow-hidden">
          <video
            src={videoUrl}
            controls
            autoPlay
            loop
            className="w-full"
          />
        </div>

        <div className="flex justify-center gap-3">
          <button
            onClick={() => setShowVideo(false)}
            className="rounded-full px-5 py-2 border border-border text-[13px] text-text-muted hover:border-gold/50 hover:text-gold transition-all"
          >
            <i className="fa-solid fa-arrow-left mr-2" />
            Back to Steps
          </button>
          <button
            onClick={restart}
            className="rounded-full px-5 py-2 border border-border text-[13px] text-text-muted hover:border-gold/50 hover:text-gold transition-all"
          >
            <i className="fa-solid fa-rotate-right mr-2" />
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Main display */}
      <div className="relative w-full aspect-video rounded-2xl border border-border overflow-hidden bg-surface">
        <Image
          src={reversedSteps[currentFrame].imageUrl}
          alt="Playback frame"
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {/* Progress indicator */}
      <div className="flex items-center gap-3">
        <span className="text-[12px] text-text-faint">
          Frame {currentFrame + 1} / {reversedSteps.length}
        </span>
        <div className="flex-1 h-1 bg-border rounded-full overflow-hidden">
          <div
            className="h-full bg-gold transition-all duration-300"
            style={{ width: `${((currentFrame + 1) / reversedSteps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!isPlaying && !playbackComplete && (
          <button
            onClick={startPlayback}
            className="rounded-full px-6 py-2 bg-gold text-white text-[13px] font-medium hover:bg-gold-dark transition-all"
          >
            <i className="fa-solid fa-play mr-2" />
            Play Color Animation
          </button>
        )}

        {isPlaying && (
          <button
            onClick={stopPlayback}
            className="rounded-full px-6 py-2 border border-gold text-gold text-[13px] font-medium hover:bg-gold/10 transition-all"
          >
            <i className="fa-solid fa-pause mr-2" />
            Pause
          </button>
        )}

        {playbackComplete && !showVideo && (
          <>
            <button
              onClick={startPlayback}
              className="rounded-full px-5 py-2 border border-border text-[13px] text-text-muted hover:border-gold/50 hover:text-gold transition-all"
            >
              <i className="fa-solid fa-rotate-right mr-2" />
              Replay
            </button>
            {videoUrl && (
              <button
                onClick={() => setShowVideo(true)}
                className="rounded-full px-6 py-2 bg-gold text-white text-[13px] font-medium hover:bg-gold-dark transition-all"
              >
                <i className="fa-solid fa-film mr-2" />
                Watch Video
              </button>
            )}
          </>
        )}

        <button
          onClick={restart}
          className="rounded-full px-5 py-2 border border-border text-[13px] text-text-muted hover:border-gold/50 hover:text-gold transition-all"
        >
          <i className="fa-solid fa-arrow-rotate-left mr-2" />
          New Image
        </button>
      </div>
    </div>
  );
}
