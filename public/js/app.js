/**
 * QUIET - GÓI VIP (MEHAPPY.INFO) MASTER JAVASCRIPT
 * Responsive Desktop + Mobile interactive features:
 * Audio player, Falling hearts, Navigation drawer, Tabs, Countdown,
 * RSVP submission, Wishes guestbook, Lightbox gallery, Bank popup, Real-time toasts
 */

// ==========================================
// 1. DATASET & CONFIGURATION
// ==========================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx9DSHqd9H3Ozx5kIiWqyj-xvPxe477ZU67Ssh62DcCXxI6yQQRpBrfhKOHQ1KsQ_A/exec';

const ALBUM_IMAGES = [
  "images/wedding/PQD06286.jpg",
  "images/wedding/PQD06764.jpg",
  "images/wedding/PQD06793.jpg",
  "images/wedding/PQD06929.jpg",
  "images/wedding/PQD07040.jpg",
  "images/wedding/PQD07012.jpg",
  "images/wedding/PQD07057.jpg",
  "images/wedding/PQD07109.jpg",
  "images/wedding/PQD07139.jpg",
  "images/wedding/PQD07266.jpg",
  "images/wedding/PQD06734.jpg",
  "images/wedding/PQD06742.jpg",
  "images/wedding/PQD06779.jpg",
  "images/wedding/PQD06861.jpg",
  "images/wedding/PQD06867.jpg",
  "images/wedding/PQD06886.jpg",
  "images/wedding/PQD06888.jpg",
  "images/wedding/PQD07034.jpg",
  "images/wedding/PQD07161.jpg",
  "images/wedding/PQD07174.jpg",
  "images/wedding/PQD06107.jpg",
  "images/wedding/PQD06385.jpg",
  "images/wedding/PQD06872.jpg",
  "images/wedding/PQD06805.jpg",
  "images/wedding/PQD06817.jpg",
  "images/wedding/PQD06879.jpg",
  "images/wedding/PQD06342.jpg",
  "images/wedding/PQD07117.jpg",
  "images/wedding/PQD06986.jpg",
  "images/wedding/PQD06917.jpg"
];

const GUEST_NOTIFICATIONS = [
  { name: 'Cao Thái Sơn', text: 'Chúc hai bạn vui vẻ, trăm năm hạnh phúc!' },
  { name: 'Bác Nguyễn Văn Hùng', text: 'vừa xác nhận tham dự tiệc cưới Nhà Gái' },
  { name: 'Cô Nghiêm Kim Oanh', text: 'Chúc hai cháu trăm năm tình viên mãn!' },
  { name: 'Anh Minh Tuấn', text: 'Chúc mừng hạnh phúc hai em Phú Cường & Thuỳ Linh!' },
  { name: 'Bạn Phương Linh', text: 'Chúc hai bạn mãi mãi ngọt ngào, hạnh phúc!' }
];

// ==========================================
// 2. BACKGROUND AUDIO & CONTROLS (RANDOM PLAYLIST - NHẠC CHẤT LƯỢNG CAO)
// ==========================================
const WEDDING_PLAYLIST = [
  {
    title: 'Lễ Đường - Kai Đinh',
    src: './audio/le_duong.mp3',
    startTime: 20
  },
  {
    title: 'Một Đời - 14 Casper & Bon Nghiêm',
    src: './audio/mot_doi.mp3',
    startTime: 20
  },
  {
    title: 'I Do - 911 (Nhạc Đám Cưới Hay Nhất)',
    src: './audio/i_do_911.mp3',
    fallbackSrc: 'https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/audio-templates/980b5e37-0d23-473b-a559-f030fd7b5541.mp3',
    startTime: 20
  }
];

let currentTrackIndex = Math.floor(Math.random() * WEDDING_PLAYLIST.length);
const bgAudio = document.getElementById('bg-audio');
const audioToggleBtn = document.getElementById('audio-toggle-btn');
let isAudioPlaying = false;
var isAutoScrolling = false;
let isAudioSeekInitialized = false;

function initRandomAudioTrack() {
  if (!bgAudio) return;
  const track = WEDDING_PLAYLIST[currentTrackIndex];
  bgAudio.src = track.src;

  const seekToStartTime = () => {
    const targetTime = track.startTime || 20;
    if (bgAudio.currentTime < targetTime) {
      try {
        bgAudio.currentTime = targetTime;
        isAudioSeekInitialized = true;
      } catch (e) {}
    }
  };

  bgAudio.addEventListener('loadedmetadata', seekToStartTime);
  bgAudio.addEventListener('canplay', seekToStartTime);

  // Đảm bảo tuyệt đối bỏ đoạn dạo đầu khi nhạc bắt đầu phát
  bgAudio.addEventListener('timeupdate', () => {
    const curr = WEDDING_PLAYLIST[currentTrackIndex];
    const target = (curr && curr.startTime) ? curr.startTime : 20;
    if (!isAudioSeekInitialized && bgAudio.currentTime < target) {
      isAudioSeekInitialized = true;
      try {
        bgAudio.currentTime = target;
      } catch (e) {}
    }
  });

  bgAudio.addEventListener('ended', () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * WEDDING_PLAYLIST.length);
    } while (nextIndex === currentTrackIndex && WEDDING_PLAYLIST.length > 1);

    currentTrackIndex = nextIndex;
    isAudioSeekInitialized = false;
    playCurrentTrack();
  });

  bgAudio.addEventListener('error', () => {
    const curr = WEDDING_PLAYLIST[currentTrackIndex];
    if (curr && curr.fallbackSrc && bgAudio.src !== curr.fallbackSrc) {
      bgAudio.src = curr.fallbackSrc;
      playCurrentTrack();
    }
  });
}

function playCurrentTrack() {
  if (!bgAudio) return Promise.reject();
  const track = WEDDING_PLAYLIST[currentTrackIndex];

  if (!bgAudio.src || !bgAudio.src.includes(track.src.replace('./', ''))) {
    bgAudio.src = track.src;
    isAudioSeekInitialized = false;
  }

  const targetTime = track.startTime || 20;
  if (!isAudioSeekInitialized || bgAudio.currentTime < targetTime) {
    try {
      bgAudio.currentTime = targetTime;
      isAudioSeekInitialized = true;
    } catch (e) {}
  }

  const p = bgAudio.play();
  if (p && typeof p.then === 'function') {
    return p.then(() => {
      if (bgAudio.currentTime < targetTime) {
        try {
          bgAudio.currentTime = targetTime;
          isAudioSeekInitialized = true;
        } catch (e) {}
      }
      updateAudioUI(true);
    }).catch(() => {});
  }
  return Promise.resolve();
}

function updateAudioUI(playing) {
  isAudioPlaying = playing;
  if (audioToggleBtn) {
    if (playing) {
      audioToggleBtn.classList.remove('paused');
    } else {
      audioToggleBtn.classList.add('paused');
    }
  }
  const bottomMusicBtn = document.getElementById('bottom-bar-music');
  if (bottomMusicBtn) {
    if (playing) {
      bottomMusicBtn.classList.add('active');
    } else {
      bottomMusicBtn.classList.remove('active');
    }
  }
}

function toggleAudio() {
  if (!bgAudio) return;
  if (bgAudio.paused) {
    playCurrentTrack();
  } else {
    bgAudio.pause();
    updateAudioUI(false);
  }
}

