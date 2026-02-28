import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync, unlinkSync } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * WebM → MP4 変換 API
 * POST: WebM ファイルを受け取り、ffmpeg で MP4 に変換し、
 *       public/renders/ に保存してダウンロードURLを返す
 */
export async function POST(request: NextRequest) {
    const timestamp = Date.now();
    const tmpDir = path.join(process.cwd(), 'tmp');
    const rendersDir = path.join(process.cwd(), 'public', 'renders');
    const inputPath = path.join(tmpDir, `input_${timestamp}.webm`);
    const outputFileName = `fortune_${timestamp}.mp4`;
    const outputPath = path.join(rendersDir, outputFileName);

    try {
        // ディレクトリ作成
        if (!existsSync(tmpDir)) await mkdir(tmpDir, { recursive: true });
        if (!existsSync(rendersDir)) await mkdir(rendersDir, { recursive: true });

        // リクエストからWebMデータ取得
        const formData = await request.formData();
        const file = formData.get('video') as File;
        if (!file) {
            return NextResponse.json({ error: '動画ファイルが必要です' }, { status: 400 });
        }

        // WebM一時保存
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // ffmpeg変換
        await execFileAsync('ffmpeg', [
            '-y',
            '-i', inputPath,
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '23',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            outputPath,
        ]);

        // 入力ファイル削除
        try { unlinkSync(inputPath); } catch { }

        // ダウンロードURLを返す（直接ファイルとして配信するAPI）
        return NextResponse.json({
            success: true,
            downloadUrl: `/api/download?file=${outputFileName}`,
            filename: outputFileName,
        });
    } catch (error: any) {
        try { unlinkSync(inputPath); } catch { }
        try { unlinkSync(outputPath); } catch { }
        console.error('Convert error:', error);
        return NextResponse.json(
            { error: `変換に失敗: ${error.message || '不明なエラー'}` },
            { status: 500 }
        );
    }
}
