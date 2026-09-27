import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TravelMode } from '../types';

export type Language = 'ko' | 'en' | 'ja';

export interface Translations {
  // Top Navbar
  presetItineraries: string;
  resetDefaultTrip: string;
  shareTrip: string;
  linkCopied: string;
  splitView: string;
  splitViewActive: string;
  splitViewDesc: string;
  photos: string;
  exportMarkdown: string;
  crdtStatus: string;
  crdtLiveActive: string;
  broadcastChannel: string;
  conflictResolution: string;
  syncedOps: string;
  connectedPeers: string;
  crdtExplainer: string;
  trips: string;
  language: string;
  createNewTrip: string;
  newTripModalTitle: string;
  newTripModalSubtitle: string;
  destinationCity: string;
  destinationPlaceholder: string;
  tripDaysCount: string;
  startDate: string;
  createTripBtn: string;
  popularDestinations: string;
  addDayTab: string;
  deleteDayPrompt: string;
  mapStyleStandard: string;
  mapStyleHot: string;
  mapStyleTopo: string;
  mapTileStyle: string;
  savedLocally: string;
  savingChanges: string;
  autoSaveNotice: string;
  storageInfo: string;
  autoSavedTooltip: string;

  // Sidebar Header
  dayNumber: string;
  connected: string;
  offline: string;
  tripTitleLabel: string;
  tripTitlePlaceholder: string;

  // Overview Section
  overview: string;
  origin: string;
  setOrigin: string;
  tags: string;
  addTag: string;

  // Day Plan
  dayPlan: string;
  dayPlanPlaceholder: string;

  // Waypoints Section
  waypoints: string;
  addWaypoint: string;
  reorderHint: string;
  noWaypointsYet: string;
  addFirstWaypoint: string;
  emptyDayTitle: string;
  emptyDaySubtitle: string;
  addFirstStopBtn: string;
  attractions: string;
  cafes: string;
  food: string;
  lodging: string;

  // Waypoint Card
  save: string;
  edit: string;
  delete: string;
  locateOnMap: string;
  moveUp: string;
  moveDown: string;
  waypointNamePlaceholder: string;
  notesPlaceholder: string;
  transitTime: string;

  // Travel Modes
  walk: string;
  bus: string;
  train: string;
  flight: string;
  car: string;
  ferry: string;

  // Map Controls & Floating Panels
  focusToDay: string;
  focusToDayTitle: string;
  weather: string;
  weatherForecast: string;
  pinsBadgeToggle: string;
  close: string;
  originCity: string;
  feelsLike: string;
  humidity: string;
  wind: string;
  hiLo: string;
  panToPin: string;
  fetchingWeather: string;
  noWeatherData: string;
  mapClickModeBanner: string;
  cancel: string;

  // Add Waypoint Modal
  addWaypointTitle: string;
  addWaypointSubtitle: string;
  placeName: string;
  placeNamePlaceholder: string;
  latitude: string;
  longitude: string;
  travelModeToNext: string;
  estDuration: string;
  estDurationPlaceholder: string;
  notesTips: string;
  notesTipsPlaceholder: string;
  quickAddFromMap: string;
  quickAddFromMapDesc: string;
  recommendedPlaces: string;
  selectCategory: string;
  cancelBtn: string;
  addBtn: string;

  // Export Modal
  exportTitle: string;
  exportSubtitle: string;
  exportItinerary: string;
  exportDesc: string;
  copyToClipboard: string;
  copyMarkdown: string;
  copied: string;
  downloadMd: string;

  // Calendar Modal
  calendarTitle: string;
  addNewDay: string;
  addDay: string;
  prevMonth: string;
  nextMonth: string;
  plannedDaysCount: string;
  daysList: string;
  selectDayPrompt: string;

  // Photos Modal
  photoGalleryTitle: string;
  photoGallerySubtitle: string;

  // CRDT Modal
  crdtModalTitle: string;
  crdtModalSubtitle: string;
  nodeClientId: string;
  connectedNodes: string;
  crdtEngineOverviewTitle: string;
  crdtEngineOverviewDesc: string;
  lwwResolutionTitle: string;
  lwwResolutionDesc: string;
  offlineFirstTitle: string;
  offlineFirstDesc: string;

  // Split Collaborator View
  collaboratorViewTitle: string;
  collaboratorViewSubtitle: string;
  hostEditor: string;
  peerEditor: string;
  guestEditor: string;
  addTagPrompt: string;
  simulatePeerActions: string;
  testAddTag: string;
  testReorder: string;

  // Footer Navigation
  prevDay: string;
  nextDay: string;
  dayNavTooltip: string;

