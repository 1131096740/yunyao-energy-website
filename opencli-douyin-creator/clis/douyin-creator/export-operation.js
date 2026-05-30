import { cli, Strategy } from '@jackwener/opencli/registry';

const PAGE_URL = 'https://creator.douyin.com/creator-micro/data-center/operation';

cli({
  site: 'douyin-creator',
  name: 'export-operation',
  access: 'read',
  description: 'Export Douyin Creator operation data',
  domain: 'creator.douyin.com',
  strategy: Strategy.COOKIE,
  browser: true,
  args: [
    {
      name: 'section',
      type: 'str',
      default: 'overview',
      choices: ['overview', 'items', 'income', 'billboard', 'all', 'raw'],
      help: 'Export section: overview/items/income/billboard/all/raw',
    },
    {
      name: 'limit',
      type: 'int',
      default: 100,
      help: 'Maximum rows to return',
    },
    {
      name: 'wait',
      type: 'int',
      default: 8,
      help: 'Seconds to wait for the page',
    },
  ],
  columns: ['section', 'metric', 'date', 'value', 'title', 'item_id', 'extra'],
  func: async (page, kwargs) => {
    if (!page) throw new Error('This command requires a browser session');

    await page.goto(PAGE_URL);
    const waitSeconds = Math.max(3, Number(kwargs.wait || 8));
    await page.wait({ time: Math.min(waitSeconds, 5) }).catch(() => {});

    const section = kwargs.section || 'overview';
    const payload = await page.evaluate(`(async () => {
      const section = ${JSON.stringify(section)};
      const now = Date.now();
      const start = now - 30 * 24 * 60 * 60 * 1000;
      const endpoints = {
        overview: '/aweme/janus/creator/data/overview/all/?last_days_type=1',
        items: '/web/api/creator/item/list?count=50&fields=visibility%2Cmetrics%2Creview&status_list%5B%5D=102&status_list%5B%5D=143&start_time=' + start + '&end_time=' + now + '&need_long_article=true',
        income: '/aweme/v1/creator/income/category/summary/',
        billboard: '/aweme/v1/creator/data/overview/billboard?limit=50&offset=0&billboard_type=505',
      };

      const fetchJson = async (name, url) => {
        const res = await fetch(url, { credentials: 'include' });
        const text = await res.text();
        let data = null;
        try {
          data = JSON.parse(text.replace(/("id"\\s*:\\s*)(\\d{16,})/g, '$1"$2"'));
        } catch {
          data = text;
        }
        return { name, status: res.status, data };
      };

      const names = section === 'all' || section === 'raw'
        ? Object.keys(endpoints)
        : [section];
      const out = {};
      for (const name of names) {
        out[name] = await fetchJson(name, endpoints[name]);
      }
      if (section === 'raw') {
        out.debug = { location: location.href, title: document.title, endpoints };
      }
      return out;
    })()`);

    const rows = normalize(payload, section);
    return rows.slice(0, Math.max(1, Number(kwargs.limit || 100)));
  },
});

function normalize(payload, section) {
  if (section === 'raw') {
    return Object.entries(payload).map(([name, value]) => row(name, 'raw', '', '', '', '', value));
  }
  const rows = [];
  if (payload.overview) rows.push(...overviewRows(payload.overview.data));
  if (payload.items) rows.push(...itemRows(payload.items.data));
  if (payload.income) rows.push(...incomeRows(payload.income.data));
  if (payload.billboard) rows.push(...billboardRows(payload.billboard.data));
  return rows;
}

function overviewRows(data) {
  const root = data?.data || {};
  const rows = [];
  for (const [metric, item] of Object.entries(root)) {
    if (!item || typeof item !== 'object') continue;
    const options = Array.isArray(item.option_list) ? item.option_list : [];
    if (options.length === 0 && item.current_count != null) {
      rows.push(row('overview', metric, '', item.current_count, '', '', {
        last_period_incr: item.last_period_incr,
        option_type: item.option_type,
      }));
      continue;
    }
    for (const point of options) {
      rows.push(row('overview', metric, point.date || '', point.count ?? '', '', '', {
        current_count: item.current_count,
        last_period_incr: item.last_period_incr,
        last_day_incr_rate: point.last_day_incr_rate,
        option_type: item.option_type,
      }));
    }
  }
  return rows;
}

function itemRows(data) {
  return (data?.items || []).map((item) => row('items', 'work', formatTime(item.create_time), item.metrics?.view_count ?? '', item.description || '', String(item.id || ''), {
    like_count: item.metrics?.like_count,
    comment_count: item.metrics?.comment_count,
    share_count: item.metrics?.share_count,
    favorite_count: item.metrics?.favorite_count,
    homepage_visit_count: item.metrics?.homepage_visit_count,
    avg_view_second: item.metrics?.avg_view_second,
    completion_rate: item.metrics?.completion_rate,
    type: item.type,
  }));
}

function incomeRows(data) {
  const rows = [];
  for (const [metric, item] of Object.entries(data || {})) {
    if (!metric.endsWith('_summary') || !item || typeof item !== 'object') continue;
    rows.push(row('income', metric, '', item.history_total_income ?? 0, '', '', {
      data_update_status: item.data_update_status,
      link_relative: item.link_relative,
      categories: item.category_list,
    }));
  }
  rows.push(row('income', 'today_total_income', '', data?.today_total_income ?? 0, '', '', {}));
  rows.push(row('income', 'total_balance', '', data?.total_balance ?? 0, '', '', {}));
  return rows;
}

function billboardRows(data) {
  return (data?.billboard_data?.element_list || []).map((item) => row('billboard', 'topic', '', item.statistics_data?.hot_value || '', item.base_data?.title || '', item.base_data?.billboard_id || '', {
    author: item.base_data?.author,
    related_items: item.related_item_list?.map((x) => x.sec_item_id).join(','),
  }));
}

function row(section, metric, date, value, title, itemId, extra) {
  return {
    section,
    metric,
    date,
    value,
    title,
    item_id: itemId,
    extra: compact(extra),
  };
}

function compact(value) {
  const text = JSON.stringify(value ?? {});
  return text.length > 500 ? `${text.slice(0, 500)}...` : text;
}

function formatTime(seconds) {
  if (!seconds) return '';
  return new Date(Number(seconds) * 1000).toISOString().slice(0, 19).replace('T', ' ');
}
