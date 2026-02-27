import React from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, AbsoluteFill, Img, Video } from 'remotion';
import {
    TextStylePreset, TEXT_STYLE_PRESETS, CtaConfig, BackgroundEffect,
} from '@/lib/types';
import { DynamicBackground } from './DynamicBackground';

interface Ranking {
    rank: number;
    date: string;
}

export interface FortuneRankingProps {
    title: string;
    rankings: Ranking[];
    copy: string;
    // テキストスタイル
    titleFontSize?: number;
    titleStyle?: TextStylePreset;
    rankingFontSize?: number;
    rankingStyle?: TextStylePreset;
    // CTA設定（4箇所）
    ctaStart?: CtaConfig;
    cta25?: CtaConfig;
    cta75?: CtaConfig;
    ctaEnd?: CtaConfig;
    // 背景
    backgroundImage?: string;
    backgroundVideo?: string;
    backgroundOpacity?: number;
    backgroundVideoSpeed?: number;
    backgroundEffect?: BackgroundEffect;
    backgroundColors?: string[];
}

// 日本語テキストの自然な改行
function formatTitleWithBreaks(text: string): string {
    if (text.length <= 8) return text;
    const mid = Math.floor(text.length / 2);
    const searchRange = Math.floor(text.length / 3);
    const breakChars = ['で', 'を', 'に', 'の', 'は', 'が', 'と', 'も', 'て'];

    let bestBreak = -1;
    let bestDist = Infinity;

    for (let i = Math.max(1, mid - searchRange); i < Math.min(text.length - 1, mid + searchRange); i++) {
        if (breakChars.includes(text[i])) {
            const dist = Math.abs(i - mid);
            if (dist < bestDist) {
                bestDist = dist;
                bestBreak = i + 1;
            }
        }
    }

    if (bestBreak > 0) return text.slice(0, bestBreak) + '\n' + text.slice(bestBreak);
    return text.slice(0, mid) + '\n' + text.slice(mid);
}

// テキストスタイル取得
function getStyle(preset: TextStylePreset = 'mystic') {
    return TEXT_STYLE_PRESETS[preset] || TEXT_STYLE_PRESETS.mystic;
}

// アイテムの型
type ItemType = 'title' | 'ranking' | 'cta' | 'ending';

interface ScrollItem {
    type: ItemType;
    content: string;
    rank?: number;
    date?: string;
    style?: TextStylePreset;
    marginTop?: number;
    marginBottom?: number;
}

