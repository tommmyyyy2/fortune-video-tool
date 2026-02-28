'use client';

import React, { useState, useCallback, useRef } from 'react';
import { VideoPreview, VideoPreviewHandle } from '@/components/VideoPreview';
import { BackgroundPanel } from '@/components/panels/BackgroundPanel';
import { TextDesignPanel } from '@/components/panels/TextDesignPanel';
import { CtaPanel } from '@/components/panels/CtaPanel';
import { RankingDataPanel } from '@/components/panels/RankingDataPanel';
import { AudioPanel } from '@/components/panels/AudioPanel';
import { handleGenerateAction, handleTitleSuggestAction } from '@/app/actions';
import { recordAndExport } from '@/lib/browserExport';
import {
  VideoConfig, DEFAULT_VIDEO_CONFIG,
  TextStylePreset, BackgroundSettings, CtaConfig, RankingItem,
} from '@/lib/types';

// サンプルランキング生成
const generateSampleRankings = (): RankingItem[] => {
  const days = [
    "1月1日", "1月15日", "2月3日", "2月14日", "3月3日", "3月21日", "4月1日", "4月17日",
    "5月5日", "5月20日", "6月6日", "6月21日", "7月7日", "7月23日", "8月8日", "8月15日",
    "9月1日", "9月22日", "10月10日", "10月31日", "11月3日", "11月22日", "12月12日", "12月25日",
    "1月8日", "1月25日", "2月11日", "2月28日", "3月14日", "3月30日", "4月10日", "4月29日",
    "5月12日", "5月31日", "6月15日", "6月30日", "7月14日", "7月28日", "8月3日", "8月22日",
    "9月9日", "9月30日", "10月5日", "10月20日", "11月11日", "11月30日", "12月1日", "12月20日",
    "1月3日", "1月19日", "2月6日", "2月22日", "3月7日", "3月25日", "4月5日", "4月22日",
    "5月8日", "5月25日", "6月3日", "6月18日", "7月3日", "7月19日", "8月11日", "8月28日",
    "9月5日", "9月17日", "10月1日", "10月15日", "11月5日", "11月18日", "12月5日", "12月18日",
    "1月11日", "1月28日", "2月9日", "2月19日", "3月10日", "3月28日", "4月8日", "4月25日",
    "5月15日", "5月28日", "6月10日", "6月25日", "7月10日", "7月25日", "8月5日", "8月20日",
    "9月12日", "9月25日", "10月8日", "10月25日", "11月8日", "11月25日", "12月8日", "12月28日",
    "1月5日",
  ];
  const rankings: RankingItem[] = [];
  for (let rank = 100; rank >= 4; rank--) {
    rankings.push({ rank, date: days[100 - rank] || `${(rank % 12) + 1}月${(rank % 28) + 1}日` });
  }
  return rankings;
};

const initialConfig: VideoConfig = {
  ...DEFAULT_VIDEO_CONFIG,
  title: '浮気を一瞬で見抜く力を持つ人',
  rankings: generateSampleRankings(),
};

