'use client';

/**
 * ブラウザ内動画録画 + サーバーサイドMP4変換
 *
 * 1. Remotion Player のDOM要素をMediaRecorderでWebM録画
 * 2. WebMをサーバーの /api/convert に送信
 * 3. サーバーがffmpegでMP4に変換し、ファイルに保存
 * 4. /api/download からMP4を直接ダウンロード
 */

type ProgressCallback = (message: string) => void;

/**
 * 指定HTML要素を録画→MP4変換し、ダウンロードURLを返す
 * 返されるURLは /api/download?file=xxx.mp4 の形式（Blob URLではない）
 */
export async function recordAndExport(
    playerContainer: HTMLElement,
    durationSeconds: number,
    onProgress: ProgressCallback,
): Promise<string> {
    onProgress('録画を準備中...');

    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d')!;

    const stream = canvas.captureStream(30);

    const mimeType = getSupportedMimeType();
    const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 8_000_000,
    });

    const chunks: Blob[] = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    const captureFrame = () => {
        try {
            const sourceEl = playerContainer;
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const videos = sourceEl.querySelectorAll('video');
            const canvases = sourceEl.querySelectorAll('canvas');

            videos.forEach((video) => {
                if (video.readyState >= 2) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            });

            canvases.forEach((srcCanvas) => {
                ctx.drawImage(srcCanvas, 0, 0, canvas.width, canvas.height);
            });

            if (videos.length === 0 && canvases.length === 0) {
                captureDOMToCanvas(ctx, sourceEl, canvas.width, canvas.height);
            }
        } catch {
            // ignore
        }
    };

    // WebM録画
    const webmBlob = await new Promise<Blob>((resolve, reject) => {
        mediaRecorder.onstop = () => {
            try {
                const blob = new Blob(chunks, { type: mimeType });
                if (blob.size < 1000) {
                    reject(new Error('録画データが空です'));
                    return;
                }
                resolve(blob);
            } catch (err) {
                reject(err);
            }
        };
        mediaRecorder.onerror = () => reject(new Error('録画エラー'));

        mediaRecorder.start(100);
        onProgress(`録画中... (0/${durationSeconds}秒)`);

        let elapsed = 0;
        const intervalMs = 1000 / 30;
        const timer = setInterval(() => {
            captureFrame();
            elapsed += intervalMs;
            const secs = Math.floor(elapsed / 1000);
            if (elapsed % 3000 < intervalMs) {
                onProgress(`録画中... (${secs}/${durationSeconds}秒)`);
            }
        }, intervalMs);

        setTimeout(() => {
            clearInterval(timer);
            captureFrame();
            if (mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, durationSeconds * 1000 + 300);
    });

    // サーバーでMP4に変換
    onProgress('MP4に変換中...');
    const formData = new FormData();
    formData.append('video', webmBlob, 'recording.webm');

    const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `MP4変換に失敗 (${response.status})`);
    }

    const result = await response.json();
    if (!result.success || !result.downloadUrl) {
        throw new Error('MP4変換に失敗しました');
    }

    onProgress('MP4変換完了！');

    // サーバー上のMP4ダウンロードURL（Blob URLではない）
    return result.downloadUrl;
}

function captureDOMToCanvas(
    ctx: CanvasRenderingContext2D,
    el: HTMLElement,
    w: number,
    h: number
) {
    const computedStyle = getComputedStyle(el);
    ctx.fillStyle = computedStyle.backgroundColor || '#000';
    ctx.fillRect(0, 0, w, h);

    el.querySelectorAll('*').forEach((node) => {
        if (node.textContent && node.children.length === 0) {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            const containerRect = el.getBoundingClientRect();
            const scaleX = w / containerRect.width;
            const x = (rect.left - containerRect.left) * scaleX;
            const y = (rect.top - containerRect.top) * (h / containerRect.height);
            const fontSize = parseFloat(style.fontSize) * scaleX;
            ctx.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
            ctx.fillStyle = style.color;
            ctx.textAlign = 'center';
            ctx.fillText(node.textContent.trim(), x + (rect.width * scaleX) / 2, y + fontSize, rect.width * scaleX);
        }
    });
}

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
 * MP4ダウンロード（サーバーURLから直接ダウンロード）
 */
export function triggerDownload(downloadUrl: string) {
    // aタグでサーバーURLにアクセス → Content-Disposition: attachment で確実にダウンロード
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = ''; // サーバー側のContent-Dispositionのfilenameを使用
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