function scrollToSection(id) {
  if (isAutoScrolling && typeof stopAutoScroll === 'function') {
    stopAutoScroll();
  }
  const el = document.getElementById(id);
  if (el) {
    const top = el.getBoundingClientRect().top + window.pageYOffset - 10;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  }
}

function scrollToTop() {
  if (isAutoScrolling && typeof stopAutoScroll === 'function') {
    stopAutoScroll();
  }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 2.1 NOVA PREMIUM OPENING INVITATION COVER
// ==========================================
function openNovaInvitation() {
  const cover = document.getElementById('nova-cover');
  if (!cover || cover.classList.contains('nova-opening')) return;

  cover.classList.add('nova-opening');

  // 1. Phát nhạc nền du dương (tự động chọn ngẫu nhiên bài hát và bắt đầu từ giây 20)
  if (bgAudio && bgAudio.paused) {
    playCurrentTrack();
  }

  // 2. Kích hoạt hiệu ứng sáng trắng mềm mại toàn màn hình để chuyển cảnh
  const flash = document.getElementById('nova-white-flash');
  if (flash) {
    flash.classList.remove('fade-out');
    flash.classList.add('active');
  }

  // 3. Tại đỉnh điểm ánh sáng trắng (550ms), ẩn thiệp mở và chuẩn bị trang chính
  setTimeout(() => {
    cover.style.display = 'none';
    document.body.classList.remove('nova-cover-active');
    window.scrollTo({ top: 0, behavior: 'instant' });

    // 4. Ánh sáng trắng tan dần nhẹ nhàng mở ra trang chính
    if (flash) {
      flash.classList.remove('active');
      flash.classList.add('fade-out');
    }

    // 5. Hiệu ứng chữ "Phú Cường & Thuỳ Linh" bắt đầu chạy vào lộng lẫy
    triggerHeroCoupleAnimation();

    // 6. Tự động cuộn trang êm ái luôn khi vào trang
    setTimeout(() => {
      startAutoScroll();
    }, 900);
  }, 550);
}

function triggerHeroCoupleAnimation() {
  const heroBanner = document.getElementById('hero-hy-banner');
  const heroLeft = document.querySelector('.hero-name-left');
  const heroSep = document.querySelector('.hero-name-sep');
  const heroRight = document.querySelector('.hero-name-right');
  const heroScrollBtn = document.getElementById('hero-scroll-btn');

  // Reset các trạng thái để hiệu ứng chạy từ đầu
  if (heroBanner) {
    heroBanner.classList.remove('animate', 'qv-visible');
    void heroBanner.offsetWidth;
  }
  if (heroLeft) {
    heroLeft.classList.remove('animate', 'qv-visible');
    void heroLeft.offsetWidth; // Force reflow
  }
  if (heroSep) {
    heroSep.classList.remove('animate', 'qv-visible');
    void heroSep.offsetWidth;
  }
  if (heroRight) {
    heroRight.classList.remove('animate', 'qv-visible');
    void heroRight.offsetWidth;
  }
  if (heroScrollBtn) heroScrollBtn.classList.remove('qv-visible');

  // Kích hoạt thẻ chữ Hỷ và hiệu ứng viết chữ handwriting (Long Phụng V2 Đỏ)
  setTimeout(() => {
    if (heroBanner) heroBanner.classList.add('animate');
    if (heroLeft) heroLeft.classList.add('animate');
    if (heroSep) heroSep.classList.add('animate');
    if (heroRight) heroRight.classList.add('animate');
  }, 80);

  // Hiển thị nút cuộn sau khi tên đã xuất hiện
  setTimeout(() => {
    if (heroScrollBtn) heroScrollBtn.classList.add('qv-visible');
  }, 2200);
}

function initHeroCoverAnimation() {
  // Nếu có bìa mở thiệp thì đợi bấm Mở thiệp mới kích hoạt chữ chạy
  if (document.body.classList.contains('nova-cover-active')) {
    return;
  }
  triggerHeroCoupleAnimation();
}

// ==========================================
// HIỆU ỨNG 2 LINH VẬT SONG PHỤNG Ở ẢNH 2 (CARD THIỆP MỜI)
// Xuất hiện khi cuộn tới ảnh 2 và mờ dần khi cuộn tiếp xuống trang mới
// ==========================================
function initCardCreaturesScrollEffect() {
  const creatureWraps = document.querySelectorAll('.card-flanking-creatures');
  if (!creatureWraps.length) return;

  let ticking = false;
  let cachedTop = 0;
  let cachedHeight = 0;
  let cachedWinH = window.innerHeight;

  function measure() {
    const activeCard = document.querySelector('.sec-card:not([style*="display: none"])');
    if (activeCard) {
      const box = activeCard.getBoundingClientRect();
      cachedTop = box.top + window.scrollY;
      cachedHeight = box.height;
    }
    cachedWinH = window.innerHeight;
  }

  function updateCreatures() {
    if (!cachedHeight) measure();
    const rectTop = cachedTop - window.scrollY;
    const rectBottom = rectTop + cachedHeight;
    const winH = cachedWinH;

    let opacity = 0;

    // Khi cuộn tới ảnh 2: Đỉnh thiệp tiến vào màn hình từ dưới lên (rectTop <= winH * 0.88)
    // Và mờ dần khi cuộn tiếp xuống trang mới: Đáy thiệp rời màn hình lên trên (rectBottom >= winH * 0.12)
    if (rectTop <= winH * 0.88 && rectBottom >= winH * 0.12) {
      const enterProgress = Math.min(1, Math.max(0, (winH * 0.88 - rectTop) / (winH * 0.35)));
      const leaveProgress = Math.min(1, Math.max(0, (rectBottom - winH * 0.12) / (winH * 0.4)));
      opacity = Math.min(enterProgress, leaveProgress);
    } else {
      opacity = 0;
    }

    const opStr = opacity.toFixed(3);
    creatureWraps.forEach(wrap => {
      wrap.style.opacity = opStr;
    });

    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateCreatures);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => {
    measure();
    onScroll();
  }, { passive: true });

  window.remeasureCreatures = measure;
  measure();
  updateCreatures();
}

function enableAudioOnFirstGesture() {
  const onFirstInteraction = () => {
    if (bgAudio && bgAudio.paused) {
      playCurrentTrack();
    }
    ['click', 'touchstart', 'pointerdown', 'wheel', 'scroll', 'keydown'].forEach(evt => {
      window.removeEventListener(evt, onFirstInteraction, { capture: true });
      document.removeEventListener(evt, onFirstInteraction, { capture: true });
    });
  };

  ['click', 'touchstart', 'pointerdown', 'wheel', 'scroll', 'keydown'].forEach(evt => {
    window.addEventListener(evt, onFirstInteraction, { once: true, passive: true, capture: true });
    document.addEventListener(evt, onFirstInteraction, { once: true, passive: true, capture: true });
  });
}

// ==========================================
// 3. NAVIGATION DRAWER (HAMBURGER MENU)
// ==========================================
function toggleNavMenu() {
  const drawer = document.getElementById('nav-drawer');
  if (drawer) {
    drawer.classList.toggle('open');
  }
}

