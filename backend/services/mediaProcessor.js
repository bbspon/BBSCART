// services/mediaProcessor.js
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const ffmpeg = require("fluent-ffmpeg");

const BASE_ASSETS_URL = process.env.BASE_ASSETS_URL || "http://localhost:5001";
const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT || path.join(__dirname, "..", "uploads");

// helpers
const toAbsUrl = (basename) =>
  `${BASE_ASSETS_URL}/uploads/${encodeURIComponent(basename)}`;

async function processImage(inPath, baseName, opts = {}) {
  const qualityMain = Number(process.env.WEBP_QUALITY_MAIN || 82);
  const qualityThumb = Number(process.env.WEBP_QUALITY_THUMB || 72);
  const thumbW = Number(process.env.THUMB_MAX_WIDTH || 480);

  const outMain = path.join(UPLOAD_ROOT, baseName);
  await sharp(inPath).webp({ quality: qualityMain }).toFile(outMain);
  const mainMeta = await sharp(outMain).metadata();

  const thumbName = baseName.replace(/\.webp$/i, ".thumb.webp");
  const outThumb = path.join(UPLOAD_ROOT, thumbName);
  await sharp(outMain)
    .resize({ width: thumbW, withoutEnlargement: true })
    .webp({ quality: qualityThumb })
    .toFile(outThumb);
  const thumbMeta = await sharp(outThumb).metadata();

  return {
    type: "image",
    main: {
      filename: baseName,
      url: toAbsUrl(baseName),
      size: fs.statSync(outMain).size,
      mime: "image/webp",
      width: mainMeta.width || 0,
      height: mainMeta.height || 0,
      quality: qualityMain,
    },
    thumb: {
      filename: thumbName,
      url: toAbsUrl(thumbName),
      size: fs.statSync(outThumb).size,
      mime: "image/webp",
      width: thumbMeta.width || 0,
      height: thumbMeta.height || 0,
      quality: qualityThumb,
    },
  };
}

function processVideo(inPath, baseName) {
  // returns a promise that resolves when webm + poster are ready
  const outWebm = path.join(UPLOAD_ROOT, baseName.replace(/\.[^.]+$/, ".webm"));
  const posterName = baseName.replace(/\.[^.]+$/, ".poster.webp");
  const outPoster = path.join(UPLOAD_ROOT, posterName);

  return new Promise((resolve, reject) => {
    ffmpeg(inPath)
      .outputOptions([
        "-c:v libvpx-vp9",
        "-b:v 0",
        "-crf 30",
        "-pix_fmt yuv420p",
      ])
      .save(outWebm)
      .on("end", async () => {
        // poster
        try {
          await new Promise((res, rej) => {
            ffmpeg(inPath)
              .screenshots({
                timestamps: ["50%"],
                filename: "frame.png",
                folder: path.dirname(outPoster),
              })
              .on("end", res)
              .on("error", rej);
          });
          const framePng = path.join(path.dirname(outPoster), "frame.png");
          await sharp(framePng).webp({ quality: 70 }).toFile(outPoster);
          fs.unlinkSync(framePng);
        } catch (_) {
          /* best effort */
        }

        const webmName = path.basename(outWebm);
        const posterUrl = fs.existsSync(outPoster)
          ? `${BASE_ASSETS_URL}/uploads/${path.basename(outPoster)}`
          : null;

        resolve({
          type: "video",
          webm: {
            filename: webmName,
            url: `${BASE_ASSETS_URL}/uploads/${webmName}`,
            size: fs.statSync(outWebm).size,
            mime: "video/webm",
          },
          poster: posterUrl ? { url: posterUrl, mime: "image/webp" } : null,
        });
      })
      .on("error", reject);
  });
}

module.exports = { processImage, processVideo, toAbsUrl, UPLOAD_ROOT };
