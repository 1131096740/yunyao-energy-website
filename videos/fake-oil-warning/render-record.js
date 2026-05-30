const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("playwright");

const root = __dirname;
const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
let outputPath = path.join(root, "renders", `fake-oil-warning-${stamp}.mp4`);
const previewPath = path.join(root, "renders", `preview-${stamp}.png`);

const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".wav": "audio/wav",
  ".webm": "video/webm",
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function serveFile(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, "http://127.0.0.1").pathname);
  const safePath = path.normalize(urlPath === "/" ? "/index.html" : urlPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(root, safePath);
  if (!filePath.startsWith(root)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
    res.end(data);
  });
}

async function main() {
  fs.mkdirSync(path.join(root, "renders"), { recursive: true });

  const server = http.createServer(serveFile);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  const url = `http://127.0.0.1:${port}/index.html?record=1`;

  let stream = null;
  const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      "--no-sandbox",
      "--autoplay-policy=no-user-gesture-required",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding"
    ]
  });

  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on("console", (message) => console.log(`browser ${message.type()}: ${message.text()}`));
    page.on("pageerror", (error) => console.log(`browser error: ${error.message}`));
    await page.exposeBinding("pushChunk", async (_source, base64) => {
      stream.write(Buffer.from(base64, "base64"));
    });
    await page.exposeBinding("reportProgress", async (_source, current, total) => {
      console.log(`recording ${current}s / ${total}s`);
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 30000 });

    const meta = await page.evaluate(() => window.__meta);
    console.log(`duration ${meta.duration.toFixed(2)}s, captions ${meta.captions}`);

    await page.evaluate(() => window.previewAt(Math.min(36, window.__meta.duration * 0.18)));
    await page.screenshot({ path: previewPath });

    const supportedTypes = await page.evaluate(() => [
      "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
      "video/mp4;codecs=h264,aac",
      "video/mp4",
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm"
    ].filter((type) => MediaRecorder.isTypeSupported(type)));
    console.log(`media recorder support: ${supportedTypes.join(", ") || "browser default only"}`);
    const preferredType = supportedTypes.find((type) => type.startsWith("video/mp4")) || supportedTypes[0] || "";
    if (!preferredType.startsWith("video/mp4")) {
      outputPath = path.join(root, "renders", `fake-oil-warning-${stamp}.webm`);
    }
    stream = fs.createWriteStream(outputPath);

    await page.evaluate((mimeType) => window.startRecording(mimeType), preferredType);
  } finally {
    await browser.close().catch(() => {});
    if (stream) await new Promise((resolve) => stream.end(resolve));
    await new Promise((resolve) => server.close(resolve));
  }

  const stat = fs.statSync(outputPath);
  console.log(`wrote ${outputPath} (${stat.size} bytes)`);
  console.log(`wrote ${previewPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