function closeNavOnBackdrop(e) {
  if (e.target.id === 'nav-drawer') {
    toggleNavMenu();
  }
}

// ==========================================
// 4. WOBBLE FALLING HEARTS (QUIET VIP SIGNATURE)
// ==========================================
function initFallingHearts() {
  const container = document.getElementById('particles-container');
  if (!container) return;

  // Exact MeHappy Quiet VIP Particle SVGs
  const heartSvg1 = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#965D5D"><path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"/></svg>'
  );
  const heartSvg2 = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#A07B7B"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  );
  const sparkleSvg = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#ffffff" opacity="0.85"/></svg>'
  );

  function createHeart() {
    const heart = document.createElement('div');
    heart.className = 'falling-heart';

    const randType = Math.random();
    let chosenSvg = heartSvg1;
    let size = Math.floor(Math.random() * 8) + 12; // 12px - 20px

    if (randType < 0.25) {
      chosenSvg = sparkleSvg;
      size = Math.floor(Math.random() * 4) + 6; // 6px - 10px sparkle
    } else if (randType < 0.6) {
      chosenSvg = heartSvg2;
    }

    const left = Math.random() * 100; // 0 - 100vw
    const duration = Math.random() * 4.5 + 8.5; // 8.5s - 13.0s slow dreamy fall
    const wobbleDuration = Math.random() * 2.0 + 2.5; // 2.5s - 4.5s gentle wobble
    const delay = Math.random() * 1.5;

    heart.style.left = left + 'vw';
    heart.style.width = size + 'px';
    heart.style.height = size + 'px';
    heart.style.backgroundImage = 'url("data:image/svg+xml,' + chosenSvg + '")';
    heart.style.backgroundSize = 'contain';
    heart.style.backgroundRepeat = 'no-repeat';
    heart.style.animationDuration = duration + 's, ' + wobbleDuration + 's';
    heart.style.animationDelay = delay + 's, ' + delay + 's';

    container.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, (duration + delay) * 1000);
  }

  // Pre-seed hearts across screen
  for (let i = 0; i < 14; i++) {
    createHeart();
  }
  setInterval(createHeart, 700);
}

// ==========================================
// 5. TAB SWITCHER (NHÀ GÁI)
// ==========================================
function switchCard(type) {
  const cardGai = document.getElementById('section-card-nhagai');
  if (cardGai) {
    cardGai.style.display = 'block';
    const frame = cardGai.querySelector('.card-parchment-frame');
    const photo = cardGai.querySelector('.card-photo-wrapper');
    const animEls = cardGai.querySelectorAll('[class*="qv-anim-"], .qv-reveal, .qv-text-reveal');
    animEls.forEach(el => el.classList.remove('qv-visible'));
    setTimeout(() => {
      if (frame) frame.classList.add('qv-visible');
      setTimeout(() => { if (photo) photo.classList.add('qv-visible'); }, 320);
      animEls.forEach(el => { if (el !== frame && el !== photo) el.classList.add('qv-visible'); });
    }, 40);
  }
  if (typeof switchSchedule === 'function') switchSchedule('bride');

  if (typeof window.refreshScrollReveal === 'function') {
    setTimeout(window.refreshScrollReveal, 40);
  }
  if (typeof window.remeasureCreatures === 'function') {
    setTimeout(window.remeasureCreatures, 50);
  }
}

// ==========================================
// 6. VIP SCHEDULE & COUNTDOWN TIMER (NHÀ GÁI)
// ==========================================
let currentScheduleSide = 'bride'; // Luôn mặc định Nhà Gái
let scheduleCountdownTarget = new Date('2026-11-17T11:00:00+07:00').getTime();

const SCHEDULE_CONFIG = {
  groom: {
    side: 'bride',
    targetISO: '2026-11-17T11:00:00+07:00',
    selectedTimeText: '11:00 Thứ 3 ngày 17 thg 11, 2026',
    dayText: 'Thứ Ba',
    dateText: '17 . 11 . 2026',
    venueText: 'Tại : TT Tiệc Cưới Queen Bee',
    addressText: 'Số 20 Láng Hạ, quận Đống Đa, Hà Nội',
    mapUrl: 'https://maps.google.com/?q=Queen+Bee+20+Láng+Hạ+Đống+Đa+Hà+Nội',
    calTitle: 'Lễ Cưới Phú Cường & Vũ Thuỳ Linh (Nhà Gái)',
    calStart: '2026-11-17T11:00:00',
    calEnd: '2026-11-17T15:00:00',
    highlightDays: [17]
  },
  bride: {
    side: 'bride',
    targetISO: '2026-11-17T11:00:00+07:00',
    selectedTimeText: '11:00 Thứ 3 ngày 17 thg 11, 2026',
    dayText: 'Thứ Ba',
    dateText: '17 . 11 . 2026',
    venueText: 'Tại : TT Tiệc Cưới Queen Bee',
    addressText: 'Số 20 Láng Hạ, quận Đống Đa, Hà Nội',
    mapUrl: 'https://maps.google.com/?q=Queen+Bee+20+Láng+Hạ+Đống+Đa+Hà+Nội',
    calTitle: 'Lễ Cưới Phú Cường & Vũ Thuỳ Linh (Nhà Gái)',
    calStart: '2026-11-17T11:00:00',
    calEnd: '2026-11-17T15:00:00',
    highlightDays: [17]
  }
};

function switchSchedule(side) {
  currentScheduleSide = 'bride';
  const cfg = SCHEDULE_CONFIG['bride'];
  if (!cfg) return;

  // 1. Tiêu đề
  const badgeText = document.getElementById('sched-title-text');
  if (badgeText) {
    badgeText.textContent = 'LỊCH CƯỚI NHÀ CÔ DÂU';
  }

  // 2. Đánh dấu trái tim ngày 17/11 (duy nhất ngày Nhà Gái)
  const allCells = document.querySelectorAll('.cal-cell[data-day]');
  allCells.forEach(cell => {
    const day = parseInt(cell.getAttribute('data-day'), 10);
    if (day === 17) {
      cell.classList.add('has-heart');
    } else {
      cell.classList.remove('has-heart');
    }
  });

  // 3. Phụ đề dưới lịch
  const timeBox = document.getElementById('cal-selected-time');
  if (timeBox) timeBox.textContent = '11:00 Thứ 3 ngày 17 thg 11, 2026';

  // 4. Thông tin chi tiết địa điểm Nhà Gái
  const dayLbl = document.getElementById('tl-dyn-day');
  const dateLbl = document.getElementById('tl-dyn-date');
  const venueLbl = document.getElementById('tl-dyn-venue');
  const addrLbl = document.getElementById('tl-dyn-address');
  const mapBtn = document.getElementById('tl-btn-map');

  if (dayLbl) dayLbl.textContent = 'Thứ Ba';
  if (dateLbl) dateLbl.textContent = '17 . 11 . 2026';
  if (venueLbl) venueLbl.textContent = 'Tại : Trung Tâm Tiệc Cưới Queen Bee';
  if (addrLbl) addrLbl.textContent = 'Số 20 Láng Hạ, quận Đống Đa, Hà Nội';
  if (mapBtn) mapBtn.href = 'https://maps.google.com/?q=Queen+Bee+20+Láng+Hạ+Đống+Đa+Hà+Nội';

  // 5. Mục tiêu đếm ngược: 11:00 ngày 17/11/2026
  scheduleCountdownTarget = new Date('2026-11-17T11:00:00+07:00').getTime();
}

