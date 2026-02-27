import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface BackgroundConfig {
	type: 'gradient' | 'particles' | 'glitch' | 'vhs';
	colors: string[];
	speed: number;
	description?: string;
}

export interface RankingData {
	title: string;
	rankings: { rank: number; date: string }[];
	copy: string;
	background: BackgroundConfig;
}

export async function generateFortuneRankings(theme: string, backgroundPrompt: string = ""): Promise<RankingData> {
	const prompt = `
		あなたはプロの占い師兼映像クリエイターです。
		テーマ「${theme}」に基づいて、366日（うるう年含む）の中からランキングを作成してください。
		
		【最重要：ランキングの構成ルール】
		1. **100位から4位まで、全97個のランキングを漏れなく作成してください。**
		2. **1位、2位、3位は絶対にデータに含めないでください**（これらはコメント欄で発表するため）。
		3. 各順位には「◯月◯日」の誕生日を1つずつ割り当ててください。日付の重複は不可です。
		4. 動画の最後に表示するインパクトのある「◯◯な人」というキャッチコピーも作成してください。

		出力は以下のJSON形式のみで返してください。余計な解説やマークダウンは不要です。

		{
			"title": "ランキングのタイトル",
			"rankings": [
				{"rank": 100, "date": "◯月◯日"},
				{"rank": 99, "date": "◯月◯日"},
				{"rank": 98, "date": "◯月◯日"},
				... 省略せず100位から4位まで全97個を列挙 ...
				{"rank": 5, "date": "◯月◯日"},
				{"rank": 4, "date": "◯月◯日"}
			],
			"copy": "◯◯な人"
		}
	`;

	let lastError: any;
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			if (attempt > 0) {
				const delay = Math.pow(2, attempt) * 1000; // 2s, 4s
				console.log(`Retry attempt ${attempt + 1}, waiting ${delay}ms...`);
				await new Promise(resolve => setTimeout(resolve, delay));
			}
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			console.log("Gemini raw response:", text.substring(0, 200));

			// Clean the text if Gemini adds markdown blocks
			const cleanedText = text.replace(/```json|```/g, "").trim();

			const parsedData = JSON.parse(cleanedText);

			// Ensure rankings exist and sort by rank descending
			const rankings = (parsedData.rankings || []).sort((a: any, b: any) => b.rank - a.rank);

			return {
				title: parsedData.title || theme,
				rankings: rankings,
				copy: parsedData.copy || "最強の運勢を持つ人",
				background: {
					type: "gradient",
					colors: ["#1a1a2e", "#16213e", "#0f3460"],
					speed: 1.0,
					description: "Fixed background for stability"
				}
			} as RankingData;
		} catch (err: any) {
			lastError = err;
			console.error(`Attempt ${attempt + 1} failed:`, err.message || err);
			if (err.message && !err.message.includes('429') && !err.message.includes('Too Many')) {
				throw err; // Non-rate-limit errors should throw immediately
			}
		}
	}
	throw lastError || new Error("生成に失敗しました（リトライ上限）");
}

// AIタイトル生成
export async function generateTitleSuggestions(theme: string): Promise<string[]> {
	const prompt = `
		あなたはSNSバズのプロです。
		テーマ「${theme}」に関連する、TikTok/Instagram Reels向けの占いランキング動画のタイトルを提案してください。

		ルール：
		- 「◯◯な人」という形式のタイトルを8個生成
		- 視聴者が思わず自分の順位を確認したくなるような、好奇心を刺激するタイトル
		- 短くてインパクトのあるもの（15文字以内推奨）
		- 改行なし、1行1タイトル

		出力形式（JSONの配列のみ、余計な文言不要）：
		["タイトル1", "タイトル2", ...]
	`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text().replace(/```json|```/g, "").trim();

	try {
		const parsed = JSON.parse(text);
		if (Array.isArray(parsed)) return parsed;
		return [];
	} catch {
		// フォールバック: 行ごとにパース
		return text.split('\n').filter(l => l.trim()).slice(0, 8);
	}
}
