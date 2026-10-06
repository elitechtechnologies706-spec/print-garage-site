import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import './BehindTheScenes.css';

type Frame = {
  src: string;
  alt: string;
  caption: string;
};

type Clip = {
  label: string;
  title: string;
  description: string;
  frames: Frame[];
};

const clips: Clip[] = [
  {
    label: '01 / PREPARE',
    title: 'Cut & prepare',
    description: 'The work starts with fabric, careful cuts and a steady hand.',
    frames: [
      { src: '/behind-the-scenes/cutting-fabric.webp', alt: 'Garment maker cutting dark fabric with shears', caption: 'A careful cut begins the job.' },
      { src: '/behind-the-scenes/sewing-detail.webp', alt: 'Hands guiding fabric through a sewing machine', caption: 'Pieces are lined up for stitching.' },
      { src: '/behind-the-scenes/stitching-closeup.webp', alt: 'Close view of the needle sewing a dark garment', caption: 'Every seam gets close attention.' },
    ],
  },
  {
    label: '02 / MAKE',
    title: 'At the machines',
    description: 'Real people and working machines turn a brief into garments.',
    frames: [
      { src: '/behind-the-scenes/garment-workshop.webp', alt: 'Garment makers working at sewing stations', caption: 'The garment line at work.' },
      { src: '/behind-the-scenes/garment-maker.webp', alt: 'Garment maker checking a dark piece of fabric at her machine', caption: 'Checking the work as it comes together.' },
      { src: '/behind-the-scenes/sewing-machine.webp', alt: 'Sewing machine and dark garment in production', caption: 'From one pass to the next.' },
      { src: '/behind-the-scenes/sewing-table.webp', alt: 'Sewing a dark garment at the work table', caption: 'Stitch by stitch, piece by piece.' },
    ],
  },
  {
    label: '03 / FINISH',
    title: 'Finish the work',
    description: 'Reflective details, pressing and final checks bring it together.',
    frames: [
      { src: '/behind-the-scenes/reflective-workwear.webp', alt: 'Garment maker sewing reflective material onto workwear', caption: 'Reflective workwear takes shape.' },
      { src: '/behind-the-scenes/pressing-workwear.webp', alt: 'Hand pressing dark workwear with reflective strips', caption: 'Pressed and ready for the next step.' },
      { src: '/behind-the-scenes/workshop-team.webp', alt: 'Garment makers working side by side at sewing machines', caption: 'Many hands behind the finished piece.' },
    ],
  },
];

type Position = { clip: number; frame: number };

function advance({ clip, frame }: Position): Position {
  if (frame < clips[clip].frames.length - 1) return { clip, frame: frame + 1 };
  return { clip: (clip + 1) % clips.length, frame: 0 };
}

function retreat({ clip, frame }: Position): Position {
  if (frame > 0) return { clip, frame: frame - 1 };
  const previousClip = (clip - 1 + clips.length) % clips.length;
  return { clip: previousClip, frame: clips[previousClip].frames.length - 1 };
}

export function BehindTheScenes() {
  const sectionRef = useRef<HTMLElement>(null);
  const [position, setPosition] = useState<Position>({ clip: 0, frame: 0 });
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const activeClip = clips[position.clip];
  const activeFrame = activeClip.frames[position.frame];
  const running = playing && visible;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(false);
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setPosition(advance), 4200);
    return () => window.clearInterval(timer);
  }, [running, position.clip, position.frame]);

  useEffect(() => {
    if (!visible) return;
    const next = advance(position);
    const preload = new Image();
    preload.src = clips[next.clip].frames[next.frame].src;
  }, [position, visible]);

  return (
    <section className="section bts" id="behind-the-scenes" ref={sectionRef}>
      <div className="shell">
        <div className="bts-heading">
          <div className="section-heading">
            <div className="eyebrow">Behind the scenes / garment making</div>
            <h2>The work, up close.</h2>
          </div>
          <p>Short photo sequences from cutting and sewing to the finishing press. See the hands and machines behind the garments.</p>
        </div>

        <div className="bts-layout">
          <div className="bts-player">
            <div className="bts-image-wrap">
              <img
                key={activeFrame.src}
                className={`bts-image${running ? ' bts-image--playing' : ''}`}
                src={activeFrame.src}
                alt={activeFrame.alt}
                decoding="async"
                loading="lazy"
              />
              <div className="bts-image-top" aria-hidden="true">
                <span>PHOTO SEQUENCE / NO SOUND</span>
                <span>{String(position.clip + 1).padStart(2, '0')} : {String(position.frame + 1).padStart(2, '0')}</span>
              </div>
              <div className="bts-image-caption">
                <span>{activeClip.label}</span>
                <strong>{activeFrame.caption}</strong>
              </div>
            </div>
            <div className="bts-player-footer">
              <div className="bts-progress" aria-label={`Photo ${position.frame + 1} of ${activeClip.frames.length} in ${activeClip.title}`}>
                {activeClip.frames.map((frame, index) => (
                  <span key={frame.src} className="bts-progress-track">
                    <span
                      key={index === position.frame ? `${position.clip}-${position.frame}` : frame.src}
                      className={`bts-progress-fill${index < position.frame ? ' bts-progress-fill--complete' : ''}${index === position.frame && running ? ' bts-progress-fill--active' : ''}`}
                    />
                  </span>
                ))}
              </div>
              <div className="bts-controls" role="group" aria-label="Photo sequence controls">
                <button type="button" onClick={() => setPosition(retreat)} aria-label="Previous photo"><ChevronLeft size={19} aria-hidden="true" /></button>
                <button type="button" onClick={() => setPlaying((value) => !value)} aria-label={playing ? 'Pause photo sequence' : 'Play photo sequence'}>
                  {playing ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
                </button>
                <button type="button" onClick={() => setPosition(advance)} aria-label="Next photo"><ChevronRight size={19} aria-hidden="true" /></button>
              </div>
            </div>
          </div>

          <div className="bts-chapters" aria-label="Behind-the-scenes photo sequences">
            {clips.map((clip, index) => (
              <button
                className={`bts-chapter${position.clip === index ? ' bts-chapter--active' : ''}`}
                key={clip.label}
                type="button"
                onClick={() => setPosition({ clip: index, frame: 0 })}
                aria-pressed={position.clip === index}
              >
                <img src={clip.frames[0].src} alt="" loading="lazy" decoding="async" />
                <span className="bts-chapter-copy">
                  <span className="bts-chapter-label">{clip.label}</span>
                  <strong>{clip.title}</strong>
                  <span className="bts-chapter-detail">{clip.description}</span>
                </span>
                <span className="bts-chapter-arrow" aria-hidden="true">↗</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bts-bottom">
          <span>Real workshop photos · Gently animated stills</span>
          <a href="/t-shirt-printing-embroidery-kampala">Explore garment branding <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>
  );
}