export const FortuneRanking: React.FC<FortuneRankingProps> = ({
    title, rankings, copy,
    titleFontSize = 85,
    titleStyle = 'mystic',
    rankingFontSize = 80,
    rankingStyle = 'mystic',
    ctaStart,
    cta25,
    cta75,
    ctaEnd,
    backgroundImage,
    backgroundVideo,
    backgroundOpacity = 100,
    backgroundVideoSpeed = 1.0,
    backgroundEffect = 'none',
    backgroundColors,
}) => {
    const frame = useCurrentFrame();
    const { height, durationInFrames } = useVideoConfig();

    // --- アイテムリスト構築 ---
    const items: ScrollItem[] = [];

    // 1. タイトル
    const formattedTitle = formatTitleWithBreaks(copy || title);
    items.push({ type: 'title', content: formattedTitle, style: titleStyle });

    // 2. 開始直後のCTA
    if (ctaStart?.text) {
        items.push({
            type: 'cta', content: ctaStart.text,
            style: ctaStart.style, marginTop: ctaStart.marginTop, marginBottom: ctaStart.marginBottom,
        });
    }

    // 3. ランキング（25%/75%にCTA挿入）
    const totalRankings = rankings.length;
    const idx25 = Math.floor(totalRankings * 0.25);
    const idx75 = Math.floor(totalRankings * 0.75);

    rankings.forEach((item, i) => {
        items.push({ type: 'ranking', content: '', rank: item.rank, date: item.date, style: rankingStyle });

        if (i === idx25 && cta25?.text) {
            items.push({
                type: 'cta', content: cta25.text,
                style: cta25.style, marginTop: cta25.marginTop, marginBottom: cta25.marginBottom,
            });
        }
        if (i === idx75 && cta75?.text) {
            items.push({
                type: 'cta', content: cta75.text,
                style: cta75.style, marginTop: cta75.marginTop, marginBottom: cta75.marginBottom,
            });
        }
    });

    // 4. エンディング
    if (ctaEnd?.text) {
        items.push({
            type: 'ending', content: ctaEnd.text,
            style: ctaEnd.style, marginTop: ctaEnd.marginTop, marginBottom: ctaEnd.marginBottom,
        });
    }

    // --- 高さ計算 ---
    const TITLE_HEIGHT = 300;
    const RANKING_HEIGHT = 120;
    const CTA_BASE_HEIGHT = 250;
    const ENDING_BASE_HEIGHT = 350;

    const getItemHeight = (item: ScrollItem): number => {
        switch (item.type) {
            case 'title': return TITLE_HEIGHT;
            case 'ranking': return RANKING_HEIGHT;
            case 'cta': return CTA_BASE_HEIGHT + (item.marginTop || 0) + (item.marginBottom || 0);
            case 'ending': return ENDING_BASE_HEIGHT + (item.marginTop || 0) + (item.marginBottom || 0);
            default: return 0;
        }
    };

    const totalContentHeight = items.reduce((acc, item) => acc + getItemHeight(item), 0);

    // スクロール計算: 最後のアイテムが画面の25%下端に来る位置で停止
    const endingStopY = height * 0.75 - totalContentHeight;
    const scrollY = interpolate(frame, [0, durationInFrames], [height * 0.3, endingStopY]);

    // 背景設定
    const bgColors = backgroundColors || ['#0f0c29', '#302b63', '#24243e'];
    const overlayOpacity = 1 - (backgroundOpacity / 100) * 0.7; // 不透明度からオーバーレイ計算

    // --- レンダリング ---
    const renderItem = (item: ScrollItem, index: number) => {
        const style = getStyle(item.style);

        switch (item.type) {
            case 'title':
                return (
                    <div key={`title-${index}`} style={{
                        height: TITLE_HEIGHT,
                        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                        padding: '20px 40px',
                    }}>
                        <h1 style={{
                            fontSize: titleFontSize,
                            fontWeight: 'bold', fontFamily: 'serif',
                            color: style.color,
                            textAlign: 'center',
                            textShadow: style.textShadow,
                            WebkitTextStroke: style.stroke,
                            margin: 0, lineHeight: 1.3,
                            whiteSpace: 'pre-line',
                        }}>
                            {item.content}
                        </h1>
                    </div>
                );

            case 'ranking':
                return (
                    <div key={`rank-${index}`} style={{
                        height: RANKING_HEIGHT,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        fontSize: rankingFontSize,
                        fontWeight: 'bold', fontFamily: 'serif',
                        textShadow: style.textShadow,
                    }}>
                        <span style={{ color: style.color, marginRight: 30 }}>【{item.rank}位】</span>
                        <span style={{ color: style.color }}>{item.date}</span>
                    </div>
                );

            case 'cta':
                return (
                    <div key={`cta-${index}`} style={{
                        height: CTA_BASE_HEIGHT,
                        marginTop: item.marginTop || 0,
                        marginBottom: item.marginBottom || 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        padding: '20px 60px',
                    }}>
                        <div style={{
                            fontSize: 55,
                            fontWeight: 'bold', fontFamily: 'sans-serif',
                            color: style.color,
                            textAlign: 'center',
                            textShadow: style.textShadow,
                            lineHeight: 1.4,
                            whiteSpace: 'pre-line',
                            background: 'rgba(0, 0, 0, 0.3)',
                            borderRadius: 30,
                            padding: '30px 50px',
                            border: `3px solid ${style.color}33`,
                        }}>
                            {item.content}
                        </div>
                    </div>
                );

            case 'ending':
                return (
                    <div key={`ending-${index}`} style={{
                        height: ENDING_BASE_HEIGHT,
                        marginTop: item.marginTop || 0,
                        marginBottom: item.marginBottom || 0,
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        padding: '20px 40px',
                    }}>
                        <div style={{
                            fontSize: 75,
                            fontWeight: 'bold', fontFamily: 'serif',
                            color: style.color,
                            textAlign: 'center',
                            textShadow: style.textShadow,
                            lineHeight: 1.4,
                            whiteSpace: 'pre-line',
                            background: 'rgba(0, 0, 0, 0.4)',
                            borderRadius: 30,
                            padding: '40px 50px',
                            border: `3px solid ${style.color}55`,
                        }}>
                            {item.content}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
            {/* 背景レイヤー */}
            <AbsoluteFill>
                {backgroundVideo ? (
                    <Video src={backgroundVideo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : backgroundImage ? (
                    <Img src={backgroundImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <DynamicBackground config={{
                        type: backgroundEffect === 'none' ? 'gradient' : (backgroundEffect || 'gradient'),
                        colors: bgColors,
                        speed: 1.0,
                    }} />
                )}
            </AbsoluteFill>

            {/* ダークオーバーレイ（不透明度制御） */}
            <AbsoluteFill style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity * 0.5})` }} />

            {/* スクロールコンテンツ */}
            <div style={{
                position: 'absolute',
                width: '100%',
                transform: `translateY(${scrollY}px)`,
            }}>
                {items.map((item, i) => renderItem(item, i))}
            </div>
        </AbsoluteFill>
    );
};
