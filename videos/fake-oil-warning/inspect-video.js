const path = require("path");
const fs = require("fs");
const http = require("http");
const { chromium } = require("playwright");

const target = process.argv[2];
if (!target) {
  console.error("Usage: node inspect-video.js <video>");
  process.exit(1);
}

(async () => {
  const absoluteTarget = path.resolve(target);
  const stat = fs.statSync(absoluteTarget);
  const server = http.createServer((req, res) => {
    const range = req.headers.range;
    if (range) {
      const [startText, endText] = range.replace(/bytes=/, "").split("-");
      const start = Number(startText);
      const end = endText ? Number(endText) : stat.size - 1;
      res.writeHead(206, {
        "Content-Type": "video/mp4",
        "Content-Length": end - start + 1,
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Accept-Ranges": "bytes"
      });
      fs.createReadStream(absoluteTarget, { start, end }).pipe(res);
      return;
    }
    res.writeHead(200, {
      "Content-Type": "video/mp4",
      "Content-Length": stat.size,
      "Accept-Ranges": "bytes"
    });
    fs.createReadStream(absoluteTarget).pipe(res);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const browser = await chromium.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: true,
    args: ["--no-sandbox"]
  });
  try {
    const page = await browser.newPage();
    const url = `http://127.0.0.1:${server.address().port}/video.mp4`;
    await page.setContent(`<video id="v" src="${url}" preload="metadata"></video>`);
    await page.waitForFunction(() => {
      const video = document.getElementById("v");
      return Number.isFinite(video.duration) && video.duration > 0;
    });
    const info = await page.evaluate(() => {
      const video = document.getElementById("v");
      return {
        duration: Number(video.duration.toFixed(2)),
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight
      };
    });
    console.log(JSON.stringify(info, null, 2));
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})();
