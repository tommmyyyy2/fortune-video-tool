'use client';

import React, { useState } from 'react';

interface CollapsibleSectionProps {
    title: string;
    icon: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title, icon, children, defaultOpen = false
}) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-zinc-900/60 backdrop-blur-sm">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">{icon}</span>
                    <span className="font-semibold text-sm text-gray-200">{title}</span>
                </div>
                <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {open && (
                <div className="px-5 pb-5 pt-1 space-y-4 border-t border-white/5">
                    {children}
                </div>
            )}
        </div>
    );
};

// 共通スライダー
interface SliderInputProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (v: number) => void;
}

export const SliderInput: React.FC<SliderInputProps> = ({
    label, value, min, max, step = 1, unit = '', onChange
}) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-xs font-medium text-gray-400">{label}</label>
            <span className="text-xs font-mono text-gray-500">{value}{unit}</span>
        </div>
        <input
            type="range"
            min={min} max={max} step={step}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full accent-yellow-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-yellow-400
        [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(250,204,21,0.5)]"
        />
    </div>
);

// 共通テキスト入力
interface TextInputProps {
    label: string;
    value: string;
    placeholder?: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    rows?: number;
}

export const TextInput: React.FC<TextInputProps> = ({
    label, value, placeholder, onChange, multiline = false, rows = 3
}) => (
    <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        {multiline ? (
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
          placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 resize-none transition-all"
            />
        ) : (
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white
          placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
            />
        )}
    </div>
);

// 数値入力
interface NumberInputProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    onChange: (v: number) => void;
    unit?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
    label, value, min = 0, max = 999, onChange, unit = ''
}) => (
    <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <div className="flex items-center gap-2">
            <input
                type="number"
                value={value}
                min={min} max={max}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-20 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white
          text-center focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
    </div>
);

// プリセット選択
interface PresetSelectorProps {
    label: string;
    options: { value: string; label: string }[];
    value: string;
    onChange: (v: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
    label, options, value, onChange
}) => (
    <div className="space-y-2">
        <label className="text-xs font-medium text-gray-400">{label}</label>
        <div className="flex flex-wrap gap-2">
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${value === opt.value
                            ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/50'
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-300'
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);
