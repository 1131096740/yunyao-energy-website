import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Beaker,
  Factory,
  MapPinned,
  MessageCircle,
  Play,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const asset = (name) => `/brochure/${name}`;
const brandAsset = (name) => `/brand/${name}`;

const advantages = [
  {
    title: '把控油品基础属性',
    text: '检测运动粘度、闪点、倾点、蒸发损失、微量水分、碱值、机械杂质、硫酸盐灰分与泡沫特性。',
    icon: MapPinned,
  },
  {
    title: '验证润滑应用性能',
    text: '覆盖极压抗磨性、防锈性、破乳化值、高温清净性和低温流动性等应用性能指标。',
    icon: Beaker,
  },
  {
    title: '全维度覆盖',
    text: '检测设备覆盖润滑油基础理化与应用性能全维度，兼具检测精度与效率。',
    icon: Factory,
  },
  {
    title: '快速输出可靠数据',
    text: '为油品品质把控、技术升级与客户需求响应提供强力支持。',
    icon: ShieldCheck,
  },
];

const products = [
  {
    name: 'APEX 巅峰系列',
    spec: '4+5 全合成创新配方',
    viscosity: '0W-20 / 0W-30 / 0W-40',
    image: asset('p07-03.webp'),
    color: '#b56ad8',
    description: '以 PAO+酯类黄金配比为基底，面向更高性能需求，强化高温、抗磨和动力响应表现。',
  },
  {
    name: 'VANGUARD 先锋',
    spec: 'API SQ · ACEA C5/C3 · ILSAC GF-7A',
    viscosity: '0W-20 / 0W-30 / 0W-40',
    image: asset('p09-01.webp'),
    color: '#7da9d7',
    description: 'PAO+GTL 全合成基础油黄金配比，兼顾高效节能、低粘度保护与国六车型适配。',
  },
  {
    name: 'SHIELD 护盾',
    spec: 'API SP · ACEA C5/C6 A3/B4 · ILSAC GF-6A',
    viscosity: '0W-20 / 5W-30 / 5W-40',
    image: asset('p11-04.webp'),
    color: '#d8aa72',
    description: '精制三类基础油与高效添加剂体系，强化清净分散，减少油泥和积碳生成。',
  },
  {
    name: 'BLUE SHIELD 大众蓝油',
    spec: 'API SQ · ACEA C5 · VW508/509',
    viscosity: '0W-20',
    image: asset('p13-01.webp'),
    color: '#5da5d7',
    description: '面向大众、奥迪、斯柯达等直喷涡轮汽油发动机，强调低温流动与持久清净。',
  },
  {
    name: 'ECO Flow 畅流',
    spec: 'API SL',
    viscosity: '5W-30 / 10W-40',
    image: asset('p15-02.webp'),
    color: '#f2f2f2',
    description: '稳定配方体系，兼顾基础保护、清净分散和氧化安定性，适配经典粘度需求。',
  },
  {
    name: 'Petrol Additive',
    spec: '汽油机燃油宝',
    viscosity: 'PEA > 65%',
    image: asset('p18-02.webp'),
    color: '#c96f96',
    description: '采用进口原料与添加剂，面向燃油系统清洁和积碳养护需求。',
  },
];

const proofItems = [
  '严守安全红线',
  '精控质量标准',
  '厚植品牌底蕴',
  '年生产能力 3 万吨',
  '出厂检测报告能力',
  '西南供应链响应',
];

