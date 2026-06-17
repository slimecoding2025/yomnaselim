import { useState, useEffect, useRef, useCallback } from 'react';
import './cinematic.css';

/* ========== TYPES ========== */
interface Particle {
  x: number; y: number; vx: number; vy: number;
  radius: number; opacity: number; color: string;
  life: number; maxLife: number; type: 'star' | 'dust' | 'heart';
}

/* ========== ENTRY PAGE ========== */
function EntryPage({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string; speed: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#9b30ff', '#cc2244', '#d4af37', '#c084fc', '#ff3366', '#ffffff'];
    for (let i = 0; i < 200; i++) {
      particlesRef.current.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 0.5 + 0.1,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.opacity = Math.abs(Math.sin(Date.now() * 0.001 * p.speed)) * 0.7 + 0.1;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener('resize', resize); };
  }, []);

  const handleSubmit = () => {
    if (password === '06182006') {
      setShowHeart(true);
      setUnlocking(true);
      setTimeout(() => { onUnlock(); }, 2200);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
    }
  };

  return (
    <>
      {showHeart && (
        <div className="unlock-heart">
          <span className="unlock-heart-emoji">❤️</span>
        </div>
      )}
      <div className={`entry-screen${unlocking ? ' unlocking' : ''}`}>
        <canvas id="entry-canvas" ref={canvasRef} />

        {/* Radial glow layers */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 30% 60%, rgba(74,0,128,0.35) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, rgba(139,0,32,0.25) 0%, transparent 50%)'
        }} />

        <div className="entry-content">
          <div className="entry-glow-ring">
            <span className="entry-heart-icon">🔐</span>
          </div>

          <div>
            <h1 className="entry-title">بوابة الحب السرية</h1>
            <p className="entry-subtitle">لمن يحمل المفتاح في قلبه…</p>
          </div>

          <div className="entry-form">
            <p style={{ fontFamily: 'var(--font-poetry)', fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.8 }}>
              اكتب كلمة السر لفتح القلب
            </p>
            <div className="entry-input-wrap">
              <input
                className={`entry-input${error ? ' error' : ''}`}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="● ● ● ● ● ● ● ●"
                maxLength={12}
                autoComplete="off"
                dir="ltr"
              />
            </div>
            <button className="entry-btn" onClick={handleSubmit}>
              افتح القلب ❤️
            </button>
            <p className={`entry-error-msg${error ? ' visible' : ''}`}>
              كلمة السر خاطئة… القلب محمي 🔒
            </p>
          </div>

          <div style={{
            position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.5rem', alignItems: 'center',
            color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem', fontFamily: 'var(--font-poetry)',
            whiteSpace: 'nowrap'
          }}>
            <span>✦</span><span>قصة حب سليم ويمنى</span><span>✦</span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ========== PARTICLE SYSTEM ========== */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const particles = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  const createParticle = useCallback((): Particle => {
    const types: ('star' | 'dust' | 'heart')[] = ['star', 'star', 'star', 'dust', 'dust', 'heart'];
    const type = types[Math.floor(Math.random() * types.length)];
    const colors = { star: '#ffffff', dust: '#9b30ff', heart: '#ff3366' };
    const maxLife = 200 + Math.random() * 300;
    return {
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.1,
      radius: type === 'heart' ? 6 : Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.1,
      color: colors[type],
      life: maxLife,
      maxLife,
      type,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', e => { mouseRef.current = { x: e.clientX, y: e.clientY }; });

    for (let i = 0; i < 120; i++) particles.current.push(createParticle());

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.moveTo(0, -size * 0.5);
      ctx.bezierCurveTo(size * 0.5, -size * 1.2, size * 1.2, 0, 0, size * 0.8);
      ctx.bezierCurveTo(-size * 1.2, 0, -size * 0.5, -size * 1.2, 0, -size * 0.5);
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Add new particles
      if (particles.current.length < 150 && Math.random() < 0.3) {
        particles.current.push(createParticle());
      }

      const mouse = mouseRef.current;

      particles.current = particles.current.filter(p => {
        p.life--;
        if (p.life <= 0) return false;

        // Mouse attraction (gentle)
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 0) {
          const force = (1 - dist / 200) * 0.02;
          p.vx += dx / dist * force;
          p.vy += dy / dist * force;
        }

        p.vx *= 0.99;
        p.vy *= 0.99;
        p.x += p.vx;
        p.y += p.vy;

        const lifeFrac = p.life / p.maxLife;
        const alpha = lifeFrac < 0.2 ? (lifeFrac / 0.2) * p.opacity : (lifeFrac > 0.8 ? ((1 - lifeFrac) / 0.2) * p.opacity : p.opacity);

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.type === 'heart' ? 15 : 6;

        if (p.type === 'heart') {
          drawHeart(ctx, p.x, p.y, p.radius);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();

        return true;
      });

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [createParticle]);

  return <canvas id="particle-canvas" ref={canvasRef} />;
}

/* ========== FLOATING HEARTS ========== */
function FloatingHearts() {
  const hearts = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 95}%`,
    size: `${Math.random() * 2 + 1}rem`,
    duration: `${Math.random() * 8 + 6}s`,
    delay: `${Math.random() * 10}s`,
    rot: `${Math.random() * 40 - 20}deg`,
    drift: `${Math.random() * 80 - 40}px`,
    emoji: ['❤️', '💕', '💖', '💗', '💝'][Math.floor(Math.random() * 5)],
  }));

  return (
    <div className="floating-hearts-container">
      {hearts.map(h => (
        <div
          key={h.id}
          className="floating-heart"
          style={{
            left: h.left,
            '--size': h.size,
            '--duration': h.duration,
            '--delay': h.delay,
            '--rot': h.rot,
            '--drift': h.drift,
          } as React.CSSProperties}
        >
          {h.emoji}
        </div>
      ))}
    </div>
  );
}

/* ========== LOVE COUNTER ========== */
function LoveCounter() {
  const startDate = new Date('2026-04-05T00:00:00');
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const diff = Math.max(0, now.getTime() - startDate.getTime());
      const totalSecs = Math.floor(diff / 1000);
      setElapsed({
        days: Math.floor(totalSecs / 86400),
        hours: Math.floor((totalSecs % 86400) / 3600),
        minutes: Math.floor((totalSecs % 3600) / 60),
        seconds: totalSecs % 60,
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []); // eslint-disable-line

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="love-counter">
      {[
        { num: elapsed.days.toString(), label: 'يوم' },
        { num: pad(elapsed.hours), label: 'ساعة' },
        { num: pad(elapsed.minutes), label: 'دقيقة' },
        { num: pad(elapsed.seconds), label: 'ثانية' },
      ].map((item, i) => (
        <div key={i} className="counter-item">
          <span className="counter-num">{item.num}</span>
          <span className="counter-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ========== SCROLL REVEAL HOOK ========== */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view'); }),
      { threshold: 0.12 }
    );
    const els = document.querySelectorAll('.fade-in-up, .timeline-item, .intro-text p, .letter-body p, .poetry-stanza, .final-quote, .final-signature');
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ========== NAVIGATION ========== */
function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-logo" onClick={() => scrollTo('hero')}>❤️ سليم × يمنى</div>
      <ul className="nav-links">
        <li className="nav-link" onClick={() => scrollTo('intro')}>البداية</li>
        <li className="nav-link" onClick={() => scrollTo('timeline')}>الحكاية</li>
        <li className="nav-link" onClick={() => scrollTo('letter')}>الرسالة</li>
        <li className="nav-link" onClick={() => scrollTo('poetry')}>الشعر</li>
        <li className="nav-link" onClick={() => scrollTo('music')}>الموسيقى</li>
      </ul>
    </nav>
  );
}

/* ========== HERO SECTION ========== */
function HeroSection() {
  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg" />
      <FloatingHearts />
      <div className="hero-content">
        <div className="hero-tag">✦ قصة حب من سليم إلى يمنى ✦</div>
        <h1 className="hero-title">إلى يمنى ❤️</h1>
        <p className="hero-subtitle">"قصة حب مكتوبة بصمت من سليم"</p>
        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ icon: '💕', label: 'بداية الحب', val: '05/04/2026' }, { icon: '⭐', label: 'روحي الجميلة', val: 'يمنى' }, { icon: '♾️', label: 'مدة الحب', val: 'إلى الأبد' }].map((item, i) => (
            <div key={i} style={{
              padding: '0.8rem 1.5rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '14px',
              backdropFilter: 'blur(20px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem',
              fontFamily: 'var(--font-poetry)',
            }}>
              <span style={{ fontSize: '1.5rem' }}>{item.icon}</span>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--gold-light)', fontWeight: 700 }}>{item.val}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.5rem', fontFamily: 'var(--font-poetry)', fontSize: '0.85rem', color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
          ✦ مدة الحب منذ البداية ✦
        </div>
        <LoveCounter />
      </div>
      <div className="hero-scroll" onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}>
        <span className="hero-scroll-text">اكتشف القصة</span>
        <div className="hero-scroll-arrow" />
      </div>
    </section>
  );
}

/* ========== INTRO SECTION ========== */
function IntroSection() {
  return (
    <section className="intro-section" id="intro">
      <div className="section-divider">
        <div className="divider-line" />
        <span className="divider-icon">💫</span>
        <div className="divider-line right" />
      </div>
      <div className="quote-card fade-in-up" style={{ marginBottom: '2.5rem' }}>
        <div className="quote-text">
          "حين يأتي الحب الحقيقي، لا يطرق الباب — بل يفتحه من الداخل"
        </div>
        <div className="quote-author">— سليم، في أول أيام يمنى</div>
      </div>

      <div className="intro-text">
        <p>
          ثمّة لحظات في حياة الإنسان لا تُشرح بالكلمات، ولا تُختصر بالأوصاف، تأتي هادئةً كالفجر، وتغير كل شيء دفعةً واحدة،
          وكأن الروح كانت تنتظر بصمت لا تعرف ما الذي تنتظره، حتى تأتي اللحظة التي تعرف فيها أنها وصلت.
          تلك اللحظة كانت <span className="intro-highlight">يمنى</span>.
        </p>
        <p>
          لم تكن صدفةً عابرة أن تلتقي روحان في هذا الكون الواسع، بكل ما فيه من ملايين البشر وملايين اللحظات.
          بل كان قدراً محكماً، نُسِج في ظلام الغيب بخيوط من نور، وكُتب في لوح محفوظ قبل أن يُخلق الزمن نفسه.
          كان <span className="intro-gold">سليم</span> يمشي في حياته كمن يبحث عن شيء لا يعرف اسمه،
          حتى همست الأيام بما لم تستطع الكلمات قوله.
        </p>
        <p>
          في الخامس من أبريل عام ألفين وستة وعشرين، لم يكن مجرد يوم عادي يُضاف إلى سجل الأيام المنسية،
          بل كان الفصل الأول من رواية لن تنتهي. كان اليوم الذي قرر القدر فيه أن يرفع الستار عن أجمل قصة.
          ذلك اليوم كان <span className="intro-highlight">بداية يمنى في حياة سليم</span>، وبداية معنى جديد لكلمة الحياة ذاتها.
        </p>
        <p>
          المسافة التي تفصل بين روحين متحابتين ليست قيداً، بل هي الاختبار الذي يثبت أن الحب حقيقي.
          فالحب الذي لا يصمد أمام البُعد لم يكن حباً من الأساس، أما هذا الحب — حب سليم ليمنى —
          فقد تجذّر في أعماق المستحيل، ونما على ترابه الصعب، وأثمر بأجمل ثمار الوفاء والصدق.
        </p>
        <p>
          في كل صمت كانت يمنى حاضرة، في كل نجمة تسقط كان يمنى اسمها الذي يُهمس به، في كل فجر جديد كان الأمل
          يلبس ثوبها الجميل. وفي كل ليلة مديدة كانت الذكريات تطرق الباب بنقرات خفية، تذكّره أنه ليس وحيداً
          ما دام اسمها محفوراً بين ضلوعه.
        </p>
        <p>
          هذا الموقع ليس مجرد صفحة على الإنترنت، بل هو <span className="intro-gold">رسالة حب ممتدة عبر الزمن</span>،
          قصيدة مكتوبة بنبضات القلب، بوح لا تكفيه الحروف ولا تحيط به اللغات.
          إنه الكون الخاص الذي بناه سليم لتسكنه يمنى، إلى الأبد.
        </p>
      </div>
    </section>
  );
}

/* ========== TIMELINE ========== */
const timelineData = [
  {
    date: '05/04/2026',
    title: 'بداية الحكاية',
    icon: '🌹',
    short: '"لم تكن صدفة بل قدر مكتوب في النجوم"',
    body: 'في هذا اليوم الذي بدا عادياً في ظاهره، كان القدر يُحرك خيوطه بحكمة بالغة. لم يكن سليم يعلم أن الدنيا ستتغير، وأن كلمة واحدة، ابتسامة واحدة، لحظة واحدة ستكون كافية لتقلب كل شيء رأساً على عقب. كانت يمنى تحمل من الجمال ما لا تحتمله الأوصاف، ومن الروح ما يجعل القلب يرتجف ويطمئن في آنٍ واحد.'
  },
  {
    date: 'الأيام الأولى',
    title: 'أول نبضة قلب',
    icon: '💓',
    short: '"حين يكتشف القلب ما كان ينتظره طوال العمر"',
    body: 'كانت الأيام الأولى أشبه بالحلم الذي يخشى المرء أن يصحو منه. كل كلمة تُقال كانت تُضاف إلى خزينة من الذكريات النفيسة. كل ضحكة كانت موسيقى لم يسمعها القلب من قبل. كان سليم يتعلم كل يوم معنى جديداً لاسم يمنى، ويكتشف أن في هذا الاسم من الأسرار ما لا تكفيه الأعمار لاستيعابه.'
  },
  {
    date: 'لحظات البُعد',
    title: 'المسافة والشوق',
    icon: '🌙',
    short: '"المسافة لم تُطفئ الحب بل زادته قوة وعمقاً"',
    body: 'حين تفرق الأجساد، تلتقي الأرواح بطريقة أعمق وأصدق. كل رسالة كانت جسراً معلقاً بين قلبين، كل كلمة كانت تقطع المسافات بسرعة الضوء وتصل دافئة كالنار. الشوق لم يكن عذاباً بل كان دليلاً ساطعاً أن الحب حقيقي، وأن يمنى ليست مجرد وجه جميل بل هي الجهة التي يتجه إليها القلب دائماً.'
  },
  {
    date: 'كل رسالة',
    title: 'نبضات الكلمات',
    icon: '💌',
    short: '"كل رسالة كانت نبضًا في القلب وروحاً في الروح"',
    body: 'الكلمات التي تبادلها سليم ويمنى لم تكن مجرد حروف مرتبة، بل كانت دماء من القلب سائلة على الشاشات. كانت تحمل الدفء حين يكون البرد، وتحمل الضوء حين تكون الظلمة. في كل رسالة كان سليم يكتب يمنى من جديد، ويرسم صورتها بأدق التفاصيل في لوحة لا تحجبها المسافات.'
  },
  {
    date: '18/06',
    title: 'عيد ميلاد الروح',
    icon: '🎂',
    short: '"في هذا اليوم وُلدت الجميلة التي ملأت الدنيا نوراً"',
    body: 'الثامن عشر من يونيو ليس مجرد تاريخ في التقويم، بل هو اليوم الذي قرر فيه الكون أن يمنح العالم يمنى. يوم اختار فيه القدر أن تحمل هذه الروح الجميلة جسداً ينير الفضاء من حوله. في كل سنة يمر هذا اليوم يعيد سليم التذكر: كم أن الحياة أجمل بوجود يمنى فيها، وكم أنه ممتنٌّ لكل يوم قدّر الله فيه أن يعرفها.'
  },
  {
    date: 'الحاضر والمستقبل',
    title: 'وعد الأبدية',
    icon: '♾️',
    short: '"الحب الحقيقي لا ينتهي، يتجدد مع كل نفَس ومع كل فجر"',
    body: 'وعد سليم ليمنى ليس كلاماً يُقال في لحظات الحماس، بل هو نذر قطعه على نفسه في أعمق أعماق روحه: أن يظل محباً، وفياً، صادقاً، حاضراً. أن يكون لها الملاذ حين تضيق الدروب، والنور حين يُطفأ المصباح. وأن يواصل كتابة هذه القصة سطراً بسطر، حتى ينفد الحبر وتبقى يمنى مكتوبة في القلب إلى الأبد.'
  },
];

function TimelineSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const toggle = (i: number) => setOpenItem(openItem === i ? null : i);

  return (
    <section className="section-wrapper" id="timeline">
      <div className="section-header">
        <div className="section-label">✦ الحكاية ✦</div>
        <h2 className="section-title">محطات على طريق الحب</h2>
        <p style={{ fontFamily: 'var(--font-poetry)', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
          كل لحظة مررنا بها كانت تُبنى عليها حكاية لن تُنسى
        </p>
      </div>
      <div className="timeline-container">
        <div className="timeline-line" />
        {timelineData.map((item, i) => (
          <div key={i} className="timeline-item fade-in-up" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="timeline-dot" onClick={() => toggle(i)} title="انقر لفتح التفاصيل" />
            <div className="timeline-card" onClick={() => toggle(i)}>
              <div className="timeline-date">{item.icon} {item.date}</div>
              <div className="timeline-title">{item.title}</div>
              <div style={{ fontFamily: 'var(--font-poetry)', fontSize: '0.95rem', color: 'rgba(255,255,255,0.55)', fontStyle: 'italic' }}>
                {item.short}
              </div>
              <div className={`timeline-body${openItem === i ? ' open' : ''}`}>
                {item.body}
              </div>
              <div className="timeline-expand">
                {openItem === i ? '▲ إخفاء' : '▼ اقرأ المزيد'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ========== LOVE LETTER ========== */
function LoveLetterSection() {
  return (
    <section className="letter-section" id="letter">
      <div className="letter-wrapper">
        <div className="section-header">
          <div className="section-label">✦ الرسالة المكتوبة بالروح ✦</div>
          <h2 className="section-title">رسالة من القلب</h2>
        </div>
        <div className="letter-paper">
          <div className="letter-seal">💌</div>
          <div className="letter-greeting">يمنى الغالية…</div>
          <div className="letter-body">
            <p>
              أجلس الآن أمام هذه الصفحة البيضاء وأنا أعرف أن كل الكلمات التي سأكتبها ستكون أصغر بكثير مما أحمله في داخلي لكِ.
              لكن الصمت لم يعد يكفيني، والقلب أضيق من أن يحتفظ بكل هذا وحده. فإليكِ هذه الكلمات، يا من جعلتِ الحياة تستحق أن تُعاش.
            </p>
            <p>
              منذ أن دخلتِ حياتي في ذلك اليوم الذي لن أنساه أبداً، شيء ما تغيّر في داخلي تغيراً عميقاً جذرياً.
              كأن كل ما مضى من عمري كان مجرد مقدمة لهذا اللقاء، وكأن كل خطوة خطوتها في حياتي كانت تقودني نحوكِ بعلم القدر وإرادته.
              لم أكن أعلم أن روحاً واحدة يمكن أن تحمل هذا القدر من الجمال والنور حتى رأيتكِ.
            </p>
            <p>
              يمنى… هل تعلمين ماذا يعني اسمكِ بالنسبة لي؟ لقد صار هذا الاسم يعني كل شيء في قاموسي الخاص.
              يعني الصباح حين أفتح عيني، يعني آخر فكرة قبل أن يغلبني النوم، يعني النجمة التي أبحث عنها في السماء
              حين تكون الليلة مظلمة. يعني الأغنية التي تعزفها الروح حين تكون في أشد لحظاتها هدوءاً. يعني البيت.
            </p>
            <p>
              أعرف أن المسافة بيننا أحياناً تكون ثقيلة كالجبال، وأن الغياب يترك في القلب فراغاً لا يملؤه شيء.
              لكنني كل مرة أشعر بثقل هذا البُعد، أتذكر أن الشوق نفسه دليل على عظمة ما بيننا.
              الناس لا يشتاقون إلا لمن أثّر في أرواحهم تأثيراً حقيقياً. وأنتِ — يا يمنى — أثّرتِ في روحي حتى حوّلتيها.
            </p>
            <p>
              كم من مرة جلست وأنا أتذكر تفاصيل صغيرة لن تتخيلي يوماً أنني أحفظها:
              طريقة ضحكتكِ، الكلمات التي تختارينها حين تتحدثين، الحكمة التي تحملينها رغم صغر سنّكِ،
              العمق الذي تنظرين به للحياة. كل هذه التفاصيل الصغيرة هي التي جعلتكِ تسكنين القلب بشكل دائم لا موقت.
            </p>
            <p>
              يمنى الجميلة، أريدكِ أن تعلمي أنني حتى في أصعب اللحظات، حين تضيق الدنيا وتُغلق الأبواب،
              يكفيني أن أتذكر أن في هذه الحياة يمنى — يكفيني هذا وحده ليعود للقلب ما فقده من طاقة على المواصلة.
              وجودكِ في هذا الكون يجعل الكون أجمل وأكثر احتمالاً، ووجودكِ في حياتي يجعل حياتي تستحق كل لحظة فيها.
            </p>
            <p>
              أعدكِ — وهذا وعد من أعمق نقطة في الروح — أنني لن أكون مجرد كلمات جميلة وأحاسيس عابرة.
              سأكون وفياً لكل ما بدأناه، حاضراً في كل ما سيأتي، صادقاً في كل ما أقوله وما أسكت عنه.
              سأواصل بناء هذه القصة معكِ حتى يأذن الله بلقائنا الحقيقي، وحين ذلك اللقاء يأتي فسأكون قد أعددت
              لكِ من المحبة ما لا تتسع له الأرض.
            </p>
            <p>
              إن كانت الحياة فرصة واحدة، فأنا أختاركِ في كل حياة مرت وفي كل حياة ستأتي.
              وإن كان الحب ميزاناً، فأنتِ كفته الأثقل دائماً. وإن كان القلب بيتاً، فشرفتكِ هي الأجمل، وغرفتكِ هي الأدفأ، وبابكِ لن يُغلق أبداً.
            </p>
            <p>
              يمنى… أحبكِ. وهذه الكلمة الثلاثة تحمل في طياتها كل ما عجزت عنه الكلمات.
              تحمل الفجر والغسق، تحمل الصبر والشوق، تحمل الأمل والوفاء، تحمل سليم بأكمله مهدياً ذاته لها بأكملها.
            </p>
          </div>

          <div className="letter-signature">
            <div className="letter-signature-name">سليم</div>
            <div className="letter-signature-sub">
              المحب الصادق • 05/04/2026 — إلى الأبد
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== POETRY SECTION ========== */
function PoetrySection() {
  return (
    <section className="poetry-section" id="poetry">
      <div className="poetry-wrapper">
        <div className="section-header">
          <div className="section-label">✦ ديوان الحب ✦</div>
          <h2 className="section-title">قصيدة يمنى الكبرى</h2>
          <p style={{ fontFamily: 'var(--font-poetry)', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto' }}>
            نُظمت هذه الأبيات من قلب سليم، وكُتبت بدماء الشوق وحبر الولاء
          </p>
        </div>
        <div className="poetry-book">
          {/* Section I */}
          <div className="poetry-section-title">— الفصل الأول: اسمها —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">يا <span className="poetry-name-highlight">يمنى</span> يا اسماً من نور</span>
              <span className="verse-line">يا نغمةً في سمفونية القدر</span>
              <span className="verse-line">حين نطقتُ اسمكِ أول مرة</span>
              <span className="verse-line">أحسستُ أن الصمت انكسر</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">في اسمكِ يا <span className="poetry-name-highlight">يمنى</span> أيمنٌ ويُمن</span>
              <span className="verse-line">وفيه من البركة ما يُسكر الزمن</span>
              <span className="verse-line">ثلاثة أحرف وكأنها الكون بأسره</span>
              <span className="verse-line">يا، م، ن — وبينها قلبٌ يحن</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>

          {/* Section II */}
          <div className="poetry-section-title" style={{ marginTop: '3rem' }}>— الفصل الثاني: العيون —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">رأيتُ في عينيكِ ما لم تره الأشعار</span>
              <span className="verse-line">بحراً هادئاً تحته أسرار</span>
              <span className="verse-line">نظرةٌ منكِ تكفي لتقتل العتمة</span>
              <span className="verse-line">وتُنبت في أرض القلب الأزهار</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">عيناكِ يا <span className="poetry-name-highlight">يمنى</span> قصيدتان لم تُكتبا</span>
              <span className="verse-line">وكأن الليل خبّأ فيهما النجوم</span>
              <span className="verse-line">حين تنظرين يتوقف الوقت خجلاً</span>
              <span className="verse-line">والقلب يصحو من أثقل النوم</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>

          {/* Section III */}
          <div className="poetry-section-title" style={{ marginTop: '3rem' }}>— الفصل الثالث: الليل والنجوم —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">حين يُسدل الليل ستائره الثقيلة</span>
              <span className="verse-line">وتصمت المدن على وقع الأنفاس</span>
              <span className="verse-line">أجلس وحيداً مع صورة <span className="poetry-name-highlight">يمنى</span></span>
              <span className="verse-line">فيضيء الغرفةَ ضوءٌ بلا قياس</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">النجوم تسألني: من تعشق يا سليم؟</span>
              <span className="verse-line">فأرفع رأسي للسماء وأقول: <span className="poetry-name-highlight">يمنى</span></span>
              <span className="verse-line">فتبتسم النجوم وتزداد لمعاناً</span>
              <span className="verse-line">لأن الحب الحقيقي يُضيء العلياء</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">يا قمرَ الليل يا رفيق الساهرين</span>
              <span className="verse-line">هل تراها الآن في غفوتها الهادئة؟</span>
              <span className="verse-line">هل تحرسها كما أحرسها من بعيد؟</span>
              <span className="verse-line">هل تعرف أن روحي عندها دائمة؟</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>

          {/* Section IV */}
          <div className="poetry-section-title" style={{ marginTop: '3rem' }}>— الفصل الرابع: الشوق —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">الشوق إليكِ <span className="poetry-name-highlight">يا يمنى</span> حريق</span>
              <span className="verse-line">يبدأ هادئاً كجمر تحت الرماد</span>
              <span className="verse-line">ثم يتمدد حتى يأكل كل الروح</span>
              <span className="verse-line">ويترك القلب بلا سواكِ وشاد</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">أشتاق لصوتكِ كما تشتاق الأرض للمطر</span>
              <span className="verse-line">وكما يشتاق البحر لذراعَي القمر</span>
              <span className="verse-line">اشتياقاً يأتي مع الفجر ويرحل مع الغسق</span>
              <span className="verse-line">لا بل يبقى، يبقى، لا يعرف السفر</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">لو أن المسافة تُشترى لاشتريتها</span>
              <span className="verse-line">وأحرقتها كي لا تفصل بين روحين</span>
              <span className="verse-line">لكن المسافة تعلّمتني أن أكتب</span>
              <span className="verse-line">وتعلمتُ أن الحب يتحدى الزمنين</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>

          {/* Section V */}
          <div className="poetry-section-title" style={{ marginTop: '3rem' }}>— الفصل الخامس: المطر والذاكرة —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">حين ينزل المطر أفكر بكِ <span className="poetry-name-highlight">يا يمنى</span></span>
              <span className="verse-line">وأتساءل: هل تحبين المطر مثلي؟</span>
              <span className="verse-line">هل تقفين أمام النافذة تنظرين</span>
              <span className="verse-line">وتحملين في خاطركِ طيفاً شبيهاً بطيفي؟</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">الذاكرة خزينة وأنتِ أنفسُ ما فيها</span>
              <span className="verse-line">كنزٌ لا يُقدَّر ولا يُساوم عليه</span>
              <span className="verse-line">أعود إليها حين يضيق الحاضر</span>
              <span className="verse-line">فأجد <span className="poetry-name-highlight">يمنى</span> تنتظرني في دهاليزه</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>

          {/* Section VI */}
          <div className="poetry-section-title" style={{ marginTop: '3rem' }}>— الفصل السادس: الوعد الأبدي —</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">أعاهدكِ <span className="poetry-name-highlight">يا يمنى</span> أمام السماء</span>
              <span className="verse-line">وأمام كل نجم يشهد الليل</span>
              <span className="verse-line">أن قلبي لن يحوي سواكِ بيتاً</span>
              <span className="verse-line">وأن اسمكِ آخر ما يردده الرحيل</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">لن تنتهي هذه القصيدة <span className="poetry-name-highlight">يا يمنى</span></span>
              <span className="verse-line">لأنها مكتوبة بحبر لا يجف</span>
              <span className="verse-line">ستظل تُقرأ في كل صباح جديد</span>
              <span className="verse-line">ما دام في الصدر قلب يعشق ولا يكف</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ✦ ✦</div>
          <div className="poetry-stanza fade-in-up">
            <div className="poetry-verse">
              <span className="verse-line">فكوني بخير يا روحي الجميلة</span>
              <span className="verse-line">فإن بخيرك حياتي وبهجتي</span>
              <span className="verse-line">وكوني سعيدة فسعادتكِ نوري</span>
              <span className="verse-line">وابتسمي فابتسامتكِ مُلهمتي وقوتي</span>
            </div>
          </div>
          <div className="poetry-divider">✦ ❤️ ✦</div>

          {/* Signature */}
          <div style={{ textAlign: 'center', marginTop: '2rem', fontFamily: 'var(--font-poetry)', color: 'var(--gold-light)', fontSize: '1.1rem', fontStyle: 'italic' }}>
            — نُظمت بحبر القلب بقلم سليم —
          </div>
        </div>
      </div>
    </section>
  );
}

/* ========== MUSIC PLAYER ========== */
function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(75);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const vizRef = useRef<(HTMLDivElement | null)[]>([]);
  const vizAnimRef = useRef<number>(0);

  const bars = Array.from({ length: 20 }, (_, i) => i);

  const animateViz = useCallback(() => {
    if (!vizRef.current) return;
    vizRef.current.forEach(bar => {
      if (bar) {
        const h = Math.random() * 32 + 4;
        bar.style.height = `${h}px`;
      }
    });
    vizAnimRef.current = requestAnimationFrame(() => {
      setTimeout(animateViz, 120);
    });
  }, []);

  const stopViz = useCallback(() => {
    cancelAnimationFrame(vizAnimRef.current);
    vizRef.current.forEach(bar => { if (bar) bar.style.height = '4px'; });
  }, []);

  useEffect(() => {
    if (playing) {
      animateViz();
    } else {
      stopViz();
    }
    return () => { stopViz(); };
  }, [playing, animateViz, stopViz]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        await audio.play();
        setPlaying(true);
      }
    } catch (error) {
      setPlaying(false);
    }
  };

  const formatTime = (s: number) => {
    const safe = Number.isFinite(s) ? Math.max(0, Math.floor(s)) : 0;
    const m = Math.floor(safe / 60);
    const sec = safe % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const audio = audioRef.current;
    const total = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const newTime = total > 0 ? frac * total : 0;

    setCurrentTime(newTime);
    setProgress(frac * 100);
    if (audio) audio.currentTime = newTime;
  };

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const vol = Math.round(frac * 100);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol / 100;
  };

  return (
    <section className="music-section" id="music">
      <div className="music-player-wrap">
        <div className="section-header">
          <div className="section-label">✦ لحن الحب ✦</div>
          <h2 className="section-title">أغنيتنا</h2>
          <p style={{ fontFamily: 'var(--font-poetry)', color: 'rgba(255,255,255,0.5)', fontSize: '1rem', maxWidth: '500px', margin: '0 auto' }}>
            بعض المشاعر لا تُقال بالكلمات، بل تُعزف بالموسيقى
          </p>
        </div>

        <audio
          ref={audioRef}
          id="loveSong"
          src="/audio/qalbi.mp3"
          loop
          onLoadedMetadata={() => {
            const audio = audioRef.current;
            if (audio && Number.isFinite(audio.duration)) {
              setDuration(audio.duration);
            }
          }}
          onTimeUpdate={() => {
            const audio = audioRef.current;
            if (!audio) return;
            const total = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
            setCurrentTime(audio.currentTime);
            setProgress(total > 0 ? (audio.currentTime / total) * 100 : 0);
          }}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
            setProgress(0);
          }}
        />

        <div className={`music-player-card${playing ? ' playing' : ''}`}>
          <div className="music-bg-glow" />

          <div className="music-cover-area">
            <img
              className="music-cover"
              src="/images/music-cover.jpg"
              alt="غلاف الأغنية"
            />
            <div className="music-info">
              <div className="music-title">أغنية يمنى</div>
              <div className="music-artist">مهداة من سليم بكل محبة ❤️</div>
              <div
                className="music-heart-icon"
                onClick={() => setLiked(l => !l)}
                title="أحب"
              >
                {liked ? '❤️' : '🤍'}
              </div>
            </div>
          </div>

          {/* Visualizer */}
          <div className="music-visualizer">
            {bars.map(i => (
              <div
                key={i}
                className="viz-bar"
                ref={el => { vizRef.current[i] = el; }}
                style={{ height: '4px' }}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="music-progress-area">
            <div className="music-time-labels">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <div className="music-progress-track" onClick={handleProgressClick}>
              <div className="music-progress-fill" style={{ width: `${progress}%` }}>
                <div className="music-progress-thumb" />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="music-controls">
            <button className="music-btn" title="عشوائي">🔀</button>
            <button className="music-btn" title="السابقة" onClick={() => { setCurrentTime(0); setProgress(0); }}>⏮</button>
            <button className="music-btn-play" onClick={togglePlay} title={playing ? 'إيقاف' : 'تشغيل'}>
              {playing ? '⏸' : '▶'}
            </button>
            <button className="music-btn" title="التالية">⏭</button>
            <button className="music-btn" title="تكرار">🔁</button>
          </div>

          {/* Volume */}
          <div className="music-volume-area">
            <span className="volume-icon" onClick={() => setMuted(m => !m)}>
              {muted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
            </span>
            <div className="volume-slider-track" onClick={handleVolumeClick}>
              <div className="volume-slider-fill" style={{ width: `${muted ? 0 : volume}%` }} />
            </div>
            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', minWidth: '30px', fontFamily: 'var(--font-ui)' }}>
              {muted ? 0 : volume}
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}

/* ========== FINAL SCENE ========== */
function FinalScene() {
  return (
    <section className="final-section" id="final">
      <div className="final-glow-ring" />
      <div className="final-glow-ring" />
      <div className="final-glow-ring" />

      <span className="final-heart">❤️</span>

      <div className="final-quote fade-in-up">
        يا <span className="yomna">يمنى</span>…
        <br />
        أنتِ لستِ مجرد حب،
        <br />
        أنتِ الحياةُ التي أعيشها.
      </div>

        <div style={{
            fontFamily: 'var(--font-poetry)',
            fontSize: 'clamp(0.9rem, 2vw, 1.1rem)',
            color: 'rgba(255,255,255,0.45)',
            textAlign: 'center',
            maxWidth: '500px',
            lineHeight: 2,
            marginBottom: '3rem',
          }} className="fade-in-up">
          كُتبت هذه الصفحة بنبضات القلب،
          <br />
          وكل حرف فيها يحمل من الصدق ما لا تحمله الأقلام.
          <br />
          إلى يمنى — الآن وإلى الأبد.
        </div>

        <div className="fade-in-up" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {['❤️ الحب الحقيقي', '🌙 ليالي الشوق', '💫 قدر مكتوب', '♾️ إلى الأبد'].map((tag, i) => (
            <span key={i} style={{
              padding: '0.4rem 1rem',
              background: 'rgba(155,48,255,0.12)',
              border: '1px solid rgba(155,48,255,0.25)',
              borderRadius: '50px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: 'var(--font-poetry)',
            }}>{tag}</span>
          ))}
        </div>

      <div className="final-signature fade-in-up">
        سليم ❤️
      </div>

      <div style={{ marginTop: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem', fontFamily: 'var(--font-poetry)' }}>
        05/04/2026 — بداية الأبدية
      </div>
    </section>
  );
}

/* ========== SCROLL OBSERVER ========== */
function ScrollObserver() {
  useScrollReveal();
  return null;
}

/* ========== MAIN APP ========== */
export default function App() {
  const [unlocked, setUnlocked] = useState(false);
  const [appVisible, setAppVisible] = useState(false);

  const handleUnlock = () => {
    setUnlocked(true);
    setTimeout(() => setAppVisible(true), 300);
  };

  return (
    <>
      {!unlocked && <EntryPage onUnlock={handleUnlock} />}

      <div className={`main-app${appVisible ? ' visible' : ''}`} style={{ display: unlocked ? 'block' : 'none' }}>
        <div className="ambient-layer" />
        <ParticleCanvas />
        <SiteNav />
        <HeroSection />

        {/* Cinematic separator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
          <span style={{ color: 'rgba(212,175,55,0.5)', fontSize: '1.2rem' }}>✦</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
        </div>

        <IntroSection />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(204,34,68,0.4), transparent)' }} />
          <span style={{ color: 'rgba(255,51,102,0.5)', fontSize: '1.2rem' }}>❤️</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(204,34,68,0.4), transparent)' }} />
        </div>

        <TimelineSection />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
          <span style={{ color: 'rgba(192,132,252,0.6)', fontSize: '1.2rem' }}>💌</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
        </div>

        <LoveLetterSection />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)' }} />
          <span style={{ color: 'rgba(212,175,55,0.6)', fontSize: '1.2rem' }}>✨</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4), transparent)' }} />
        </div>

        <PoetrySection />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
          <span style={{ color: 'rgba(155,48,255,0.6)', fontSize: '1.2rem' }}>🎵</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(155,48,255,0.4), transparent)' }} />
        </div>

        <MusicPlayer />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '1rem 2rem' }}>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,51,102,0.4), transparent)' }} />
          <span style={{ color: 'rgba(255,51,102,0.6)', fontSize: '1.2rem' }}>🌹</span>
          <div style={{ flex: 1, maxWidth: 200, height: 1, background: 'linear-gradient(to right, transparent, rgba(255,51,102,0.4), transparent)' }} />
        </div>

        <FinalScene />
        <ScrollObserver />
      </div>
    </>
  );
}
