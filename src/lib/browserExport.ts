'use client';

/**
 * ブラウザ内動画録画
 *
 * Remotion Player の DOM要素をキャプチャし、
 * MediaRecorder で WebM に録画してダウンロードする。
 * 
 * ffmpeg.wasm は SharedArrayBuffer が必要なため、
 * COOP/COEP ヘッダーなしでは使えない。
 * WebM は TikTok/Instagram/YouTube で直接アップロード可能。
 */

type ProgressCallback = (message: string) => void;

/**
 * 指定された HTML要素を録画し、動画としてダウンロード可能なURLを返す
 */
export async function recordAndExport(
    playerContainer: HTMLElement,
    durationSeconds: number,
    onProgress: ProgressCallback,
): Promise<string> {
    onProgress('録画を準備中...');

    // Step 1: Canvas にプレビューをキャプチャ
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    // Step 2: Canvas の MediaStream を取得
    const stream = canvas.captureStream(30); // 30fps

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8_000_000, // 8Mbps
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    // Step 3: DOM → Canvas フレームキャプチャ
    const captureFrame = () => {
        try {
            // プレビュー内の要素を取得
            const sourceEl = playerContainer;
            const rect = sourceEl.getBoundingClientRect();

            // OffscreenCanvas / drawImage は直接DOM要素には使えないため、
            // プレビュー内容のスケーリングされたスナップショットを描画
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // プレビュー内のすべてのcanvas/video要素を検索して描画
            const videos = sourceEl.querySelectorAll('video');
            const canvases = sourceEl.querySelectorAll('canvas');

            // video要素があれば描画
            videos.forEach((video) => {
                if (video.readyState >= 2) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            });

            // canvas要素があれば描画
            canvases.forEach((srcCanvas) => {
                ctx.drawImage(srcCanvas, 0, 0, canvas.width, canvas.height);
            });

            // video/canvasがない場合、SVG foreignObjectでDOM全体をキャプチャ
            if (videos.length === 0 && canvases.length === 0) {
                captureDOMToCanvas(ctx, sourceEl, canvas.width, canvas.height);
            }
        } catch {
            // フレームキャプチャエラーは無視（黒フレーム）
        }
    };

    // Step 4: 録画実行
    return new Promise<string>((resolve, reject) => {
        mediaRecorder.onstop = () => {
            try {
                const blob = new Blob(chunks, { type: mimeType });
                if (blob.size < 1000) {
                    reject(new Error('録画データが空です。プレビューが再生中か確認してください。'));
                    return;
                }
                const url = URL.createObjectURL(blob);
                resolve(url);
            } catch (err) {
                reject(err);
            }
        };

        mediaRecorder.onerror = () => {
            reject(new Error('録画中にエラーが発生しました'));
        };

        mediaRecorder.start(100); // 100ms チャンク
        onProgress(`録画中... (0/${durationSeconds}秒)`);

        // フレームキャプチャループ
        let elapsed = 0;
        const intervalMs = 1000 / 30;
        const timer = setInterval(() => {
            captureFrame();
            elapsed += intervalMs;
            const secs = Math.floor(elapsed / 1000);
            if (elapsed % 3000 < intervalMs) { // 3秒ごとに更新
                onProgress(`録画中... (${secs}/${durationSeconds}秒)`);
            }
        }, intervalMs);

        // 録画終了
        setTimeout(() => {
            clearInterval(timer);
            captureFrame(); // 最後のフレーム
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, durationSeconds * 1000 + 300);
    });
}

/**
 * SVG foreignObject でDOMをCanvasに描画（フォールバック）
 */
function captureDOMToCanvas(
    ctx: CanvasRenderingContext2D,
    el: HTMLElement,
    w: number,
    h: number
) {
    // 画面上でレンダリングされている要素の色情報を利用
    const computedStyle = getComputedStyle(el);
    const bgColor = computedStyle.backgroundColor || '#000';
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);

    // テキスト要素を描画
    const allText = el.querySelectorAll('*');
    allText.forEach((node) => {
        if (node.textContent && node.children.length === 0) {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            const containerRect = el.getBoundingClientRect();

            // スケール計算
            const scaleX = w / containerRect.width;
            const scaleY = h / containerRect.height;
            const x = (rect.left - containerRect.left) * scaleX;
            const y = (rect.top - containerRect.top) * scaleY;

            const fontSize = parseFloat(style.fontSize) * scaleX;
            ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
            ctx.fillStyle = style.color;
            ctx.textAlign = 'center';
            ctx.fillText(
                node.textContent.trim(),
                x + (rect.width * scaleX) / 2,
                y + fontSize,
                rect.width * scaleX
            );
        }
    });
}

/**
 * デバイスがサポートするMIMEタイプを取得
 */
function getSupportedMimeType(): string {
    const types = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
    ];
    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'video/webm';
}

/**
 * ファイルのダウンロードをトリガー
 */
export function triggerDownload(url: string, filename: string = 'fortune_ranking.webm') {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
