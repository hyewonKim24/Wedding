'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Play, Pause, MapPin, Calendar, Heart, Send, Plane } from 'lucide-react';

// ─── 바코드 ───────────────────────────────────────────────
const BARCODE = [3,1,2,3,1,3,2,1,3,2,1,2,3,1,2,1,3,2,3,1,2,3,1,2,1,3,2,1,3,1,2,3,2,1,3,2,1,2,3,1,2,1,3,2];
const BAR_H   = [100,60,100,75,100,55,100,80,65,100,70,100,55,90,100,60,100,75,50,100,80,100,65,55,100,70,100,60,80,100,55,100,75,100,60,85,100,55,100,70,60,100,80,100];

// ─── 갤러리 사진 (URL만 추가하면 자동으로 표시됩니다) ──────
const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80',
  'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80',
  'https://images.unsplash.com/photo-1583939000340-690624471565?w=600&q=80',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80',
  'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&q=80',
  'https://images.unsplash.com/photo-1591604021695-0c69b7c05981?w=600&q=80',
  'https://images.unsplash.com/photo-1550005809-91ad75fb315f?w=600&q=80',
];

// ─── 꽃잎 & 화이트데이 파티클 ────────────────────────────
const PETAL_COLORS = [
  'rgba(252,231,243,0.75)',  // pink-100
  'rgba(255,255,255,0.80)',  // white
  'rgba(254,205,211,0.70)',  // rose-200
  'rgba(255,228,230,0.65)',  // rose-100
  'rgba(253,242,248,0.80)',  // pink-50
];

function FallingPetals() {
  const particles = useMemo(() => Array.from({ length: 32 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    duration: Math.random() * 8 + 10,
    delay: Math.random() * 12,
    size: Math.random() * 9 + 5,
    drift: Math.random() * 120 - 60,
    rotateStart: Math.random() * 360,
    rotateEnd: Math.random() * 360 + (Math.random() > 0.5 ? 360 : -360),
    color: PETAL_COLORS[i % PETAL_COLORS.length],
    isHeart: i % 6 === 0,
    isBig: i % 9 === 0,
  })), []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: -20 }}
          animate={{
            y: '115vh',
            x: p.drift,
            rotate: [p.rotateStart, p.rotateEnd],
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
            times: [0, 0.08, 0.88, 1],
          }}
        >
          {p.isHeart ? (
            <Heart
              size={p.isBig ? p.size + 4 : p.size}
              fill="currentColor"
              className="text-rose-300"
              style={{ opacity: 0.55 }}
            />
          ) : (
            <div style={{
              width: p.size * 0.65,
              height: p.size,
              borderRadius: '50% 50% 50% 0',
              background: p.color,
              boxShadow: '0 1px 3px rgba(244,63,94,0.08)',
            }} />
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ─── 섹션 레이블 ──────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return <p className="text-[9px] tracking-[0.42em] text-rose-400 uppercase mb-3">{children}</p>;
}

// ─── 섹션 구분선 ──────────────────────────────────────────
function TicketDivider() {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 border-t border-dashed border-gray-200" />
      <Plane size={11} className="text-rose-300 rotate-90 flex-shrink-0" fill="currentColor" strokeWidth={0} />
      <div className="flex-1 border-t border-dashed border-gray-200" />
    </div>
  );
}