function addTimelineToCalendar() {
  const cfg = SCHEDULE_CONFIG[currentScheduleSide];
  if (!cfg) return;
  addToGoogleCalendar(cfg.calTitle, cfg.calStart, cfg.calEnd, cfg.addressText);
}

function initCountdown() {
  function update() {
    const now = new Date().getTime();
    const distance = scheduleCountdownTarget - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-minutes');
    const secsEl = document.getElementById('cd-seconds');

    if (distance <= 0) {
      if (daysEl) daysEl.textContent = '00';
      if (hoursEl) hoursEl.textContent = '00';
      if (minsEl) minsEl.textContent = '00';
      if (secsEl) secsEl.textContent = '00';
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = d < 10 ? '0' + d : d;
    if (hoursEl) hoursEl.textContent = h < 10 ? '0' + h : h;
    if (minsEl) minsEl.textContent = m < 10 ? '0' + m : m;
    if (secsEl) secsEl.textContent = s < 10 ? '0' + s : s;
  }
  update();
  setInterval(update, 1000);
}

// ==========================================
// 7. RSVP FORM SUBMISSION
// ==========================================
function selectAttendance(val) {
  const cardYes = document.getElementById('card-attend-yes');
  const cardNo = document.getElementById('card-attend-no');
  const radios = document.querySelectorAll('input[name="willComeRadio"]');
  radios.forEach(r => {
    if (r.value === val) r.checked = true;
  });
  if (val.includes('Có')) {
    if (cardYes) cardYes.classList.add('active');
    if (cardNo) cardNo.classList.remove('active');
  } else {
    if (cardYes) cardYes.classList.remove('active');
    if (cardNo) cardNo.classList.add('active');
  }
}

async function handleRsvpSubmit(e) {
  e.preventDefault();
  const nameInput = document.getElementById('rsvp-name');
  const fullName = nameInput ? nameInput.value.trim() : '';
  const willComeRadio = document.querySelector('input[name="willComeRadio"]:checked');
  const willCome = willComeRadio ? willComeRadio.value : 'Có, tôi sẽ tham dự';

  const guestOfEl = document.getElementById('rsvp-guest-of');
  const guestType = guestOfEl ? (guestOfEl.options[guestOfEl.selectedIndex]?.text || guestOfEl.value) : 'Khách mời của cả hai';

  const countEl = document.getElementById('rsvp-count') || document.getElementById('rsvp-guests');
  const quantity = countEl ? (countEl.options[countEl.selectedIndex]?.text || countEl.value) : '1';

  const eventTargetEl = document.getElementById('rsvp-event-target') || document.getElementById('rsvp-event');
  const partyTime = eventTargetEl ? (eventTargetEl.options[eventTargetEl.selectedIndex]?.text || eventTargetEl.value) : 'Tiệc Cưới Nhà Gái';

  const noteEl = document.getElementById('rsvp-note');
  const note = noteEl ? noteEl.value.trim() : '';
  const btn = document.getElementById('rsvp-submit-btn');
  const feedback = document.getElementById('rsvp-feedback');

  if (!fullName) {
    alert('Vui lòng nhập họ và tên của bạn!');
    if (nameInput) nameInput.focus();
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Đang gửi xác nhận...</span>';
  }

  const payload = {
    sheetName: 'RSVP',
    action: 'rsvp',
    name: fullName,
    fullName: fullName,
    status: willCome,
    willCome: willCome,
    attending: willCome,
    guestType: guestType,
    guestOf: guestType,
    quantity: quantity,
    guests: quantity,
    count: quantity,
    partyTime: partyTime,
    event: partyTime,
    eventSide: partyTime,
    note: note,
    message: note,
    time: new Date().toLocaleString('vi-VN')
  };

  try {
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    if (GOOGLE_SCRIPT_URL) {
      const qs = new URLSearchParams(payload).toString();
      const scriptUrl = GOOGLE_SCRIPT_URL.includes('?') ? `${GOOGLE_SCRIPT_URL}&${qs}` : `${GOOGLE_SCRIPT_URL}?${qs}`;
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('Google Script sync warning:', err));
    }

    if (feedback) {
      feedback.className = 'form-feedback-msg success';
      feedback.textContent = '🎉 Xác nhận tham dự thành công! Cảm ơn bạn rất nhiều!';
    }
    if (btn) btn.innerHTML = '<span>Đã xác nhận</span>';
  } catch (err) {
    if (feedback) {
      feedback.className = 'form-feedback-msg success';
      feedback.textContent = '🎉 Đã ghi nhận phản hồi của bạn! Chân thành cảm ơn!';
    }
    if (btn) btn.innerHTML = '<span>Đã gửi</span>';
  }
}


// 8. WISHES GUESTBOOK & SUGGESTIONS
// ==========================================
function getLocalWishes() {
  try {
    return JSON.parse(localStorage.getItem('wedding_guestbook_wishes') || '[]');
  } catch (e) {
    return [];
  }
}

function saveLocalWish(item) {
  try {
    const list = getLocalWishes();
    list.unshift(item);
    localStorage.setItem('wedding_guestbook_wishes', JSON.stringify(list.slice(0, 50)));
  } catch (e) {}
}

function safeText(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

function applySuggestedWish(btn) {
  const textarea = document.getElementById('wish-message');
  if (textarea) {
    textarea.value = btn.textContent.trim();
    textarea.focus();
    const tanaWish = document.getElementById('tana-wish-text');
    if (tanaWish) tanaWish.value = textarea.value;
    const innerNote = document.getElementById('rsvp-note');
    if (innerNote) innerNote.value = textarea.value;
    try {
      sessionStorage.setItem('wedding_guest_wish', textarea.value);
      localStorage.setItem('wedding_guest_wish', textarea.value);
    } catch (e) {}
  }
}

async function handleWishSubmit(e) {
  e.preventDefault();
  const authorInput = document.getElementById('wish-author');
  const messageInput = document.getElementById('wish-message');
  const btn = document.getElementById('wish-submit-btn');
  const feedback = document.getElementById('wish-feedback');
  const list = document.getElementById('wishes-list');

  const author = (authorInput.value || '').trim();
  const message = (messageInput.value || '').trim();

  if (!author || !message) {
    alert('Vui lòng nhập họ tên và lời chúc!');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span>Đang gửi lời chúc...</span>';
  feedback.className = 'form-feedback-msg';

  const payload = {
    sheetName: 'Wishes',
    action: 'wish',
    name: author,
    fullName: author,
    message: message,
    wishes: message,
    time: 'Vừa xong'
  };

  try {
    // Only call local Node server API when running on localhost to avoid 404 on Vercel
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    if (GOOGLE_SCRIPT_URL) {
      const qs = new URLSearchParams(payload).toString();
      const scriptUrl = GOOGLE_SCRIPT_URL.includes('?') ? `${GOOGLE_SCRIPT_URL}&${qs}` : `${GOOGLE_SCRIPT_URL}?${qs}`;
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      }).catch(err => console.warn('Google Script sync warning:', err));
    }

    // Persist locally so guests see their wish immediately and on page reloads
    saveLocalWish({ name: author, message: message, time: 'Vừa xong' });

    if (list) {
      const card = document.createElement('div');
      card.className = 'wish-item-card';
      card.innerHTML = `
        <div class="wish-name">${safeText(author)}</div>
        <div class="wish-body">${safeText(message)}</div>
      `;
      list.prepend(card);
    }

    feedback.className = 'form-feedback-msg success';
    feedback.textContent = '❤️ Lời chúc của bạn đã được gửi thành công!';
    btn.innerHTML = '<span>Đã gửi</span>';
    messageInput.value = '';

    showToastNotification(author, 'vừa gửi lời chúc mừng hạnh phúc!');
    setTimeout(() => {
      btn.disabled = false;
      btn.innerHTML = '<span>Gửi Lời Chúc</span>';
    }, 3000);
  } catch (err) {
    feedback.className = 'form-feedback-msg success';
    feedback.textContent = '❤️ Đã ghi nhận lời chúc của bạn!';
    btn.innerHTML = '<span>Đã gửi</span>';
  }
}

