import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

/**
 * WebM → MP4 変換 API
 * POST: WebM ファイルを受け取り、ffmpeg で MP4 に変換して返す
 */
export async function POST(request: NextRequest) {
    const tmpDir = path.join(process.cwd(), 'tmp');
    const timestamp = Date.now();
    const inputPath = path.join(tmpDir, `input_${timestamp}.webm`);
    const outputPath = path.join(tmpDir, `output_${timestamp}.mp4`);

    try {
        // tmp ディレクトリ作成
        if (!existsSync(tmpDir)) {
            await mkdir(tmpDir, { recursive: true });
        }

        // リクエストボディからWebMデータを取得
        const formData = await request.formData();
        const file = formData.get('video') as File;
        if (!file) {
            return NextResponse.json({ error: '動画ファイルが必要です' }, { status: 400 });
        }

        // WebMファイルを一時保存
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(inputPath, buffer);

        // ffmpeg で WebM → MP4 変換
        await execFileAsync('ffmpeg', [
            '-y',              // 上書き許可
            '-i', inputPath,   // 入力
            '-c:v', 'libx264', // H.264 コーデック
            '-preset', 'fast', // エンコード速度
            '-crf', '23',      // 品質（小さいほど高品質）
            '-pix_fmt', 'yuv420p', // 互換性のあるピクセルフォーマット
            '-movflags', '+faststart', // ストリーミング対応
            outputPath,
        ]);

        // MP4ファイルを読み込み
        const mp4Buffer = await readFile(outputPath);

        // 一時ファイル削除
        await unlink(inputPath).catch(() => { });
        await unlink(outputPath).catch(() => { });

        // MP4を返す
        return new NextResponse(mp4Buffer, {
            status: 200,
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': mp4Buffer.length.toString(),
                'Content-Disposition': `attachment; filename="fortune_${timestamp}.mp4"`,
            },
        });
    } catch (error: any) {
        // 一時ファイルのクリーンアップ
        await unlink(inputPath).catch(() => { });
        await unlink(outputPath).catch(() => { });

        console.error('Convert error:', error);
        return NextResponse.json(
            { error: `変換に失敗: ${error.message || '不明なエラー'}` },
            { status: 500 }
        );
    }
}
