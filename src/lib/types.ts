// ============================================
// TOP100動画ジェネレーター — 共通型定義
// ============================================

// テキストスタイルプリセット
export type TextStylePreset = 'mystic' | 'pastel' | 'neon' | 'gold' | 'flame';

export interface TextStyleConfig {
    label: string;
    color: string;
    textShadow: string;
    stroke?: string; // -webkit-text-stroke
}

export const TEXT_STYLE_PRESETS: Record<TextStylePreset, TextStyleConfig> = {
    mystic: {
        label: '神秘的',
        color: '#FFFFFF',
        textShadow: '0 0 30px rgba(75, 0, 130, 0.9), 0 0 60px rgba(75, 0, 130, 0.6), 3px 3px 10px rgba(30, 0, 60, 0.8)',
    },
    pastel: {
        label: 'パステル',
        color: '#FFE4F0',
        textShadow: '0 0 20px rgba(255, 182, 193, 0.6), 2px 2px 8px rgba(200, 150, 200, 0.5)',
        stroke: '1px rgba(255, 200, 220, 0.4)',
    },
    neon: {
        label: 'ネオン',
        color: '#00FFFF',
        textShadow: '0 0 10px #00FFFF, 0 0 40px #00FFFF, 0 0 80px #0088FF, 0 0 120px #0088FF',
    },
    gold: {
        label: 'ゴールド',
        color: '#FFD700',
        textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(218, 165, 32, 0.5), 2px 2px 8px rgba(0, 0, 0, 0.9)',
    },
    flame: {
        label: '炎',
        color: '#FF4500',
        textShadow: '0 0 20px rgba(255, 69, 0, 0.9), 0 0 40px rgba(255, 140, 0, 0.6), 0 0 80px rgba(255, 0, 0, 0.4)',
    },
};

// 背景エフェクト
export type BackgroundEffect = 'none' | 'particles' | 'glitch' | 'vhs';

// CTA設定
export interface CtaConfig {
    text: string;
    style: TextStylePreset;
    marginTop: number;
    marginBottom: number;
}

// 背景設定
export interface BackgroundSettings {
    type: 'color' | 'image' | 'video';
    // グラデーション/カラー
    colors: string[];
    // アップロードファイル
    imageUrl?: string;
    videoUrl?: string;
    // 調整
    opacity: number;      // 0〜100
    videoSpeed: number;    // 0.25〜2.0
    effect: BackgroundEffect;
}

// ランキングアイテム
export interface RankingItem {
    rank: number;
    date: string;
}

// 動画全体の設定
export interface VideoConfig {
    // タイトル
    title: string;
    titleFontSize: number;
    titleStyle: TextStylePreset;

    // ランキングデータ
    rankings: RankingItem[];
    rankingFontSize: number;
    rankingStyle: TextStylePreset;

    // CTA（4箇所）
    ctaStart: CtaConfig;   // 開始直後
    cta25: CtaConfig;      // 中間25%
    cta75: CtaConfig;      // 中間75%
    ctaEnd: CtaConfig;     // 最後

    // 背景
    background: BackgroundSettings;

    // 音声
    bgmUrl?: string;
    bgmVolume: number;  // 0〜100

    // 出力設定
    fps: 30 | 60;
    durationMode: 'auto' | 'manual';
    manualDuration?: number; // seconds
}

// デフォルト設定
export const DEFAULT_VIDEO_CONFIG: VideoConfig = {
    title: '',
    titleFontSize: 120,
    titleStyle: 'mystic',

    rankings: [],
    rankingFontSize: 80,
    rankingStyle: 'mystic',

    ctaStart: {
        text: '1位までに、いいね保存すると\n運勢777倍アップ✨',
        style: 'gold',
        marginTop: 80,
        marginBottom: 80,
    },
    cta25: {
        text: '1位までにフォローすると\n運気200%増加！🔥',
        style: 'gold',
        marginTop: 80,
        marginBottom: 80,
    },
    cta75: {
        text: '当たりすぎると大人気の恋愛占いは\n「運命」とコメントすると\n無料鑑定がGETのチャンス💬',
        style: 'neon',
        marginTop: 80,
        marginBottom: 80,
    },
    ctaEnd: {
        text: '🏆 1位〜3位は\nコメント欄で発表！',
        style: 'flame',
        marginTop: 100,
        marginBottom: 100,
    },

    background: {
        type: 'color',
        colors: ['#0f0c29', '#302b63', '#24243e'],
        opacity: 100,
        videoSpeed: 1.0,
        effect: 'none',
    },

    bgmVolume: 80,
    fps: 30,
    durationMode: 'auto',
};