export default function Home() {
  const [config, setConfig] = useState<VideoConfig>(initialConfig);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiTitleLoading, setAiTitleLoading] = useState(false);
  const [renderLoading, setRenderLoading] = useState(false);
  const [renderProgress, setRenderProgress] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [status, setStatus] = useState('');
  const previewRef = useRef<VideoPreviewHandle>(null);

  // ショートカットアップデーター
  const updateConfig = useCallback(<K extends keyof VideoConfig>(key: K, value: VideoConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // AI生成
  const handleAiGenerate = async () => {
    const theme = config.title || '2026年最強運勢ランキング';
    setAiLoading(true);
    setStatus('🤖 AIがランキングを生成中...');
    try {
      const data = await handleGenerateAction(theme);
      setConfig(prev => ({
        ...prev,
        title: data.copy || prev.title,
        rankings: data.rankings,
      }));
      setStatus('✅ 生成完了！');
    } catch (error: any) {
      setStatus(`❌ エラー: ${error?.message || '不明'}`);
    } finally {
      setAiLoading(false);
    }
  };

  // AIタイトル提案
  const handleAiTitleSuggest = async () => {
    setAiTitleLoading(true);
    try {
      const suggestions = await handleTitleSuggestAction(config.title || '占い');
      // 最初の提案をセット（将来的にはリスト表示）
      if (suggestions.length > 0) {
        setConfig(prev => ({ ...prev, title: suggestions[0] }));
        setStatus(`✅ タイトル候補: ${suggestions.length}件`);
      }
    } catch (error: any) {
      setStatus(`❌ タイトル生成エラー: ${error?.message || '不明'}`);
    } finally {
      setAiTitleLoading(false);
    }
  };

  // MP4書き出し（ブラウザ内録画）
  const handleExport = async () => {
    const container = previewRef.current?.getPlayerContainer();
    const player = previewRef.current?.getPlayerRef();
    if (!container) {
      setStatus('❌ プレビュー要素が見つかりません');
      return;
    }

    setRenderLoading(true);
    setRenderProgress('録画を準備中...');
    setDownloadUrl(null);

    try {
      const durationSeconds = Math.round(calculateDuration() / config.fps);

      // Playerを先頭にリセットして再生
      if (player) {
        player.seekTo(0);
        player.play();
      }

      const mp4Url = await recordAndExport(
        container,
        durationSeconds,
        (msg) => setRenderProgress(msg),
      );

      // 再生を停止
      if (player) player.pause();

      setDownloadUrl(mp4Url);
      setRenderProgress('');
      setStatus(`✅ 書き出し完了！ (${durationSeconds}秒)`);
    } catch (error: any) {
      setRenderProgress('');
      setStatus(`❌ 書き出しエラー: ${error?.message || String(error) || '不明'}`);
    } finally {
      setRenderLoading(false);
    }
  };

  // 動画長計算
  const calculateDuration = () => {
    if (config.durationMode === 'manual' && config.manualDuration) {
      return config.manualDuration * config.fps;
    }
    const count = config.rankings.length;
    const seconds = Math.max(30, Math.min(78, count * 0.78 + 5));
    return Math.round(seconds * config.fps);
  };

  return (
    <div className="h-screen bg-[#0a0a0f] text-white font-sans flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-5 py-3 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-tr from-yellow-400 to-orange-600 rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(251,191,36,0.4)]">
            <span className="text-base">✨</span>
          </div>
          <h1 className="text-sm font-bold tracking-tight text-white/90">
            TOP100 Video Generator
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {status && (
            <span className={`text-[11px] px-3 py-1 rounded-full ${status.includes('✅') ? 'bg-green-900/40 text-green-400' :
              status.includes('❌') ? 'bg-red-900/40 text-red-400' :
                'bg-yellow-900/40 text-yellow-400'
              }`}>
              {status}
            </span>
          )}
          <div className="flex items-center gap-2 text-[10px] text-gray-500">
            <span className="px-2 py-1 bg-white/5 rounded">{config.fps}fps</span>
            <span className="px-2 py-1 bg-white/5 rounded">1080×1920</span>
          </div>
          {renderProgress && (
            <span className="text-[11px] px-3 py-1 rounded-full bg-blue-900/40 text-blue-400 animate-pulse">
              {renderProgress}
            </span>
          )}
          {downloadUrl && (
            <a
              href={downloadUrl}
              download
              className="px-3 py-2 bg-green-600/80 text-white text-xs font-bold rounded-lg hover:bg-green-500 transition-colors flex items-center gap-1.5"
            >
              ⬇️ MP4ダウンロード
            </a>
          )}
          <button
            onClick={handleExport}
            disabled={renderLoading || config.rankings.length === 0}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all shadow-[0_4px_15px_rgba(251,191,36,0.3)] flex items-center gap-1.5 ${renderLoading || config.rankings.length === 0
              ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:scale-[1.02]'
              }`}
          >
            {renderLoading ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                書き出し中...
              </>
            ) : '動画を書き出し 🎬'}
          </button>
        </div>
      </header>

      {/* Main 2-pane layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: Settings */}
        <div className="w-[380px] flex-shrink-0 border-r border-white/[0.06] overflow-y-auto
          scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
          <div className="p-4 space-y-3">

            {/* ランキングデータ */}
            <RankingDataPanel
              rankings={config.rankings}
              onRankingsChange={(v) => updateConfig('rankings', v)}
              onAiGenerate={handleAiGenerate}
              aiLoading={aiLoading}
              theme={config.title}
            />

            {/* テキスト・デザイン */}
            <TextDesignPanel
              title={config.title}
              titleFontSize={config.titleFontSize}
              titleStyle={config.titleStyle}
              rankingFontSize={config.rankingFontSize}
              rankingStyle={config.rankingStyle}
              onTitleChange={(v) => updateConfig('title', v)}
              onTitleFontSizeChange={(v) => updateConfig('titleFontSize', v)}
              onTitleStyleChange={(v) => updateConfig('titleStyle', v)}
              onRankingFontSizeChange={(v) => updateConfig('rankingFontSize', v)}
              onRankingStyleChange={(v) => updateConfig('rankingStyle', v)}
              onAiSuggest={handleAiTitleSuggest}
              aiLoading={aiTitleLoading}
            />

            {/* CTA演出 */}
            <CtaPanel
              ctaStart={config.ctaStart}
              cta25={config.cta25}
              cta75={config.cta75}
              ctaEnd={config.ctaEnd}
              onCtaStartChange={(v) => updateConfig('ctaStart', v)}
              onCta25Change={(v) => updateConfig('cta25', v)}
              onCta75Change={(v) => updateConfig('cta75', v)}
              onCtaEndChange={(v) => updateConfig('ctaEnd', v)}
            />

            {/* 背景設定 */}
            <BackgroundPanel
              settings={config.background}
              onChange={(v) => updateConfig('background', v)}
            />

            {/* 音声 */}
            <AudioPanel
              bgmUrl={config.bgmUrl}
              bgmVolume={config.bgmVolume}
              onBgmUrlChange={(v) => updateConfig('bgmUrl', v)}
              onBgmVolumeChange={(v) => updateConfig('bgmVolume', v)}
            />

          </div>
        </div>

        {/* Right Panel: Preview */}
        <div className="flex-1 flex items-center justify-center bg-[#080810] p-6 relative">
          {/* グリッド背景 */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          <div className="relative z-10">
            <VideoPreview ref={previewRef} config={config} durationInFrames={calculateDuration()} />
          </div>
        </div>
      </main>
    </div>
  );
}
