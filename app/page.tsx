'use client';

import { useEffect, useMemo, useState } from 'react';
import { ConditionId, conditions, destinations, scenarios } from './mock-data';

type Step = 'input' | 'matching' | 'route' | 'guide' | 'arrival';

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
  const progress = useMemo(() => ({ input: 18, matching: 40, route: 62, guide: 84, arrival: 100 }[step]), [step]);

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
        <a className="brand" href="#top" aria-label="PickGo 홈"><span className="brand-dot">P</span><span>PickGo</span></a>
        <div className="demo-pill"><span /> PORTFOLIO DEMO</div>
        <a className="about-link" href="#flow">서비스 구조 <span>↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">ONE INPUT · ONE DECISION</p>
          <h1>목적지와 오늘의 나,<br /><em>한 번에 알려주세요.</em></h1>
          <p className="lead">검색하고, 필터를 고르고, 경로를 비교하는 과정 없이<br />PickGo가 지금 가장 적합한 한 가지 길로 연결해요.</p>
          <div className="hero-flow-mini" aria-label="PickGo 이용 순서">
            <span className={step === 'input' ? 'active' : ''}>통합 입력</span><i>→</i>
            <span className={step === 'matching' ? 'active' : ''}>가중치 매칭</span><i>→</i>
            <span className={step === 'route' || step === 'guide' ? 'active' : ''}>이동 안내</span><i>→</i>
            <span className={step === 'arrival' ? 'active' : ''}>도착</span>
          </div>
        </div>

        <div className="demo-stage flow-demo-stage">
          <MapBackdrop active={step === 'guide'} urgent={selected === 'urgent'} />
          <section className={`condition-panel flow-panel ${selected === 'urgent' && step === 'guide' ? 'assistive' : ''}`} aria-label="PickGo 통합 경로 체험">
            <div className="panel-head">
              <span className="location-dot" /><span>출발지</span><strong>서울역</strong>
              {step !== 'input' && <button className="restart-mini" type="button" onClick={resetDemo}>처음부터</button>}
            </div>
            <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

            {step === 'input' && (
              <div className="panel-body combined-screen screen-enter">
                <p className="step-label">STEP 01 · 목적지 + 상태 통합 입력</p>
                <h2>어디로, 어떤 상태로<br />이동하시나요?</h2>
                <label className="destination-field combined-field">
                  <span className="field-pin">●</span>
                  <span className="field-content"><small>목적지</small><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="목적지를 입력해주세요" /></span>
                  {destination && <button type="button" onClick={() => setDestination('')} aria-label="목적지 지우기">×</button>}
                </label>
                <div className="quick-destinations combined-quick">{destinations.map((item) => <button type="button" key={item} onClick={() => setDestination(item)}>{item}</button>)}</div>

                <div className="combined-divider"><span>그리고</span></div>
                <div className="status-title"><div><strong>지금 내 상태</strong><small>한 가지만 선택해도 충분해요</small></div>{condition && <span>선택 완료 ✓</span>}</div>
                <div className="condition-grid combined-grid">
                  {conditions.map((item) => {
                    const active = selected === item.id;
                    return (
                      <button key={item.id} className={`condition-card compact ${item.id === 'barrierFree' ? 'wide' : ''} ${active ? 'selected' : ''}`} onClick={() => setSelected(item.id)} aria-pressed={active} type="button">
                        <span className={`condition-mark ${item.tone}`}>{item.mark}</span>
                        <span className="condition-text"><strong>{item.label}</strong><small>{item.detail}</small></span><span className="check">✓</span>
                      </button>
                    );
                  })}
                </div>
                <div className="mock-context-line"><span>예시 환경</span><b>비 30%</b><b>혼잡 보통</b><b>교통 정상</b></div>
                <button className="primary-button" disabled={!selected || !destination.trim()} type="button" onClick={startMatching}>{selected && destination.trim() ? '한 가지 최적 경로 찾기' : '목적지와 상태를 모두 선택해주세요'}<span>→</span></button>
                <p className="privacy-note">실시간 API가 아닌 포트폴리오용 예시 데이터로 동작해요.</p>
              </div>
            )}

            {step === 'matching' && scenario && (
              <div className="panel-body matching-screen screen-enter" role="status" aria-live="polite">
                <div className="logic-orbit"><span>P</span><i /><i /><i /></div>
                <p className="step-label">STEP 02 · PICKGO LOGIC ENGINE</p>
                <h2>{condition?.label.replace('요', '')} 상태에 맞춰<br />경로 가중치를 계산해요.</h2>
                <div className="matching-inputs"><span>출발 · 서울역</span><i>+</i><span>도착 · {displayDestination}</span><i>+</i><span>상태 · {condition?.label}</span></div>
                <div className="logic-cards">
                  <div className="logic-card done"><span>✓</span><div><strong>예시 교통·날씨 데이터</strong><small>혼잡 보통 · 비 30% · 지연 없음</small></div></div>
                  <div className="logic-card active"><span>↻</span><div><strong>상태별 동적 가중치</strong><small>{selected === 'barrierFree' ? '계단 제외 ∞ · 엘리베이터 최우선' : selected === 'luggage' ? '계단 제외 · 넓은 개찰구 우선' : selected === 'tired' ? '도보 최소 · 좌석 가능성 우선' : selected === 'urgent' ? '도착 시간 · 조작 단계 최우선' : '지연 위험 · 도착 편차 최우선'}</small></div></div>
                  <div className="logic-card"><span>03</span><div><strong>단일 경로 + 이동수단 결정</strong><small>중간 비교 없이 1개 결과로 연결</small></div></div>
                </div>
                <div className="matching-loader"><span /><small>Mock Engine이 추천 결과를 만들고 있어요</small></div>
              </div>
            )}

            {step === 'route' && scenario && (
              <div className="panel-body route-screen screen-enter">
                <div className="route-topline"><button className="back-button" type="button" onClick={() => setStep('input')}>← 입력 수정</button><span className="live-badge"><i /> EXAMPLE DATA</span></div>
                <p className="step-label">STEP 03 · 지금 추천 경로 1개</p>
                <div className="choice-heading"><div><h2>{displayDestination}</h2><p>{scenario.destinationDetail}</p></div><div className="fit-score"><strong>{scenario.fit}</strong><small>% 적합</small></div></div>
                <div className="route-summary"><div><strong>{scenario.minutes}<small>분</small></strong><span>예상 시간</span></div><i /><div><strong>{scenario.walk}</strong><span>총 도보</span></div><i /><div><strong>{scenario.cost}</strong><span>예상 비용</span></div></div>
                <div className="reason-card"><span className="reason-icon">P</span><div><strong>{scenario.routeLabel}</strong><p>{scenario.reason}</p></div></div>
                <div className="transport-match">
                  <div className="transport-copy"><small>추천 이동수단</small><strong>{transportMode}</strong><span>{scenario.transport.note}</span></div>
                  <div className="transport-options"><button type="button" onClick={() => setTransportMode(scenario.transport.recommended)} className={transportMode === scenario.transport.recommended ? 'selected' : ''}>{scenario.transport.recommended}</button>{scenario.transport.alternatives.map((item) => <button type="button" key={item} onClick={() => setTransportMode(item)} className={transportMode === item ? 'selected' : ''}>{item}</button>)}</div>
                </div>
                <div className="context-row">{scenario.context.map((item) => <span key={item}>✓ {item}</span>)}</div>
                <ol className="route-steps">{scenario.steps.map((item, index) => <li key={item.label}><span className="step-mode">{item.mode}</span><div><small className="phase-label">{item.phase}</small><strong>{item.label}</strong><small>{item.detail}</small></div>{index < scenario.steps.length - 1 && <i />}</li>)}</ol>
                <button className="primary-button" type="button" onClick={startGuide}>GO · 행동 안내 시작 <span>→</span></button>
              </div>
            )}

            {step === 'guide' && scenario && (
              <div className={`guide-screen screen-enter ${selected === 'urgent' ? 'urgent-guide' : ''}`}>
                <div className="guide-map">
                  <div className="guide-route-line"><i /><span /><b /></div>
                  <span className="map-place place-one">서울역</span><span className="map-place place-two">{displayDestination}</span>
                  <div className="live-float"><i /> ACTIVE GUARD · DEMO</div>
                  {incident && <div className="incident-float"><strong>!</strong><div><b>앞 구간 지연 감지</b><span>더 안정적인 이동수단을 찾았어요.</span></div></div>}
                </div>
                <div className="guide-sheet">
                  <div className="guide-meta"><span>STEP 04 · 지금 해야 할 일</span><strong>{Math.max(1, scenario.minutes - guideIndex * Math.ceil(scenario.minutes / 3))}분 남음</strong></div>
                  <div className="journey-phases">{scenario.steps.map((item, index) => <div key={item.phase} className={index === guideIndex ? 'active' : index < guideIndex ? 'done' : ''}><span>{index < guideIndex ? '✓' : index + 1}</span><small>{item.phase}</small></div>)}</div>
                  <div className="next-action"><span className="turn-arrow">{guideIndex === scenario.steps.length - 1 ? '↓' : guideIndex === 1 ? '↑' : '↱'}</span><div><strong>{scenario.steps[guideIndex].label}</strong><p>{scenario.steps[guideIndex].detail}</p></div></div>
                  <div className="guide-progress"><span style={{ width: `${((guideIndex + 1) / scenario.steps.length) * 100}%` }} /></div>
                  <div className="live-context"><span><i /> ETA 예시 업데이트</span><span>혼잡 {congestionReport || scenario.congestion.level}</span></div>

                  {selected === 'urgent' && <button className={`sos-button ${shared ? 'shared' : ''}`} type="button" onClick={() => setShared(!shared)}><span>{shared ? '✓' : 'SOS'}</span><div><strong>{shared ? '위치 공유 데모가 켜졌어요' : '보호자 위치 공유 데모'}</strong><small>실제 위치는 전송되지 않아요</small></div></button>}

                  {selected !== 'urgent' && <div className="crowd-report-wrap"><button className="crowd-report-trigger" type="button" onClick={() => setShowReport(!showReport)}><span className="crowd-symbol"><i /><i /><i /></span><div><strong>{congestionReport ? `혼잡도 ‘${congestionReport}’ 제보 완료` : '지금 혼잡도를 알려주세요'}</strong><small>다음 이동자를 돕는 원탭 제보 · 데모</small></div><b>{showReport ? '닫기' : '제보'}</b></button>{showReport && <div className="crowd-options">{['여유', '보통', '혼잡'].map((level) => <button key={level} type="button" onClick={() => { setCongestionReport(level); setShowReport(false); }}>{level}</button>)}</div>}</div>}

                  {!incident && guideIndex === 1 && <button className="secondary-button" type="button" onClick={() => setIncident(true)}>실시간 변수 대응 체험 <span>↗</span></button>}
                  {incident && <button className="reroute-button" type="button" onClick={() => { setIncident(false); setTransportMode(scenario.transport.alternatives.at(-1) || scenario.transport.recommended); }}><span>↗</span><div><strong>{scenario.transport.alternatives.at(-1)}로 스마트 스위칭</strong><small>예상 지연 7분을 피하는 예시 제안</small></div><b>변경</b></button>}
                  <button className="primary-button finish-button" type="button" onClick={advanceGuide}>{guideIndex === scenario.steps.length - 1 ? '도착 완료' : `다음 · ${scenario.steps[guideIndex + 1].phase}`} <span>→</span></button>
                  <button className="text-button" type="button" onClick={resetDemo}>안내 종료</button>
                </div>
              </div>
            )}

            {step === 'arrival' && scenario && (
              <div className="panel-body arrival-screen screen-enter">
                <div className="arrival-mark"><span>✓</span></div><p className="step-label">STEP 05 · ARRIVAL</p>
                <h2>{scenario.arrivalMessage}</h2><p className="arrival-sub">마지막 출구와 동선까지 오늘의 상태에 맞춰 안내했어요.</p>
                <div className="impact-card"><span>오늘 PickGo가 아껴드린 것</span><strong>{scenario.impact}</strong><div className="impact-bars"><i /><i /><i /><i /></div></div>
                <div className="arrival-stats"><div><strong>{scenario.minutes}분</strong><span>이동 시간</span></div><div><strong>{scenario.walk}</strong><span>걸은 거리</span></div><div><strong>{transportMode}</strong><span>최종 수단</span></div></div>
                <button className="primary-button" type="button" onClick={resetDemo}>다른 조건으로 다시 체험하기 <span>↻</span></button>
              </div>
            )}
          </section>
        </div>
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

      <section className="story-section" id="story">
        <div className="story-intro"><p className="eyebrow">WHY PICKGO</p><h2>정보가 많아서가 아니라,<br />결정할 것이 많아서 힘들었습니다.</h2><p>목적지를 입력한 뒤 다시 조건을 고르고, 여러 경로를 비교하는 대신 PickGo는 목적지와 상태를 함께 받아 하나의 행동으로 연결합니다.</p></div>
        <div className="insight-number"><span>단일 경로 선호도</span><strong>4.2</strong><small>5점 만점 · 사용자 조사 10명</small></div>
        <div className="value-grid">
          <article><span>01</span><h3>Combined Input</h3><p>목적지와 상태를 한 화면에서 받아 불필요한 설정 단계를 줄입니다.</p></article>
          <article><span>02</span><h3>Dynamic Weighting</h3><p>급함, 피로, 짐, 이동 불편에 따라 경로의 우선순위를 다르게 계산합니다.</p></article>
          <article><span>03</span><h3>Active Guard</h3><p>이동 중 변수에는 재검색 대신 이동수단 전환과 우회 경로를 제안합니다.</p></article>
        </div>
      </section>

      <section className="reference-section">
        <div className="reference-head"><div><p className="eyebrow">UX REFERENCE</p><h2>검증된 이동 UX를<br />PickGo의 맥락으로.</h2></div><p>Transit의 행동 안내, Citymapper의 단계별 정보, Moovit의 상황 맞춤 추천 원리를 PickGo의 통합 입력과 동적 가중치에 결합했습니다.</p></div>
        <div className="reference-grid">
          <article className="reference-card featured"><div className="reference-no">01 <span>PRIMARY</span></div><h3>Transit</h3><p>사용자가 행동해야 하는 순간에 맞춘 GO 안내와 혼잡도 제보.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>단일 추천 → GO 안내<br />→ 혼잡도 원탭 제보</strong></div></article>
          <article className="reference-card"><div className="reference-no">02</div><h3>Citymapper</h3><p>걷기·탑승·환승·하차 단계마다 가장 필요한 정보만 제공.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>출발 전 혼잡 → 이동 중 환승<br />→ 도착 전 하차 정보</strong></div></article>
          <article className="reference-card"><div className="reference-no">03</div><h3>Moovit</h3><p>교통 상황과 사용자 맥락을 함께 고려하는 적합 경로 추천.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>가장 빠른 길보다<br />지금 나에게 적합한 길</strong></div></article>
        </div>
      </section>

      <section className="research-strip"><div><span>PICKGO PRINCIPLE</span><blockquote>목적지는 하나,<br />오늘의 최적 경로도 하나.</blockquote><p>모든 데이터와 추천은 포트폴리오용 Mock Data입니다.</p></div><button type="button" onClick={resetDemo}>PickGo 다시 체험하기 <span>↗</span></button></section>
      <footer className="site-footer"><div className="brand"><span className="brand-dot">P</span><span>PickGo</span></div><p>당신의 컨디션에 딱 맞는, 단 하나의 확신 경로.</p><span>UX PORTFOLIO · 2026</span></footer>
    </main>
  );
}

function FlowCard({ no, title, subtitle, items, accent }: { no: string; title: string; subtitle: string; items: string[]; accent: string }) {
  return <article className={`flow-card ${accent}`}><span className="flow-no">STEP {no}</span><div className="flow-icon">{no}</div><h3>{title}</h3><small>{subtitle}</small><ul>{items.map((item) => <li key={item}>{item}</li>)}</ul></article>;
}

function MapBackdrop({ active, urgent }: { active: boolean; urgent: boolean }) {
  return <div className={`map-grid ${active ? 'map-active' : ''} ${urgent ? 'map-urgent' : ''}`} aria-hidden="true"><span className="road road-a" /><span className="road road-b" /><span className="road road-c" /><span className="map-label label-a">CITY HALL</span><span className="map-label label-b">SEOUL STATION</span><span className="route-dots"><i /><i /><i /><i /><i /></span></div>;
}
