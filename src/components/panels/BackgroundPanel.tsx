'use client';

import React, { useRef } from 'react';
import { BackgroundSettings, BackgroundEffect } from '@/lib/types';
import { CollapsibleSection, SliderInput, PresetSelector } from '@/components/ui/FormControls';

interface BackgroundPanelProps {
    settings: BackgroundSettings;
    onChange: (settings: BackgroundSettings) => void;
}

const EFFECT_OPTIONS = [
    { value: 'none', label: 'なし' },
    { value: 'particles', label: 'パーティクル' },
    { value: 'glitch', label: 'グリッチ' },
    { value: 'vhs', label: 'VHS風' },
];

export const BackgroundPanel: React.FC<BackgroundPanelProps> = ({ settings, onChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const isImage = file.type.startsWith('image/');
        if (!isVideo && !isImage) return;

        // Create object URL for preview (in production, upload to server)
        const url = URL.createObjectURL(file);

        if (isVideo) {
            onChange({ ...settings, type: 'video', videoUrl: url, imageUrl: undefined });
        } else {
            onChange({ ...settings, type: 'image', imageUrl: url, videoUrl: undefined });
        }
    };

    const handleRemoveFile = () => {
        if (settings.imageUrl) URL.revokeObjectURL(settings.imageUrl);
        if (settings.videoUrl) URL.revokeObjectURL(settings.videoUrl);
        onChange({ ...settings, type: 'color', imageUrl: undefined, videoUrl: undefined });
    };

    return (
        <CollapsibleSection title="背景設定" icon="📁" defaultOpen={true}>
            {/* ファイルアップロード */}
            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-400">背景素材</label>

                {settings.type === 'color' ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-white/15 rounded-xl p-6 text-center cursor-pointer
              hover:border-yellow-500/40 hover:bg-yellow-500/5 transition-all group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📤</div>
                        <p className="text-xs text-gray-500 group-hover:text-gray-400">
                            クリックして画像/動画をアップロード
                        </p>
                        <p className="text-[10px] text-gray-600 mt-1">PNG, JPG, WEBP, MP4, MOV</p>
                    </div>
                ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black/50 border border-white/10">
                        {settings.type === 'image' && settings.imageUrl && (
                            <img src={settings.imageUrl} alt="背景" className="w-full h-32 object-cover" />
                        )}
                        {settings.type === 'video' && settings.videoUrl && (
                            <video src={settings.videoUrl} className="w-full h-32 object-cover" muted loop autoPlay playsInline />
                        )}
                        <button
                            onClick={handleRemoveFile}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center
                text-white text-xs hover:bg-red-500 transition-colors"
                        >
                            ✕
                        </button>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded text-[10px] text-gray-300">
                            {settings.type === 'video' ? '🎬 動画' : '🖼️ 画像'}
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,video/mp4,video/quicktime"
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* 不透明度 */}
            <SliderInput
                label="不透明度"
                value={settings.opacity}
                min={0} max={100}
                unit="%"
                onChange={(v) => onChange({ ...settings, opacity: v })}
            />

            {/* 動画再生速度（動画の場合のみ） */}
            {settings.type === 'video' && (
                <SliderInput
                    label="再生速度"
                    value={settings.videoSpeed}
                    min={0.25} max={2.0} step={0.05}
                    unit="x"
                    onChange={(v) => onChange({ ...settings, videoSpeed: v })}
                />
            )}

            {/* 背景エフェクト */}
            <PresetSelector
                label="エフェクト"
                options={EFFECT_OPTIONS}
                value={settings.effect}
                onChange={(v) => onChange({ ...settings, effect: v as BackgroundEffect })}
            />
        </CollapsibleSection>
    );
};