  // Help Guide Modal
  helpGuide: string;
  helpGuideTitle: string;
  helpGuideSubtitle: string;
  guideStep1Title: string;
  guideStep1Desc: string;
  guideStep2Title: string;
  guideStep2Desc: string;
  guideStep3Title: string;
  guideStep3Desc: string;
  guideStep4Title: string;
  guideStep4Desc: string;
  guideStep5Title: string;
  guideStep5Desc: string;
  gotIt: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  ko: {
    // Top Navbar
    presetItineraries: '추천 여행 일정 목록',
    resetDefaultTrip: '기본 일정으로 초기화',
    shareTrip: '일정 공유 / 링크 복사',
    linkCopied: '링크가 복사되었습니다!',
    splitView: '동시 편집 분할',
    splitViewActive: '실시간 협업 중',
    splitViewDesc: 'CRDT 동시 협업 모드 (양방향 분할 뷰)',
    photos: '여행 사진첩 & 명소',
    exportMarkdown: '마크다운 / 노션 내보내기',
    crdtStatus: 'CRDT 동기화 상태',
    crdtLiveActive: '실시간 동기화 활성',
    broadcastChannel: '브로드캐스트 채널:',
    conflictResolution: '충돌 해결 알고리즘:',
    syncedOps: '동기화된 작업 수:',
    connectedPeers: '연결된 피어:',
    crdtExplainer: '이 앱을 다른 브라우저 탭이나 창에서 열면 실시간 충돌 없이 즉각 동기화됩니다.',
    trips: '여행 목록',
    language: '언어 (Language)',
    createNewTrip: '새 여행 만들기',
    newTripModalTitle: '새 여행 일정 만들기',
    newTripModalSubtitle: '여행지, 시작 날짜, 일수를 정해 나만의 여행 계획을 시작하세요.',
    destinationCity: '여행지 / 도시',
    destinationPlaceholder: '예: 도쿄, 파리, 제주도, 뉴욕, 오사카',
    tripDaysCount: '여행 일수',
    startDate: '여행 시작일',
    createTripBtn: '여행 일정 생성',
    popularDestinations: '인기 여행지 빠른 선택',
    addDayTab: '+ 일차 추가',
    deleteDayPrompt: '이 일차를 삭제하시겠습니까?',
    mapStyleStandard: 'OSM 표준 지도',
    mapStyleHot: 'OSM 인도주의 지도 (HOT)',
    mapStyleTopo: 'OSM 지형도 (OpenTopoMap)',
    mapTileStyle: '지도 스타일',
    savedLocally: '자동 저장됨',
    savingChanges: '저장 중...',
    autoSaveNotice: '일정이 브라우저 저장소에 자동 저장되어 새로고침 후에도 유지됩니다.',
    storageInfo: '로컬/IndexedDB 자동 저장',
    autoSavedTooltip: '모든 변경사항이 브라우저 로컬 저장소(IndexedDB/LocalStorage)에 실시간으로 보관됩니다.',

    // Sidebar Header
    dayNumber: '{n}일차',
    connected: '연결됨',
    offline: '오프라인',
    tripTitleLabel: '여행 제목',
    tripTitlePlaceholder: '여행 제목을 입력하세요...',

    // Overview Section
    overview: '개요',
    origin: '출발지',
    setOrigin: '출발지 설정',
    tags: '태그',
    addTag: '태그 추가',

    // Day Plan
    dayPlan: '일정 계획',
    dayPlanPlaceholder: '이 날의 도심 산책, 휴식, 맛집 탐방 계획을 메모하세요...',

    // Waypoints Section
    waypoints: '경유지 목록',
    addWaypoint: '추가',
    reorderHint: '카드를 드래그하거나 화살표를 눌러 방문 순서를 변경할 수 있습니다',
    noWaypointsYet: '이 날에 등록된 경유지가 아직 없습니다.',
    addFirstWaypoint: '+ 첫 번째 경유지 추가하기',
    emptyDayTitle: '첫 번째 방문 장소를 등록해보세요',
    emptyDaySubtitle: '관광 명소, 카페, 맛집, 숙소를 등록하여 이 날의 여행 동선을 완성해보세요.',
    addFirstStopBtn: '첫 경유지 추가하기',
    attractions: '명소',
    cafes: '카페',
    food: '맛집',
    lodging: '숙소',

    // Waypoint Card
    save: '저장',
    edit: '수정',
    delete: '삭제',
    locateOnMap: '지도에서 위치 확인',
    moveUp: '순서 위로 이동',
    moveDown: '순서 아래로 이동',
    waypointNamePlaceholder: '경유지 이름',
    notesPlaceholder: '이동 경로 및 방문 팁 메모...',
    transitTime: '이동 시간',

    // Travel Modes
    walk: '도보',
    bus: '버스',
    train: '지하철/기차',
    flight: '항공편',
    car: '차량/택시',
    ferry: '페리/선박',

    // Map Controls & Floating Panels
    focusToDay: '일정에 맞춤',
    focusToDayTitle: '현재 일자의 모든 경유지가 한눈에 보이도록 지도 시점 자동 맞춤',
    weather: '날씨 예보',
    weatherForecast: '날씨 예보',
    pinsBadgeToggle: '핀 온도',
    close: '닫기',
    originCity: '출발지',
    feelsLike: '체감',
    humidity: '습도',
    wind: '풍속',
    hiLo: '최고/최저',
    panToPin: '핀 위치로 이동',
    fetchingWeather: 'OpenWeatherMap 예보 조회 중...',
    noWeatherData: '날씨 예보 데이터를 불러올 수 없습니다.',
    mapClickModeBanner: '지도의 원하는 위치를 클릭하여 새 경유지를 추가하세요',
    cancel: '취소',

    // Add Waypoint Modal
    addWaypointTitle: '새 경유지 추가',
    addWaypointSubtitle: '여행 일정에 추가할 장소 정보를 입력하거나 추천 장소를 선택하세요.',
    placeName: '장소 이름',
    placeNamePlaceholder: '예: 시드니 오페라 하우스, 성산일출봉',
    latitude: '위도 (Lat)',
    longitude: '경도 (Lng)',
    travelModeToNext: '이동 수단',
    estDuration: '예상 소요 시간',
    estDurationPlaceholder: '예: 15분, 1시간 30분',
    notesTips: '방문 팁 & 메모',
    notesTipsPlaceholder: '예: 티켓 사전 예매 필수, 석양 감상 포인트',
    quickAddFromMap: '지도에서 직접 클릭하여 지정',
    quickAddFromMapDesc: '모달을 닫고 지도 화면에서 원하는 위치를 마우스로 직접 클릭합니다.',
    recommendedPlaces: '추천 여행 명소',
    selectCategory: '지역별 필터',
    cancelBtn: '취소',
    addBtn: '경유지 추가',

    // Export Modal
    exportTitle: '마크다운 일정 내보내기',
    exportSubtitle: '노션(Notion), 옵시디언(Obsidian), 블로그에 바로 붙여넣을 수 있는 정돈된 마크다운 문서입니다.',
    exportItinerary: '여행 일정 내보내기',
    exportDesc: '노션, 옵시디언, 여행 메모 등에 공유하기 쉬운 마크다운 포맷',
    copyToClipboard: '클립보드에 복사',
    copyMarkdown: '클립보드에 복사',
    copied: '복사 완료!',
    downloadMd: '.md 파일 다운로드',

    // Calendar Modal
    calendarTitle: '일정 날짜 & 캘린더',
    addNewDay: '새로운 일자 추가 (+)',
    addDay: '일자 추가',
    prevMonth: '이전 달',
    nextMonth: '다음 달',
    plannedDaysCount: '{count}개 일정 등록됨',
    daysList: '등록된 여행 일차',
    selectDayPrompt: '이동할 일자를 선택하거나 새 날짜를 추가하세요.',

    // Photos Modal
    photoGalleryTitle: '여행 사진첩 & 추천 포토스팟',
    photoGallerySubtitle: '선택한 일자의 주요 명소와 추천 사진 스팟입니다.',

    // CRDT Modal
    crdtModalTitle: 'CRDT 실시간 동기화 엔진',
    crdtModalSubtitle: '충돌 없는 복제 데이터 타입 (LWW-Element-Set) & 피어 간 분산 동기화',
    nodeClientId: '클라이언트 노드 ID',
    connectedNodes: '연결된 피어 수',
    crdtEngineOverviewTitle: '실시간 피어 동기화 (BroadcastChannel)',
    crdtEngineOverviewDesc: '중앙 집중식 잠금(Locking) 없이 다중 탭 및 분산 노드 간에 변경 사항을 즉시 반영합니다.',
    lwwResolutionTitle: '타임스탬프 기반 충돌 해결 (LWW)',
    lwwResolutionDesc: '동일 필드를 여러 사용자가 동시에 수정할 경우, 논리적 타임스탬프가 최신인 작업을 채택하여 데이터 일관성을 유지합니다.',
    offlineFirstTitle: '오프라인 퍼스트 아키텍처',
    offlineFirstDesc: '네트워크가 일시적으로 끊겨도 로컬에서 자유롭게 편집할 수 있으며, 다시 연결되는 즉시 상태가 통합됩니다.',

    // Split Collaborator View
    collaboratorViewTitle: '실시간 협업자 듀얼 뷰 (CRDT Dual View)',
    collaboratorViewSubtitle: '좌측과 우측의 두 화면이 서로 다른 클라이언트 노드로 작동하며 변경 사항이 즉시 양방향 동기화됩니다.',
    hostEditor: '내 화면 (호스트 노드)',
    peerEditor: '협업자 화면 (피어 노드 - 시뮬레이션)',
    guestEditor: '협업자 화면 (Peer B: Alice)',
    addTagPrompt: '태그 추가',
    simulatePeerActions: '협업자 편집 시뮬레이션 테스트:',
    testAddTag: '협업자가 태그 추가',
    testReorder: '협업자가 경유지 순서 변경',

    // Footer Navigation
    prevDay: '{n}일차',
    nextDay: '{n}일차',
    dayNavTooltip: '{n}일차 ({date})로 전환',

    // Help Guide Modal
    helpGuide: '도움말',
    helpGuideTitle: '여행 플래너 사용 가이드',
    helpGuideSubtitle: '지도 기반 여행 일정 계획과 실시간 동기화 기능을 100% 활용하는 방법입니다.',
    guideStep1Title: '1. 여행지 선택 & 지도 자동 이동',
    guideStep1Desc: '상단 왼쪽의 여행지 이름을 클릭하여 추천 여행 일정(서울/제주, 도쿄/교토, 시드니/뉴질랜드)을 불러올 수 있으며, 선택 시 지도가 해당 지역으로 즉시 자동 이동합니다.',
    guideStep2Title: '2. 일자별(Day) 일정 탐색 & 일정에 맞춤',
    guideStep2Desc: '하단 네비게이션이나 캘린더에서 일차(Day 1, Day 2...)를 전환하세요. 지도 좌측 상단의 "일정에 맞춤" 버튼을 누르면 해당 일자의 모든 방문지가 한눈에 들어옵니다.',
    guideStep3Title: '3. 새 경유지 등록 (사이드바 입력 & 지도 클릭)',
    guideStep3Desc: '사이드바의 "+ 경유지 추가" 버튼으로 장소명과 이동 수단(도보, 버스, 항공 등)을 입력하거나, 지도 클릭 모드를 켜서 지도 위를 마우스로 직접 콕 찍어 추가할 수 있습니다.',
    guideStep4Title: '4. 순서 재정렬 & 상세 위치/날씨 확인',
    guideStep4Desc: '경유지 카드를 드래그하거나 ▲/▼ 화살표 버튼으로 방문 순서를 바꾸면 이동 경로가 실시간으로 재계산됩니다. 카드를 클릭하면 지도 위치로 날아가며 실시간 날씨 팝업이 열립니다.',
    guideStep5Title: '5. 실시간 협업 (CRDT) & 마크다운 내보내기',
    guideStep5Desc: '브라우저 탭을 여러 개 띄우거나 상단 "동시 편집 분할"을 켜서 충돌 없는 실시간 동시 편집을 체험할 수 있습니다. 상단 내보내기(📥) 아이콘으로 노션용 마크다운을 원클릭 복사하세요.',
    gotIt: '확인했어요',
  },
  en: {
    // Top Navbar
    presetItineraries: 'Preset Itineraries',
    resetDefaultTrip: 'Reset Default Trip',
    shareTrip: 'Share trip or copy link',
    linkCopied: 'Link copied!',
    splitView: 'Split Peer',
    splitViewActive: 'Dual Sync',
    splitViewDesc: 'Toggle CRDT Dual-Peer Collaborator Mode (Side-by-Side)',
    photos: 'Trip photo spots & memories',
    exportMarkdown: 'Export as Markdown / Notion document',
    crdtStatus: 'CRDT Sync Status',
    crdtLiveActive: 'Live Active',
    broadcastChannel: 'BroadcastChannel:',
    conflictResolution: 'Conflict Resolution:',
    syncedOps: 'Synced Operations:',
    connectedPeers: 'Connected Peers:',
    crdtExplainer: 'Opening this app in another browser tab will synchronize edits in real time with zero conflict.',
    trips: 'Trips',
    language: 'Language',
    createNewTrip: 'Create New Trip',
    newTripModalTitle: 'Create New Itinerary',
    newTripModalSubtitle: 'Choose a destination, start date, and days to start planning your custom journey.',
    destinationCity: 'Destination / City',
    destinationPlaceholder: 'e.g. Tokyo, Paris, Jeju, New York, Osaka',
    tripDaysCount: 'Duration (Days)',
    startDate: 'Start Date',
    createTripBtn: 'Create Itinerary',
    popularDestinations: 'Quick Popular Destinations',
    addDayTab: '+ Add Day',
    deleteDayPrompt: 'Are you sure you want to delete this day?',
    mapStyleStandard: 'OSM Standard Map',
    mapStyleHot: 'OSM Humanitarian Map (HOT)',
    mapStyleTopo: 'OSM Topographic Map',
    mapTileStyle: 'Map Style',
    savedLocally: 'Saved to browser',
    savingChanges: 'Saving...',
    autoSaveNotice: 'Itinerary is automatically saved locally and persists on refresh.',
    storageInfo: 'LocalStorage & IndexedDB Storage',
    autoSavedTooltip: 'All itinerary edits are automatically saved to your browser storage (LocalStorage/IndexedDB).',

    // Sidebar Header
    dayNumber: 'Day {n}',
    connected: 'Connected',
    offline: 'Offline',
    tripTitleLabel: 'Trip title',
    tripTitlePlaceholder: 'Name your journey...',

    // Overview Section
    overview: 'Overview',
    origin: 'Origin',
    setOrigin: 'Set origin',
    tags: 'Tags',
    addTag: 'Add tag',

    // Day Plan
    dayPlan: 'Day plan',
    dayPlanPlaceholder: 'Set aside the day for exploration, rest, or highlights...',

    // Waypoints Section
    waypoints: 'Waypoints',
    addWaypoint: 'Add',
    reorderHint: 'Drag cards or use arrows to reorder itinerary sequence',
    noWaypointsYet: 'No stops scheduled for this day yet.',
    addFirstWaypoint: '+ Add first waypoint',
    emptyDayTitle: 'Add your first stop',
    emptyDaySubtitle: 'Start mapping out your day by adding attractions, cafes, restaurants, or hotels.',
    addFirstStopBtn: 'Add your first stop',
    attractions: 'Attractions',
    cafes: 'Cafes',
    food: 'Food',
    lodging: 'Hotels',

    // Waypoint Card
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    locateOnMap: 'Locate on map',
    moveUp: 'Move up',
    moveDown: 'Move down',
    waypointNamePlaceholder: 'Waypoint name',
    notesPlaceholder: 'Transit notes & sightseeing tips...',
    transitTime: 'Transit time',

    // Travel Modes
    walk: 'Walk',
    bus: 'Bus',
    train: 'Train',
    flight: 'Flight',
    car: 'Drive',
    ferry: 'Ferry',

    // Map Controls & Floating Panels
    focusToDay: 'Focus to Day',
    focusToDayTitle: 'Automatically zoom and pan map to fit all stops of active day',
    weather: 'Weather',
    weatherForecast: 'Weather Forecast',
    pinsBadgeToggle: 'Pins',
    close: 'Close',
    originCity: 'Origin City',
    feelsLike: 'Feels',
    humidity: 'Humidity',
    wind: 'Wind',
    hiLo: 'H / L',
    panToPin: 'Pan to Pin',
    fetchingWeather: 'Fetching OpenWeatherMap forecast...',
    noWeatherData: 'No forecast data available.',
    mapClickModeBanner: 'Click anywhere on the map to set a new waypoint',
    cancel: 'Cancel',

    // Add Waypoint Modal
    addWaypointTitle: 'Add New Waypoint',
    addWaypointSubtitle: 'Enter location details or choose from popular recommended stops.',
    placeName: 'Place Name',
    placeNamePlaceholder: 'e.g. Sydney Opera House, Bondi Beach',
    latitude: 'Latitude (Lat)',
    longitude: 'Longitude (Lng)',
    travelModeToNext: 'Travel Mode to here',
    estDuration: 'Estimated Travel Time',
    estDurationPlaceholder: 'e.g. 15 mins, 1 hr 20m',
    notesTips: 'Notes & Highlights',
    notesTipsPlaceholder: 'e.g. Best sunset views, pre-booking required',
    quickAddFromMap: 'Pick directly from Map',
    quickAddFromMapDesc: 'Close modal and click any point on the map to automatically fill coordinates.',
    recommendedPlaces: 'Popular Recommended Stops',
    selectCategory: 'Filter by Region',
    cancelBtn: 'Cancel',
    addBtn: 'Add Waypoint',

    // Export Modal
    exportTitle: 'Export Markdown Itinerary',
    exportSubtitle: 'A clean markdown document ready to paste into Notion, Obsidian, or your personal travel journal.',
    exportItinerary: 'Export Trip Itinerary',
    exportDesc: 'Markdown format ready for Notion, notes, or travel companion sharing',
    copyToClipboard: 'Copy to Clipboard',
    copyMarkdown: 'Copy to Clipboard',
    copied: 'Copied!',
    downloadMd: 'Download .md File',

    // Calendar Modal
    calendarTitle: 'Trip Schedule & Calendar',
    addNewDay: 'Add New Day (+)',
    addDay: 'Add Day',
    prevMonth: 'Previous Month',
    nextMonth: 'Next Month',
    plannedDaysCount: '{count} planned days',
    daysList: 'Scheduled Days',
    selectDayPrompt: 'Select a day to switch views or schedule an additional date.',

    // Photos Modal
    photoGalleryTitle: 'Trip Photo Gallery & Highlights',
    photoGallerySubtitle: 'Scenic landmarks and photography spots for the selected day.',

    // CRDT Modal
    crdtModalTitle: 'CRDT Sync Engine',
    crdtModalSubtitle: 'Conflict-free Replicated Data Type & Peer-to-Peer State',
    nodeClientId: 'Node Client ID',
    connectedNodes: 'Connected Peers',
    crdtEngineOverviewTitle: 'Peer-to-Peer BroadcastChannel',
    crdtEngineOverviewDesc: 'Instant synchronization across multiple tabs and instances without centralized lock-in.',
    lwwResolutionTitle: 'Last-Write-Wins (LWW) Resolution',
    lwwResolutionDesc: 'Concurrent changes use monotonic timestamps to ensure all peers deterministically converge to the exact same state.',
    offlineFirstTitle: 'Offline-First Resilience',
    offlineFirstDesc: 'Full read/write capability even when disconnected; changes merge smoothly upon reconnecting.',

    // Split Collaborator View
    collaboratorViewTitle: 'CRDT Dual-Peer Collaborator View',
    collaboratorViewSubtitle: 'Both panels represent distinct peer nodes that synchronize modifications in real time without conflicts.',
    hostEditor: 'Your Editor (Host Node)',
    peerEditor: 'Collaborator Editor (Peer Node - Simulation)',
    guestEditor: 'Peer B: Alice (Collaborator)',
    addTagPrompt: 'Add Tag',
    simulatePeerActions: 'Test Peer Actions:',
    testAddTag: 'Peer Adds Tag',
    testReorder: 'Peer Reorders Stops',

    // Footer Navigation
    prevDay: 'Day {n}',
    nextDay: 'Day {n}',
    dayNavTooltip: 'Switch to Day {n} ({date})',

    // Help Guide Modal
    helpGuide: 'Help Guide',
    helpGuideTitle: 'Travel Planner User Guide',
    helpGuideSubtitle: 'How to make the most of map-based itinerary planning and real-time collaboration.',
    guideStep1Title: '1. Select Itinerary & Auto Map Navigation',
    guideStep1Desc: 'Click the trip name on the top left to switch between curated itineraries (Seoul & Jeju, Tokyo & Kyoto, Sydney & NZ). The map automatically flies to that region.',
    guideStep2Title: '2. Explore by Day & Focus to Day',
    guideStep2Desc: 'Switch days (Day 1, Day 2...) from the bottom navigation or calendar. Click "Focus to Day" on the map to automatically fit all scheduled stops into view.',
    guideStep3Title: '3. Add Waypoints (Sidebar or Map Click)',
    guideStep3Desc: 'Add stops using "+ Add Waypoint" in the sidebar with travel modes (walk, bus, flight, etc.), or enable "Map Click Mode" to drop pins directly on the map.',
    guideStep4Title: '4. Reorder Stops & Live Weather',
    guideStep4Desc: 'Drag stops or use the ▲/▼ buttons to reorder your itinerary—routes update dynamically. Click any stop card to fly there on the map and view live weather forecasts.',
    guideStep5Title: '5. Real-Time Collaboration (CRDT) & Export',
    guideStep5Desc: 'Open multiple browser tabs or click "Dual Sync" to test real-time conflict-free collaboration. Use the Export button (📥) to copy Markdown for Notion or Obsidian.',
    gotIt: 'Got it',
  },
  ja: {
    // Top Navbar
    presetItineraries: 'おすすめ旅行プラン',
    resetDefaultTrip: '初期日程に戻す',
    shareTrip: '日程を共有 / リンクをコピー',
    linkCopied: 'リンクがコピーされました！',
    splitView: '同時編集分割',
    splitViewActive: 'リアルタイム協調中',
    splitViewDesc: 'CRDT同時協調モード（両画面分割ビュー）',
    photos: '旅行写真＆名所',
    exportMarkdown: 'Markdown / Notion出力',
    crdtStatus: 'CRDT同期状態',
    crdtLiveActive: 'リアルタイム同期有効',
    broadcastChannel: 'ブロードキャストチャネル:',
    conflictResolution: '衝突解決アルゴリズム:',
    syncedOps: '同期済み操作数:',
    connectedPeers: '接続ピア数:',
    crdtExplainer: 'このアプリを別ブラウザタブやウィンドウで開くと、リアルタイムで競合なく即座に同期されます。',
    trips: '旅行リスト',
    language: '言語 (Language)',
    createNewTrip: '新しい旅行を作成',
    newTripModalTitle: '新しい旅行日程を作成',
    newTripModalSubtitle: '旅行先、開始日、日数を設定して、あなただけの旅行プランを始めましょう。',
    destinationCity: '旅行先 / 都市',
    destinationPlaceholder: '例: 東京、京都、パリ、済州島、ニューヨーク',
    tripDaysCount: '旅行日数',
    startDate: '旅行開始日',
    createTripBtn: '旅行日程を作成',
    popularDestinations: '人気の旅行先から選ぶ',
    addDayTab: '+ 日程追加',
    deleteDayPrompt: 'この日程を削除しますか？',
    mapStyleStandard: 'OSM標準マップ',
    mapStyleHot: 'OSM人道支援マップ (HOT)',
    mapStyleTopo: 'OSM地形図 (OpenTopoMap)',
    mapTileStyle: 'マップスタイル',
    savedLocally: 'ブラウザに自動保存済み',
    savingChanges: '保存中...',
    autoSaveNotice: '日程はブラウザストレージに自動保存され、リロード後も保持されます。',
    storageInfo: 'ローカル/IndexedDB自動保存',
    autoSavedTooltip: 'すべての変更はブラウザストレージ（IndexedDB/LocalStorage）にリアルタイムで安全に保存されます。',

    // Sidebar Header
    dayNumber: '{n}日目',
    connected: '接続中',
    offline: 'オフライン',
    tripTitleLabel: '旅行タイトル',
    tripTitlePlaceholder: '旅行タイトルを入力...',

    // Overview Section
    overview: '概要',
    origin: '出発地',
    setOrigin: '出発地を設定',
    tags: 'タグ',
    addTag: 'タグ追加',

    // Day Plan
    dayPlan: '一日の計画',
    dayPlanPlaceholder: 'この日の観光、散策、グルメ、カフェの計画をメモしましょう...',

    // Waypoints Section
    waypoints: '経由地リスト',
    addWaypoint: '追加',
    reorderHint: 'カードをドラッグまたは矢印ボタンで訪問順序を変更できます',
    noWaypointsYet: 'この日に登録された経由地はまだありません。',
    addFirstWaypoint: '+ 最初の経由地を追加',
    emptyDayTitle: '最初の目的地を追加しましょう',
    emptyDaySubtitle: '観光名所、カフェ、グルメ、ホテルを登録してこの日のルートを描きましょう。',
    addFirstStopBtn: '最初の目的地を追加',
    attractions: '観光名所',
    cafes: 'カフェ',
    food: 'グルメ',
    lodging: 'ホテル',

    // Waypoint Card
    save: '保存',
    edit: '編集',
    delete: '削除',
    locateOnMap: '地図で位置を確認',
    moveUp: '上に移動',
    moveDown: '下に移動',
    waypointNamePlaceholder: '経由地名',
    notesPlaceholder: '移動メモや見どころ・ヒント...',
    transitTime: '移動時間',

    // Travel Modes
    walk: '徒歩',
    bus: 'バス',
    train: '地下鉄/電車',
    flight: 'フライト',
    car: '車/タクシー',
    ferry: 'フェリー/船',

    // Map Controls & Floating Panels
    focusToDay: '日程に合わせる',
    focusToDayTitle: '現在の日のすべての経由地が一目で収まるよう地図を自動調整',
    weather: '天気予報',
    weatherForecast: '天気予報',
    pinsBadgeToggle: 'ピン温度',
    close: '閉じる',
    originCity: '出発地',
    feelsLike: '体感',
    humidity: '湿度',
    wind: '風速',
    hiLo: '最高/最低',
    panToPin: 'ピン位置へ移動',
    fetchingWeather: 'OpenWeatherMap予報を取得中...',
    noWeatherData: '天気予報データを取得できませんでした。',
    mapClickModeBanner: '地図上の任意の場所をクリックして新しい経由地を追加できます',
    cancel: 'キャンセル',

    // Add Waypoint Modal
    addWaypointTitle: '新しい経由地を追加',
    addWaypointSubtitle: '旅行日程に追加する場所の情報を入力するか、おすすめスポットを選択してください。',
    placeName: 'スポット名',
    placeNamePlaceholder: '例: 新宿御苑、東京タワー、浅草寺',
    latitude: '緯度 (Lat)',
    longitude: '経度 (Lng)',
    travelModeToNext: '移動手段',
    estDuration: '予想所要時間',
    estDurationPlaceholder: '例: 15分、1時間30分',
    notesTips: 'メモ・見どころ',
    notesTipsPlaceholder: '例: 事前予約推奨、日没の眺望スポット',
    quickAddFromMap: '地図から直接クリックして指定',
    quickAddFromMapDesc: 'モーダルを閉じて地図上をクリックすると自動で座標が入力されます。',
    recommendedPlaces: 'おすすめ観光スポット',
    selectCategory: '地域フィルター',
    cancelBtn: 'キャンセル',
    addBtn: '経由地を追加',

    // Export Modal
    exportTitle: 'Markdown日程を出力',
    exportSubtitle: 'Notion、Obsidian、旅のメモにそのまま貼り付けられる整理されたMarkdownドキュメントです。',
    exportItinerary: '旅行日程を出力',
    exportDesc: 'Notionや旅仲間との共有に適したMarkdown形式',
    copyToClipboard: 'クリップボードにコピー',
    copyMarkdown: 'クリップボードにコピー',
    copied: 'コピー完了！',
    downloadMd: '.mdファイルをダウンロード',

    // Calendar Modal
    calendarTitle: '日程カレンダー',
    addNewDay: '新しい日を追加 (+)',
    addDay: '日を追加',
    prevMonth: '前月',
    nextMonth: '次月',
    plannedDaysCount: '{count}件の日程登録済み',
    daysList: '登録済み日程',
    selectDayPrompt: '移動したい日を選択するか、新しい日付を追加してください。',

    // Photos Modal
    photoGalleryTitle: '旅の写真ギャラリー＆スポット',
    photoGallerySubtitle: '選択した日の代表的な名所とフォトスポットです。',

    // CRDT Modal
    crdtModalTitle: 'CRDT同期エンジン',
    crdtModalSubtitle: '競合のないレプリケーテッド・データタイプ＆ピア・ツー・ピア状態',
    nodeClientId: 'ノードクライアントID',
    connectedNodes: '接続中ピア',
    crdtEngineOverviewTitle: 'ピア・ツー・ピア BroadcastChannel',
    crdtEngineOverviewDesc: '中央サーバー不要で複数タブやインスタンス間をリアルタイム同期します。',
    lwwResolutionTitle: 'Last-Write-Wins (LWW) 解決',
    lwwResolutionDesc: '単調増加タイムスタンプにより、同時変更があっても全ピアが同一状態に収束します。',
    offlineFirstTitle: 'オフラインファースト設計',
    offlineFirstDesc: 'オフラインでも自由に編集可能で、再接続時に自動マージされます。',

    // Split Collaborator View
    collaboratorViewTitle: 'CRDTデュアル共同編集ビュー',
    collaboratorViewSubtitle: '2つのパネルはそれぞれ独立したピアノードとして動作し、競合なくリアルタイム同期します。',
    hostEditor: 'あなたのエディタ (ホスト)',
    peerEditor: '共同編集者エディタ (ピア・シミュレーション)',
    guestEditor: 'ピア B: アリス (共同編集者)',
    addTagPrompt: 'タグ追加',
    simulatePeerActions: 'ピア操作テスト:',
    testAddTag: 'ピアがタグを追加',
    testReorder: 'ピアが順序を変更',

    // Footer Navigation
    prevDay: '{n}日目',
    nextDay: '{n}日目',
    dayNavTooltip: '{n}日目 ({date}) へ切り替え',

    // Help Guide Modal
    helpGuide: '使い方ガイド',
    helpGuideTitle: 'トラベルプランナー使い方ガイド',
    helpGuideSubtitle: '地図連動の日程計画とリアルタイム共同作業をマスターしましょう。',
    guideStep1Title: '1. 旅行の選択＆新規旅行作成',
    guideStep1Desc: '左上の旅行名をクリックしておすすめプラン（東京・京都、ソウル・済州、シドニー等）を切り替えたり、「+ 新しい旅行を作成」でオリジナル旅行を白紙から作成できます。',
    guideStep2Title: '2. 日程（Day）管理＆一発地図フィット',
    guideStep2Desc: 'サイドバー上部の [Day 1][Day 2][+ 日程追加] 탭で日程を自由に追加・切り替えできます。地図上の「日程に合わせる」を押すと、その日の全スポットが一目で収まります。',
    guideStep3Title: '3. 経由地の登録（サイドバー＆地図クリック）',
    guideStep3Desc: 'サイドバーの「+ 経由地追加」から移動手段（徒歩、バス、電車等）とともにスポットを登録するか、「地図クリックモード」で地図上を直接クリックしてピンを立てられます。',
    guideStep4Title: '4. 順序並べ替え＆リアルタイム天気',
    guideStep4Desc: '経由地カードのドラッグや▲/▼ボタンで順序を入れ替えるとルートが即座に再計算されます。カードをクリックすると地図がジャンプし、天気予報ポップアップが表示されます。',
    guideStep5Title: '5. リアルタイム協調（CRDT）＆出力',
    guideStep5Desc: '別ブラウザタブで開くか「同時編集分割」で競合のないリアルタイム同期を試せます。上部の出力（📥）ボタンからNotion用Markdownをワンクリックコピーできます。',
    gotIt: '理解しました',
  },
};

