'use server';

import { generateFortuneRankings, generateTitleSuggestions, RankingData } from '@/lib/gemini';

export async function handleGenerateAction(theme: string, backgroundPrompt?: string): Promise<RankingData> {
    if (!theme) {
        throw new Error("テーマを入力してください");
    }

    try {
        const data = await generateFortuneRankings(theme, backgroundPrompt);
        return data;
    } catch (error) {
        console.error("AI Generation Error:", error);
        throw new Error("AIによる生成に失敗しました");
    }
}

export async function handleTitleSuggestAction(theme: string): Promise<string[]> {
    if (!theme) {
        throw new Error("テーマを入力してください");
    }

    try {
        const suggestions = await generateTitleSuggestions(theme);
        return suggestions;
    } catch (error) {
        console.error("Title Suggestion Error:", error);
        throw new Error("タイトル提案の生成に失敗しました");
    }
}
