import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { BackgroundConfig } from '@/lib/gemini';

interface DynamicBackgroundProps {
    config: BackgroundConfig;
}

// Deterministic pseudo-random from seed
function seededRandom(seed: number): number {
    const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ config }) => {
    const frame = useCurrentFrame();

    const type = config.type || 'gradient';
    const colors = config.colors && config.colors.length > 0 ? config.colors : ['#000000', '#333333'];
    const speed = config.speed || 1.0;

    // ===== GRADIENT =====
    if (type === 'gradient') {
        const angle = frame * speed * 0.5;
        const gradientString = `linear-gradient(${angle}deg, ${colors.join(', ')})`;

        return (
            <AbsoluteFill style={{
                backgroundImage: gradientString,
                backgroundSize: '400% 400%',
            }}>
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\' opacity=\'0.1\'/%3E%3C/svg%3E")',
                    opacity: 0.3,
                    mixBlendMode: 'overlay' as const,
                }} />
            </AbsoluteFill>
        );
    }

    // ===== PARTICLES =====
    if (type === 'particles') {
        const bgColor = colors[0] || '#000';
        const particleColor = colors[1] || '#fff';
        const particles = new Array(50).fill(0).map((_, i) => ({
            x: (i * 137.5) % 100,
            y: (i * 293.3) % 100,
            size: (i % 3) + 2,
            delay: i * 0.1,
        }));

        return (
            <AbsoluteFill style={{ backgroundColor: bgColor }}>
                {particles.map((p, i) => {
                    const movement = (frame * speed * 0.2 + p.delay * 50) % 120 - 10;
                    return (
                        <div key={i} style={{
                            position: 'absolute',
                            left: `${p.x}%`, top: `${movement}%`,
                            width: p.size, height: p.size,
                            borderRadius: '50%',
                            backgroundColor: particleColor,
                            boxShadow: `0 0 ${p.size * 2}px ${particleColor}`,
                            opacity: interpolate(movement, [-10, 10, 90, 110], [0, 1, 1, 0]),
                        }} />
                    );
                })}
            </AbsoluteFill>
        );
    }

    // ===== GLITCH =====
    if (type === 'glitch') {
        const bgColor = colors[0] || '#0a0a2e';
        const glitchColor1 = colors[1] || '#ff0040';
        const glitchColor2 = colors[2] || '#00ffff';

        // Glitch occurs in bursts — active for ~5 frames every 20-40 frames
        const glitchCycle = Math.floor(frame / 30);
        const glitchPhase = frame % 30;
        const isGlitching = glitchPhase < 4;

        // Deterministic glitch offsets
        const offsetX = isGlitching ? (seededRandom(frame * 7) * 40 - 20) : 0;
        const offsetY = isGlitching ? (seededRandom(frame * 13) * 20 - 10) : 0;

        // Random scan line blocks
        const blocks = isGlitching ? new Array(5).fill(0).map((_, i) => ({
            top: seededRandom(frame * 3 + i * 17) * 100,
            height: seededRandom(frame * 5 + i * 31) * 8 + 2,
            offsetX: seededRandom(frame * 9 + i * 23) * 30 - 15,
            color: i % 2 === 0 ? glitchColor1 : glitchColor2,
        })) : [];

        return (
            <AbsoluteFill style={{ backgroundColor: bgColor }}>
                {/* Base gradient */}
                <AbsoluteFill style={{
                    backgroundImage: `linear-gradient(${frame * 0.3}deg, ${bgColor}, ${colors[1] || '#1a1a4e'})`,
                }} />

                {/* Color channel shift */}
                {isGlitching && (
                    <>
                        <AbsoluteFill style={{
                            backgroundColor: glitchColor1,
                            opacity: 0.08,
                            transform: `translate(${offsetX}px, ${offsetY}px)`,
                            mixBlendMode: 'screen' as const,
                        }} />
                        <AbsoluteFill style={{
                            backgroundColor: glitchColor2,
                            opacity: 0.06,
                            transform: `translate(${-offsetX}px, ${-offsetY}px)`,
                            mixBlendMode: 'screen' as const,
                        }} />
                    </>
                )}

                {/* Glitch blocks */}
                {blocks.map((b, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        top: `${b.top}%`,
                        left: 0, right: 0,
                        height: `${b.height}%`,
                        transform: `translateX(${b.offsetX}px)`,
                        backgroundColor: b.color,
                        opacity: 0.12,
                        mixBlendMode: 'screen' as const,
                    }} />
                ))}

                {/* Scan lines */}
                <AbsoluteFill style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
                    opacity: 0.5,
                }} />
            </AbsoluteFill>
        );
    }

    // ===== VHS =====
    if (type === 'vhs') {
        const bgColor = colors[0] || '#0a0a1a';

        // VHS tracking error — wobbles up and down
        const trackingOffset = Math.sin(frame * 0.05) * 3 + seededRandom(frame) * 2;

        // Color bleed — slight horizontal shift for RGB channels
        const colorBleed = Math.sin(frame * 0.03) * 2;

        // Occasional tracking burst (every ~120 frames for ~8 frames)
        const trackingBurstPhase = frame % 120;
        const isTrackingBurst = trackingBurstPhase > 112;
        const burstOffset = isTrackingBurst ? seededRandom(frame * 11) * 60 - 30 : 0;

        return (
            <AbsoluteFill style={{ backgroundColor: bgColor }}>
                {/* Base gradient with slight color shift */}
                <AbsoluteFill style={{
                    backgroundImage: `linear-gradient(180deg, ${bgColor}, ${colors[1] || '#1a1a3a'}, ${bgColor})`,
                    transform: `translateY(${trackingOffset + burstOffset}px)`,
                }} />

                {/* Red channel offset */}
                <AbsoluteFill style={{
                    backgroundColor: '#ff0000',
                    opacity: 0.03,
                    transform: `translateX(${colorBleed}px)`,
                    mixBlendMode: 'screen' as const,
                }} />

                {/* Blue channel offset */}
                <AbsoluteFill style={{
                    backgroundColor: '#0000ff',
                    opacity: 0.03,
                    transform: `translateX(${-colorBleed}px)`,
                    mixBlendMode: 'screen' as const,
                }} />

                {/* Scan lines (VHS characteristic) */}
                <AbsoluteFill style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.2) 1px, rgba(0,0,0,0.2) 3px)',
                    opacity: 0.6,
                }} />

                {/* Horizontal noise band */}
                <div style={{
                    position: 'absolute',
                    left: 0, right: 0,
                    top: `${(frame * 0.8) % 110 - 5}%`,
                    height: '3%',
                    background: `linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 20%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 80%, transparent 100%)`,
                    filter: 'blur(1px)',
                }} />

                {/* VHS tracking bar */}
                {isTrackingBurst && (
                    <div style={{
                        position: 'absolute',
                        left: 0, right: 0,
                        top: `${seededRandom(frame * 3) * 100}%`,
                        height: '8%',
                        background: `linear-gradient(180deg, transparent, rgba(255,255,255,0.08), rgba(0,0,0,0.3), transparent)`,
                    }} />
                )}

                {/* Vignette */}
                <AbsoluteFill style={{
                    background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)',
                }} />
            </AbsoluteFill>
        );
    }

    return <AbsoluteFill style={{ backgroundColor: '#000' }} />;
};