// Weather description dictionary for Japanese
const WEATHER_JA_MAP: Record<string, string> = {
  'clear sky': '快晴',
  'few clouds': '晴れ（雲少なめ）',
  'scattered clouds': '晴れ時々曇り',
  'broken clouds': '曇りがち',
  'overcast clouds': '曇り',
  'shower rain': 'にわか雨',
  'light rain': '小雨',
  'moderate rain': '雨',
  'heavy intensity rain': '強い雨',
  'very heavy rain': '大雨',
  'extreme rain': '豪雨',
  'freezing rain': '凍雨',
  'light intensity shower rain': '弱い小雨',
  'heavy intensity shower rain': '激しいにわか雨',
  'thunderstorm': '雷雨',
  'snow': '雪',
  'light snow': '小雪',
  'heavy snow': '大雪',
  'mist': '靄（もや）',
  'fog': '濃霧',
  'haze': '煙霧',
  'clear': '晴れ',
  'clouds': '曇り',
  'partly cloudy': '晴れ時々曇り',
  'mostly cloudy': '概ね曇り',
  'sunny': '快晴',
};

// Weather description dictionary for Korean
const WEATHER_KO_MAP: Record<string, string> = {
  'clear sky': '맑음',
  'few clouds': '구름 조금',
  'scattered clouds': '구름 약간',
  'broken clouds': '구름 많음',
  'overcast clouds': '흐림',
  'shower rain': '소나기',
  'light rain': '약한 비',
  'moderate rain': '비',
  'heavy intensity rain': '강한 비',
  'very heavy rain': '폭우',
  'extreme rain': '호우',
  'freezing rain': '어는 비',
  'light intensity shower rain': '약한 소나기',
  'heavy intensity shower rain': '강한 소나기',
  'ragged shower rain': '돌풍성 소나기',
  'thunderstorm': '뇌우',
  'thunderstorm with light rain': '약한 비를 동반한 뇌우',
  'thunderstorm with rain': '비를 동반한 뇌우',
  'thunderstorm with heavy rain': '강한 비를 동반한 뇌우',
  'light thunderstorm': '약한 뇌우',
  'heavy thunderstorm': '강한 뇌우',
  'ragged thunderstorm': '돌풍성 뇌우',
  'snow': '눈',
  'light snow': '약한 눈',
  'heavy snow': '폭설',
  'sleet': '진눈깨비',
  'light shower sleet': '약한 진눈깨비',
  'shower sleet': '진눈깨비',
  'light rain and snow': '비와 눈',
  'rain and snow': '눈과 비',
  'light shower snow': '약한 소나기 눈',
  'shower snow': '소나기 눈',
  'heavy shower snow': '강한 소나기 눈',
  'mist': '박무 (옅은 안개)',
  'smoke': '연무',
  'haze': '안개 / 실안개',
  'sand/dust whirls': '모래바람',
  'fog': '짙은 안개',
  'sand': '모래',
  'dust': '미세먼지',
  'volcanic ash': '화산재',
  'squalls': '돌풍',
  'tornado': '토네이도',
  'clear': '맑음',
  'clouds': '구름',
  'partly cloudy': '구름 조금',
  'mostly cloudy': '대체로 흐림',
  'sunny': '화창함',
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations, params?: Record<string, string | number>) => string;
  formatDate: (dateStr: string) => string;
  formatDayNumber: (dayNum: number) => string;
  translateTravelMode: (mode: TravelMode) => string;
  translateWeatherDesc: (desc: string) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Default to Korean as requested by the user, check localStorage
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('vibetrip_language') as Language;
      if (saved === 'ko' || saved === 'en' || saved === 'ja') {
        return saved;
      }
    }
    return 'ko'; // Default Korean!
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vibetrip_language', lang);
      document.documentElement.lang = lang;
    }
  };

  const toggleLanguage = () => {
    if (language === 'ko') setLanguage('en');
    else if (language === 'en') setLanguage('ja');
    else setLanguage('ko');
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: keyof Translations, params?: Record<string, string | number>): string => {
    const text = TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || String(key);
    if (!params) return text;

    return Object.entries(params).reduce((acc, [paramKey, paramVal]) => {
      return acc.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    }, text);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;

      if (language === 'ko') {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
        const dayName = dayNames[d.getDay()];
        return `${year}년 ${month}월 ${day}일 (${dayName})`;
      } else if (language === 'ja') {
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
        const dayName = dayNames[d.getDay()];
        return `${year}年 ${month}月 ${day}日 (${dayName})`;
      } else {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        };
        return d.toLocaleDateString('en-US', options);
      }
    } catch {
      return dateStr;
    }
  };

  const formatDayNumber = (dayNum: number): string => {
    if (language === 'ko') return `${dayNum}일차`;
    if (language === 'ja') return `${dayNum}日目`;
    return `Day ${dayNum}`;
  };

  const translateTravelMode = (mode: TravelMode): string => {
    const map: Record<TravelMode, { ko: string; en: string; ja: string }> = {
      walk: { ko: '도보', en: 'Walk', ja: '徒歩' },
      bus: { ko: '버스', en: 'Bus', ja: 'バス' },
      train: { ko: '지하철/기차', en: 'Train', ja: '地下鉄/電車' },
      flight: { ko: '항공편', en: 'Flight', ja: 'フライト' },
      car: { ko: '차량/택시', en: 'Drive', ja: '車/タクシー' },
      ferry: { ko: '페리/선박', en: 'Ferry', ja: 'フェリー/船' },
    };
    return map[mode]?.[language] || map[mode]?.['ko'] || mode;
  };

  const translateWeatherDesc = (desc: string): string => {
    if (!desc) return '';
    if (language === 'en') return desc;

    const lower = desc.toLowerCase().trim();
    if (language === 'ja') {
      if (WEATHER_JA_MAP[lower]) return WEATHER_JA_MAP[lower];
      for (const [enKey, jaVal] of Object.entries(WEATHER_JA_MAP)) {
        if (lower.includes(enKey)) return jaVal;
      }
      return desc;
    }

    if (WEATHER_KO_MAP[lower]) {
      return WEATHER_KO_MAP[lower];
    }

    // Partial matches
    for (const [enKey, koVal] of Object.entries(WEATHER_KO_MAP)) {
      if (lower.includes(enKey)) {
        return koVal;
      }
    }

    return desc;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        formatDate,
        formatDayNumber,
        translateTravelMode,
        translateWeatherDesc,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
