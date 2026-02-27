'use client';

import React, { useRef } from 'react';
import { CollapsibleSection, SliderInput, PresetSelector } from '@/components/ui/FormControls';

interface AudioPanelProps {
    bgmUrl?: string;
    bgmVolume: number;
    onBgmUrlChange: (url?: string) => void;
    onBgmVolumeChange: (v: number) => void;
}

const PRESET_BGMS = [
    { value: '', label: 'なし' },
    { value: '/audio/mystical.mp3', label: '神秘的' },
    { value: '/audio/upbeat.mp3', label: 'アップビート' },
    { value: '/audio/calm.mp3', label: '静かな' },
];

export const AudioPanel: React.FC<AudioPanelProps> = ({
    bgmUrl, bgmVolume, onBgmUrlChange, onBgmVolumeChange,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        onBgmUrlChange(url);
    };

    return (
        <CollapsibleSection title="音声/BGM" icon="🎵">
            {/* プリセット選択 */}
            <PresetSelector
                label="プリセットBGM"
                options={PRESET_BGMS}
                value={bgmUrl || ''}
                onChange={(v) => onBgmUrlChange(v || undefined)}
            />

            {/* ファイルアップロード */}
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl text-xs font-medium bg-white/5 text-gray-400
          hover:bg-white/10 hover:text-gray-300 transition-all flex items-center justify-center gap-1.5
          border border-dashed border-white/10"
            >
                🎵 音声ファイルをアップロード（MP3/WAV）
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/mpeg"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* BGM表示 */}
            {bgmUrl && (
                <div className="flex items-center gap-2 p-2 bg-white/[0.03] rounded-lg">
                    <span className="text-sm">🎶</span>
                    <span className="text-[10px] text-gray-400 flex-1 truncate">{bgmUrl}</span>
                    <button
                        onClick={() => onBgmUrlChange(undefined)}
                        className="text-[10px] text-red-400 hover:text-red-300"
                    >
                        削除
                    </button>
                </div>
            )}

            {/* 音量 */}
            <SliderInput
                label="音量"
                value={bgmVolume}
                min={0} max={100}
                unit="%"
                onChange={onBgmVolumeChange}
            />
        </CollapsibleSection>
    );
};