async function loadWishes() {
  const list = document.getElementById('wishes-list');
  if (!list) return;

  // 1. Render persisted wishes from localStorage first
  const localWishes = getLocalWishes();
  if (localWishes.length > 0) {
    list.innerHTML = '';
    localWishes.forEach(item => {
      const card = document.createElement('div');
      card.className = 'wish-item-card';
      card.innerHTML = `
        <div class="wish-name">${safeText(item.name || 'Khách quý')}</div>
        <div class="wish-body">${safeText(item.message || item.wishes || '')}</div>
      `;
      list.appendChild(card);
    });
  }

  // 2. If running on localhost, sync from Node server database
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.length > 0) {
          list.innerHTML = '';
          json.data.forEach(item => {
            const card = document.createElement('div');
            card.className = 'wish-item-card';
            card.innerHTML = `
              <div class="wish-name">${safeText(item.name || 'Khách quý')}</div>
              <div class="wish-body">${safeText(item.message || item.wishes || '')}</div>
            `;
            list.appendChild(card);
          });
        }
      }
    } catch (e) {}
  }
}

// ==========================================
// 8. ALBUM EXPAND / COLLAPSE TOGGLE, PRELOADER & CHOREOGRAPHY
// ==========================================
const PRELOADED_ALBUM_CACHE = new Set();

function preloadSingleImage(src, priority = 'high') {
  if (!src || PRELOADED_ALBUM_CACHE.has(src)) return;
  PRELOADED_ALBUM_CACHE.add(src);

  const img = new Image();
  img.decoding = 'async';
  img.fetchPriority = priority;
  img.src = src;
  if ('decode' in img) {
    img.decode().catch(() => {});
  }
}

// Luôn ưu tiên tải trước toàn bộ 10 ảnh album cưới ngay khi mở web
function initAlbumPriorityPreloader() {
  const initialPhotos = [
    "images/wedding/PQD06286.jpg",
    "images/wedding/PQD06817.jpg",
    "images/wedding/PQD06861.jpg",
    "images/wedding/PQD06867.jpg",
    "images/wedding/PQD07040.jpg",
    "images/wedding/PQD07057.jpg",
    "images/wedding/PQD07109.jpg",
    "images/wedding/PQD06764.jpg",
    "images/wedding/PQD06793.jpg",
    "images/wedding/PQD06929.jpg"
  ];

  // Nạp ngay lập tức 10 ảnh với ưu tiên cao nhất
  initialPhotos.forEach(src => preloadSingleImage(src, 'high'));

  // Nạp thêm các ảnh mở rộng trong lúc rảnh rỗi
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      ALBUM_IMAGES.forEach(src => preloadSingleImage(src, 'auto'));
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      ALBUM_IMAGES.forEach(src => preloadSingleImage(src, 'auto'));
    }, 800);
  }
}

// Kích hoạt hiệu ứng chính xác khi người dùng cuộn tới hoặc bấm Tự cuộn
function initAlbumScrollChoreography() {
  const row1 = document.querySelector('.album-row.row-4-cols');
  const row2 = document.querySelector('.album-row.row-3-tall');
  const row3 = document.querySelector('.album-row.row-3-wide');

  if (!row1 || !row2 || !row3) return;

  let row1TriggerTime = 0;
  let row2TriggerTime = 0;

  const rowObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const target = entry.target;

      if (entry.isIntersecting) {
        if (target === row1) {
          row1TriggerTime = Date.now();
          target.classList.add('qv-row-active');
        } else if (target === row2) {
          // Nếu hàng 1 vừa mới chạy (màn hình lớn), đợi hàng 1 xong 600ms rồi chạy tiếp
          // Nếu người dùng cuộn chậm tới hàng 2 sau vài giây thì kích hoạt ngay lập tức!
          const elapsed = row1TriggerTime ? (Date.now() - row1TriggerTime) : 9999;
          const wait = Math.max(0, 600 - elapsed);
          setTimeout(() => {
            row2TriggerTime = Date.now();
            target.classList.add('qv-row-active');
          }, wait);
        } else if (target === row3) {
          // Tương tự, nếu vừa chạy hàng 2 thì đợi hàng 2 xong, còn nếu cuộn chậm thì chạy ngay
          const elapsed = row2TriggerTime ? (Date.now() - row2TriggerTime) : 9999;
          const wait = Math.max(0, 600 - elapsed);
          setTimeout(() => {
            target.classList.add('qv-row-active');
          }, wait);
        }
      } else {
        // Khi người dùng cuộn ngược lên phía trên, reset lại hiệu ứng để lần sau cuộn xuống chạy lại
        const rect = target.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          target.classList.remove('qv-row-active');
          if (target === row1) row1TriggerTime = 0;
          if (target === row2) row2TriggerTime = 0;
        }
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px' // Phải tiến vào trong màn hình ít nhất 40px mới kích hoạt
  });

  rowObserver.observe(row1);
  rowObserver.observe(row2);
  rowObserver.observe(row3);
}

