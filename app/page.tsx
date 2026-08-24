'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  Accessibility, ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUp, ArrowUpRight,
  BatteryFull, Briefcase, CarTaxiFront, Check, Circle, CircleCheckBig, Clock, CornerUpRight,
  GitCompareArrows, ListFilter, LoaderCircle, LocateFixed, MapPin, Moon, Quote, RotateCcw,
  Route, Search, Signal, TrainFront, TriangleAlert, UserRound, Wifi, X, Zap, type LucideIcon,
} from 'lucide-react';
import { ConditionId, conditions, destinations, scenarios } from './mock-data';

type Step = 'input' | 'matching' | 'route' | 'guide' | 'arrival';

const prototypeConditionOrder: ConditionId[] = ['urgent', 'tired', 'barrierFree', 'luggage', 'schedule'];
const prototypeConditionMeta: Record<ConditionId, { icon: LucideIcon; label: string }> = {
  urgent: { icon: Zap, label: '급해요' },
  tired: { icon: Moon, label: '피곤해요' },
  barrierFree: { icon: Accessibility, label: '배리어프리' },
  luggage: { icon: Briefcase, label: '짐이 많아요' },
  schedule: { icon: Clock, label: '늦으면 안 돼요' },
};

function HeroRouteGraphic() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const draw = () => {
      const bounds = canvas.getBoundingClientRect();
      const width = bounds.width;
      const height = bounds.height;
      if (!width || !height) return;

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);

      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.clearRect(0, 0, width, height);

      const point = (x: number, y: number) => ({ x: width * x, y: height * y });
      const p0 = point(0, .82);
      const p1 = point(.06, .82);
      const p2 = point(.12, .72);
      const p3 = point(.24, .72);
      const p4 = point(.34, .82);
      const p5 = point(.42, .82);
      const p6 = point(.49, .72);
      const p7 = point(.49, .41);
      const p8 = point(.56, .24);
      const p9 = point(.75, .24);
      const p10 = point(.81, .38);
      const p11 = point(.81, .54);
      const p12 = point(.90, .66);
      const p13 = point(1, .66);

      context.beginPath();
      context.moveTo(p0.x, p0.y);
      context.lineTo(p1.x, p1.y);
      context.bezierCurveTo(width * .09, height * .82, width * .09, height * .72, p2.x, p2.y);
      context.lineTo(p3.x, p3.y);
      context.bezierCurveTo(width * .30, height * .72, width * .29, height * .82, p4.x, p4.y);
      context.lineTo(p5.x, p5.y);
      context.bezierCurveTo(width * .47, height * .82, width * .49, height * .79, p6.x, p6.y);
      context.lineTo(p7.x, p7.y);
      context.bezierCurveTo(width * .49, height * .30, width * .51, height * .24, p8.x, p8.y);
      context.lineTo(p9.x, p9.y);
      context.bezierCurveTo(width * .80, height * .24, width * .81, height * .30, p10.x, p10.y);
      context.lineTo(p11.x, p11.y);
      context.bezierCurveTo(width * .81, height * .62, width * .84, height * .66, p12.x, p12.y);
      context.lineTo(p13.x, p13.y);
      context.strokeStyle = 'rgba(255,255,255,.09)';
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.stroke();

      const drawStation = ({ x, y }: { x: number; y: number }, origin = false) => {
        if (origin) {
          context.beginPath();
          context.arc(x, y, 16, 0, Math.PI * 2);
          context.fillStyle = 'rgba(255,139,0,.05)';
          context.fill();
          context.beginPath();
          context.arc(x, y, 10, 0, Math.PI * 2);
          context.fillStyle = 'rgba(255,139,0,.09)';
          context.fill();
        }
        context.beginPath();
        context.arc(x, y, 5, 0, Math.PI * 2);
        context.fillStyle = origin ? '#ff8b00' : 'rgba(255,255,255,.09)';
        context.fill();
        context.lineWidth = 2;
        context.strokeStyle = origin ? 'rgba(255,139,0,.58)' : 'rgba(255,255,255,.18)';
        context.stroke();
      };

      drawStation(p1, true);
      [p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12].forEach((station) => drawStation(station));
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  return <div className="hero-route-graphic" aria-hidden="true"><canvas ref={canvasRef} /></div>;
}

