'use client';

import { useEffect, useMemo, useState } from 'react';
import { ConditionId, conditions, destinations, scenarios } from './mock-data';

type Step = 'condition' | 'destination' | 'route' | 'guide' | 'arrival';

export default function Home() {
  const [step, setStep] = useState<Step>('condition');
  const [selected, setSelected] = useState<ConditionId | ''>('');
  const [destination, setDestination] = useState('');
  const [incident, setIncident] = useState(false);
  const [shared, setShared] = useState(false);
  const [guideIndex, setGuideIndex] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [congestionReport, setCongestionReport] = useState('');
  const condition = conditions.find((item) => item.id === selected);
  const scenario = selected ? scenarios[selected] : null;
  const displayDestination = destination || scenario?.destination || '';

  const progress = useMemo(() => ({ condition: 20, destination: 40, route: 62, guide: 82, arrival: 100 }[step]), [step]);

  useEffect(() => {
    if (step === 'route' || step === 'guide' || step === 'arrival') {
      document.querySelector('.condition-panel')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [step]);

  function continueFromCondition() {
    if (!selected) return;
    if (selected === 'urgent') {
      setDestination(scenarios.urgent.destination);
      setStep('route');
    } else {
      setStep('destination');
    }
  }

  function resetDemo() {
    setStep('condition');
    setSelected('');
    setDestination('');
    setIncident(false);
    setShared(false);
    setGuideIndex(0);
    setShowReport(false);
    setCongestionReport('');
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
        <a className="about-link" href="#story">서비스 소개 <span>↘</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">CONTEXT-AWARE MOBILITY</p>
          <h1>길은 같아도,<br /><em>오늘의 나는 다르니까.</em></h1>
          <p className="lead">지금 내 컨디션을 알려주세요.<br />PickGo가 고민 없이 움직일 수 있는 단 하나의 길을 골라드려요.</p>
          <div className="proof-row" aria-label="PickGo 주요 가치">
            <div><strong>70%</strong><span>경로 결정 시간 단축 목표</span></div><i />
            <div><strong>4.2/5</strong><span>단일 경로 선호도</span></div>
          </div>
        </div>

        <div className="demo-stage">
          <MapBackdrop active={step === 'guide'} urgent={selected === 'urgent'} />
          <section className={`condition-panel ${selected === 'urgent' && step === 'guide' ? 'assistive' : ''}`} aria-label="PickGo 체험 화면">
            <div className="panel-head">
              <span className="location-dot" /><span>현재 위치</span><strong>서울역</strong>
              {step !== 'condition' && <button className="restart-mini" type="button" onClick={resetDemo}>처음부터</button>}
            </div>
            <div className="progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

            {step === 'condition' && (
              <div className="panel-body screen-enter">
                <p className="step-label">STEP 01 · 내 상태 체크</p>
                <h2>오늘 이동은<br />어떤 도움이 필요하세요?</h2>
                <p className="helper">한 가지만 골라도 충분해요.</p>
                <div className="condition-grid">
                  {conditions.map((item) => {
                    const active = selected === item.id;
                    return (
                      <button key={item.id} className={`condition-card ${active ? 'selected' : ''}`} onClick={() => setSelected(item.id)} aria-pressed={active} type="button">
                        <span className={`condition-mark ${item.tone}`}>{item.mark}</span>
                        <span className="condition-text"><strong>{item.label}</strong><small>{item.detail}</small></span><span className="check">✓</span>
                      </button>
                    );
                  })}
                </div>
                {condition && <p className="care-message" role="status"><span>✓</span>{condition.feedback}</p>}
                <button className="primary-button" disabled={!selected} type="button" onClick={continueFromCondition}>{selected ? '이 상태에 맞는 길 찾기' : '내 상태를 선택해주세요'}<span>→</span></button>
                <p className="privacy-note"><span>⌁</span> 선택한 상태는 이 체험에만 사용돼요.</p>
              </div>
            )}

            {step === 'destination' && (
              <div className="panel-body screen-enter">
                <button className="back-button" type="button" onClick={() => setStep('condition')}>← 상태 다시 선택</button>
                <p className="step-label">STEP 02 · 목적지</p>
                <h2>어디까지<br />가면 될까요?</h2>
                <p className="care-message static"><span>✓</span>{condition?.feedback}</p>
                <label className="destination-field">
                  <span className="field-pin">●</span>
                  <span className="field-content"><small>도착지</small><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="목적지를 입력해주세요" autoFocus /></span>
                  {destination && <button type="button" onClick={() => setDestination('')} aria-label="목적지 지우기">×</button>}
                </label>
                <p className="quick-label">빠른 선택</p>
                <div className="quick-destinations">{destinations.map((item) => <button type="button" key={item} onClick={() => setDestination(item)}>{item}</button>)}</div>
                <button className="primary-button" disabled={!destination.trim()} type="button" onClick={() => setStep('route')}>PickGo가 한 길만 골라드릴게요 <span>→</span></button>
              </div>
            )}

            {step === 'route' && scenario && (
              <div className="panel-body route-screen screen-enter">
                <div className="route-topline"><button className="back-button" type="button" onClick={() => setStep(selected === 'urgent' ? 'condition' : 'destination')}>← 조건 수정</button><span className="live-badge"><i /> DEMO DATA</span></div>
                <p className="step-label">지금 추천 경로 · 1개만 먼저</p>
                <div className="choice-heading"><div><h2>{displayDestination}</h2><p>{scenario.destinationDetail}</p></div><div className="fit-score"><strong>{scenario.fit}</strong><small>% 적합</small></div></div>
                <div className="route-summary"><div><strong>{scenario.minutes}<small>분</small></strong><span>예상 시간</span></div><i /><div><strong>{scenario.walk}</strong><span>총 도보</span></div><i /><div><strong>{scenario.cost}</strong><span>예상 비용</span></div></div>
                <div className="reason-card"><span className="reason-icon">P</span><div><strong>{scenario.routeLabel}</strong><p>{scenario.reason}</p></div></div>
                <div className="context-row" aria-label="추천에 반영된 조건">{scenario.context.map((item) => <span key={item}>✓ {item}</span>)}</div>
                <div className={`crowd-forecast crowd-${scenario.congestion.level}`}><div className="crowd-symbol"><i /><i /><i /></div><div><strong>출발 전 혼잡 예상 · {scenario.congestion.level}</strong><small>{scenario.congestion.note}</small></div><span>예시</span></div>
                <ol className="route-steps">{scenario.steps.map((item, index) => <li key={item.label}><span className="step-mode">{item.mode}</span><div><small className="phase-label">{item.phase}</small><strong>{item.label}</strong><small>{item.detail}</small></div>{index < scenario.steps.length - 1 && <i />}</li>)}</ol>
                <button className="primary-button" type="button" onClick={startGuide}>GO · 행동 안내 시작 <span>→</span></button>
                <button className="text-button" type="button" onClick={() => setStep('condition')}>추천이 맞지 않나요? 상태 다시 선택</button>
              </div>
            )}

            {step === 'guide' && scenario && (
              <div className={`guide-screen screen-enter ${selected === 'urgent' ? 'urgent-guide' : ''}`}>
                <div className="guide-map">
                  <div className="guide-route-line"><i /><span /><b /></div>
                  <span className="map-place place-one">서울역</span><span className="map-place place-two">{displayDestination}</span>
                  <div className="live-float"><i /> GO 안내 중 · DEMO</div>
                  {incident && <div className="incident-float"><strong>!</strong><div><b>앞 구간 지연 감지</b><span>더 안정적인 길을 찾았어요.</span></div></div>}
                </div>
                <div className="guide-sheet">
                  <div className="guide-meta"><span>{selected === 'urgent' ? 'ASSISTIVE MODE' : 'ACTIVE GUIDE'}</span><strong>{Math.max(1, scenario.minutes - guideIndex * Math.ceil(scenario.minutes / 3))}분 남음</strong></div>
                  <div className="journey-phases" aria-label="이동 단계">{scenario.steps.map((item, index) => <div key={item.phase} className={index === guideIndex ? 'active' : index < guideIndex ? 'done' : ''}><span>{index < guideIndex ? '✓' : index + 1}</span><small>{item.phase}</small></div>)}</div>
                  <p className="moment-label">지금 해야 할 일</p>
                  <div className="next-action"><span className="turn-arrow">{guideIndex === scenario.steps.length - 1 ? '↓' : guideIndex === 1 ? '↑' : '↱'}</span><div><strong>{scenario.steps[guideIndex].label}</strong><p>{scenario.steps[guideIndex].detail}</p></div></div>
                  <div className="guide-progress"><span style={{ width: `${((guideIndex + 1) / scenario.steps.length) * 100}%` }} /></div>
                  <div className="live-context"><span><i /> ETA 업데이트됨</span><span>혼잡 {congestionReport || scenario.congestion.level}</span></div>
                  {selected === 'urgent' && (
                    <button className={`sos-button ${shared ? 'shared' : ''}`} type="button" onClick={() => setShared(!shared)}><span>{shared ? '✓' : 'SOS'}</span><div><strong>{shared ? '위치 공유 데모가 켜졌어요' : '보호자 위치 공유 데모'}</strong><small>{shared ? '실제 위치는 전송되지 않아요' : '눌러도 실제 전송되지 않아요'}</small></div></button>
                  )}
                  {selected !== 'urgent' && (
                    <div className="crowd-report-wrap">
                      <button className="crowd-report-trigger" type="button" onClick={() => setShowReport(!showReport)}><span className="crowd-symbol"><i /><i /><i /></span><div><strong>{congestionReport ? `혼잡도 ‘${congestionReport}’ 제보 완료` : '지금 칸의 혼잡도는 어떤가요?'}</strong><small>한 번의 탭으로 다음 이동자를 도와주세요 · 데모</small></div><b>{showReport ? '닫기' : '제보'}</b></button>
                      {showReport && <div className="crowd-options">{['여유', '보통', '혼잡'].map((level) => <button key={level} type="button" className={congestionReport === level ? 'selected' : ''} onClick={() => { setCongestionReport(level); setShowReport(false); }}>{level === '여유' ? '○' : level === '보통' ? '◐' : '●'} {level}</button>)}</div>}
                    </div>
                  )}
                  {!incident && selected !== 'urgent' && guideIndex === 1 && <button className="secondary-button" type="button" onClick={() => setIncident(true)}>돌발 상황 체험하기 <span>↗</span></button>}
                  {incident && <button className="reroute-button" type="button" onClick={() => setIncident(false)}><span>↗</span><div><strong>안전한 우회 경로로 변경</strong><small>예상 지연 7분을 피할 수 있어요</small></div><b>변경</b></button>}
                  <button className="primary-button finish-button" type="button" onClick={advanceGuide}>{guideIndex === scenario.steps.length - 1 ? '도착 완료' : `다음 · ${scenario.steps[guideIndex + 1].phase}`} <span>→</span></button>
                  <button className="text-button" type="button" onClick={resetDemo}>안내 종료</button>
                </div>
              </div>
            )}

            {step === 'arrival' && scenario && (
              <div className="panel-body arrival-screen screen-enter">
                <div className="arrival-mark"><span>✓</span></div><p className="step-label">ARRIVED · 도착 완료</p>
                <h2>{scenario.arrivalMessage}</h2><p className="arrival-sub">PickGo가 오늘의 컨디션에 맞춰 끝까지 함께했어요.</p>
                <div className="impact-card"><span>오늘 PickGo가 아껴드린 것</span><strong>{scenario.impact}</strong><div className="impact-bars"><i /><i /><i /><i /></div></div>
                <div className="arrival-stats"><div><strong>{scenario.minutes}분</strong><span>이동 시간</span></div><div><strong>{scenario.walk}</strong><span>걸은 거리</span></div><div><strong>안전</strong><span>도착 상태</span></div></div>
                <button className="primary-button" type="button" onClick={resetDemo}>다른 상황으로 다시 체험하기 <span>↻</span></button>
                <p className="privacy-note">도착과 함께 위치 공유 데모도 종료됐어요.</p>
              </div>
            )}
          </section>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-intro"><p className="eyebrow">WHY PICKGO</p><h2>정보가 많아서가 아니라,<br />결정할 것이 많아서 힘들었습니다.</h2><p>출구가 공사 중일 때, 짐을 들고 계단 앞에 섰을 때, 화장실이 급할 때. 기존 지도는 여전히 비교를 요구했습니다.</p></div>
        <div className="insight-number"><span>사용자 리서치</span><strong>10</strong><small>명의 실제 이동 경험에서 시작</small></div>
        <div className="value-grid">
          <article><span>01</span><h3>Selection Zero</h3><p>선택지를 나열하지 않고 지금의 나에게 맞는 경로 하나를 확신 있게 제안합니다.</p></article>
          <article><span>02</span><h3>Active Guide</h3><p>공사와 지연 같은 돌발 변수를 먼저 감지하고 재검색 없이 대안을 보여줍니다.</p></article>
          <article><span>03</span><h3>Condition Care</h3><p>최단 거리보다 계단 없음, 최소 보행, 실패 가능성을 우선하는 이동을 설계합니다.</p></article>
        </div>
      </section>

      <section className="reference-section" aria-labelledby="reference-title">
        <div className="reference-head"><div><p className="eyebrow">UX REFERENCE</p><h2 id="reference-title">좋은 이동 경험을<br />PickGo의 언어로 다시 설계했습니다.</h2></div><p>기능을 그대로 옮기기보다, 사용자가 움직이는 순간의 원리를 추출해 PickGo의 상태 기반 추천과 결합했습니다.</p></div>
        <div className="reference-grid">
          <article className="reference-card featured"><div className="reference-no">01 <span>PRIMARY</span></div><h3>Transit</h3><p>경로를 고르는 순간보다, 사용자가 행동해야 하는 순간에 집중합니다.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>지금 추천 경로 1개<br />→ GO 행동 안내<br />→ 혼잡도 원탭 제보</strong></div></article>
          <article className="reference-card"><div className="reference-no">02</div><h3>Citymapper</h3><p>걷기·탑승·환승·하차를 나누고 그 순간 필요한 정보만 보여줍니다.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>출발 전 혼잡 예상<br />→ 이동 중 지연·환승<br />→ 도착 전 하차 정보</strong></div></article>
          <article className="reference-card"><div className="reference-no">03</div><h3>Moovit</h3><p>교통 상황과 사용자 맥락을 함께 보고, 가장 적합한 이동을 제안합니다.</p><div className="reference-apply"><small>PICKGO 적용</small><strong>가장 빠른 길이 아닌<br />현재 나에게 가장<br />적합한 한 가지 길</strong></div></article>
        </div>
        <div className="analysis-split"><div><span>COMPETITOR</span><strong>네이버지도 · 카카오맵 · T맵</strong><small>시장과 기능 구조를 비교하는 경쟁사 분석</small></div><i>→</i><div><span>UX REFERENCE</span><strong>Transit · Citymapper · Moovit</strong><small>이동 순간과 추천 원리를 배우는 경험 레퍼런스</small></div></div>
      </section>

      <section className="research-strip"><div><span>RESEARCH INSIGHT</span><blockquote>“단 5분을 더 걷더라도,<br />계단만 없으면 좋겠어요.”</blockquote><p>무거운 짐과 이동하는 사용자 인터뷰 중</p></div><button type="button" onClick={resetDemo}>PickGo 다시 체험하기 <span>↗</span></button></section>

      <footer className="site-footer"><div className="brand"><span className="brand-dot">P</span><span>PickGo</span></div><p>당신의 컨디션에 딱 맞는, 단 하나의 확신 경로.</p><span>UX PORTFOLIO · 2026</span></footer>
    </main>
  );
}

function MapBackdrop({ active, urgent }: { active: boolean; urgent: boolean }) {
  return (
    <div className={`map-grid ${active ? 'map-active' : ''} ${urgent ? 'map-urgent' : ''}`} aria-hidden="true">
      <span className="road road-a" /><span className="road road-b" /><span className="road road-c" />
      <span className="map-label label-a">CITY HALL</span><span className="map-label label-b">SEOUL STATION</span>
      <span className="route-dots"><i /><i /><i /><i /><i /></span>
    </div>
  );
}