function toggleAlbumExpand() {
  const container = document.getElementById('album-expanded-container');
  const textEl = document.getElementById('album-toggle-text');
  const iconEl = document.getElementById('album-toggle-icon');
  if (!container) return;

  const isHidden = container.style.display === 'none' || container.style.display === '';

  if (isHidden) {
    container.style.display = 'flex';
    // Kích hoạt hiển thị toàn bộ các hàng và ảnh mở rộng
    container.querySelectorAll('.album-row').forEach(row => {
      row.classList.add('qv-row-active');
    });
    container.querySelectorAll('.alb-card').forEach(card => {
      card.classList.add('qv-visible');
      card.style.opacity = '1';
      card.style.transform = 'none';
    });

    // Nạp trước toàn bộ ảnh mở rộng để người dùng lướt không bị khựng
    ALBUM_IMAGES.forEach(src => preloadSingleImage(src, 'auto'));

    if (textEl) textEl.textContent = 'THU GỌN';
    if (iconEl) {
      iconEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        </svg>
      `;
    }
    if (typeof window.refreshScrollReveal === 'function') {
      setTimeout(window.refreshScrollReveal, 80);
    }
  } else {
    container.style.display = 'none';
    if (textEl) textEl.textContent = 'XEM THÊM';
    if (iconEl) {
      iconEl.innerHTML = `
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#ffffff">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      `;
    }
    const sec = document.getElementById('section-album');
    if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ==========================================
// 9. LIGHTBOX GALLERY
// ==========================================
let currentLightboxIndex = 0;


// ==========================================
// GROOM & BRIDE PROFILE ALBUM MODALS
// ==========================================
const GROOM_ALBUM = [
  "images/wedding/PQD06872.jpg",
  "images/wedding/PQD06805.jpg",
  "images/wedding/PQD06817.jpg",
  "images/wedding/PQD06879.jpg"
];
const BRIDE_ALBUM = [
  "images/wedding/PQD06342.jpg",
  "images/wedding/PQD07117.jpg",
  "images/wedding/PQD06986.jpg",
  "images/wedding/PQD06917.jpg"
];

const GROOM_CAPTION = "Phú Cường, chàng trai mùa thu Hà Nội. Những năm tháng học tập xa nhà tại Nhật Bản đã giúp anh hiểu rằng: điều quý giá nhất chính là sự tin tưởng và thấu hiểu từ phương xa. Cảm ơn em đã luôn là hậu phương ấm áp, cùng anh bước qua khoảng cách địa lý để hôm nay hai đứa chính thức về chung một mái nhà.";
const BRIDE_CAPTION = "Thuỳ Linh, cô gái Hà Nội xinh xắn. Duyên phận đưa hai người gặp gỡ, và sự chân thành đã giữ hai trái tim luôn gần nhau suốt những mùa yêu xa. Hạnh phúc giản đơn là sau tất cả những cuộc gọi cách trở ngàn cây số, giờ đây mỗi ngày đều có thể bình yên cùng nhau sẻ chia mọi khoảnh khắc đời thường.";

let currentSubAlbum = [];
let currentSubIndex = 0;
let currentSubCaption = "";

function openGroomAlbum(index = 0) {
  currentSubAlbum = GROOM_ALBUM;
  currentSubIndex = index;
  currentSubCaption = GROOM_CAPTION;
  showPersonModal("CHÚ RỂ PHÚ CƯỜNG");
}

function openBrideAlbum(index = 0) {
  currentSubAlbum = BRIDE_ALBUM;
  currentSubIndex = index;
  currentSubCaption = BRIDE_CAPTION;
  showPersonModal("CÔ DÂU VŨ THÙY LINH");
}

// ==========================================
// LIGHTBOX ZOOM & PAN ENGINE
// ==========================================
let lightboxZoom = 1;
let lightboxPanX = 0;
let lightboxPanY = 0;
let isLightboxPanning = false;
let startPanX = 0;
let startPanY = 0;
let lastTapTime = 0;
let isZoomInitialized = false;

function applyLightboxTransform(animate = true) {
  const img = document.getElementById('lightbox-img');
  const badge = document.getElementById('lb-zoom-reset');
  if (!img) return;

  if (animate) {
    img.style.transition = 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)';
  } else {
    img.style.transition = 'none';
  }

  img.style.transform = `translate3d(${lightboxPanX}px, ${lightboxPanY}px, 0) scale(${lightboxZoom})`;
  img.style.cursor = lightboxZoom > 1 ? (isLightboxPanning ? 'grabbing' : 'grab') : 'zoom-in';

  if (badge) {
    badge.textContent = Math.round(lightboxZoom * 100) + '%';
  }
}

function clampLightboxPan() {
  const img = document.getElementById('lightbox-img');
  if (!img || lightboxZoom <= 1) {
    lightboxPanX = 0;
    lightboxPanY = 0;
    return;
  }
  const rect = img.getBoundingClientRect();
  const maxPanX = Math.max(0, (rect.width * (lightboxZoom - 1)) / (2 * lightboxZoom) + 60);
  const maxPanY = Math.max(0, (rect.height * (lightboxZoom - 1)) / (2 * lightboxZoom) + 60);

  lightboxPanX = Math.max(-maxPanX, Math.min(maxPanX, lightboxPanX));
  lightboxPanY = Math.max(-maxPanY, Math.min(maxPanY, lightboxPanY));
}

function setLightboxZoom(newZoom) {
  lightboxZoom = Math.min(4, Math.max(1, Math.round(newZoom * 100) / 100));
  if (lightboxZoom === 1) {
    lightboxPanX = 0;
    lightboxPanY = 0;
  } else {
    clampLightboxPan();
  }
  applyLightboxTransform(true);
}

function zoomLightbox(delta) {
  setLightboxZoom(lightboxZoom + delta);
}

function resetLightboxZoom() {
  lightboxZoom = 1;
  lightboxPanX = 0;
  lightboxPanY = 0;
  applyLightboxTransform(true);
}

function toggleLightboxFullZoom() {
  if (lightboxZoom > 1.1) {
    resetLightboxZoom();
  } else {
    setLightboxZoom(2);
  }
}

function initLightboxZoomEvents() {
  if (isZoomInitialized) return;
  const container = document.querySelector('.lightbox-media-container');
  const img = document.getElementById('lightbox-img');
  if (!container || !img) return;
  isZoomInitialized = true;

  // Mouse Wheel Zoom
  container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.25 : -0.25;
    zoomLightbox(delta);
  }, { passive: false });

  // Mouse Drag / Pan
  img.addEventListener('mousedown', (e) => {
    if (lightboxZoom <= 1) return;
    e.preventDefault();
    isLightboxPanning = true;
    startPanX = e.clientX - lightboxPanX;
    startPanY = e.clientY - lightboxPanY;
    img.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isLightboxPanning) return;
    e.preventDefault();
    lightboxPanX = e.clientX - startPanX;
    lightboxPanY = e.clientY - startPanY;
    clampLightboxPan();
    applyLightboxTransform(false);
  });

  window.addEventListener('mouseup', () => {
    if (isLightboxPanning) {
      isLightboxPanning = false;
      applyLightboxTransform(true);
    }
  });

  // Double Click Image
  img.addEventListener('dblclick', (e) => {
    e.preventDefault();
    toggleLightboxFullZoom();
  });

  // Touch Drag & Pinch Zoom
  let touchStartDist = 0;
  let touchStartZoom = 1;

  img.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTapTime < 300) {
        e.preventDefault();
        toggleLightboxFullZoom();
      }
      lastTapTime = now;

      if (lightboxZoom > 1) {
        isLightboxPanning = true;
        startPanX = e.touches[0].clientX - lightboxPanX;
        startPanY = e.touches[0].clientY - lightboxPanY;
      }
    } else if (e.touches.length === 2) {
      isLightboxPanning = false;
      touchStartDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStartZoom = lightboxZoom;
    }
  }, { passive: false });

  img.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1 && isLightboxPanning) {
      e.preventDefault();
      lightboxPanX = e.touches[0].clientX - startPanX;
      lightboxPanY = e.touches[0].clientY - startPanY;
      clampLightboxPan();
      applyLightboxTransform(false);
    } else if (e.touches.length === 2 && touchStartDist > 0) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = currentDist / touchStartDist;
      setLightboxZoom(touchStartZoom * ratio);
    }
  }, { passive: false });

  img.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) touchStartDist = 0;
    if (e.touches.length === 0) {
      isLightboxPanning = false;
      applyLightboxTransform(true);
    }
  });
}