export default function Home() {
  const [step, setStep] = useState<Step>('input');
  const [selected, setSelected] = useState<ConditionId | ''>('');
  const [destination, setDestination] = useState('');
  const [guideIndex, setGuideIndex] = useState(0);
  const [incident, setIncident] = useState(false);
  const [shared, setShared] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [congestionReport, setCongestionReport] = useState('');
  const [transportMode, setTransportMode] = useState('');

  const condition = conditions.find((item) => item.id === selected);
  const scenario = selected ? scenarios[selected] : null;
  const displayDestination = destination || scenario?.destination || '';
  const GuideTurnIcon = scenario && guideIndex === scenario.steps.length - 1 ? ArrowDown : guideIndex === 1 ? ArrowUp : CornerUpRight;
  useEffect(() => {
    if (step !== 'matching' || !scenario) return;
    const timer = window.setTimeout(() => {
      setTransportMode(scenario.transport.recommended);
      setStep('route');
    }, 1450);
    return () => window.clearTimeout(timer);
  }, [step, scenario]);

  useEffect(() => {
    if (step !== 'input') {
      document.querySelector('.condition-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  function startMatching() {
    if (!selected || !destination.trim()) return;
    setStep('matching');
  }

  function resetDemo() {
    setStep('input');
    setSelected('');
    setDestination('');
    setGuideIndex(0);
    setIncident(false);
    setShared(false);
    setShowReport(false);
    setCongestionReport('');
    setTransportMode('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startGuide() {
    setGuideIndex(0);
    setIncident(false);
    setStep('guide');
  }

  function advanceGuide() {
    if (!scenario) return;
    if (guideIndex >= scenario.steps.length - 1) {
      setStep('arrival');
      return;
    }
    setGuideIndex((current) => current + 1);
    setIncident(false);
  }

  return (
    <main className="site-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PickGo 홈"><PickGoLogo /></a>
        <div className="demo-pill"><span /> PORTFOLIO DEMO</div>
        <a className="about-link" href="#flow">서비스 구조 <span><ArrowDownRight aria-hidden="true" size={24} strokeWidth={2} /></span></a>
      </header>

      <section className="hero" id="top">
        <HeroRouteGraphic />
        <div className="hero-copy">
          <p className="eyebrow">ONE INPUT · ONE DECISION</p>
          <h1>목적지와 오늘의 나,<br /><em>한 번에 알려주세요.</em></h1>
          <p className="lead">검색하고, 필터를 고르고, 경로를 비교하는 과정 없이<br />PickGo가 지금 가장 적합한 한 가지 길로 연결해요.</p>
          <div className="hero-flow-mini" aria-label="PickGo 이용 순서">
            <span className={step === 'input' ? 'active' : ''}>통합 입력</span><i><ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></i>
            <span className={step === 'matching' ? 'active' : ''}>가중치 매칭</span><i><ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></i>
            <span className={step === 'route' || step === 'guide' ? 'active' : ''}>이동 안내</span><i><ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></i>
            <span className={step === 'arrival' ? 'active' : ''}>도착</span>
          </div>
        </div>

        <div className="demo-stage flow-demo-stage">
          <MapBackdrop active={step === 'guide'} urgent={selected === 'urgent'} />
          <div className="phone-presentation">
            <div className="phone-prototype-label"><span>LIVE PROTOTYPE</span><strong>{step === 'input' ? '[HM–002] Combined Input' : step === 'matching' ? '[LG–001] Weighting Logic' : step === 'route' ? "[PA–001] PickGo's Choice" : step === 'guide' ? '[DR–002] Active Guard' : '[AR–001] Arrival'}</strong></div>
            <div className="phone-device-shell">
              <div className="phone-statusbar"><strong>9:41</strong><span><Signal aria-hidden="true" size={24} strokeWidth={2} /><Wifi aria-hidden="true" size={24} strokeWidth={2} /><BatteryFull aria-hidden="true" size={24} strokeWidth={2} /></span></div>
              <section className={`condition-panel flow-panel ${selected === 'urgent' && step === 'guide' ? 'assistive' : ''}`} aria-label="PickGo 통합 경로 체험">
            {step === 'input' && (
              <div className="prototype-app-screen home-prototype screen-enter">
                <div className="prototype-search-panel">
                  <div className="prototype-search-row"><span><Search aria-hidden="true" size={24} strokeWidth={2} /></span><strong>검색</strong><button type="button" aria-label="프로필"><UserRound aria-hidden="true" size={24} strokeWidth={2} /></button></div>
                  <div className="prototype-destination-row"><span><MapPin aria-hidden="true" size={24} strokeWidth={2} /></span><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="어디로 가시나요?" /><button type="button" onClick={() => setDestination('집')}>집</button><button type="button" onClick={() => setDestination('회사')}>회사</button></div>
                  <div className="prototype-quick-row">{destinations.map((item) => <button type="button" key={item} onClick={() => setDestination(item)}>{item}</button>)}</div>
                </div>
                <PrototypeRouteMap variant="home" destination={displayDestination || '목적지'} />
                <button className="map-locate-button" type="button" aria-label="현재 위치"><LocateFixed aria-hidden="true" size={24} strokeWidth={2} /></button>
                <div className="prototype-bottom-sheet input-sheet">
                  <span className="sheet-grabber" />
                  <div className="sheet-heading"><div><small>COMBINED INPUT</small><strong>지금 어떤 이동이 필요하세요?</strong></div>{condition && <span>선택 완료 <Check aria-hidden="true" size={24} strokeWidth={2} /></span>}</div>
                  <div className="status-icon-row">
                    {prototypeConditionOrder.map((id) => {
                      const active = selected === id;
                      const meta = prototypeConditionMeta[id];
                      const Icon = meta.icon;
                      return <button key={id} type="button" data-condition={id} className={active ? 'selected' : ''} onClick={() => setSelected(id)} aria-pressed={active}><span><Icon aria-hidden="true" size={24} strokeWidth={2} /></span><small>{meta.label}</small></button>;
                    })}
                  </div>
                  <button className="prototype-cta" disabled={!selected || !destination.trim()} type="button" onClick={startMatching}>{selected && destination.trim() ? '지금 추천 경로 보기' : '목적지와 상태를 선택해주세요'}<span><ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></span></button>
                  <p className="prototype-data-note">예시 데이터로 동작하는 포트폴리오 프로토타입</p>
                </div>
              </div>
            )}

            {step === 'matching' && scenario && (
              <div className="panel-body matching-screen matching-prototype screen-enter" role="status" aria-live="polite">
                <div className="prototype-top-nav"><button type="button" onClick={() => setStep('input')} aria-label="입력 화면으로 돌아가기"><ArrowLeft aria-hidden="true" size={24} strokeWidth={2} /></button><strong>PickGo</strong><span>02 / 05</span></div>
                <div className="logic-orbit"><span>P</span><i /><i /><i /></div>
                <p className="step-label">STEP 02 · PICKGO LOGIC ENGINE</p>
                <h2>{condition?.label.replace('요', '')} 상태에 맞춰<br />경로 가중치를 계산해요.</h2>
                <div className="matching-inputs"><span>출발 · 서울역</span><i>+</i><span>도착 · {displayDestination}</span><i>+</i><span>상태 · {condition?.label}</span></div>
                <div className="logic-cards">
                  <div className="logic-card done"><span><Check aria-hidden="true" size={24} strokeWidth={2} /></span><div><strong>예시 교통·날씨 데이터</strong><small>혼잡 보통 · 비 30% · 지연 없음</small></div></div>
                  <div className="logic-card active"><span><LoaderCircle aria-hidden="true" size={24} strokeWidth={2} /></span><div><strong>상태별 동적 가중치</strong><small>{selected === 'barrierFree' ? '계단 제외 ∞ · 엘리베이터 최우선' : selected === 'luggage' ? '계단 제외 · 넓은 개찰구 우선' : selected === 'tired' ? '도보 최소 · 좌석 가능성 우선' : selected === 'urgent' ? '도착 시간 · 조작 단계 최우선' : '지연 위험 · 도착 편차 최우선'}</small></div></div>
                  <div className="logic-card"><span>03</span><div><strong>단일 경로 + 이동수단 결정</strong><small>중간 비교 없이 1개 결과로 연결</small></div></div>
                </div>
                <div className="matching-loader"><span /><small>Mock Engine이 추천 결과를 만들고 있어요</small></div>
              </div>
            )}

            {step === 'route' && scenario && (
              <div className="prototype-app-screen route-prototype screen-enter">
                <div className="prototype-top-nav"><button type="button" onClick={() => setStep('input')} aria-label="입력 화면으로 돌아가기"><ArrowLeft aria-hidden="true" size={24} strokeWidth={2} /></button><strong>PickGo’s Choice</strong><button type="button" onClick={resetDemo} aria-label="다시 시작"><RotateCcw aria-hidden="true" size={24} strokeWidth={2} /></button></div>
                <div className="match-heading"><p><strong>{condition?.label}</strong> 상태와</p><h2><em>{scenario.fit}%</em> 일치하는 경로입니다</h2><div className="match-progress"><span style={{ width: `${scenario.fit}%` }} /></div></div>
                <article className="matched-route-card">
                  <div className="route-card-title"><span>P</span><div><strong>{displayDestination}</strong><small>Route Card · 1-Path Matched</small></div><b>{scenario.minutes}분</b></div>
                  <PrototypeRouteMap variant="route" destination={displayDestination} />
                  <div className="route-transit-row"><span><TrainFront aria-hidden="true" size={24} strokeWidth={2} /> {scenario.transport.recommended}</span><span><CarTaxiFront aria-hidden="true" size={24} strokeWidth={2} /> 택시 약 {Math.max(8, scenario.minutes - 4)}분</span></div>
                  <div className="matched-reason"><small>MATCHED REASON DATA</small><div>{scenario.context.map((item) => <span className={getContextTone(item)} key={item}><Check aria-hidden="true" size={24} strokeWidth={2} /> {item}</span>)}</div></div>
                </article>
                <div className="route-infographic-row"><div><strong>{scenario.walk}</strong><small>총 도보</small></div><i /><div><strong>{scenario.cost}</strong><small>예상 비용</small></div><i /><div className="congestion-metric" data-level={scenario.congestion.level}><strong>{scenario.congestion.level}</strong><small>혼잡 예상</small></div></div>
                <div className="route-reason-copy"><span>P</span><p><strong>{scenario.routeLabel}</strong>{scenario.reason}</p></div>
                <div className="prototype-sticky-action"><button className="prototype-cta" type="button" onClick={startGuide}>GO · 안내 시작 <span><ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></span></button><small>{scenario.minutes}분 뒤 도착 예정 · 예시 데이터</small></div>
              </div>
            )}

            {step === 'guide' && scenario && (
              <div className={`prototype-app-screen guard-prototype screen-enter ${incident ? 'incident-open' : ''}`}>
                <div className="guard-map-wrap">
                  <PrototypeRouteMap variant="guide" destination={displayDestination} />
                  <div className="guard-search-bar"><span><Search aria-hidden="true" size={24} strokeWidth={2} /></span><strong>{displayDestination}</strong><button type="button" onClick={resetDemo} aria-label="안내 종료"><X aria-hidden="true" size={24} strokeWidth={2} /></button></div>
                  <div className="active-guard-pill"><i /> ACTIVE GUARD · {Math.max(1, scenario.minutes - guideIndex * Math.ceil(scenario.minutes / 3))}분 남음</div>
                </div>

                {!incident && <div className="prototype-bottom-sheet guard-sheet">
                  <span className="sheet-grabber" />
                  <div className="guide-meta"><span>지금 해야 할 일</span><strong>STEP {guideIndex + 1} / {scenario.steps.length}</strong></div>
                  <div className="journey-phases">{scenario.steps.map((item, index) => <div key={item.phase} className={index === guideIndex ? 'active' : index < guideIndex ? 'done' : ''}><span>{index < guideIndex ? <Check aria-hidden="true" size={24} strokeWidth={2} /> : index + 1}</span><small>{item.phase}</small></div>)}</div>
                  <div className="next-action"><span className="turn-arrow"><GuideTurnIcon aria-hidden="true" size={24} strokeWidth={2} /></span><div><strong>{scenario.steps[guideIndex].label}</strong><p>{scenario.steps[guideIndex].detail}</p></div></div>
                  <div className="guide-context-row"><span>ETA 예시 업데이트</span><span data-level={congestionReport || scenario.congestion.level}>혼잡 {congestionReport || scenario.congestion.level}</span></div>
                  {selected === 'urgent' ? <button className={`sos-compact ${shared ? 'shared' : ''}`} type="button" onClick={() => setShared(!shared)}><b>{shared ? <Check aria-hidden="true" size={24} strokeWidth={2} /> : 'SOS'}</b><span>{shared ? '위치 공유 데모 ON' : '보호자 위치 공유 데모'}</span></button> : <div className="compact-report"><button type="button" onClick={() => setShowReport(!showReport)}>혼잡도 제보 <b>{congestionReport || '선택'}</b></button>{showReport && <div>{['여유', '보통', '혼잡'].map((level) => <button data-level={level} key={level} type="button" onClick={() => { setCongestionReport(level); setShowReport(false); }}>{level}</button>)}</div>}</div>}
                  <div className="guide-action-grid"><button type="button" onClick={() => setIncident(true)}><TriangleAlert aria-hidden="true" size={24} strokeWidth={2} /> 돌발상황 체험</button><button type="button" onClick={advanceGuide}>{guideIndex === scenario.steps.length - 1 ? '도착 완료' : '다음 단계'} <ArrowRight aria-hidden="true" size={24} strokeWidth={2} /></button></div>
                </div>}

                {incident && <>
                  <div className="guard-dim" />
                  <div className="system-alert-modal"><span><TriangleAlert aria-hidden="true" size={24} strokeWidth={2} /></span><strong>System Alert</strong><p>전방 구간에 지연이 감지됐어요.<br />대안 경로로 변경하시겠어요?</p></div>
                  <div className="alternative-sheet">
                    <span className="sheet-grabber" />
                    <small>ALTERNATIVE OPTION · SMART SWITCH</small>
                    <PrototypeRouteMap variant="alternative" destination={displayDestination} />
                    <div className="alternative-copy"><b>[대안 제안]</b><strong>{scenario.transport.alternatives.at(-1)} 경로 추천</strong><p>예상 도착 7분 단축 · 계단 이용 0개</p></div>
                    <div className="alternative-actions"><button type="button" onClick={() => setIncident(false)}>원래대로 진행</button><button type="button" onClick={() => { setIncident(false); setTransportMode(scenario.transport.alternatives.at(-1) || scenario.transport.recommended); }}>대안 경로로 변경</button></div>
                  </div>
                </>}
              </div>
            )}

            {step === 'arrival' && scenario && (
              <div className="panel-body arrival-screen screen-enter">
                <div className="arrival-mark"><span><CircleCheckBig aria-hidden="true" size={24} strokeWidth={2} /></span></div><p className="step-label">STEP 05 · ARRIVAL</p>
                <h2>{scenario.arrivalMessage}</h2><p className="arrival-sub">마지막 출구와 동선까지 오늘의 상태에 맞춰 안내했어요.</p>
                <div className="impact-card"><span>오늘 PickGo가 아껴드린 것</span><strong>{scenario.impact}</strong><div className="impact-bars"><i /><i /><i /><i /></div></div>
                <div className="arrival-stats"><div><strong>{scenario.minutes}분</strong><span>이동 시간</span></div><div><strong>{scenario.walk}</strong><span>걸은 거리</span></div><div><strong>{transportMode}</strong><span>최종 수단</span></div></div>
                <button className="primary-button" type="button" onClick={resetDemo}>다른 조건으로 다시 체험하기 <span><RotateCcw aria-hidden="true" size={24} strokeWidth={2} /></span></button>
              </div>
            )}
              </section>
              <div className="device-homebar" />
            </div>
            <p className="prototype-tap-hint"><span><Circle aria-hidden="true" size={24} strokeWidth={2} /></span> 목적지와 상태를 선택해 전체 흐름을 직접 눌러보세요.</p>
          </div>
        </div>
      </section>

      <ScreenGallery />

      <section className="story-section" id="story">
        <div className="story-lead-grid">
          <div className="story-intro"><p className="eyebrow">WHY PICKGO</p><h2>정보가 많아서가 아니라,<br />결정할 것이 많아서 힘들었습니다.</h2><p>목적지를 입력한 뒤 다시 조건을 고르고, 여러 경로를 비교하는 대신 PickGo는 목적지와 상태를 함께 받아 하나의 행동으로 연결합니다.</p></div>
          <aside className="story-principle" aria-label="PickGo 핵심 원칙">
            <span>PICKGO CORE</span>
            <Route aria-hidden="true" />
            <strong>오늘의 상태까지 이해한<br />하나의 추천 경로</strong>
            <p>가장 빠른 길만 계산하지 않고,<br />지금 실제로 이동하기 좋은 길을 제안합니다.</p>
            <div><b>상태 반영</b><b>1–PATH</b><b>즉시 안내</b></div>
          </aside>
        </div>
        <div className="story-decision-flow" aria-label="기존 경로 탐색과 PickGo의 의사결정 과정 비교">
          <div className="story-flow-copy">
            <small>DECISION FLOW</small>
            <h3>세 번의 판단을,<br />한 번의 선택으로.</h3>
          </div>
          <div className="story-step-track">
            <article><span><Search aria-hidden="true" /></span><small>STEP 01</small><strong>목적지 검색</strong></article>
            <ArrowRight aria-hidden="true" className="story-step-arrow" />
            <article><span><ListFilter aria-hidden="true" /></span><small>STEP 02</small><strong>조건 다시 설정</strong></article>
            <ArrowRight aria-hidden="true" className="story-step-arrow" />
            <article><span><GitCompareArrows aria-hidden="true" /></span><small>STEP 03</small><strong>여러 경로 비교</strong></article>
            <ArrowRight aria-hidden="true" className="story-step-arrow" />
            <article className="pickgo-step"><span><Route aria-hidden="true" /></span><small>PICKGO</small><strong>지금 맞는 길 1개</strong></article>
          </div>
        </div>
      </section>

      <section className="research-evidence-section" aria-labelledby="research-evidence-title">
        <div className="research-evidence-head">
          <p className="eyebrow">USER RESEARCH · 10 PARTICIPANTS</p>
          <h2 id="research-evidence-title">사용자는 더 많은 경로보다,<br />믿고 갈 하나의 경로를 원했습니다.</h2>
          <p>2026년 4월 출퇴근자와 지도 앱 사용자 10명을 대상으로 이동 중 불편과 단일 경로 제안에 대한 선호를 확인했습니다.</p>
        </div>

        <div className="research-preference-card">
          <div className="preference-score">
            <div className="preference-ring" aria-label="단일 경로 선호도 5점 만점에 4.2점"><span><strong>4.2</strong><small>/ 5.0</small></span></div>
            <div><small>SINGLE PATH PREFERENCE</small><h3>단일 경로 제안 선호도</h3><p>응답자의 80%가 4점 이상으로 평가했습니다.</p></div>
          </div>
          <div className="preference-comparison" aria-label="사용자 조사 결과 비교">
            <div><span><b>기존 앱의 변수 대응 만족도</b><em>3.4 / 5</em></span><i><u style={{ width: '68%' }} /></i></div>
            <div className="highlight"><span><b>PickGo 단일 경로 선호도</b><em>4.2 / 5</em></span><i><u style={{ width: '84%' }} /></i></div>
          </div>
          <div className="preference-distribution">
            <span><i style={{ height: '40%' }} /><b>5점</b><small>40%</small></span>
            <span><i style={{ height: '40%' }} /><b>4점</b><small>40%</small></span>
            <span><i style={{ height: '20%' }} /><b>3점</b><small>20%</small></span>
          </div>
          <div className="research-key-stat"><strong>80%</strong><span>패닉 상황에서<br /><b>도움 모드가 매우 필요</b></span></div>
        </div>

        <div className="research-voices">
          <article className="research-voice-card">
            <div className="research-person-photo"><Image src="/research-pregnant.png" alt="지하철 엘리베이터 앞의 임산부 이용자" fill sizes="(max-width: 780px) 100vw, 33vw" /></div>
            <blockquote><Quote aria-hidden="true" /><p>“임신한 날에는 몇 분 빠른 길보다<br /><strong>엘리베이터와 덜 걷는 동선</strong>이 더 중요해요.”</p><footer><b>리서치 페르소나 · 임산부</b><span>에너지 보존형 이동 니즈</span></footer></blockquote>
          </article>
          <article className="research-voice-card">
            <div className="research-person-photo"><Image src="/research-wheelchair.png" alt="넓은 지하철 통로를 이동하는 휠체어 이용자" fill sizes="(max-width: 780px) 100vw, 33vw" /></div>
            <blockquote><Quote aria-hidden="true" /><p>“계단이 한 구간이라도 포함되면<br /><strong>그 경로는 제게 선택지가 아니에요.</strong>”</p><footer><b>리서치 페르소나 · 휠체어 이용자</b><span>배리어프리 경로 니즈</span></footer></blockquote>
          </article>
          <article className="research-voice-card">
            <div className="research-person-photo luggage-photo"><Image src="/research-luggage.png" alt="지하철에서 캐리어를 끄는 이용자" fill sizes="(max-width: 780px) 100vw, 33vw" /></div>
            <blockquote><Quote aria-hidden="true" /><p>“짐이 많을 때는 최단 시간보다<br /><strong>계단이 없고 덜 걷는 경로</strong>가 필요해요.”</p><footer><b>리서치 페르소나 · 짐이 많은 이용자</b><span>최소 보행 경로 니즈</span></footer></blockquote>
          </article>
        </div>
        <p className="research-source-note">SOURCE · PickGo 사용자 인터뷰 및 타깃 사용자 그룹, 2026.04.03–04.05 · n=10 · 인물과 문구는 익명성 보호를 위해 리서치 기반으로 재구성했습니다.</p>
      </section>

      <section className="system-flow-section" id="flow">
        <div className="system-flow-head"><p className="eyebrow">PICKGO USER FLOW</p><h2>입력부터 도착까지,<br />판단은 줄이고 대응은 빠르게.</h2><p>첨부 플로우의 핵심 원리를 포트폴리오 데모에 맞춰 실제 인터랙션으로 단순화했습니다.</p></div>
        <div className="system-flow-grid">
          <FlowCard no="01" title="통합 입력" subtitle="Combined Input" items={['목적지 직접 입력', '현재 상태 원탭 선택']} accent="green" />
          <FlowCard no="02" title="가중치 매칭" subtitle="Mock Logic Engine" items={['교통·날씨 예시 데이터', '상태별 우선순위 계산']} accent="blue" />
          <FlowCard no="03" title="결정과 안내" subtitle="1-Path Decision" items={['최적 경로 1개', '추천 이동수단 매칭']} accent="green" />
          <FlowCard no="04" title="능동 대응" subtitle="Active Guard" items={['지연 예시 감지', '원탭 수단 전환']} accent="orange" />
          <FlowCard no="05" title="도착 완료" subtitle="Arrival" items={['최종 출구 안내', '절약 가치 리포트']} accent="green" />
        </div>
        <div className="key-logic-bar"><div><span>KEY 01</span><strong>목적지+상태 동시 입력</strong><small>중간 비교 화면 생략</small></div><i /><div><span>KEY 02</span><strong>배리어프리 우선순위</strong><small>비·짐·통증에 따라 가중치 변경</small></div><i /><div><span>KEY 03</span><strong>스마트 리라우팅</strong><small>돌발 상황에 이동수단까지 재매칭</small></div></div>
      </section>

      <section className="reference-section">
        <div className="reference-head"><div><p className="eyebrow">UX REFERENCE</p><h2>검증된 이동 UX를<br />PickGo의 맥락으로.</h2></div><p>Transit의 행동 안내, Citymapper의 단계별 정보, Moovit의 상황 맞춤 추천 원리를 PickGo의 통합 입력과 동적 가중치에 결합했습니다.</p></div>
        <div className="reference-grid">
          <article className="reference-card featured"><div className="reference-no">01 <span>PRIMARY</span></div><h3>Transit</h3><p>사용자가 행동해야 하는 순간에 맞춘 GO 안내와 혼잡도 제보.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>단일 추천 → GO 안내<br />→ 혼잡도 원탭 제보</strong></div></article>
          <article className="reference-card"><div className="reference-no">02</div><h3>Citymapper</h3><p>걷기·탑승·환승·하차 단계마다 가장 필요한 정보만 제공.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>출발 전 혼잡 → 이동 중 환승<br />→ 도착 전 하차 정보</strong></div></article>
          <article className="reference-card"><div className="reference-no">03</div><h3>Moovit</h3><p>교통 상황과 사용자 맥락을 함께 고려하는 적합 경로 추천.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>가장 빠른 길보다<br />지금 나에게 적합한 길</strong></div></article>
        </div>
      </section>

      <section className="research-strip"><div><span>PICKGO PRINCIPLE</span><blockquote>목적지는 하나,<br />오늘의 최적 경로도 하나.</blockquote><p>모든 데이터와 추천은 포트폴리오용 Mock Data입니다.</p></div><button type="button" onClick={resetDemo}>PickGo 다시 체험하기 <span><ArrowUpRight aria-hidden="true" size={24} strokeWidth={2} /></span></button></section>
      <a className="go-to-top" href="#top" aria-label="페이지 맨 위로 이동"><ArrowUp aria-hidden="true" size={24} strokeWidth={2} /><span>TOP</span></a>
      <footer className="site-footer"><div className="brand"><PickGoLogo /></div><p>당신의 컨디션에 딱 맞는, 단 하나의 확신 경로.</p><span>UX PORTFOLIO · 2026</span></footer>
    </main>
  );
}

function ScreenGallery() {
  return (
    <section className="screen-gallery-section" aria-labelledby="screen-gallery-title">
      <div className="screen-gallery-head">
        <p className="eyebrow">PICKGO SCREEN OVERVIEW</p>
        <h2 id="screen-gallery-title">한 번의 입력부터 이동 중 대응까지.</h2>
        <p>인터랙티브 프로토타입의 핵심 장면을 실제 앱 화면처럼 한눈에 비교할 수 있도록 정리했습니다.</p>
      </div>

      <div className="screen-gallery-grid">
        <article className="screen-capture-card">
          <div className="screen-capture-label"><span>[HM–002]</span><strong>Main Home · Combined Input</strong></div>
          <div className="capture-device">
            <div className="capture-statusbar"><strong>9:41</strong><span><Signal aria-hidden="true" /><Wifi aria-hidden="true" /><BatteryFull aria-hidden="true" /></span></div>
            <div className="capture-search">
              <div><Search aria-hidden="true" /><span>검색</span><UserRound aria-hidden="true" /></div>
              <div><MapPin aria-hidden="true" /><span>강남역</span><b>집</b><b>회사</b></div>
            </div>
            <div className="capture-quick"><span>시청역</span><span>홍대입구역</span><span>강남역</span></div>
            <div className="capture-map-home"><PrototypeRouteMap variant="home" destination="강남역" /></div>
            <div className="capture-sheet capture-input-sheet">
              <i />
              <small>COMBINED INPUT</small>
              <h3>지금 어떤 이동이 필요하세요?</h3>
              <div className="capture-condition-row">
                <span className="urgent"><Zap aria-hidden="true" /><b>급해요</b></span>
                <span><Moon aria-hidden="true" /><b>피곤해요</b></span>
                <span className="selected"><Accessibility aria-hidden="true" /><b>배려가 필요해요</b></span>
                <span className="selected"><Briefcase aria-hidden="true" /><b>짐이 많아요</b></span>
                <span className="urgent"><Clock aria-hidden="true" /><b>늦으면 안 돼요</b></span>
              </div>
              <button type="button">추천 경로 보기 <ArrowRight aria-hidden="true" /></button>
            </div>
            <span className="capture-homebar" />
          </div>
        </article>

        <article className="screen-capture-card">
          <div className="screen-capture-label"><span>[PA–001]</span><strong>Single-Path Matched · PickGo’s Choice</strong></div>
          <div className="capture-device">
            <div className="capture-statusbar"><strong>9:41</strong><span><Signal aria-hidden="true" /><Wifi aria-hidden="true" /><BatteryFull aria-hidden="true" /></span></div>
            <div className="capture-choice-head"><small>PICKGO’S CHOICE</small><p><strong>짐이 많아요</strong> 상태와</p><h3><em>98%</em> 일치하는 경로입니다</h3><i><span /></i></div>
            <article className="capture-route-card">
              <div><span>P</span><p><strong>강남역</strong><small>Route Card · 1-Path Matched</small></p><b>31분</b></div>
              <div className="capture-map-route"><PrototypeRouteMap variant="route" destination="강남역" /></div>
              <p className="capture-transit"><span><TrainFront aria-hidden="true" /> 지하철 4호선 → 2호선</span><b>환승 1회</b></p>
              <small>MATCHED REASON DATA</small>
              <div className="capture-reasons"><span><Check aria-hidden="true" /> 엘리베이터 중심</span><span><Check aria-hidden="true" /> 계단 최소</span><span><Check aria-hidden="true" /> 실내 연결</span></div>
            </article>
            <div className="capture-metrics"><span><strong>420m</strong><small>총 도보</small></span><span><strong>1,500원</strong><small>예상 비용</small></span><span><strong>보통</strong><small>혼잡 예상</small></span></div>
            <button className="capture-primary-button" type="button">GO · 안내 시작 <ArrowRight aria-hidden="true" /></button>
            <span className="capture-homebar" />
          </div>
        </article>

        <article className="screen-capture-card">
          <div className="screen-capture-label"><span>[DR–002]</span><strong>Active Guard · Smart Re-routing</strong></div>
          <div className="capture-device capture-guard-device">
            <div className="capture-statusbar"><strong>9:41</strong><span><Signal aria-hidden="true" /><Wifi aria-hidden="true" /><BatteryFull aria-hidden="true" /></span></div>
            <div className="capture-guard-map"><PrototypeRouteMap variant="guide" destination="강남역" /></div>
            <div className="capture-guard-search"><Search aria-hidden="true" /><strong>강남역</strong><X aria-hidden="true" /></div>
            <div className="capture-guard-dim" />
            <div className="capture-alert"><TriangleAlert aria-hidden="true" /><strong>System Alert</strong><p>전방 구간에 지연이 감지됐어요.<br />대안 경로로 변경하시겠어요?</p></div>
            <div className="capture-alternative-sheet">
              <i />
              <small>ALTERNATIVE OPTION · SMART SWITCH</small>
              <div className="capture-alt-map"><PrototypeRouteMap variant="alternative" destination="대안 경로" /></div>
              <p><b>[대안 제안]</b><strong>저상버스 + 택시 경로 추천</strong><span>예상 도착 7분 단축 · 계단 이용 0개</span></p>
              <div><button type="button">원래대로 진행</button><button type="button">대안 경로로 변경</button></div>
            </div>
            <span className="capture-homebar" />
          </div>
        </article>
      </div>
    </section>
  );
}

function PickGoLogo() {
  return <span className="pickgo-logo-image" aria-label="PickGo"><Image src="/pickgo_logo.png" alt="" width={140} height={70} priority /></span>;
}

function getContextTone(item: string) {
  if (/지연 없음|위험 낮음|계단|엘리베이터|개찰구|좌석|도보 최소|환승 없음|실내/.test(item)) return 'success';
  if (/혼잡|붐비/.test(item)) return 'warning';
  if (/지연|운행 문제/.test(item)) return 'danger';
  if (/시간|개방|비 /.test(item)) return 'time';
  return 'neutral';
}

function PrototypeRouteMap({ variant, destination }: { variant: 'home' | 'route' | 'guide' | 'alternative'; destination: string }) {
  const mapTiles = [
    'osm-16-55881-25380.png', 'osm-16-55882-25380.png', 'osm-16-55883-25380.png',
    'osm-16-55881-25381.png', 'osm-16-55882-25381.png', 'osm-16-55883-25381.png',
    'osm-16-55881-25382.png', 'osm-16-55882-25382.png', 'osm-16-55883-25382.png',
  ];
  return (
    <div className={`coded-route-map map-${variant}`} aria-label={`${destination} 예시 경로 지도`}>
      <div className="local-map-tiles" aria-hidden="true">{mapTiles.map((tile) => <Image key={tile} src={`/map/${tile}`} alt="" width={256} height={256} draggable={false} unoptimized />)}</div>
      <span className="map-soft-overlay" />
      <ContinuousRouteLine variant={variant} />
      <i className="route-origin" /><i className="route-stop" /><i className="route-destination" />
      <small className="coded-map-label">{destination}</small>
      <a className="map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap</a>
    </div>
  );
}

function ContinuousRouteLine({ variant }: { variant: 'home' | 'route' | 'guide' | 'alternative' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const drawRoute = () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (!width || !height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(height * pixelRatio);
      const context = canvas.getContext('2d');
      if (!context) return;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.clearRect(0, 0, width, height);

      const points = variant === 'alternative'
        ? [[0.18, 0.72], [0.38, 0.44], [0.64, 0.6], [0.94, 0.31]]
        : [[0.18, 0.72], [0.42, 0.4], [0.68, 0.52], [0.94, 0.31]];
      const trace = () => {
        context.beginPath();
        points.forEach(([x, y], index) => {
          if (index === 0) context.moveTo(x * width, y * height);
          else context.lineTo(x * width, y * height);
        });
      };

      context.lineCap = 'round';
      context.lineJoin = 'round';
      trace();
      context.strokeStyle = 'rgba(255,255,255,.96)';
      context.lineWidth = Math.max(9, Math.min(13, width / 32));
      context.stroke();
      trace();
      context.strokeStyle = variant === 'alternative' ? '#3384ff' : '#0064ff';
      context.lineWidth = Math.max(5, Math.min(7, width / 60));
      context.stroke();
    };

    drawRoute();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(drawRoute);
    observer?.observe(canvas);
    window.addEventListener('resize', drawRoute);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', drawRoute);
    };
  }, [variant]);

  return <canvas ref={canvasRef} className="continuous-route-canvas" aria-hidden="true" />;
}

function FlowCard({ no, title, subtitle, items, accent }: { no: string; title: string; subtitle: string; items: string[]; accent: string }) {
  return <article className={`flow-card ${accent}`}><span className="flow-no">STEP {no}</span><div className="flow-icon">{no}</div><h3>{title}</h3><small>{subtitle}</small><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

function MapBackdrop({ active, urgent }: { active: boolean; urgent: boolean }) {
  return <div className={`map-grid ${active ? 'map-active' : ''} ${urgent ? 'map-urgent' : ''}`} aria-hidden="true"><span className="road road-a" /><span className="road road-b" /><span className="road road-c" /><span className="map-label label-a">CITY HALL</span><span className="map-label label-b">SEOUL STATION</span><span className="route-dots"><i /><i /><i /><i /><i /></span></div>;
}