function App() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-shell', {
        y: -26,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('.hero-copy > *', {
        y: 38,
        opacity: 0,
        duration: 1,
        stagger: 0.12,
        ease: 'power3.out',
      });

      gsap.from('.hero-visual', {
        scale: 0.92,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
      });

      gsap.utils.toArray('.reveal-word').forEach((word, index) => {
        gsap.to(word, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: '.scrub-statement',
            start: `top+=${index * 8} 78%`,
            end: `top+=${index * 8 + 140} 42%`,
            scrub: true,
          },
        });
      });

      gsap.utils.toArray('.image-scale').forEach((image) => {
        gsap.fromTo(
          image,
          { scale: 0.86, opacity: 0.35 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: image,
              start: 'top 86%',
              end: 'bottom 35%',
              scrub: true,
            },
          },
        );
      });

      ScrollTrigger.matchMedia({
        '(min-width: 960px)': function setupPinnedLab() {
          ScrollTrigger.create({
            trigger: '.lab-section',
            start: 'top top',
            end: 'bottom bottom',
            pin: '.lab-pin',
            pinSpacing: false,
          });
        },
      });
    });

    return () => ctx.revert();
  }, []);

  const statementWords =
    '昆明具有“东连黔桂通沿海，北经川渝进中原，南下越老达泰柬，西接缅甸连印巴”的独特区位优势。云耀能源依托发达交通与独特区位，以技术实力和产品品质为基础，乘势而上。'.split('');

  return (
    <main className="site-shell">
      <nav className="nav-shell" aria-label="主导航">
        <a className="brand-mark" href="#top" aria-label="云耀能源润滑油首页">
          <img src={brandAsset('yunyao-logo-dark.webp')} alt="云耀润滑油 logo" />
          <strong>云耀润滑油</strong>
        </a>
        <div className="nav-links">
          <a href="#strength">实力</a>
          <a href="#lab">检测</a>
          <a href="#products">产品</a>
          <a href="#contact">咨询</a>
        </div>
      </nav>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="hero-kicker">云耀润滑油</p>
          <h1>云南云耀能源有限公司</h1>
          <p className="hero-lede">
            成立于 2025 年，坐落于云南省昆明市杨林经济开发区空港大道。新建工厂严格按照国际 4S 标准建设，
            致力于突破行业技术壁垒，引领技术革新。
          </p>
          <div className="hero-facts" aria-label="公司概况">
            <span>生产、研发、销售、服务一体</span>
            <span>目前年生产能力达 3 万吨</span>
            <span>服务云南及西南用油市场</span>
          </div>
          <div className="hero-actions">
            <a className="button primary" href="#strength">
              <Factory size={18} />
              了解公司实力
            </a>
            <a className="button secondary" href="#products">
              <Sparkles size={18} />
              查看产品体系
            </a>
          </div>
        </div>
        <div className="hero-visual image-scale">
          <img src={brandAsset('factory-floor.webp')} alt="云耀能源润滑油厂区环境实拍" />
          <div className="hero-panel">
            <span>昆明杨林经济开发区</span>
            <strong>厂区生产环境实拍</strong>
          </div>
        </div>
      </section>

      <div className="marquee-wrap" aria-label="品牌能力">
        <div className="marquee-track">
          {[...proofItems, ...proofItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </div>

      <section className="brand-proof" aria-label="云耀品牌实拍">
        <div className="logo-card">
          <img src={brandAsset('yunyao-logo-photo.webp')} alt="云耀能源润滑油 logo 实拍" />
        </div>
        <div className="factory-note">
          <h2>以前瞻视野和理性思考，紧跟时代步伐。</h2>
          <p>
            云耀能源凭借先进生产工艺和前沿行业标准，严守安全红线，精控质量标准，
            厚植品牌底蕴，致力于服务社会，为中国经济注入正能量。
          </p>
        </div>
      </section>

      <section id="strength" className="strength-section">
        <div className="section-heading">
          <p>公司简介</p>
          <h2>依托昆明区位优势，以扎实技术实力和卓越产品品质稳步开拓新局。</h2>
        </div>
        <div className="bento-grid">
          <article className="bento-card wide image-card">
            <img className="image-scale" src={asset('p04-01.webp')} alt="云耀能源品牌优势" />
            <div>
              <Factory size={26} />
              <h3>集生产、研发、销售、服务于一体</h3>
              <p>主营产品涵盖车用油、工程机械油、工业油、变速箱油、冷却液、清洗油、制动液等多种品类。</p>
            </div>
          </article>
          <article className="bento-card compact">
            <MapPinned size={26} />
            <h3>区位优势</h3>
            <p>昆明地处中国、东盟自由贸易区、澜湄合作区域、泛珠三角经济圈交汇点，是面向南亚、东南亚的重要门户。</p>
          </article>
          <article className="bento-card compact">
            <Sparkles size={26} />
            <h3>原料采购</h3>
            <p>基础油和添加剂采购自美孚、壳牌、台塑、润英联、雅富顿、雪佛龙等世界知名厂家。</p>
          </article>
          <article className="bento-card field-card">
            <ShieldCheck size={26} />
            <h3>应用领域</h3>
            <p>产品广泛应用于汽车、机械、冶金、矿采、航空航天、电子等领域。</p>
            <div className="domain-list" aria-label="应用领域列表">
              <span>汽车</span>
              <span>机械</span>
              <span>冶金</span>
              <span>矿采</span>
              <span>航空航天</span>
              <span>电子</span>
              <span>工程机械</span>
              <span>工业设备</span>
            </div>
          </article>
        </div>
      </section>

      <section className="statement-section" aria-label="品牌定位">
        <p className="scrub-statement">
          {statementWords.map((word, index) => (
            <span className="reveal-word" key={`${word}-${index}`}>
              {word}
            </span>
          ))}
        </p>
      </section>

      <section id="lab" className="lab-section">
        <div className="lab-pin">
          <p>质量保障体系</p>
          <h2>以精准检测，筑牢品质根基。</h2>
          <p className="lab-lede">
            云耀能源凭借行业领先的检测体系与设备，从源头确保产品数据可靠、性能卓越。
          </p>
        </div>
        <div className="lab-stack">
          {advantages.map((item) => {
            const Icon = item.icon;
            return (
              <article className="lab-card" key={item.title}>
                <Icon size={28} />
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
          <div className="lab-image-row">
            <img className="image-scale" src={asset('p05-01.webp')} alt="润滑油检测设备" />
            <img className="image-scale" src={asset('p05-02.webp')} alt="实验室检测仪器" />
          </div>
        </div>
      </section>

      <section id="products" className="products-section">
        <div className="section-heading products-heading">
          <p>主营产品</p>
          <h2>
            丰富产品体系，覆盖车用油、冷却液与高性能汽车养护品。
          </h2>
        </div>
        <div className="product-accordion">
          {products.map((product) => (
            <article className="product-panel" style={{ '--accent': product.color }} key={product.name}>
              <img src={product.image} alt={product.name} />
              <div className="product-copy">
                <span>{product.spec}</span>
                <h3>{product.name}</h3>
                <strong>{product.viscosity}</strong>
                <p>{product.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="contact-section">
        <div>
          <p>微信咨询 · 抖音关注</p>
          <h2>了解云耀能源产品体系、检测能力与合作信息。</h2>
        </div>
        <div className="contact-grid">
          <article>
            <MessageCircle size={28} />
            <h3>微信咨询</h3>
            <p>可用于索取车用油、工程机械油、工业油、冷却液与养护品资料。</p>
            <div className="wechat-codes" aria-label="微信联系方式">
              <span>YUNYAO_01</span>
              <span>WX15301290110537</span>
            </div>
          </article>
          <article className="qr-card">
            <img src={brandAsset('douyin-qr.webp')} alt="云耀润滑油抖音二维码" />
            <div>
              <Play size={28} />
              <h3>关注抖音</h3>
              <p>扫码关注云耀润滑油抖音号，查看公司动态、产品知识、检测能力与厂家服务信息。</p>
            </div>
          </article>
        </div>
      </section>

      <footer className="site-footer">
        <strong>云耀润滑油</strong>
        <span>云耀能源润滑油 · 昆明杨林经济开发区</span>
      </footer>
    </main>
  );
}

export default App;
