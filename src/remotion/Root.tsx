import { Composition } from 'remotion';
import { FortuneRanking, FortuneRankingProps } from './FortuneRanking';

// Generate sample rankings from 100 to 4
const sampleRankings: { rank: number; date: string }[] = [];
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
for (let rank = 100; rank >= 4; rank--) {
	sampleRankings.push({ rank, date: days[100 - rank] || `${(rank % 12) + 1}月${(rank % 28) + 1}日` });
}

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="FortuneRanking"
				component={FortuneRanking as unknown as React.FC<Record<string, unknown>>}
				durationInFrames={2340}
				fps={30}
				width={1080}
				height={1920}
				defaultProps={{
					title: "2026年 最強運勢ランキング",
					rankings: sampleRankings,
					copy: "浮気を一瞬で見抜く力を持つ人",
					titleFontSize: 120,
					titleStyle: 'mystic' as const,
					rankingFontSize: 80,
					rankingStyle: 'mystic' as const,
					ctaStart: {
						text: '1位までに、いいね保存すると\n運勢777倍アップ✨',
						style: 'gold' as const,
						marginTop: 80,
						marginBottom: 80,
					},
					cta25: {
						text: '1位までにフォローすると\n運気200%増加！🔥',
						style: 'gold' as const,
						marginTop: 80,
						marginBottom: 80,
					},
					cta75: {
						text: '「運命」とコメントすると\n無料鑑定がGETのチャンス💬',
						style: 'neon' as const,
						marginTop: 80,
						marginBottom: 80,
					},
					ctaEnd: {
						text: '🏆 1位〜3位は\nコメント欄で発表！',
						style: 'flame' as const,
						marginTop: 100,
						marginBottom: 100,
					},
				}}
			/>
		</>
	);
};
