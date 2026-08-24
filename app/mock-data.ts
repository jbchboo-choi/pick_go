export type ConditionId = 'urgent' | 'luggage' | 'tired' | 'schedule';

export type Condition = {
  id: ConditionId;
  label: string;
  detail: string;
  mark: string;
  tone: string;
  feedback: string;
};

export type RouteScenario = {
  destination: string;
  destinationDetail: string;
  minutes: number;
  cost: string;
  walk: string;
  fit: number;
  reason: string;
  routeLabel: string;
  congestion: { level: '여유' | '보통' | '혼잡'; note: string };
  context: string[];
  steps: { phase: string; mode: string; label: string; detail: string }[];
  impact: string;
  arrivalMessage: string;
};

export const conditions: Condition[] = [
  { id: 'urgent', label: '지금 너무 급해요', detail: '가까운 시설이 필요해요', mark: '!', tone: 'coral', feedback: '가장 가까운 곳부터 바로 찾을게요.' },
  { id: 'luggage', label: '짐이 많아요', detail: '계단 없는 길이 좋아요', mark: '□', tone: 'mint', feedback: '계단은 빼고, 평평한 길을 찾을게요.' },
  { id: 'tired', label: '많이 피곤해요', detail: '최대한 덜 걷고 싶어요', mark: '–', tone: 'blue', feedback: '오늘은 발걸음을 가장 적게 쓰는 길로 갈게요.' },
  { id: 'schedule', label: '늦으면 안 돼요', detail: '실패 없는 길이 필요해요', mark: '↗', tone: 'yellow', feedback: '돌발 변수까지 살펴 실패가 적은 길을 고를게요.' },
];

export const destinations = ['시청역', '홍대입구역', '강남역'];

export const scenarios: Record<ConditionId, RouteScenario> = {
  urgent: {
    destination: '서울역 1번 출구 화장실', destinationDetail: '현재 위치에서 110m', minutes: 2, cost: '무료', walk: '110m', fit: 98,
    reason: '지금 열려 있는 시설 중 가장 가깝고, 계단 없이 갈 수 있어요.', routeLabel: '가장 가까운 안심 경로',
    congestion: { level: '여유', note: '역사 안 이동이 원활해요' }, context: ['계단 없음', '24시간 개방', '실내 이동'],
    steps: [
      { phase: '걷기', mode: '01', label: '오른쪽 통로로 직진', detail: '약 60m · 편의점 방향' },
      { phase: '방향 전환', mode: '02', label: '1번 출구 표지판 앞에서 좌회전', detail: '약 30m' },
      { phase: '도착', mode: '03', label: '화장실 도착', detail: '왼쪽 자동문 옆' },
    ],
    impact: '복잡한 검색 4단계를 줄였어요', arrivalMessage: '가장 가까운 곳에 무사히 도착했어요.',
  },
  luggage: {
    destination: '홍대입구역', destinationDetail: '공항철도 이용', minutes: 18, cost: '1,500원', walk: '270m', fit: 96,
    reason: '3분 더 걸리지만 계단이 없고, 넓은 개찰구와 엘리베이터를 이용해요.', routeLabel: '계단 없는 편안한 경로',
    congestion: { level: '보통', note: '2-2칸이 비교적 여유로워요' }, context: ['엘리베이터', '넓은 개찰구', '비 소식 없음'],
    steps: [
      { phase: '걷기', mode: '걷기', label: '공항철도 15번 엘리베이터', detail: '평지 120m · 오른쪽 통로' },
      { phase: '탑승', mode: 'A', label: '2-2칸에서 공항철도 탑승', detail: '1개 역 · 약 7분 · 혼잡 보통' },
      { phase: '하차', mode: '출구', label: '5번 출구 엘리베이터', detail: '오른쪽 문 하차 · 평지 150m' },
    ],
    impact: '계단 42개와 도보 180m를 피했어요', arrivalMessage: '어깨와 무릎을 아끼는 길로 도착했어요.',
  },
  tired: {
    destination: '시청역', destinationDetail: '버스 7022 이용', minutes: 14, cost: '1,500원', walk: '190m', fit: 94,
    reason: '걷는 거리가 가장 짧고, 환승 없이 앉아서 이동할 가능성이 높은 길이에요.', routeLabel: '최소 보행 경로',
    congestion: { level: '여유', note: '좌석 가능성이 높은 편이에요' }, context: ['환승 없음', '도보 최소', '좌석 가능성 높음'],
    steps: [
      { phase: '걷기', mode: '걷기', label: '서울역 버스환승센터 이동', detail: '평지 90m · 5번 승강장' },
      { phase: '탑승', mode: '버스', label: '7022번 버스 탑승', detail: '3개 정류장 · 약 8분 · 좌석 여유' },
      { phase: '하차', mode: '걷기', label: '시청앞 정류장에서 하차', detail: '하차 후 7번 출구까지 평지 100m' },
    ],
    impact: '일반 추천보다 340m 덜 걸었어요', arrivalMessage: '오늘의 에너지를 지키며 도착했어요.',
  },
  schedule: {
    destination: '강남역', destinationDetail: '4호선 → 2호선', minutes: 38, cost: '1,600원', walk: '420m', fit: 95,
    reason: '가장 빠른 길보다 2분 여유가 있고, 현재 지연 위험이 가장 낮은 경로예요.', routeLabel: '실패 가능성이 낮은 경로',
    congestion: { level: '보통', note: '4호선 5-3칸이 덜 붐벼요' }, context: ['지연 위험 낮음', '환승 1회', '비 30%'],
    steps: [
      { phase: '탑승', mode: '4', label: '4호선 5-3칸 탑승', detail: '사당 방면 · 2분 뒤 도착' },
      { phase: '환승', mode: '2', label: '사당역에서 2호선 환승', detail: '빠른 환승 통로 · 예상 4분' },
      { phase: '하차', mode: '출구', label: '강남역에서 오른쪽 문 하차', detail: '11번 출구 · 도착 예정 14:28' },
    ],
    impact: '예상 지연 7분을 미리 피했어요', arrivalMessage: '약속 시간보다 12분 일찍 도착했어요.',
  },
};