// ─── 0. 탑승권 인트로 ─────────────────────────────────────
function BoardingPassIntro({ onBoard }: { onBoard: () => void }) {
  const [tearing, setTearing] = useState(false);

  const handleTap = () => {
    if (tearing) return;
    setTearing(true);
    setTimeout(onBoard, 1050);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden"
      style={{
        background: 'linear-gradient(150deg, #0d1b2a 0%, #1b1035 100%)',
        pointerEvents: tearing ? 'none' : 'auto',
      }}
      animate={{ opacity: tearing ? 0 : 1 }}
      transition={{ duration: 0.45, delay: tearing ? 0.55 : 0 }}
    >
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[500px] opacity-[0.06] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top, #f9a8d4 0%, transparent 70%)' }} />

      <motion.div
        className="relative z-10 w-[312px] select-none cursor-pointer"
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        onClick={handleTap}
      >
        {/* 상단 */}
        <motion.div className="bg-white rounded-t-[22px] px-6 pt-6 pb-5"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          animate={tearing ? { y: -320, rotate: -6, opacity: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}>
          <div className="flex justify-between items-start mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-400 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm">✈</span>
              </div>
              <div>
                <p className="text-[7px] tracking-[0.22em] text-gray-400 leading-none mb-0.5">OPERATED BY</p>
                <p className="text-[11px] font-extrabold tracking-[0.18em] text-gray-800">WEDDING AIR</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[7px] tracking-[0.2em] text-gray-400 leading-none mb-0.5">FLIGHT</p>
              <p className="text-sm font-black tracking-widest text-gray-800 font-mono">WD-0314</p>
            </div>
          </div>
          <div className="mb-4 pb-4 border-b border-dashed border-gray-100">
            <p className="text-[7px] tracking-[0.25em] text-gray-400 mb-1.5">PASSENGER NAME</p>
            <p className="text-[13px] font-black tracking-[0.1em] text-gray-900 whitespace-nowrap">
              KIM HYEWON <span className="text-rose-400">×</span> JANG WOOKTAE
            </p>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div>
              <p className="text-[7px] tracking-[0.2em] text-gray-400 mb-0.5">FROM</p>
              <p className="text-[26px] font-thin tracking-[0.12em] text-gray-800 leading-none">TWO</p>
            </div>
            <div className="flex-1 flex items-center gap-1 pt-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-rose-300 text-base">✈</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="text-right">
              <p className="text-[7px] tracking-[0.2em] text-gray-400 mb-0.5">TO</p>
              <p className="text-[26px] font-thin tracking-[0.12em] text-gray-800 leading-none">ONE</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-x-2 mb-4">
            {[
              { label: 'DATE',  value: '14 MAR 27', accent: false },
              { label: 'TIME',  value: '14:10',      accent: false },
              { label: 'GATE',  value: 'LOVE',       accent: true  },
              { label: 'SEAT',  value: '01 A',       accent: false },
            ].map(({ label, value, accent }) => (
              <div key={label}>
                <p className="text-[6.5px] tracking-[0.22em] text-gray-400 mb-1">{label}</p>
                <p className={`text-[10px] font-bold tracking-wide ${accent ? 'text-rose-400' : 'text-gray-800'}`}>{value}</p>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-gray-50">
            <p className="text-[6.5px] tracking-[0.22em] text-gray-400 mb-1">VENUE</p>
            <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-600">SINDORIM RAMADA · HANEUL HALL</p>
          </div>
        </motion.div>

        {/* 절취선 */}
        <div className="relative h-0">
          <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
            style={{ background: 'linear-gradient(150deg, #0d1b2a 0%, #1b1035 100%)' }} />
          <div className="mx-2 border-t-[1.5px] border-dashed border-gray-200" />
          <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full"
            style={{ background: 'linear-gradient(150deg, #0d1b2a 0%, #1b1035 100%)' }} />
        </div>

        {/* 하단 스텁 */}
        <motion.div className="bg-white rounded-b-[22px] px-6 pt-5 pb-5"
          style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
          animate={tearing ? { y: 320, rotate: 5, opacity: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1], delay: 0.04 }}>
          <div className="flex items-end justify-center gap-[1.8px] h-10 mb-2">
            {BARCODE.map((w, i) => (
              <div key={i} className="bg-gray-900 rounded-[0.5px]" style={{ width: w, height: `${BAR_H[i]}%` }} />
            ))}
          </div>
          <p className="text-center text-[6.5px] font-mono tracking-[0.18em] text-gray-400 mb-3">WD2027-0314-14:10-KHW×JWK</p>
          <div className="flex justify-between">
            <span className="text-[7px] tracking-[0.2em] text-gray-400 font-medium">BOARDING PASS</span>
            <span className="text-[7px] tracking-[0.2em] text-gray-400">NOT TRANSFERABLE</span>
          </div>
        </motion.div>
      </motion.div>

      <motion.div className="mt-9 flex flex-col items-center gap-2 relative z-10"
        animate={{ opacity: tearing ? 0 : [0.45, 1, 0.45] }}
        transition={{ duration: 2, repeat: tearing ? 0 : Infinity, ease: 'easeInOut' }}>
        <motion.span className="text-gray-400 text-base leading-none"
          animate={{ y: tearing ? 0 : [0, -5, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}>↑</motion.span>
        <p className="text-[10px] tracking-[0.38em] text-gray-500 uppercase">Tap to Board</p>
      </motion.div>
    </motion.div>
  );
}

// ─── 1. 스크롤 비행기 ─────────────────────────────────────
function FlyingPlane() {
  const { scrollYProgress } = useScroll();
  const [vw, setVw] = useState(0);

  useEffect(() => {
    setVw(window.innerWidth);
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const planeX   = useTransform(scrollYProgress, [0, 1], [-60, vw + 60]);
  const opacity  = useTransform(scrollYProgress, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const trailW   = useTransform(scrollYProgress, [0, 1], [0, vw]);

  if (vw === 0) return null;

  return (
    <div className="fixed top-[32vh] inset-x-0 z-30 pointer-events-none">
      {/* 콘트레일 */}
      <motion.div
        className="absolute top-[11px] left-0 h-px"
        style={{
          width: trailW,
          opacity,
          background: 'linear-gradient(to right, transparent 0%, rgba(244,63,94,0.12) 20%, rgba(244,63,94,0.25) 100%)',
        }}
      />
      <motion.div
        className="absolute top-[11px] left-0 h-px overflow-hidden"
        style={{ width: trailW, opacity }}
      >
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(to right, rgba(244,63,94,0.35) 0px, rgba(244,63,94,0.35) 5px, transparent 5px, transparent 14px)',
        }} />
      </motion.div>
      {/* 비행기 */}
      <motion.div
        className="absolute -top-1 text-rose-400 drop-shadow-sm"
        style={{ x: planeX, opacity }}
      >
        <motion.div
          animate={{ y: [0, -3, 0, 3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Plane size={20} fill="currentColor" strokeWidth={0} />
        </motion.div>
      </motion.div>
    </div>
  );
}

// ─── 2. BGM 플레이어 ──────────────────────────────────────
function DynamicBGM() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div layout onClick={() => setIsExpanded(!isExpanded)}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md border border-gray-100 shadow-md rounded-full px-4 py-2 cursor-pointer overflow-hidden"
      animate={{ width: isExpanded ? 240 : 120, height: isExpanded ? 64 : 38 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
          className="w-7 h-7 bg-rose-50 rounded-full flex items-center justify-center flex-shrink-0 border border-rose-100"
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}>
          {isPlaying ? <Pause size={12} className="text-rose-400" /> : <Play size={12} className="text-rose-400 ml-0.5" />}
        </motion.div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div initial={{ opacity: 0, filter: 'blur(4px)' }} animate={{ opacity: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, filter: 'blur(4px)' }}
              className="flex flex-col text-xs whitespace-nowrap">
              <span className="font-semibold tracking-wide text-gray-700 text-[11px]">우리의 봄이 시작됩니다</span>
              <span className="text-gray-400 text-[9px] tracking-widest">BGM — Piano Sonata</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <audio ref={audioRef} src="https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=piano-moment-9835.mp3" loop />
    </motion.div>
  );
}

// ─── 3. 방명록 ────────────────────────────────────────────
type Message = { id: number; name: string; text: string; rotate: number };
const TAPE_COLORS = ['bg-rose-200/70','bg-amber-200/70','bg-sky-200/70','bg-violet-200/70','bg-emerald-200/70'];
const INITIAL_MESSAGES: Message[] = [
  { id: 1, name: '지민', text: '결혼 너무너무 축하해! 행복하게 잘 살아 ❤️', rotate: -2   },
  { id: 2, name: '현우', text: '두 사람 앞날에 꽃길만 가득하길 바랍니다.',    rotate: 1.5  },
  { id: 3, name: '은지', text: '세상에서 제일 예쁜 신부 혜원이! 오래오래 행복해 ✨', rotate: -1 },
];

function GuestbookWall() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setMessages([{ id: Date.now(), name, text, rotate: +(Math.random() * 4 - 2).toFixed(1) }, ...messages]);
    setName(''); setText('');
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#FBF9F7]">
      <style dangerouslySetInnerHTML={{ __html: `@import url('https://fonts.googleapis.com/css2?family=Gaegu:wght@300;400;700&display=swap');` }} />
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #9ca3af 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="max-w-lg mx-auto relative">
        <div className="text-center mb-12">
          <SectionLabel>— Guestbook —</SectionLabel>
          <p className="text-gray-400 text-sm font-light">두 사람을 위한 따뜻한 한 마디를 남겨주세요</p>
        </div>
        <form onSubmit={handleSubmit}
          className="mb-12 bg-white/80 backdrop-blur-sm rounded-2xl px-7 py-6 shadow-sm border border-gray-100">
          <input type="text" placeholder="이름" maxLength={10} value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-1/3 min-w-[90px] border-b border-gray-200 py-1 mb-5 outline-none text-sm text-gray-700 placeholder:text-gray-300 focus:border-rose-300 transition-colors bg-transparent block" />
          <div className="flex items-end gap-3">
            <textarea placeholder="축하의 말을 적어주세요..." rows={2} value={text}
              onChange={(e) => setText(e.target.value)}
              className="flex-1 resize-none border-b border-gray-200 py-1 outline-none text-sm text-gray-700 placeholder:text-gray-300 focus:border-rose-300 transition-colors bg-transparent" />
            <button type="submit"
              className="mb-1 w-9 h-9 flex items-center justify-center bg-rose-400 text-white rounded-full hover:bg-rose-500 active:scale-95 transition-all flex-shrink-0 shadow-sm">
              <Send size={14} />
            </button>
          </div>
        </form>
        <div style={{ columns: 2, columnGap: '1rem' }}>
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0, rotate: msg.rotate }}
                exit={{ opacity: 0, scale: 0.88 }}
                whileHover={{ rotate: 0, scale: 1.04, zIndex: 30 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="break-inside-avoid mb-4 inline-block w-full relative cursor-default">
                <div className={`absolute -top-2.5 left-1/2 w-9 h-[18px] ${TAPE_COLORS[idx % TAPE_COLORS.length]} rounded-[3px] shadow-sm`}
                  style={{ transform: 'translateX(-50%) rotate(-1.5deg)' }} />
                <div className="bg-white rounded-xl px-5 py-5 pt-6 shadow-[0_4px_20px_rgba(0,0,0,0.07)] border border-gray-50">
                  <p className="text-gray-700 leading-snug break-words" style={{ fontFamily: "'Gaegu', cursive", fontSize: '1.2rem' }}>{msg.text}</p>
                  <p className="text-rose-400 mt-2 text-right" style={{ fontFamily: "'Gaegu', cursive", fontSize: '1.05rem' }}>— {msg.name}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// ─── 4. RSVP 모달 ─────────────────────────────────────────
type RsvpData = { name: string; attending: 'yes' | 'no' | ''; guests: string; message: string };

function RsvpModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<RsvpData>({ name: '', attending: '', guests: '1', message: '' });
  const [submitted, setSubmitted] = useState(false);

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-8 pb-10 z-10 border border-gray-100"
        initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 350, damping: 30 }}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-300 hover:text-gray-500 transition-colors text-xl leading-none">✕</button>

        {submitted ? (
          <motion.div className="text-center py-8" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-14 h-14 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-5">
              <Heart className="text-rose-400" size={22} fill="currentColor" />
            </div>
            <p className="text-gray-800 text-lg font-semibold mb-2">감사합니다, {form.name}님</p>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {form.attending === 'yes' ? '소중한 걸음 기다리겠습니다.\n3월 14일에 함께해 주세요.' : '참석이 어려우시더라도\n마음만으로도 충분합니다.'}
            </p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-rose-400 text-white rounded-xl text-sm font-medium hover:bg-rose-500 transition-colors">닫기</button>
          </motion.div>
        ) : (
          <>
            <SectionLabel>CHECK-IN</SectionLabel>
            <p className="text-gray-800 font-semibold mb-6 text-lg">참석 의사를 알려주세요</p>
            <form onSubmit={(e) => { e.preventDefault(); if (form.name.trim() && form.attending) setSubmitted(true); }}
              className="flex flex-col gap-5">
              <div>
                <label className="text-[9px] tracking-[0.28em] text-gray-400">PASSENGER NAME</label>
                <input type="text" placeholder="홍길동" maxLength={10} value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 border-b border-gray-200 pb-2 outline-none text-sm text-gray-700 placeholder:text-gray-300 focus:border-rose-300 transition-colors bg-transparent" />
              </div>
              <div>
                <label className="text-[9px] tracking-[0.28em] text-gray-400">BOARDING STATUS</label>
                <div className="flex gap-3 mt-2">
                  {(['yes', 'no'] as const).map((val) => (
                    <button key={val} type="button" onClick={() => setForm({ ...form, attending: val })}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        form.attending === val ? 'bg-rose-400 text-white border-rose-400' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                      }`}>
                      {val === 'yes' ? '참석합니다' : '참석이 어렵습니다'}
                    </button>
                  ))}
                </div>
              </div>
              {form.attending === 'yes' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="text-[9px] tracking-[0.28em] text-gray-400">PASSENGERS</label>
                  <select value={form.guests} onChange={(e) => setForm({ ...form, guests: e.target.value })}
                    className="w-full mt-1 border-b border-gray-200 pb-2 outline-none text-sm text-gray-700 focus:border-rose-300 transition-colors bg-transparent">
                    {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}명</option>)}
                  </select>
                </motion.div>
              )}
              <div>
                <label className="text-[9px] tracking-[0.28em] text-gray-400">MESSAGE (OPTIONAL)</label>
                <textarea placeholder="한 마디를 남겨주세요..." rows={2} value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full mt-1 resize-none border-b border-gray-200 pb-2 outline-none text-sm text-gray-700 placeholder:text-gray-300 focus:border-rose-300 transition-colors bg-transparent" />
              </div>
              <button type="submit"
                disabled={!form.name.trim() || !form.attending}
                className="mt-2 w-full py-4 bg-rose-400 text-white rounded-xl font-semibold tracking-wide shadow-sm disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all hover:bg-rose-500">
                탑승 확인하기
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── 5. 메인 페이지 ───────────────────────────────────────
export default function WeddingInvitation() {
  const [mounted, setMounted] = useState(false);
  const [boarded, setBoarded] = useState(false);
  const [rsvpOpen, setRsvpOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <>
      <AnimatePresence>
        {!boarded && <BoardingPassIntro onBoard={() => setBoarded(true)} />}
      </AnimatePresence>

      <main className="relative min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden">
        {rsvpOpen && <RsvpModal onClose={() => setRsvpOpen(false)} />}
        <FallingPetals />
        <FlyingPlane />
        <DynamicBGM />

        {/* ══ HERO ════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center z-10 px-6">

          {/* 배경 연도 워터마크 */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
            <span className="text-[38vw] font-black leading-none tracking-tighter"
              style={{ color: 'rgba(17,24,39,0.025)' }}>2027</span>
          </div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(244,63,94,0.04) 0%, transparent 60%)' }} />

          <motion.div className="w-full max-w-[340px] mx-auto relative"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.15 }}>

            {/* 항공편 배지 */}
            <div className="flex items-center gap-3 mb-12 justify-center">
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, #e5e7eb)' }} />
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 border border-gray-100 rounded-full bg-white shadow-sm">
                <Plane size={11} className="text-rose-400" fill="currentColor" strokeWidth={0} />
                <span className="text-[8px] tracking-[0.32em] text-gray-400">WEDDING AIR · WD-0314</span>
              </div>
              <div className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, #e5e7eb)' }} />
            </div>

            {/* 이름 — 신랑 × 신부 나란히 */}
            <div className="flex items-stretch justify-center gap-0 mb-6">

              {/* 신랑 */}
              <motion.div className="flex-1 text-center pr-5 border-r border-gray-100"
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}>
                <p className="text-[13px] font-light tracking-[0.15em] text-gray-600 mb-0.5">신랑</p>
                <p className="text-[7.5px] tracking-[0.32em] text-gray-400 mb-3">GROOM</p>
                <h1 className="text-[38px] font-extralight tracking-[0.06em] text-gray-800 leading-none mb-2">장욱태</h1>
                <p className="text-[8px] tracking-[0.22em] text-gray-400">WOOKTAE JANG</p>
              </motion.div>

              {/* 구분선 */}
              <div className="flex flex-col items-center justify-center px-4 gap-1.5">
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-rose-200 to-transparent" />
                <span className="text-rose-300 text-[18px] leading-none font-light">×</span>
                <div className="w-px h-5 bg-gradient-to-b from-transparent via-rose-200 to-transparent" />
              </div>

              {/* 신부 */}
              <motion.div className="flex-1 text-center pl-5 border-l border-gray-100"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.4 }}>
                <p className="text-[13px] font-light tracking-[0.15em] text-gray-600 mb-0.5">신부</p>
                <p className="text-[7.5px] tracking-[0.32em] text-gray-400 mb-3">BRIDE</p>
                <h1 className="text-[38px] font-extralight tracking-[0.06em] text-gray-800 leading-none mb-2">김혜원</h1>
                <p className="text-[8px] tracking-[0.22em] text-gray-400">HYEWON KIM</p>
              </motion.div>
            </div>

            {/* 날짜 구분선 + 한글 문구 */}
            <div className="my-8 text-center">
              <p className="text-[15px] font-light tracking-[0.2em] text-gray-600 mb-3">저희 결혼합니다</p>
              <div className="relative flex items-center">
                <div className="flex-1 border-t border-dashed" style={{ borderColor: '#efefef' }} />
                <span className="mx-4 text-[9px] tracking-[0.3em] text-gray-400 whitespace-nowrap">2027 · 03 · 14</span>
                <div className="flex-1 border-t border-dashed" style={{ borderColor: '#efefef' }} />
              </div>
            </div>

            {/* 정보 카드 */}
            <div className="grid grid-cols-3 rounded-2xl border border-gray-100 overflow-hidden bg-[#FAFAFA] divide-x divide-gray-100 shadow-sm">
              {[
                { label: 'FLIGHT', value: 'WD-0314', sub: 'WEDDING AIR', accent: false },
                { label: 'TIME',   value: '14:10',   sub: 'SUNDAY',      accent: false },
                { label: 'GATE',   value: 'LOVE',    sub: 'SEAT · 01A',  accent: true  },
              ].map(({ label, value, sub, accent }) => (
                <div key={label} className="py-4 px-1.5 text-center">
                  <p className="text-[6.5px] tracking-[0.28em] text-gray-400 mb-1.5">{label}</p>
                  <p className={`text-[12px] font-bold tracking-wide ${accent ? 'text-rose-400' : 'text-gray-800'}`}>{value}</p>
                  <p className="text-[7px] tracking-[0.15em] text-gray-400 mt-1">{sub}</p>
                </div>
              ))}
            </div>

            {/* 스크롤 힌트 */}
            <motion.div className="mt-10 flex flex-col items-center gap-2"
              animate={{ opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <motion.div className="w-px bg-gradient-to-b from-rose-300/50 to-transparent"
                animate={{ height: [24, 36, 24] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }} />
              <p className="text-[7px] tracking-[0.4em] text-gray-400">SCROLL</p>
            </motion.div>

          </motion.div>
        </section>

        {/* ══ 인사말 ═══════════════════════════════════════ */}
        <section className="px-6 z-10 relative">
          <div className="max-w-sm mx-auto">
            <TicketDivider />
            <motion.div className="py-20 text-center"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9 }}>
              <SectionLabel>Message</SectionLabel>
              <div className="w-8 h-px bg-rose-200 mx-auto mb-6" />
              <p className="leading-[2.2] text-gray-500 font-light whitespace-pre-line text-[14px]">
                {`오랜 시간 한 곳을 바라보며 걸어온 두 사람,\n이제 그 발걸음을 나란히 하려 합니다.\n\n바쁘시겠지만 참석하시어\n저희의 새로운 시작을 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.`}
              </p>
              <div className="w-8 h-px bg-rose-200 mx-auto mt-6" />
            </motion.div>
            <TicketDivider />
          </div>
        </section>

        {/* ══ 갤러리 ═══════════════════════════════════════ */}
        <section className="py-16 px-5 z-10 relative bg-[#FBF9F7]">
          <div className="max-w-sm mx-auto">
            <div className="text-center mb-8">
              <SectionLabel>Gallery</SectionLabel>
              <p className="text-[10px] tracking-[0.2em] text-gray-400 mt-1">
                {GALLERY_PHOTOS.length} PHOTOS
              </p>
            </div>
            {/* 매소너리 그리드 — GALLERY_PHOTOS 배열에 URL 추가하면 자동 표시 */}
            <div style={{ columns: 2, columnGap: '8px' }}>
              {GALLERY_PHOTOS.map((src, i) => (
                <motion.div
                  key={i}
                  className="mb-2 break-inside-avoid overflow-hidden rounded-xl border border-white/60 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
                  whileHover={{ scale: 1.02, zIndex: 10 }}
                >
                  <img
                    src={src}
                    alt={`사진 ${i + 1}`}
                    className="w-full object-cover block"
                    loading="lazy"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 장소 ═════════════════════════════════════════ */}
        <section className="px-6 z-10 relative">
          <div className="max-w-sm mx-auto">
            <TicketDivider />
            <motion.div className="py-20"
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9 }}>
              <div className="text-center mb-8"><SectionLabel>Location</SectionLabel></div>

              {/* 장소 카드 */}
              <div className="rounded-2xl border border-gray-100 overflow-hidden shadow-sm mb-3">
                <div className="px-6 py-5 bg-[#FAFAFA] border-b border-gray-50">
                  <p className="text-[7px] tracking-[0.3em] text-gray-400 mb-1.5">TERMINAL</p>
                  <p className="text-xl font-semibold tracking-wide text-gray-800">신도림 라마다</p>
                  <p className="text-xs text-rose-400 tracking-[0.2em] mt-0.5">하늘정원홀</p>
                </div>
                <div className="grid grid-cols-2 divide-x divide-gray-50">
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Calendar size={11} className="text-rose-400/70" />
                      <p className="text-[7px] tracking-[0.28em] text-gray-400">DATE & TIME</p>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-700">2027.03.14</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">일요일 · 14:10</p>
                  </div>
                  <div className="px-5 py-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <MapPin size={11} className="text-rose-400/70" />
                      <p className="text-[7px] tracking-[0.28em] text-gray-400">ADDRESS</p>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-700">구로구 새말로 97</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">서울특별시</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2.5 px-5 py-4 border-t border-gray-50">
                  <a href="https://map.kakao.com/?q=신도림+라마다+호텔" target="_blank" rel="noopener noreferrer"
                    className="py-3 bg-[#FEE500] text-black text-[11px] rounded-xl font-bold tracking-wide active:scale-95 transition-transform text-center block">
                    카카오맵
                  </a>
                  <a href="https://map.naver.com/v5/search/신도림+라마다+호텔" target="_blank" rel="noopener noreferrer"
                    className="py-3 bg-[#03C75A] text-white text-[11px] rounded-xl font-bold tracking-wide active:scale-95 transition-transform text-center block">
                    네이버지도
                  </a>
                </div>
              </div>

              {/* 지도 */}
              <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <iframe
                  src="https://maps.google.com/maps?q=서울+구로구+새말로+97+라마다&output=embed&hl=ko&z=16"
                  width="100%" height="260"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="신도림 라마다 지도"
                />
              </div>
            </motion.div>
            <TicketDivider />
          </div>
        </section>

        {/* ══ 방명록 ═══════════════════════════════════════ */}
        <GuestbookWall />

        {/* ══ RSVP ═════════════════════════════════════════ */}
        <section className="px-6 z-10 relative">
          <div className="max-w-sm mx-auto">
            <TicketDivider />
            <motion.div className="text-center py-20"
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }} transition={{ duration: 0.9 }}>
              <SectionLabel>RSVP</SectionLabel>
              <p className="text-gray-400 text-sm mb-10 leading-[1.9]">
                원활한 예식 진행을 위해<br />참석 여부를 미리 알려주시면 감사하겠습니다.
              </p>
              <button onClick={() => setRsvpOpen(true)}
                className="w-full py-4 bg-rose-400 text-white rounded-2xl font-semibold tracking-[0.1em] shadow-[0_6px_24px_rgba(244,63,94,0.22)] active:scale-95 transition-all hover:bg-rose-500 hover:shadow-[0_8px_30px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2">
                <Plane size={15} fill="currentColor" strokeWidth={0} />
                참석 의사 전달하기
              </button>
            </motion.div>
            <TicketDivider />
          </div>
        </section>

        {/* ══ FOOTER ═══════════════════════════════════════ */}
        <footer className="py-14 text-center z-10 relative bg-[#FBF9F7]">
          <Plane size={14} className="text-rose-300 mx-auto mb-3" fill="currentColor" strokeWidth={0} />
          <p className="text-[8px] tracking-[0.42em] text-gray-300 uppercase mb-1.5">
            © 2027 Wooktae &amp; Hyewon
          </p>
          <p className="text-[7px] tracking-[0.32em] text-gray-300 uppercase">
            Wedding Air · Flight WD-0314
          </p>
        </footer>
      </main>
    </>
  );
}
