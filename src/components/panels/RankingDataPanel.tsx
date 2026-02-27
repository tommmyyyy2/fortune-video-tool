'use client';

import React, { useRef } from 'react';
import { RankingItem } from '@/lib/types';
import { CollapsibleSection, TextInput } from '@/components/ui/FormControls';

interface RankingDataPanelProps {
    rankings: RankingItem[];
    onRankingsChange: (rankings: RankingItem[]) => void;
    onAiGenerate?: () => void;
    aiLoading?: boolean;
    theme?: string;
}

// テキストからランキングをパース（複数フォーマットに対応）
function parseRankings(text: string): RankingItem[] {
    const lines = text.split('\n').filter(l => l.trim());
    const results: RankingItem[] = [];

    for (const line of lines) {
        // Format: "100 1月1日" or "100,1月1日" or "【100位】1月1日" or "100位 1月1日"
        const match = line.match(/[【]?(\d+)[位】]?\s*[,\t ]?\s*(.+)/);
        if (match) {
            results.push({ rank: parseInt(match[1]), date: match[2].trim() });
        }
    }

    return results.sort((a, b) => b.rank - a.rank);
}

// ランキングをテキストに変換
function rankingsToText(rankings: RankingItem[]): string {
    return rankings.map(r => `${r.rank} ${r.date}`).join('\n');
}

export const RankingDataPanel: React.FC<RankingDataPanelProps> = ({
    rankings, onRankingsChange, onAiGenerate, aiLoading,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textValue = rankingsToText(rankings);

    const handleTextChange = (text: string) => {
        const parsed = parseRankings(text);
        if (parsed.length > 0) {
            onRankingsChange(parsed);
        }
    };

    const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            const parsed = parseRankings(text);
            if (parsed.length > 0) {
                onRankingsChange(parsed);
            }
        };
        reader.readAsText(file);
    };

    // 動画長の自動計算（page.tsx の calculateDuration と同じロジック）
    const estimatedDuration = Math.round(
        Math.max(30, Math.min(78, rankings.length * 0.78 + 5))
    );

    return (
        <CollapsibleSection title="ランキングデータ" icon="📊" defaultOpen={true}>
            {/* ステータス */}
            <div className="flex items-center justify-between p-3 bg-white/[0.03] rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="text-yellow-400 text-sm font-bold">{rankings.length}</span>
                    <span className="text-[10px] text-gray-500">件のランキング</span>
                </div>
                <div className="text-[10px] text-gray-500">
                    推定 ~{estimatedDuration}秒
                </div>
            </div>

            {/* AI生成ボタン */}
            {onAiGenerate && (
                <button
                    onClick={onAiGenerate}
                    disabled={aiLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold transition-all
            bg-gradient-to-r from-yellow-500/80 to-orange-500/80 text-black
            hover:from-yellow-400 hover:to-orange-400
            disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
                >
                    {aiLoading ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            AIが生成中...
                        </>
                    ) : (
                        <>🤖 AIでランキングを自動生成</>
                    )}
                </button>
            )}

            {/* データ入力 */}
            <TextInput
                label="一括入力（1行=1ランキング）"
                value={textValue}
                placeholder={"100 1月1日\n99 2月3日\n98 3月15日\n..."}
                onChange={handleTextChange}
                multiline
                rows={8}
            />

            {/* CSVインポート */}
            <div className="flex gap-2">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 text-gray-400
            hover:bg-white/10 hover:text-gray-300 transition-all flex items-center justify-center gap-1.5"
                >
                    📄 CSVインポート
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleCsvImport}
                    className="hidden"
                />
            </div>
        </CollapsibleSection>
    );
};