function showPersonModal(title) {
  const modal = document.getElementById('qv-lightbox');
  let captionEl = document.getElementById('lightbox-caption');
  
  if (!captionEl) {
    captionEl = document.createElement('div');
    captionEl.id = 'lightbox-caption';
    captionEl.className = 'lightbox-caption-box';
    const container = document.querySelector('.lightbox-media-container');
    if (container) container.appendChild(captionEl);
  }
  
  resetLightboxZoom();
  initLightboxZoomEvents();
  updatePersonModalImage();
  if (modal) modal.classList.add('open');
}

function updatePersonModalImage() {
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  const captionEl = document.getElementById('lightbox-caption');
  
  if (img) img.src = currentSubAlbum[currentSubIndex];
  if (counter) counter.textContent = (currentSubIndex + 1) + ' / ' + currentSubAlbum.length;
  if (captionEl) captionEl.innerHTML = '<p class="lightbox-caption-text">' + currentSubCaption + '</p>';
}

function openLightboxByIndex(index) {
  const captionEl = document.getElementById("lightbox-caption");
  if (captionEl) captionEl.innerHTML = "";

  currentLightboxIndex = Math.max(0, Math.min(index, ALBUM_IMAGES.length - 1));
  resetLightboxZoom();
  initLightboxZoomEvents();
  updateLightboxImage();
  const modal = document.getElementById('qv-lightbox');
  if (modal) modal.classList.add('open');
  document.body.classList.add('lightbox-open');
}

function openLightboxBySrc(src) {
  const idx = ALBUM_IMAGES.indexOf(src);
  if (idx !== -1) {
    openLightboxByIndex(idx);
  } else {
    resetLightboxZoom();
    initLightboxZoomEvents();
    const modal = document.getElementById('qv-lightbox');
    const img = document.getElementById('lightbox-img');
    const counter = document.getElementById('lightbox-counter');
    if (img) img.src = src;
    if (counter) counter.textContent = '';
    if (modal) modal.classList.add('open');
    document.body.classList.add('lightbox-open');
  }
}

function updateLightboxImage() {
  const img = document.getElementById('lightbox-img');
  const counter = document.getElementById('lightbox-counter');
  if (img) img.src = ALBUM_IMAGES[currentLightboxIndex];
  if (counter) counter.textContent = (currentLightboxIndex + 1) + ' / ' + ALBUM_IMAGES.length;
}

function navigateLightbox(dir) {
  resetLightboxZoom();
  currentLightboxIndex += dir;
  if (currentLightboxIndex < 0) currentLightboxIndex = ALBUM_IMAGES.length - 1;
  if (currentLightboxIndex >= ALBUM_IMAGES.length) currentLightboxIndex = 0;
  updateLightboxImage();
}

function closeLightbox() {
  resetLightboxZoom();
  const modal = document.getElementById('qv-lightbox');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('lightbox-open');
}

function closeLightboxOnBackdrop(e) {
  if (e.target.id === 'qv-lightbox' || e.target.classList.contains('lightbox-media-container')) {
    closeLightbox();
  }
}

document.addEventListener('keydown', e => {
  const modal = document.getElementById('qv-lightbox');
  if (modal && modal.classList.contains('open')) {
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'Escape') closeLightbox();
    if (e.key === '+' || e.key === '=') zoomLightbox(0.25);
    if (e.key === '-' || e.key === '_') zoomLightbox(-0.25);
    if (e.key === '0') resetLightboxZoom();
  }
});

// ==========================================
// 10. POPUP HỘP MỪNG CƯỚI & CLIPBOARD
// ==========================================
function openPopup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}

function closePopup(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

function closePopupOnBackdrop(e, id) {
  if (e.target.id === id) {
    closePopup(id);
  }
}

function copyText(str, msg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str).then(() => {
      alert(msg || 'Đã sao chép: ' + str);
    }).catch(() => {
      fallbackCopy(str, msg);
    });
  } else {
    fallbackCopy(str, msg);
  }
}

function fallbackCopy(str, msg) {
  const temp = document.createElement('textarea');
  temp.value = str;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand('copy');
  document.body.removeChild(temp);
  alert(msg || 'Đã sao chép: ' + str);
}

// ==========================================
// 11. REAL-TIME TOAST NOTIFICATIONS
// ==========================================
let toastTimer = null;
let toastQueueIndex = 0;

function showToastNotification(name, action) {
  return; // hidden by user
  const toast = document.getElementById('guest-toast');
  const title = document.getElementById('toast-title');
  const text = document.getElementById('toast-text');
  const bar = document.getElementById('toast-progress-bar');
  if (!toast) return;

  if (title) title.textContent = name;
  if (text) text.textContent = action;

  toast.classList.add('show');
  if (bar) {
    bar.style.transition = 'none';
    bar.style.width = '100%';
    setTimeout(() => {
      bar.style.transition = 'width 6s linear';
      bar.style.width = '0%';
    }, 50);
  }

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 6200);
}

function closeToast() {
  const toast = document.getElementById('guest-toast');
  if (toast) toast.classList.remove('show');
  clearTimeout(toastTimer);
}

function startToastQueue() {
  setInterval(() => {
    const item = GUEST_NOTIFICATIONS[toastQueueIndex];
    showToastNotification(item.name, item.text);
    toastQueueIndex = (toastQueueIndex + 1) % GUEST_NOTIFICATIONS.length;
  }, 12000);
}

// ==========================================
// 12. SMOOTH SCROLL & CALENDAR HELPERS
// ==========================================
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function addToGoogleCalendar(title, startISO, endISO, location) {
  const format = iso => iso.replace(/[-:]/g, '') + 'Z';
  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent(title) +
    '&dates=' + format(startISO) + '/' + format(endISO) +
    '&location=' + encodeURIComponent(location) +
    '&details=' + encodeURIComponent('Đám cưới Phú Cường & Thuỳ Linh. Trân trọng kính mời bạn đến chung vui!');
  window.open(url, '_blank');
}

// ==========================================
// 13. SCROLL REVEAL OBSERVER (AOS STYLE)
// ĐẾN ĐÂU - KÍCH HOẠT HIỆU ỨNG TỚI ĐÓ!
// ĐẶC BIỆT: CÁC PHẦN CÓ ẢNH & LỚP CHỮ Ở TRÊN -> CUỘN XUỐNG MỘT CHÚT RỒI ẢNH MỚI HIỆN RA
// ==========================================
let globalScrollObserver = null;
let photoScrollObserver = null;

function isPhotoElement(el) {
  return el.matches('.card-photo-wrapper, .preface-fullscreen-photo, .portrait-photo, .wishes-photo-frame, .story-photo, .alb-card') ||
         Boolean(el.closest('.card-photo-wrapper, .preface-fullscreen-photo, .portrait-photo, .wishes-photo-frame, .story-photo'));
}

