'use client';

import React from 'react';
import { TextStylePreset, TEXT_STYLE_PRESETS } from '@/lib/types';
import { CollapsibleSection, TextInput, NumberInput, PresetSelector } from '@/components/ui/FormControls';

interface TextDesignPanelProps {
    title: string;
    titleFontSize: number;
    titleStyle: TextStylePreset;
    rankingFontSize: number;
    rankingStyle: TextStylePreset;
    onTitleChange: (v: string) => void;
    onTitleFontSizeChange: (v: number) => void;
    onTitleStyleChange: (v: TextStylePreset) => void;
    onRankingFontSizeChange: (v: number) => void;
    onRankingStyleChange: (v: TextStylePreset) => void;
    onAiSuggest?: () => void;
    aiLoading?: boolean;
}

const STYLE_OPTIONS = Object.entries(TEXT_STYLE_PRESETS).map(([value, config]) => ({
    value,
    label: config.label,
}));

export const TextDesignPanel: React.FC<TextDesignPanelProps> = ({
    title, titleFontSize, titleStyle, rankingFontSize, rankingStyle,
    onTitleChange, onTitleFontSizeChange, onTitleStyleChange,
    onRankingFontSizeChange, onRankingStyleChange,
    onAiSuggest, aiLoading,
}) => {
    return (
        <CollapsibleSection title="テキスト・デザイン" icon="🎨" defaultOpen={true}>
            {/* タイトル入力 */}
            <TextInput
                label="タイトル（テーマ）"
                value={title}
                placeholder="例：浮気を一瞬で見抜く力を持つ人"
                onChange={onTitleChange}
            />

            {/* AIタイトル生成ボタン */}
            {onAiSuggest && (
                <button
                    onClick={onAiSuggest}
                    disabled={aiLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all
            bg-gradient-to-r from-purple-600/80 to-blue-600/80 text-white
            hover:from-purple-500 hover:to-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
                >
                    {aiLoading ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            生成中...
                        </>
                    ) : (
                        <>🤖 タイトル案をAIで見つける</>
                    )}
                </button>
            )}

            {/* タイトルスタイル */}
            <div className="grid grid-cols-2 gap-3">
                <NumberInput
                    label="タイトル文字サイズ"
                    value={titleFontSize}
                    min={40} max={200}
                    onChange={onTitleFontSizeChange}
                    unit="px"
                />
                <NumberInput
                    label="ランキング文字サイズ"
                    value={rankingFontSize}
                    min={40} max={160}
                    onChange={onRankingFontSizeChange}
                    unit="px"
                />
            </div>

            <PresetSelector
                label="タイトルスタイル"
                options={STYLE_OPTIONS}
                value={titleStyle}
                onChange={(v) => onTitleStyleChange(v as TextStylePreset)}
            />

            <PresetSelector
                label="ランキングスタイル"
                options={STYLE_OPTIONS}
                value={rankingStyle}
                onChange={(v) => onRankingStyleChange(v as TextStylePreset)}
            />
        </CollapsibleSection>
    );
};
