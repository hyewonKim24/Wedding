'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Play, Pause, MapPin, Calendar, Heart, Send, Plane, ChevronDown, Copy, Check } from 'lucide-react';

// ─── 바코드 ───────────────────────────────────────────────
const BARCODE = [3,1,2,3,1,3,2,1,3,2,1,2,3,1,2,1,3,2,3,1,2,3,1,2,1,3,2,1,3,1,2,3,2,1,3,2,1,2,3,1,2,1,3,2];
const BAR_H   = [100,60,100,75,100,55,100,80,65,100,70,100,55,90,100,60,100,75,50,100,80,100,65,55,100,70,100,60,80,100,55,100,75,100,60,85,100,55,100,70,60,100,80,100];

// ─── 갤러리 사진 (경로만 추가하면 자동으로 표시됩니다) ──────
const GALLERY_PHOTOS: string[] = [
  '', '', '', '', '', '', '', '',
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

// ─── 갤러리 ───────────────────────────────────────────────
function GallerySection() {
  const [activeIdx, setActiveIdx]     = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, offsetWidth } = scrollRef.current;
    setActiveIdx(Math.round(scrollLeft / offsetWidth));
  };

  const goTo = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * scrollRef.current.offsetWidth, behavior: 'smooth' });
    setActiveIdx(i);
  };

  const lbPrev = () => setLightboxIdx(i => (i !== null && i > 0 ? i - 1 : i));
  const lbNext = () => setLightboxIdx(i => (i !== null && i < GALLERY_PHOTOS.length - 1 ? i + 1 : i));

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIdx(null);
      if (e.key === 'ArrowLeft')  lbPrev();
      if (e.key === 'ArrowRight') lbNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxIdx]);

  return (
    <>
      <section className="py-16 z-10 relative bg-[#FBF9F7]">
        <div className="text-center mb-8 px-5">
          <SectionLabel>Gallery</SectionLabel>
          <p className="text-[10px] tracking-[0.2em] text-gray-400 mt-1">
            {activeIdx + 1} / {GALLERY_PHOTOS.length}
          </p>
        </div>

        {/* 캐러셀 */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto"
          style={{
            scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            gap: '12px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}>
          {GALLERY_PHOTOS.map((src, i) => (
            <motion.div
              key={i}
              onClick={() => setLightboxIdx(i)}
              className="flex-shrink-0 overflow-hidden rounded-2xl bg-gray-200 cursor-pointer shadow-sm"
              style={{
                scrollSnapAlign: 'center',
                width: 'calc(100vw - 64px)',
                maxWidth: '320px',
              }}
              whileTap={{ scale: 0.97 }}
            >
              {src
                ? <img src={src} alt={`사진 ${i + 1}`} className="w-full h-auto block" loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                : <div className="w-full bg-gray-200 flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none">
                      <rect x="4" y="10" width="40" height="30" rx="4" stroke="#9ca3af" strokeWidth="2" fill="none"/>
                      <circle cx="17" cy="22" r="4" stroke="#9ca3af" strokeWidth="2" fill="none"/>
                      <path d="M4 34 L14 24 L22 32 L30 22 L44 36" stroke="#9ca3af" strokeWidth="2" strokeLinejoin="round" fill="none"/>
                    </svg>
                  </div>
              }
            </motion.div>
          ))}
        </div>

        {/* 도트 인디케이터 */}
        <div className="flex justify-center gap-1.5 mt-5">
          {GALLERY_PHOTOS.map((_, i) => (
            <button key={i} onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === activeIdx ? '20px' : '6px',
                height: '6px',
                background: i === activeIdx ? '#f43f5e' : '#d1d5db',
              }} />
          ))}
        </div>
      </section>

      {/* 라이트박스 */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.93)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setLightboxIdx(null)}>

            {/* 닫기 */}
            <button className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white text-lg z-10"
              onClick={() => setLightboxIdx(null)}>✕</button>

            {/* 카운터 */}
            <p className="absolute top-6 left-1/2 -translate-x-1/2 text-white/50 text-[11px] tracking-[0.2em]">
              {lightboxIdx + 1} / {GALLERY_PHOTOS.length}
            </p>

            {/* 이미지 (드래그로 넘기기) */}
            <motion.div
              key={lightboxIdx}
              className="relative"
              style={{ maxWidth: '90vw', maxHeight: '80vh' }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60) lbNext();
                if (info.offset.x > 60)  lbPrev();
              }}
              onClick={(e) => e.stopPropagation()}>
              {GALLERY_PHOTOS[lightboxIdx]
                ? <img src={GALLERY_PHOTOS[lightboxIdx]} alt={`사진 ${lightboxIdx + 1}`}
                    className="rounded-xl object-contain shadow-2xl"
                    style={{ maxWidth: '90vw', maxHeight: '80vh' }} />
                : <div className="rounded-xl bg-gray-700"
                    style={{ width: '70vw', aspectRatio: '3/4', maxHeight: '80vh' }} />
              }
            </motion.div>

            {/* 이전/다음 버튼 */}
            {lightboxIdx > 0 && (
              <button onClick={(e) => { e.stopPropagation(); lbPrev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl">
                ‹
              </button>
            )}
            {lightboxIdx < GALLERY_PHOTOS.length - 1 && (
              <button onClick={(e) => { e.stopPropagation(); lbNext(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-white text-xl">
                ›
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── 웨딩 스냅 ────────────────────────────────────────────
type SnapPhoto = { id: number; url: string; name: string };

function WeddingSnapSection() {
  const [name, setName]           = useState('');
  const [files, setFiles]         = useState<File[]>([]);
  const [previews, setPreviews]   = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [done, setDone]           = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setFiles(prev => [...prev, ...selected]);
    setPreviews(prev => [...prev, ...selected.map(f => URL.createObjectURL(f))]);
    setDone(false);
    e.target.value = '';
  };

  const removeFile = (i: number) => {
    setFiles(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    setUploadError(null);
    setProgress(0);
    const uploaderName = name.trim() || '하객';
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const ext  = f.name.split('.').pop() ?? 'jpg';
      const path = `${Date.now()}-${i}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('wedding-snaps')
        .upload(path, f, { upsert: false });
      if (upErr) { setUploadError(`Storage 오류: ${upErr.message}`); setUploading(false); return; }
      const { data: urlData } = supabase.storage.from('wedding-snaps').getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from('wedding_snaps')
        .insert({ uploader_name: uploaderName, image_url: urlData.publicUrl });
      if (dbErr) { setUploadError(`DB 오류: ${dbErr.message}`); setUploading(false); return; }
      setProgress(i + 1);
    }
    setFiles([]);
    setPreviews([]);
    setName('');
    setUploading(false);
    setDone(true);
  };

  return (
    <>
      <section className="px-5 py-20 z-10 relative bg-[#FBF9F7]">
        <div className="max-w-sm mx-auto">

          <motion.div className="pt-16 pb-10"
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9 }}>

            {/* 헤더 */}
            <div className="text-center mb-8">
              <SectionLabel>Wedding Snap</SectionLabel>
              <p className="text-gray-800 text-[17px] font-light tracking-wide mt-1 mb-4">
                우리만의 사진작가가 되어주세요!
              </p>
              <p className="text-gray-400 text-[12px] leading-[1.9]">
                저희의 결혼식 추억을 함께 남겨주세요.<br />
                <span className="text-rose-400">베스트 사진작가</span>님께 소정의 상품도 준비했어요 🎁
              </p>
            </div>

            {/* 업로드 카드 */}
            <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden mb-6"
              style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.04)' }}>

              {/* 사진 추가 버튼 */}
              <button onClick={() => fileRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 py-8 px-6 transition-colors active:bg-gray-50">
                <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
                <p className="text-[12px] text-gray-400 tracking-wide">
                  {previews.length > 0 ? `${previews.length}장 선택됨 · 추가하기` : '사진을 선택해 주세요 (여러 장 가능)'}
                </p>
                <p className="text-[10px] text-gray-300">JPG · PNG · HEIC</p>
              </button>

              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFile} />

              {/* 미리보기 그리드 */}
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-1.5 px-4 pb-4">
                  {previews.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '1' }}>
                      <img src={src} className="w-full h-full object-cover" />
                      <button onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white text-[10px] flex items-center justify-center">
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 이름 + 업로드 버튼 */}
              <div className="px-5 py-4 border-t border-gray-50 flex items-center gap-3">
                <input type="text" placeholder="이름 (선택)" maxLength={10} value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 outline-none text-[13px] text-gray-700 placeholder:text-gray-300 bg-transparent" />
                <button onClick={handleUpload}
                  disabled={!files.length || uploading}
                  className="px-4 py-2 rounded-xl text-[11px] font-medium tracking-wide transition-all active:scale-95 disabled:opacity-30"
                  style={{ background: '#fff1f2', color: '#f43f5e' }}>
                  {uploading ? `${progress}/${files.length} 업로드 중...` : '업로드'}
                </button>
              </div>

              {done && (
                <p className="px-5 pb-3 text-[10px] text-emerald-500 tracking-wide">✓ 업로드 완료!</p>
              )}
              {uploadError && (
                <p className="px-5 pb-3 text-[10px] text-red-400">{uploadError}</p>
              )}
            </div>

          </motion.div>
        </div>
      </section>

    </>
  );
}

// ─── 카카오맵 ─────────────────────────────────────────────
const KAKAO_APP_KEY = 'e2e376c7b43632160887f2a350bf3afe';
const HOTEL_ADDRESS = '서울특별시 구로구 신도림동 427-3';

function KakaoMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initMap = () => {
      if (!mapRef.current) return;
      const kakao = (window as any).kakao;

      kakao.maps.load(() => {
        const geocoder = new kakao.maps.services.Geocoder();

        const ps = new kakao.maps.services.Places();
        ps.keywordSearch('라마다 서울 신도림 호텔', (data: any[], status: any) => {
          const ok = kakao.maps.services.Status.OK;
          const coords = status === ok
            ? new kakao.maps.LatLng(data[0].y, data[0].x)
            : new kakao.maps.LatLng(37.50957, 126.89020);

          const map = new kakao.maps.Map(mapRef.current, {
            center: coords,
            level: 4,
          });

          new kakao.maps.Marker({ map, position: coords });

          const content = `<div style="
            background:white;
            border:2px solid #f43f5e;
            border-radius:20px;
            padding:5px 13px;
            font-size:12px;
            font-weight:600;
            color:#f43f5e;
            white-space:nowrap;
            box-shadow:0 2px 8px rgba(244,63,94,0.25);
            margin-bottom:8px;
          ">욱태♥혜원</div>`;

          new kakao.maps.CustomOverlay({
            map,
            position: coords,
            content,
            yAnchor: 1,
          });
        });
      });
    };

    if ((window as any).kakao?.maps) {
      initMap();
      return;
    }
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
    script.onload = initMap;
    document.head.appendChild(script);
  }, []);

  return (
    <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
      <div ref={mapRef} style={{ width: '100%', height: '260px' }} />
    </div>
  );
}

// ─── 우리의 여정 ──────────────────────────────────────────
const JOURNEY_W = 320;
const JOURNEY_H = 440;
const JOURNEY_PATH = 'M 55,90 C 155,65 205,165 265,165 C 335,165 315,255 55,255 C -15,255 85,360 180,360';

const JOURNEY_STOPS = [
  { x: 55,  y: 90,  side: 'custom', lx: 5, ly: 20, lw: 150, code: 'SBN', date: null,           city: '곡란중학교',     sub: '같은 중학교, 모르는 사이', icon: '🏫', color: '#9CA3AF' },
  { x: 265, y: 165, side: 'custom', lx: 200, ly: 85, lw: 130, code: 'SBN', date: '11 SEP 2025',  city: '산본',           sub: '욱태 생일 · 첫 만남',     icon: '💕', color: '#F43F5E' },
  { x: 55,  y: 255, side: 'custom', lx: 5, ly: 160, lw: 155, code: 'LAS', date: '24 FEB 2026',  city: '라스베이거스',   sub: '벨라지오 분수쇼 프로포즈', icon: '💍', color: '#7C3AED' },
  { x: 180, y: 360, side: 'right', code: 'SEL', date: '14 MAR 2027',  city: '라마다 신도림',  sub: 'FINAL DESTINATION',       icon: '💒', color: '#F43F5E' },
];

function OurJourneySection() {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLen, setPathLen] = useState(900);
  useEffect(() => {
    if (pathRef.current) setPathLen(pathRef.current.getTotalLength());
  }, []);

  return (
    <section className="px-6 z-10 relative">
      <div className="max-w-sm mx-auto">
        <motion.div className="py-16"
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9 }}>

          <div className="text-center mb-8">
            <SectionLabel>Our Journey</SectionLabel>
            <p className="text-gray-500 text-[11px] tracking-[0.2em] mt-1">두 사람의 이야기</p>
          </div>

          <div style={{ position: 'relative', width: JOURNEY_W, margin: '0 auto' }}>
            <svg width={JOURNEY_W} height={JOURNEY_H} viewBox={`0 0 ${JOURNEY_W} ${JOURNEY_H}`}
              style={{ overflow: 'visible', display: 'block' }}>
              <defs>
                <linearGradient id="jGrad" gradientUnits="userSpaceOnUse" x1="55" y1="90" x2="180" y2="360">
                  <stop offset="0%"   stopColor="#9CA3AF" />
                  <stop offset="33%"  stopColor="#F43F5E" />
                  <stop offset="66%"  stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#F43F5E" />
                </linearGradient>
              </defs>

              {/* 배경 점선 */}
              <path d={JOURNEY_PATH} fill="none" stroke="#E5E7EB" strokeWidth="3" strokeDasharray="6 5" />

              {/* 측정용 hidden path */}
              <path ref={pathRef} d={JOURNEY_PATH} fill="none" stroke="none" />

              {/* 애니메이션 컬러 경로 */}
              <motion.path
                d={JOURNEY_PATH} fill="none"
                stroke="url(#jGrad)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={pathLen}
                initial={{ strokeDashoffset: pathLen }}
                whileInView={{ strokeDashoffset: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.2 }}
              />

              {/* 경로 따라가는 비행기 */}
              <motion.g
                style={{
                  offsetPath: `path("${JOURNEY_PATH}")`,
                  offsetRotate: 'auto',
                } as React.CSSProperties}
                initial={{ offsetDistance: '0%' } as any}
                whileInView={{ offsetDistance: '100%' } as any}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 2.2, ease: 'easeInOut', delay: 0.2 }}>
                <text
                  x="0" y="0"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ fontSize: '14px', userSelect: 'none' }}>✈</text>
              </motion.g>

              {/* 스팟 원 */}
              {JOURNEY_STOPS.map((s, i) => (
                <motion.g key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.4, type: 'spring', stiffness: 300, damping: 18 }}>
                  <circle cx={s.x} cy={s.y} r={18} fill="white"
                    stroke={s.color} strokeWidth="2.5"
                    style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
                  <text x={s.x} y={s.y + 1} textAnchor="middle" dominantBaseline="middle"
                    style={{ fontSize: '15px' }}>{s.icon}</text>
                </motion.g>
              ))}
            </svg>

            {/* 라벨 */}
            {JOURNEY_STOPS.map((s, i) => {
              const isRight  = s.side === 'right';
              const isLeft   = s.side === 'left';
              const isAbove  = s.side === 'above';
              const isBelow  = s.side === 'below';
              const isCustom = s.side === 'custom';
              const W = (s as any).lw ?? 112;
              const style: React.CSSProperties = {
                position: 'absolute',
                zIndex: 10,
                width: W,
                ...(isRight  ? { left: s.x + 24,              top: s.y - 20       } : {}),
                ...(isLeft   ? { right: JOURNEY_W - s.x + 24, top: s.y - 20       } : {}),
                ...(isAbove  ? { left: s.x - W + 8,           top: s.y - 68       } : {}),
                ...(isBelow  ? { left: s.x + 24,              top: s.y + 22       } : {}),
                ...(isCustom ? { left: (s as any).lx,         top: (s as any).ly  } : {}),
              };
              return (
                <motion.div key={i} style={style}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 + i * 0.3 }}>
                  <p className="font-bold tracking-[0.1em]"
                    style={{ fontSize: '9px', color: s.color, marginBottom: '2px', whiteSpace: 'nowrap' }}>
                    {s.code} {s.date && `· ${s.date}`}
                  </p>
                  <p className="font-semibold text-gray-800 leading-tight"
                    style={{ fontSize: '13px', marginBottom: '2px' }}>
                    {s.city}
                  </p>
                  <p className="text-gray-400 leading-snug" style={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                    {s.sub}
                  </p>
                  {i === 2 && (
                    <div className="flex items-center gap-1 mt-1">
                      <motion.div className="w-1.5 h-1.5 rounded-full"
                        style={{ background: s.color }}
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }} />
                      <p style={{ fontSize: '9px', color: s.color }}>현재진행형</p>
                    </div>
                  )}
                  {i === 3 && (
                    <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full"
                      style={{ background: `${s.color}12`, border: `1px solid ${s.color}30` }}>
                      <Plane size={8} fill="currentColor" strokeWidth={0} style={{ color: s.color }} />
                      <p style={{ fontSize: '8px', color: s.color, letterSpacing: '0.15em' }}>FINAL</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
        <TicketDivider />
      </div>
    </section>
  );
}

// ─── 오시는길 블록 ────────────────────────────────────────
function DirectionBlock({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[14px]">{icon}</span>
        <p className="text-[9px] tracking-[0.28em] text-gray-400 font-medium">{title}</p>
      </div>
      {children}
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
            <p className="text-[10px] font-semibold tracking-[0.12em] text-gray-600">RAMADA SEOUL SINDORIM · HANEUL HALL</p>
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
              <span className="font-semibold tracking-wide text-gray-700 text-[11px]">Love is All</span>
              <span className="text-gray-400 text-[9px] tracking-widest">BGM — 검정치마</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <audio ref={audioRef} src="/music/love-is-all.mp3" loop />
    </motion.div>
  );
}

// ─── 3. 방명록 ────────────────────────────────────────────
const HANDWRITING_FONTS = ['Nanum01','Nanum02','Nanum03','Nanum04','Nanum05','Nanum06','Nanum07','Nanum08'];

const STAMP_COLORS = [
  '#8B1A1A','#1A3F6B','#1A5C2A','#4A1A6B',
  '#1A5C5C','#6B3A1A','#6B1A4A','#1A4A5C',
];

function PostcardCard({ msg, i }: { msg: { id: number; name: string; text: string; fontIdx: number; accentIdx: number }; i: number }) {
  const font  = HANDWRITING_FONTS[msg.fontIdx % HANDWRITING_FONTS.length];
  const color = STAMP_COLORS[msg.accentIdx % STAMP_COLORS.length];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, delay: i * 0.06 }}
      style={{
        background: '#FDF6E3',
        borderRadius: '6px',
        padding: '3px',
        backgroundImage: `
          repeating-linear-gradient(-45deg,
            #c0392b 0px,#c0392b 4px,
            #1a3f7a 4px,#1a3f7a 8px,
            #FDF6E3 8px,#FDF6E3 12px
          )
        `,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}>
      <div style={{ background: '#FDF6E3', borderRadius: '4px', padding: '12px 13px 11px' }}>

        {/* 우표 + 소인 */}
        <div className="flex justify-end items-start gap-1.5 mb-2">
          {/* 소인(postmark) */}
          <div style={{ position: 'relative', width: '30px', height: '30px', flexShrink: 0, opacity: 0.22 }}>
            <div style={{ position: 'absolute', inset: 0, border: `1.5px solid ${color}`, borderRadius: '50%' }} />
            {[-30, 0, 30].map(deg => (
              <div key={deg} style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: color, transform: `rotate(${deg}deg)`, transformOrigin: 'center' }} />
            ))}
          </div>
          {/* 우표 */}
          <div style={{
            width: '30px', height: '36px',
            border: `1.5px dashed ${color}`,
            borderRadius: '2px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: `${color}12`,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '13px' }}>✈</span>
          </div>
        </div>

        {/* 헤더 라인 */}
        <div className="flex items-center gap-2 mb-2">
          <div style={{ flex: 1, height: '1px', backgroundImage: `repeating-linear-gradient(to right, ${color}40 0px, ${color}40 4px, transparent 4px, transparent 8px)` }} />
          <p style={{ fontFamily: 'monospace', fontSize: '6px', letterSpacing: '0.25em', color, opacity: 0.55 }}>WEDDING · 2027.03.14</p>
          <div style={{ flex: 1, height: '1px', backgroundImage: `repeating-linear-gradient(to right, ${color}40 0px, ${color}40 4px, transparent 4px, transparent 8px)` }} />
        </div>

        {/* 메시지 */}
        <p style={{
          fontFamily: `'${font}', cursive`,
          fontSize: '1.05rem',
          lineHeight: 1.6,
          color: '#4A3728',
          wordBreak: 'break-word',
          minHeight: '40px',
        }}>{msg.text}</p>

        {/* 보내는 사람 */}
        <div className="flex items-center gap-1.5 mt-2 pt-2" style={{ borderTop: `1px dashed ${color}30` }}>
          <span style={{ fontSize: '11px' }}>📮</span>
          <p style={{ fontFamily: `'${font}', cursive`, fontSize: '0.85rem', color: '#7A5C3A' }}>
            {msg.name}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

type Message = { id: number; name: string; text: string; fontIdx: number; accentIdx: number };

function GuestbookWall() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [name, setName]     = useState('');
  const [text, setText]     = useState('');
  const [page, setPage]     = useState(0);
  const [dir, setDir]       = useState(1);
  const [loading, setLoading] = useState(true);
  const PER_PAGE = 4;

  useEffect(() => {
    supabase.from('guestbook').select('*').order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setMessages(data.map(r => ({
          id: r.id, name: r.name, text: r.text,
          fontIdx: r.font_idx, accentIdx: r.accent_idx,
        })));
        setLoading(false);
      });
  }, []);

  const totalPages = Math.ceil(messages.length / PER_PAGE);
  const paged = messages.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const goPage = (next: number) => {
    setDir(next > page ? 1 : -1);
    setPage(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    const fontIdx   = Math.floor(Math.random() * HANDWRITING_FONTS.length);
    const accentIdx = Math.floor(Math.random() * STAMP_COLORS.length);
    const { data, error } = await supabase
      .from('guestbook')
      .insert({ name, text, font_idx: fontIdx, accent_idx: accentIdx })
      .select().single();
    if (!error && data) {
      setMessages(prev => [{ id: data.id, name, text, fontIdx, accentIdx }, ...prev]);
      setPage(0);
    }
    setName(''); setText('');
  };

  return (
    <section className="py-24 px-5 relative overflow-hidden" style={{
      background: '#EDE4D3',
      backgroundImage: `repeating-linear-gradient(0deg, rgba(160,130,80,0.06) 0px, rgba(160,130,80,0.06) 1px, transparent 1px, transparent 22px)`,
    }}>
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-10">
          <SectionLabel>Guestbook</SectionLabel>
          <p className="text-[11px] tracking-[0.2em] mt-1" style={{ color: '#9C8268' }}>축하 엽서를 보내주세요</p>
        </div>

        {/* 입력 폼 — 엽서 스타일 */}
        <form onSubmit={handleSubmit} className="mb-10" style={{
          background: '#FDF6E3',
          borderRadius: '6px',
          padding: '3px',
          backgroundImage: `repeating-linear-gradient(-45deg,
            #c0392b 0px,#c0392b 4px,
            #1a3f7a 4px,#1a3f7a 8px,
            #FDF6E3 8px,#FDF6E3 12px)`,
          boxShadow: '0 3px 16px rgba(0,0,0,0.12)',
        }}>
          <div style={{ background: '#FDF6E3', borderRadius: '4px', padding: '16px' }}>
            <div className="flex justify-between items-start mb-3">
              <p style={{ fontFamily: 'monospace', fontSize: '7px', letterSpacing: '0.3em', color: '#8B6A3A', opacity: 0.6 }}>
                AIR MAIL ✈
              </p>
              {/* 우표 */}
              <div style={{ width: '32px', height: '38px', border: '1.5px dashed #8B6A3A', borderRadius: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(139,106,58,0.08)', flexShrink: 0 }}>
                <span style={{ fontSize: '14px' }}>💌</span>
              </div>
            </div>
            <div style={{ borderTop: '1px dashed rgba(139,106,58,0.3)', paddingTop: '10px' }}>
              <input type="text" placeholder="보내는 사람 (이름)" maxLength={10} value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full outline-none bg-transparent mb-3 font-medium"
                style={{ fontSize: '13px', color: '#4A3728', borderBottom: '1px dashed rgba(139,106,58,0.3)', paddingBottom: '6px' }} />
              <textarea placeholder="따뜻한 축하의 말을 적어주세요..." rows={3} value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full resize-none outline-none bg-transparent leading-relaxed"
                style={{ fontSize: '1.1rem', color: '#4A3728', fontFamily: `'${HANDWRITING_FONTS[0]}', cursive` }} />
            </div>
            <button type="submit"
              disabled={!name.trim() || !text.trim()}
              className="mt-3 w-full py-2.5 rounded text-[11px] tracking-[0.2em] font-medium transition-all active:scale-95 disabled:opacity-30"
              style={{ background: 'rgba(139,106,58,0.12)', color: '#6B4F2A', border: '1px dashed rgba(139,106,58,0.4)' }}>
              축하 엽서 보내기 ✈️
            </button>
          </div>
        </form>

        {loading && <p className="text-center py-8 text-[11px]" style={{ color: '#B09A7A', letterSpacing: '0.2em' }}>loading...</p>}

        {/* 스와이프 엽서 영역 */}
        {messages.length > 0 && (
          <div className="relative overflow-hidden">
            <motion.div
              key={page}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.15}
              onDragEnd={(_, info) => {
                if (info.offset.x < -60 && page < totalPages - 1) goPage(page + 1);
                if (info.offset.x > 60  && page > 0)              goPage(page - 1);
              }}
              initial={{ x: dir * 80, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: dir * -80, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              style={{ touchAction: 'pan-y' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', alignItems: 'start' }}>
                <AnimatePresence>
                  {paged.map((msg, i) => (
                    <PostcardCard key={msg.id} msg={msg} i={i} />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* 스와이프 힌트 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-5 px-1">
                <p style={{ fontSize: '9px', color: '#B09A7A', letterSpacing: '0.15em' }}>
                  ← 스와이프
                </p>
                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button key={i} onClick={() => goPage(i)}
                      className="rounded-full transition-all duration-200"
                      style={{ width: i === page ? '18px' : '5px', height: '5px', background: i === page ? '#8B6A3A' : '#C4A882' }} />
                  ))}
                </div>
                <p style={{ fontSize: '9px', color: '#B09A7A', letterSpacing: '0.15em' }}>
                  스와이프 →
                </p>
              </div>
            )}
            {totalPages > 1 && (
              <p className="text-center mt-2" style={{ fontSize: '9px', color: '#C4A882', letterSpacing: '0.15em' }}>
                {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, messages.length)} / {messages.length}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ─── 4. 계좌 섹션 ─────────────────────────────────────────
const ACCOUNT_GROUPS = [
  {
    side: '신랑측',
    color: '#6B7FCC',
    members: [
      { role: '신랑',       name: '장욱태', bank: '은행명', number: '000-0000-0000' },
      { role: '신랑 아버지', name: '장○○',  bank: '은행명', number: '000-0000-0000' },
      { role: '신랑 어머니', name: '장○○',  bank: '은행명', number: '000-0000-0000' },
    ],
  },
  {
    side: '신부측',
    color: '#CC6B8A',
    members: [
      { role: '신부',       name: '김혜원', bank: '은행명', number: '000-0000-0000' },
      { role: '신부 아버지', name: '김○○',  bank: '은행명', number: '000-0000-0000' },
      { role: '신부 어머니', name: '김○○',  bank: '은행명', number: '000-0000-0000' },
    ],
  },
];

function AccountSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (number: string, key: string) => {
    navigator.clipboard.writeText(number.replace(/-/g, ''));
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  };

  return (
    <section className="px-6 z-10 relative">
      <div className="max-w-sm mx-auto">
        <TicketDivider />
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.9 }}>

          <div className="text-center mb-8">
            <SectionLabel>마음 전하실 곳</SectionLabel>
            <p className="text-gray-400 text-[11px] tracking-[0.18em] mt-1">축하의 마음을 전해주세요</p>
          </div>

          <div className="flex flex-col gap-3">
            {ACCOUNT_GROUPS.map((group, gi) => {
              const isOpen = openIdx === gi;
              return (
                <div key={gi} className="rounded-2xl overflow-hidden shadow-sm"
                  style={{ border: isOpen ? `1px solid ${group.color}33` : '1px solid #f3f4f6' }}>

                  {/* 토글 헤더 */}
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : gi)}
                    className="w-full flex items-center justify-between px-5 py-4 transition-colors"
                    style={{ background: isOpen ? `${group.color}08` : 'white' }}>
                    <div className="flex items-center gap-3">
                      {/* 아이콘 */}
                      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${group.color}15` }}>
                        <Heart size={13} style={{ color: group.color }} fill="currentColor" />
                      </div>
                      <div className="text-left">
                        <p className="text-[9px] tracking-[0.28em] mb-0.5"
                          style={{ color: group.color }}>
                          {group.side.toUpperCase()}
                        </p>
                        <p className="text-[15px] font-semibold text-gray-800 leading-none">
                          {group.members[0].name}
                        </p>
                      </div>
                    </div>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.22 }}>
                      <ChevronDown size={16} className="text-gray-400" />
                    </motion.div>
                  </button>

                  {/* 펼쳐지는 계좌 목록 */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                        transition={{ duration: 0.24, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}>
                        <div style={{ borderTop: `1px solid ${group.color}20` }}>
                          {group.members.map((member, mi) => {
                            const key = `${gi}-${mi}`;
                            const isCopied = copied === key;
                            return (
                              <div key={mi}
                                className="flex items-center justify-between px-5 py-3.5"
                                style={{
                                  borderBottom: mi < group.members.length - 1 ? `1px solid ${group.color}12` : 'none',
                                  background: mi % 2 === 0 ? 'white' : `${group.color}04`,
                                }}>
                                {/* 좌: 역할 + 이름 + 계좌 */}
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className="w-[3px] h-9 rounded-full flex-shrink-0"
                                    style={{ background: group.color, opacity: 0.5 }} />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                      <span className="text-[8px] tracking-[0.2em] px-1.5 py-0.5 rounded-full font-medium"
                                        style={{ background: `${group.color}15`, color: group.color }}>
                                        {member.role}
                                      </span>
                                      <span className="text-[13px] font-semibold text-gray-800">{member.name}</span>
                                    </div>
                                    <p className="text-[10px] text-gray-400">
                                      {member.bank} <span className="font-mono text-gray-600 tracking-wide">{member.number}</span>
                                    </p>
                                  </div>
                                </div>
                                {/* 우: 복사 버튼 */}
                                <button
                                  onClick={() => copy(member.number, key)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium flex-shrink-0 ml-2 transition-all active:scale-95"
                                  style={{
                                    background: isCopied ? '#f0fdf4' : `${group.color}12`,
                                    color: isCopied ? '#16a34a' : group.color,
                                    border: isCopied ? '1px solid #bbf7d0' : `1px solid ${group.color}30`,
                                  }}>
                                  {isCopied ? <><Check size={10} />복사됨</> : <><Copy size={10} />복사</>}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── 5. RSVP 모달 ─────────────────────────────────────────
type RsvpData = { name: string; attending: 'yes' | 'no' | ''; guests: string; message: string };

function RsvpModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<RsvpData>({ name: '', attending: '', guests: '1', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.attending) return;
    await supabase.from('rsvp').insert({
      name: form.name,
      attending: form.attending,
      guests: parseInt(form.guests),
      message: form.message,
    });
    setSubmitted(true);
  };

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
            <form onSubmit={handleRsvpSubmit}
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
        <section className="relative min-h-screen flex flex-col items-center justify-start z-10 px-6 pt-20">

          {/* 배경 연도 워터마크 */}
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none" style={{ alignItems: 'flex-start', paddingTop: '5vh' }}>
            <span className="flex flex-col items-center text-[22vw] font-black leading-none tracking-tighter"
              style={{ color: 'rgba(17,24,39,0.025)' }}>
              <span>2027</span>
              <span>0314</span>
            </span>
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

        {/* ══ COVER PHOTO ══════════════════════════════════ */}
        <section className="relative w-full z-10">
          <img
            src="/images/cover.jpg"
            alt="cover"
            className="w-full h-auto block"
            onError={(e) => {
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = 'none';
              (el.nextElementSibling as HTMLElement).style.display = 'flex';
            }}
          />
          {/* 사진 없을 때만 표시 */}
          <div className="w-full bg-gray-200 flex-col items-center justify-center gap-3 py-20"
            style={{ display: 'none' }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <rect x="4" y="10" width="40" height="30" rx="4" stroke="#9ca3af" strokeWidth="2" fill="none"/>
              <circle cx="17" cy="22" r="4" stroke="#9ca3af" strokeWidth="2" fill="none"/>
              <path d="M4 34 L14 24 L22 32 L30 22 L44 36" stroke="#9ca3af" strokeWidth="2" strokeLinejoin="round" fill="none"/>
            </svg>
            <p className="text-[10px] tracking-[0.25em] text-gray-400 mt-2">public/images/cover.jpg</p>
          </div>
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
                {`각자의 궤도를 날던 두 사람이 만나,\n이제 평생이라는 목적지를 향해\n함께 비행하려 합니다.\n\n저희의 첫 출발을 알리는 결혼식에\n소중한 분들을 초대합니다.\n\n오셔서 따뜻한 응원으로\n자리를 빛내주시면 감사하겠습니다.`}
              </p>
              <div className="w-8 h-px bg-rose-200 mx-auto mt-6" />
            </motion.div>
            <TicketDivider />
          </div>
        </section>

        {/* ══ 우리의 여정 ══════════════════════════════════ */}
        <OurJourneySection />

        {/* ══ 갤러리 ═══════════════════════════════════════ */}
        <GallerySection />

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
                  <p className="text-xl font-semibold tracking-wide text-gray-800">라마다 서울 신도림 호텔</p>
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
                  <a href="https://map.kakao.com/?q=라마다+서울+신도림+호텔" target="_blank" rel="noopener noreferrer"
                    className="py-3 bg-[#FEE500] text-black text-[11px] rounded-xl font-bold tracking-wide active:scale-95 transition-transform text-center block">
                    카카오맵
                  </a>
                  <a href="https://map.naver.com/v5/search/라마다+서울+신도림+호텔" target="_blank" rel="noopener noreferrer"
                    className="py-3 bg-[#03C75A] text-white text-[11px] rounded-xl font-bold tracking-wide active:scale-95 transition-transform text-center block">
                    네이버지도
                  </a>
                </div>
              </div>

              {/* 지도 */}
              <KakaoMap />

              {/* 오시는길 */}
              <div className="mt-4 rounded-2xl border border-gray-100 overflow-hidden shadow-sm bg-white">

                {/* 자가용 */}
                <DirectionBlock icon="🚗" title="자가용">
                  <p className="text-[10px] text-gray-600 mb-1">주차장 입구 · 서울특별시 구로구 경인로 624</p>
                  <p className="text-[10px] text-gray-400">주차 가능 · 1시간 30분 무료</p>
                </DirectionBlock>

                <div className="h-px bg-gray-50" />

                {/* 지하철 */}
                <DirectionBlock icon="🚇" title="지하철">
                  <div className="flex items-start gap-2 mb-1.5">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 whitespace-nowrap">1·2호선</span>
                    <span className="text-[10px] text-gray-500 leading-[1.6]">신도림역 1번 출구 → 광장 도보 5분</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100">
                    <span className="text-rose-400 text-[11px]">🚌</span>
                    <span className="text-[10px] text-rose-500 font-medium">셔틀버스 · 신도림역 1번 출구 앞 운행</span>
                  </div>
                </DirectionBlock>

                <div className="h-px bg-gray-50" />

                {/* 버스 */}
                <DirectionBlock icon="🚍" title="버스">
                  <p className="text-[9px] tracking-[0.15em] text-gray-400 mb-2">신도림역 / 구로역 하차</p>
                  {[
                    { type: '간선(파랑)',   color: '#3B82F6', lines: '160 · 503 · 600 · 660 · 662 · N16' },
                    { type: '지선(초록)',   color: '#22C55E', lines: '6515 · 6516 · 6637 · 6640A · 6640B · 6713' },
                    { type: '경기일반',     color: '#6B7280', lines: '10 · 11-1 · 11-2 · 83 · 88 · 530' },
                    { type: '직행(빨강)',   color: '#EF4444', lines: '301 · 320 · 5200' },
                  ].map(({ type, color, lines }) => (
                    <div key={type} className="flex items-baseline gap-2 mb-1.5 last:mb-0">
                      <span className="text-[8px] font-semibold px-1.5 py-0.5 rounded-full whitespace-nowrap"
                        style={{ background: color + '18', color }}>
                        {type}
                      </span>
                      <span className="text-[10px] text-gray-500">{lines}</span>
                    </div>
                  ))}
                </DirectionBlock>
              </div>

            </motion.div>
            <TicketDivider />
          </div>
        </section>

        {/* ══ 방명록 ═══════════════════════════════════════ */}
        <GuestbookWall />

        {/* ══ 마음 전하실 곳 ═══════════════════════════════ */}
        <AccountSection />

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

        {/* ══ 웨딩 스냅 ════════════════════════════════════ */}
        <WeddingSnapSection />

        {/* ══ FOOTER ═══════════════════════════════════════ */}
        <footer className="py-14 text-center z-10 relative bg-[#FBF9F7]">
          <Plane size={14} className="text-rose-300 mx-auto mb-3" fill="currentColor" strokeWidth={0} />
          <p className="text-[8px] tracking-[0.42em] text-gray-300 uppercase mb-1.5">
            © 2027 Wooktae &amp; Hyewon
          </p>
          <p className="text-[7px] tracking-[0.32em] text-gray-300 uppercase mb-4">
            Wedding Air · Flight WD-0314
          </p>
          <p className="text-[7px] tracking-[0.2em] text-gray-200">made by hyewon</p>
        </footer>
      </main>
    </>
  );
}
