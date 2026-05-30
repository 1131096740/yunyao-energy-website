import { cli, Strategy } from '@jackwener/opencli/registry';

type CapturedResponse = {
  method: string;
  url: string;
  status: number;
  contentType: string;
  filename: string;
  body: unknown;
};

const PAGE_URL =
  'https://creator.douyin.com/creator-micro/data-center/operation';

cli({
  site: 'douyin-creator',
  name: 'export-operation',
  description: '导出抖音创作者中心数据中心-经营数据',
  domain: 'creator.douyin.com',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'timeout',
      type: 'int',
      default: 15000,
      help: '等待导出接口返回的毫秒数',
    },
    {
      name: 'click_text',
      type: 'str',
      default: '导出',
      help: '页面上触发导出的按钮文字',
    },
    {
      name: 'direct_url',
      type: 'str',
      required: false,
      help: '已知导出接口时直接请求该 URL',
    },
  ],
  columns: ['rank', 'method', 'status', 'filename', 'url', 'preview'],
  func: async (page, kwargs) => {
    if (!page) throw new Error('This command requires a browser session');

    await page.goto(PAGE_URL);
    await page.wait(3);

    if (kwargs.direct_url) {
      const direct = await page.evaluate(`(async () => {
        const res = await fetch(${JSON.stringify(kwargs.direct_url)}, {
          credentials: 'include',
        });
        const contentType = res.headers.get('content-type') || '';
        const disposition = res.headers.get('content-disposition') || '';
        let body = null;
        if (contentType.includes('json')) {
          body = await res.clone().json().catch(() => null);
        } else {
          body = await res.clone().text().catch(() => '');
        }
        return [{
          method: 'GET',
          url: res.url,
          status: res.status,
          contentType,
          filename: disposition,
          body,
        }];
      })()`);
      return formatCaptured(direct as CapturedResponse[]);
    }

    await page.evaluate(`(() => {
      const g = window;
      g.__opencliDouyinExport = [];

      const shouldKeep = (url, contentType) => {
        const text = String(url || '').toLowerCase();
        return /export|download|operation|data|creator|micro/.test(text)
          || /json|csv|excel|spreadsheet|octet-stream/.test(String(contentType || '').toLowerCase());
      };

      if (!g.__opencliDouyinFetchPatched) {
        g.__opencliDouyinFetchPatched = true;
        const originalFetch = g.fetch.bind(g);
        g.fetch = async (...args) => {
          const res = await originalFetch(...args);
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
          const method = (args[1]?.method || args[0]?.method || 'GET').toUpperCase();
          const contentType = res.headers.get('content-type') || '';
          const disposition = res.headers.get('content-disposition') || '';
          if (shouldKeep(url || res.url, contentType)) {
            const cloned = res.clone();
            let body = null;
            if (contentType.includes('json')) {
              body = await cloned.json().catch(() => null);
            } else {
              body = await cloned.text().catch(() => '');
            }
            g.__opencliDouyinExport.push({
              method,
              url: res.url || url,
              status: res.status,
              contentType,
              filename: disposition,
              body,
            });
          }
          return res;
        };
      }

      if (!g.__opencliDouyinXhrPatched) {
        g.__opencliDouyinXhrPatched = true;
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.open = function(method, url, ...rest) {
          this.__opencliMethod = method;
          this.__opencliUrl = url;
          return originalOpen.call(this, method, url, ...rest);
        };
        XMLHttpRequest.prototype.send = function(...args) {
          this.addEventListener('load', function() {
            const contentType = this.getResponseHeader('content-type') || '';
            const disposition = this.getResponseHeader('content-disposition') || '';
            if (!shouldKeep(this.__opencliUrl || this.responseURL, contentType)) return;
            let body = this.responseText;
            if (contentType.includes('json')) {
              try { body = JSON.parse(this.responseText); } catch {}
            }
            g.__opencliDouyinExport.push({
              method: String(this.__opencliMethod || 'GET').toUpperCase(),
              url: this.responseURL || this.__opencliUrl,
              status: this.status,
              contentType,
              filename: disposition,
              body,
            });
          });
          return originalSend.apply(this, args);
        };
      }
    })()`);

    const clicked = await page.evaluate(`(() => {
      const wanted = ${JSON.stringify(kwargs.click_text || '导出')};
      const nodes = Array.from(document.querySelectorAll('button, [role="button"], a'));
      const target = nodes.find((node) => {
        const text = (node.innerText || node.textContent || '').trim();
        return text.includes(wanted) && !node.disabled;
      });
      if (!target) return false;
      target.click();
      return true;
    })()`);

    if (!clicked) {
      throw new Error(
        `没有找到包含「${kwargs.click_text || '导出'}」文字的导出按钮，可用 --click_text 指定按钮文案`,
      );
    }

    const timeout = Math.max(1000, Number(kwargs.timeout || 15000));
    const started = Date.now();
    let captured: CapturedResponse[] = [];
    while (Date.now() - started < timeout) {
      await page.wait(1);
      captured = (await page.evaluate(
        `(() => window.__opencliDouyinExport || [])()`,
      )) as CapturedResponse[];
      if (captured.length > 0) break;
    }

    if (captured.length === 0) {
      throw new Error('已点击导出，但没有捕获到导出相关接口，请尝试增大 --timeout 或调整 --click_text');
    }

    return formatCaptured(captured);
  },
});

function formatCaptured(items: CapturedResponse[]) {
  return items.map((item, index) => ({
    rank: index + 1,
    method: item.method,
    status: item.status,
    filename: decodeDisposition(item.filename),
    url: item.url,
    preview: previewBody(item.body),
  }));
}

function previewBody(body: unknown) {
  if (body == null) return '';
  const text = typeof body === 'string' ? body : JSON.stringify(body);
  return text.length > 240 ? `${text.slice(0, 240)}...` : text;
}

function decodeDisposition(value: string) {
  if (!value) return '';
  try {
    const match = value.match(/filename\*=UTF-8''([^;]+)/i);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    return value;
  }
  return value;
}
