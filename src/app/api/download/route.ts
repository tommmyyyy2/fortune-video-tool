import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync, statSync } from 'fs';
import path from 'path';

/**
 * MP4ファイルダウンロードAPI
 * GET ?file=fortune_xxx.mp4
 * 
 * Content-Type: video/mp4 と Content-Disposition: attachment を設定して
 * ブラウザに確実にMP4としてダウンロードさせる
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const file = searchParams.get('file');

    // ファイル名のバリデーション（パストラバーサル防止）
    if (!file || !/^fortune_\d+\.mp4$/.test(file)) {
        return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'renders', file);

    if (!existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const stat = statSync(filePath);
    const fileBuffer = readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': stat.size.toString(),
            'Content-Disposition': `attachment; filename="${file}"`,
            'Cache-Control': 'no-cache',
        },
    });
}
