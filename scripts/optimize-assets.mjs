import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpegPath from 'ffmpeg-static';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const imageJobs = [
    'src/assets/Learn-pg-hero-image.png',
    'src/assets/Learn-pg-hero-image-2.png',
    'src/assets/shilingi-community.png',
    'src/assets/Shilingi-dashboad image.png',
    'src/assets/home-page-1.png',
    'src/assets/home-page-2.png',
    'src/assets/home-page-3.png',
    'src/assets/trust_people_kenya.png',
    'src/assets/bernard-sanya.png',
    'src/assets/contact-form-hero.png',
    'src/assets/stories/story1.png',
    'src/assets/stories/story2.png',
    'src/assets/stories/story3.png',
];

const videoJobs = [
    'src/video/AI_Video-compare.mp4',
    'src/assets/Partnerships-herovideo.mp4',
    'src/video/Community video.mp4',
    'src/video/Refer-friend.mp4',
    'src/video/tools-page-video-1.mp4',
    'src/video/shilingi-dashboard-guide.mp4',
];

function formatBytes(bytes) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function optimizedImagePath(source) {
    const parsed = path.parse(source);
    return path.join(parsed.dir, `${parsed.name}.webp`);
}

function optimizedVideoPath(source) {
    const parsed = path.parse(source);
    return path.join(parsed.dir, `${parsed.name}-optimized.mp4`);
}

async function getSize(filePath) {
    return (await stat(path.resolve(rootDir, filePath))).size;
}

async function optimizeImage(relativePath) {
    const input = path.resolve(rootDir, relativePath);
    const outputRelative = optimizedImagePath(relativePath);
    const output = path.resolve(rootDir, outputRelative);
    const originalSize = await getSize(relativePath);

    await sharp(input)
        .rotate()
        .resize({
            width: 1920,
            height: 1280,
            fit: 'inside',
            withoutEnlargement: true,
        })
        .webp({
            quality: 78,
            effort: 5,
        })
        .toFile(output);

    const optimizedSize = await getSize(outputRelative);
    console.log(`${relativePath} -> ${outputRelative}: ${formatBytes(originalSize)} to ${formatBytes(optimizedSize)}`);
}

function runFfmpeg(args) {
    return new Promise((resolve, reject) => {
        const child = spawn(ffmpegPath, args, {
            cwd: rootDir,
            stdio: ['ignore', 'ignore', 'pipe'],
        });
        let stderr = '';

        child.stderr.on('data', (chunk) => {
            stderr += chunk.toString();
        });

        child.on('error', reject);
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
                return;
            }

            reject(new Error(stderr || `ffmpeg exited with code ${code}`));
        });
    });
}

async function optimizeVideo(relativePath) {
    const outputRelative = optimizedVideoPath(relativePath);
    const originalSize = await getSize(relativePath);

    await runFfmpeg([
        '-y',
        '-i',
        relativePath,
        '-vf',
        'scale=min(1280\\,iw):-2',
        '-c:v',
        'libx264',
        '-preset',
        'medium',
        '-crf',
        '30',
        '-c:a',
        'aac',
        '-b:a',
        '96k',
        '-movflags',
        '+faststart',
        outputRelative,
    ]);

    const optimizedSize = await getSize(outputRelative);
    console.log(`${relativePath} -> ${outputRelative}: ${formatBytes(originalSize)} to ${formatBytes(optimizedSize)}`);
}

for (const image of imageJobs) {
    await optimizeImage(image);
}

for (const video of videoJobs) {
    await optimizeVideo(video);
}
