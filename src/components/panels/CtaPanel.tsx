'use client';

import React from 'react';
import { CtaConfig, TextStylePreset, TEXT_STYLE_PRESETS } from '@/lib/types';
import { CollapsibleSection, TextInput, NumberInput, PresetSelector } from '@/components/ui/FormControls';

interface CtaPanelProps {
    ctaStart: CtaConfig;
    cta25: CtaConfig;
    cta75: CtaConfig;
    ctaEnd: CtaConfig;
    onCtaStartChange: (c: CtaConfig) => void;
    onCta25Change: (c: CtaConfig) => void;
    onCta75Change: (c: CtaConfig) => void;
    onCtaEndChange: (c: CtaConfig) => void;
}

const STYLE_OPTIONS = Object.entries(TEXT_STYLE_PRESETS).map(([value, config]) => ({
    value, label: config.label,
}));

interface SingleCtaEditorProps {
    label: string;
    position: string;
    config: CtaConfig;
    onChange: (c: CtaConfig) => void;
}

const SingleCtaEditor: React.FC<SingleCtaEditorProps> = ({ label, position, config, onChange }) => (
    <div className="space-y-3 p-3 bg-white/[0.02] rounded-xl border border-white/5">
        <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-300">{label}</span>
            <span className="text-[10px] text-gray-600 bg-white/5 px-2 py-0.5 rounded">{position}</span>
        </div>

        <TextInput
            label="テキスト"
            value={config.text}
            placeholder="CTAテキストを入力..."
            onChange={(v) => onChange({ ...config, text: v })}
            multiline
            rows={2}
        />

        <PresetSelector
            label="スタイル"
            options={STYLE_OPTIONS}
            value={config.style}
            onChange={(v) => onChange({ ...config, style: v as TextStylePreset })}
        />

        <div className="grid grid-cols-2 gap-3">
            <NumberInput
                label="上余白"
                value={config.marginTop}
                min={0} max={300}
                onChange={(v) => onChange({ ...config, marginTop: v })}
                unit="px"
            />
            <NumberInput
                label="下余白"
                value={config.marginBottom}
                min={0} max={300}
                onChange={(v) => onChange({ ...config, marginBottom: v })}
                unit="px"
            />
        </div>
    </div>
);

export const CtaPanel: React.FC<CtaPanelProps> = ({
    ctaStart, cta25, cta75, ctaEnd,
    onCtaStartChange, onCta25Change, onCta75Change, onCtaEndChange,
}) => {
    return (
        <CollapsibleSection title="CTA演出" icon="📢">
            <p className="text-[10px] text-gray-600 -mt-1">
                視聴者のエンゲージメントを促すテキストをスクロール中に挿入
            </p>

            <SingleCtaEditor
                label="演出1"
                position="開始直後"
                config={ctaStart}
                onChange={onCtaStartChange}
            />

            <SingleCtaEditor
                label="演出2"
                position="中間 25%"
                config={cta25}
                onChange={onCta25Change}
            />

            <SingleCtaEditor
                label="演出3"
                position="中間 75%"
                config={cta75}
                onChange={onCta75Change}
            />

            <SingleCtaEditor
                label="演出4"
                position="最後"
                config={ctaEnd}
                onChange={onCtaEndChange}
            />
        </CollapsibleSection>
    );
};
