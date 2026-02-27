'use client';

import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { FortuneRanking } from '@/remotion/FortuneRanking';
import { VideoConfig } from '@/lib/types';

interface VideoPreviewProps {
    config: VideoConfig;
    durationInFrames: number;
}

export interface VideoPreviewHandle {
    getPlayerContainer: () => HTMLElement | null;
    getPlayerRef: () => PlayerRef | null;
}

export const VideoPreview = forwardRef<VideoPreviewHandle, VideoPreviewProps>(
    ({ config, durationInFrames }, ref) => {
        const containerRef = useRef<HTMLDivElement>(null);
        const playerRef = useRef<PlayerRef>(null);

        useImperativeHandle(ref, () => ({
            getPlayerContainer: () => containerRef.current,
            getPlayerRef: () => playerRef.current,
        }));

        // VideoConfig → FortuneRanking propsへ変換
        const inputProps = {
            title: config.title,
            rankings: config.rankings,
            copy: config.title,
            titleFontSize: config.titleFontSize,
            titleStyle: config.titleStyle,
            rankingFontSize: config.rankingFontSize,
            rankingStyle: config.rankingStyle,
            ctaStart: config.ctaStart,
            cta25: config.cta25,
            cta75: config.cta75,
            ctaEnd: config.ctaEnd,
            backgroundImage: config.background.imageUrl,
            backgroundVideo: config.background.videoUrl,
            backgroundOpacity: config.background.opacity,
            backgroundVideoSpeed: config.background.videoSpeed,
            backgroundEffect: config.background.effect,
            backgroundColors: config.background.colors,
        };

        return (
            <div className="flex flex-col items-center gap-3">
                {/* スマホモックアップ */}
                <div className="relative">
                    <div className="rounded-[2.5rem] border-[3px] border-white/[0.08] p-1.5 bg-black shadow-[0_0_60px_rgba(0,0,0,0.5)]">
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20" />
                        <div
                            ref={containerRef}
                            className="rounded-[2rem] overflow-hidden bg-black"
                            style={{ width: '324px', height: '576px' }}
                        >
                            <Player
                                ref={playerRef}
                                component={FortuneRanking}
                                inputProps={inputProps}
                                durationInFrames={durationInFrames}
                                fps={config.fps}
                                compositionWidth={1080}
                                compositionHeight={1920}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                }}
                                controls
                                autoPlay
                                loop
                            />
                        </div>
                    </div>
                </div>

                {/* ステータス */}
                <div className="flex items-center gap-4 text-[10px] text-gray-600">
                    <span>{config.rankings.length}件</span>
                    <span>•</span>
                    <span>{Math.round(durationInFrames / config.fps)}秒</span>
                    <span>•</span>
                    <span>1080×1920</span>
                </div>
            </div>
        );
    }
);

VideoPreview.displayName = 'VideoPreview';