function initScrollReveal() {
  const elements = document.querySelectorAll('[class*="qv-anim-"], .qv-reveal, .qv-text-reveal');
  if (!elements.length) return;

  if (globalScrollObserver) globalScrollObserver.disconnect();
  if (photoScrollObserver) photoScrollObserver.disconnect();

  // 1. Observer cho văn bản & tiêu đề: kích hoạt khi cuộn vừa chớm tới (~40px)
  globalScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (el.closest('#section-hero') || el.closest('.album-rows-wrap')) return;

      if (entry.isIntersecting) {
        el.classList.add('qv-visible');
      }
    });
  }, {
    threshold: 0.02,
    rootMargin: '50px 0px 50px 0px'
  });

  // 2. Observer cho các phần có ảnh: Hiển thị ngay lập tức, không làm trễ hay mờ ảnh!
  photoScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target;
      if (el.closest('#section-hero') || el.closest('.album-rows-wrap')) return;

      if (entry.isIntersecting) {
        el.classList.add('qv-visible');
        photoScrollObserver.unobserve(el);
      }
    });
  }, {
    threshold: 0.02,
    rootMargin: '100px 0px 100px 0px' // Kích hoạt sớm để ảnh luôn rõ nét ngay khi cuộn tới!
  });

  // Phân loại quan sát từng phần tử
  elements.forEach(el => {
    if (el.closest('#section-hero') || el.closest('.album-rows-wrap')) return;

    if (isPhotoElement(el)) {
      photoScrollObserver.observe(el);
    } else {
      globalScrollObserver.observe(el);
    }
  });
}

window.refreshScrollReveal = function() {
  if (!globalScrollObserver || !photoScrollObserver) {
    initScrollReveal();
    return;
  }
  const elements = document.querySelectorAll('[class*="qv-anim-"], .qv-reveal, .qv-text-reveal');
  elements.forEach(el => {
    if (el.closest('#section-hero') || el.closest('.album-rows-wrap')) return;
    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight - 30) {
      el.classList.remove('qv-visible');
    }
    if (isPhotoElement(el)) {
      photoScrollObserver.observe(el);
    } else {
      globalScrollObserver.observe(el);
    }
  });
};

// ==========================================
// 14. AUTO-SCROLL ENGINE (TỰ ĐỘNG CUỘN TRANG SIÊU MƯỢT 60/120/144FPS)
// Sử dụng chuẩn Delta-Time + Float Subpixel Scrolling chống giật lag tuyệt đối
// ==========================================
let autoScrollAnimId = null;
let lastScrollTime = null;
let exactScrollY = 0;
const AUTO_SCROLL_SPEED_PX = 95; // Tốc độ trôi trang mượt mà, trực quan và vừa vặn (~95px/giây)

function updateAutoScrollUI(active) {
  isAutoScrolling = active;
  const btn = document.getElementById('auto-scroll-btn');
  const txt = document.getElementById('auto-scroll-text');
  if (btn) {
    if (active) {
      btn.classList.add('scrolling');
      if (txt) txt.textContent = 'Dừng cuộn';
    } else {
      btn.classList.remove('scrolling');
      if (txt) txt.textContent = 'Tự cuộn';
    }
  }
  if (active) {
    document.body.classList.add('is-auto-scrolling');
    document.documentElement.style.scrollBehavior = 'auto';
  } else {
    document.body.classList.remove('is-auto-scrolling');
    document.documentElement.style.scrollBehavior = '';
  }
}

function startAutoScroll() {
  if (isAutoScrolling) return;
  updateAutoScrollUI(true);

  lastScrollTime = null;
  exactScrollY = window.scrollY;

  function step(timestamp) {
    if (!isAutoScrolling) return;

    if (!lastScrollTime) {
      lastScrollTime = timestamp;
      exactScrollY = window.scrollY;
      autoScrollAnimId = requestAnimationFrame(step);
      return;
    }

    // Delta time chính xác dựa trên thời gian thực (giây)
    const dt = Math.min((timestamp - lastScrollTime) / 1000, 0.04);
    lastScrollTime = timestamp;

    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (window.scrollY >= maxScroll - 2) {
      stopAutoScroll();
      return;
    }

    // Đồng bộ lại mốc nếu người dùng can thiệp cuộn chuột/cảm ứng
    if (Math.abs(window.scrollY - exactScrollY) > 6) {
      exactScrollY = window.scrollY;
    }

    exactScrollY += AUTO_SCROLL_SPEED_PX * dt;
    if (exactScrollY > maxScroll) exactScrollY = maxScroll;

    window.scrollTo({
      top: exactScrollY,
      behavior: 'instant'
    });

    autoScrollAnimId = requestAnimationFrame(step);
  }

  autoScrollAnimId = requestAnimationFrame(step);
}

function stopAutoScroll() {
  if (!isAutoScrolling) return;
  updateAutoScrollUI(false);
  if (autoScrollAnimId) {
    cancelAnimationFrame(autoScrollAnimId);
    autoScrollAnimId = null;
  }
  lastScrollTime = null;
}

function toggleAutoScroll() {
  if (bgAudio && bgAudio.paused) {
    playCurrentTrack();
  }
  if (isAutoScrolling) {
    stopAutoScroll();
  } else {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY >= maxScroll - 10) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(startAutoScroll, 600);
    } else {
      startAutoScroll();
    }
  }
}

function setupAutoScrollPauseOnUserGesture() {
  const pauseOnInteraction = (e) => {
    // Không dừng khi click trúng nút Tự Cuộn, nút Nhạc hoặc thanh công cụ điều hướng
    if (e && e.target && (e.target.closest('#auto-scroll-btn') || e.target.closest('#audio-toggle-btn') || e.target.closest('#music-toggle-btn') || e.target.closest('.mobile-bottom-bar') || e.target.closest('.lightbox-overlay') || e.target.closest('.qv-popup-overlay'))) {
      return;
    }
    if (isAutoScrolling) {
      stopAutoScroll();
    }
  };

  window.addEventListener('wheel', pauseOnInteraction, { passive: true });
  window.addEventListener('touchstart', pauseOnInteraction, { passive: true });
  window.addEventListener('pointerdown', pauseOnInteraction, { passive: true });
  window.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Space', 'Home', 'End'].includes(e.code)) {
      pauseOnInteraction(e);
    }
  }, { passive: true });
}

// ==========================================
// 15. INITIALIZATION ON DOM READY
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initRandomAudioTrack();
  enableAudioOnFirstGesture();
  initHeroCoverAnimation();
  initCardCreaturesScrollEffect();
  initFallingHearts();
  initScrollReveal();
  initCountdown();
  switchSchedule('bride');
  switchCard('nhagai');
  initAlbumPriorityPreloader();
  initAlbumScrollChoreography();
  loadWishes();
  setupAutoScrollPauseOnUserGesture();
  // startToastQueue(); - hidden by user

  const params = new URLSearchParams(window.location.search);
  const guestParam = params.get('guest') || params.get('to') || params.get('u');
  if (guestParam) {
    const formatted = decodeURIComponent(guestParam);
    const novaGuest = document.getElementById('nova-guest-name');
    if (novaGuest) novaGuest.textContent = formatted;
    const slotTrai = document.getElementById('guest-name-slot-nhatrai');
    const slotGai = document.getElementById('guest-name-slot-nhagai');
    if (slotTrai) slotTrai.textContent = formatted;
    if (slotGai) slotGai.textContent = formatted;
    const rsvpName = document.getElementById('rsvp-name');
    if (rsvpName && !rsvpName.value) rsvpName.value = formatted;
  }
});

