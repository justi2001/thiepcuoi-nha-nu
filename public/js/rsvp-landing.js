/**
 * TanaWedding Style RSVP Front Page Logic
 * Manages front-page RSVP form submission, attendance state,
 * guest name query parameter parsing, and transition to main invitation.
 */

// Global State
window.tanaRsvpState = {
  attendance: 'attending',
  guestChoice: '1',
  relationship: 'family'
};

// URL parameters parsing
function initTanaGuestFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const guestRaw = params.get('khach') || params.get('to') || params.get('guest') || params.get('ten');
    if (!guestRaw) return;

    let cleanName = decodeURIComponent(guestRaw).replace(/[-_+]/g, ' ').trim();
    // Normalize casing if needed
    cleanName = cleanName.split(' ')
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');

    const nameInput = document.getElementById('rsvp-tana-name');
    if (nameInput && cleanName) {
      nameInput.value = cleanName;
    }

    const tagWrap = document.getElementById('rsvp-custom-guest-tag');
    const tagName = document.getElementById('rsvp-display-guest-name');
    const subText = document.getElementById('rsvp-card-sub-text');
    if (tagWrap && tagName && cleanName) {
      tagName.textContent = cleanName;
      tagWrap.style.display = 'inline-flex';
      if (subText) {
        subText.textContent = `Trân trọng kính mời ${cleanName} xác nhận thông tin tham dự tiệc cưới cùng chúng tôi.`;
      }
    }

    // Also sync to nova-cover opening card
    const novaGuest = document.getElementById('nova-guest-name');
    if (novaGuest && cleanName) {
      novaGuest.textContent = cleanName;
    }
  } catch (err) {
    console.warn('Error parsing guest url:', err);
  }
  syncTanaToInnerRsvp();
}

// ==========================================
// FORM SYNCHRONIZATION: FRONT PAGE -> INNER RSVP & WISHES FORM
// ==========================================
window.syncTanaToInnerRsvp = function() {
  try {
    // 1. Đồng bộ Họ và tên sang Form RSVP nội bộ và Form Gửi Lời Chúc (Sổ lưu bút)
    const tanaNameInp = document.getElementById('rsvp-tana-name');
    const innerNameInp = document.getElementById('rsvp-name');
    const wishAuthorInp = document.getElementById('wish-author') || document.getElementById('wish-name');
    const novaGuest = document.getElementById('nova-guest-name');
    const currentName = tanaNameInp ? tanaNameInp.value.trim() : '';

    if (currentName) {
      if (innerNameInp) innerNameInp.value = currentName;
      if (wishAuthorInp) wishAuthorInp.value = currentName;
      if (novaGuest) novaGuest.textContent = currentName;
      try {
        sessionStorage.setItem('wedding_guest_name', currentName);
        localStorage.setItem('wedding_guest_name', currentName);
      } catch (e) {}
    }

    // 2. Đồng bộ Trạng thái tham dự (Có tham gia / Bận không tham gia)
    const att = window.tanaRsvpState.attendance;
    if (typeof selectAttendance === 'function') {
      if (att === 'declined') {
        selectAttendance('Xin lỗi, tôi bận mất rồi');
      } else {
        selectAttendance('Có, tôi sẽ tham dự');
      }
    }

    // 3. Khách mời: Mặc định là Khách mời Cô Dâu (Thuỳ Linh)
    const guestOfEl = document.getElementById('rsvp-guest-of');
    if (guestOfEl) {
      guestOfEl.value = 'Cô Dâu';
    }

    // 4. Đồng bộ Số người tham dự
    const choice = window.tanaRsvpState.guestChoice;
    const innerCountEl = document.getElementById('rsvp-count');
    if (innerCountEl) {
      if (att === 'declined') {
        innerCountEl.value = '1';
      } else if (choice === '1') {
        innerCountEl.value = '1';
      } else if (choice === '2') {
        innerCountEl.value = '2';
      } else if (choice === 'other') {
        const otherInp = document.getElementById('tana-guest-other-input');
        const num = parseInt(otherInp ? otherInp.value : '1', 10) || 1;
        if (num >= 5) {
          innerCountEl.value = '5+';
        } else if (num >= 1 && num <= 4) {
          innerCountEl.value = String(num);
        }
      }
    }

    // 5. Đồng bộ Lời chúc sang Sổ lưu bút (Section 11) & Ghi chú RSVP
    const wishTextInp = document.getElementById('tana-wish-text');
    const innerWishInp = document.getElementById('wish-message');
    const innerRsvpNote = document.getElementById('rsvp-note');
    const currentWish = wishTextInp ? wishTextInp.value : '';

    if (currentWish) {
      if (innerWishInp) innerWishInp.value = currentWish;
      if (innerRsvpNote) innerRsvpNote.value = currentWish;
      try {
        sessionStorage.setItem('wedding_guest_wish', currentWish);
        localStorage.setItem('wedding_guest_wish', currentWish);
      } catch (e) {}
    }
  } catch (err) {
    console.warn('syncTanaToInnerRsvp error:', err);
  }
};

// Attendance selection
window.selectTanaAttendance = function(labelEl, value) {
  window.tanaRsvpState.attendance = value;
  const parent = labelEl.closest('.rsvp-options-vertical');
  if (parent) {
    parent.querySelectorAll('.rsvp-radio-card').forEach(el => el.classList.remove('checked'));
  }
  labelEl.classList.add('checked');
  const radio = labelEl.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  // Toggle guest count section if declined
  const countSection = document.getElementById('tana-guest-count-section');
  if (countSection) {
    if (value === 'declined') {
      countSection.style.opacity = '0.4';
      countSection.style.pointerEvents = 'none';
    } else {
      countSection.style.opacity = '1';
      countSection.style.pointerEvents = 'auto';
    }
  }

  const errEl = document.getElementById('tana-attendance-error');
  if (errEl) errEl.style.display = 'none';

  syncTanaToInnerRsvp();
};

// Count selection
window.selectTanaCount = function(labelEl, value) {
  window.tanaRsvpState.guestChoice = value;
  const parent = labelEl.closest('.rsvp-options-grid-three');
  if (parent) {
    parent.querySelectorAll('.rsvp-radio-card').forEach(el => el.classList.remove('checked'));
  }
  labelEl.classList.add('checked');
  const radio = labelEl.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  const otherWrap = document.getElementById('tana-guest-other-wrap');
  if (otherWrap) {
    otherWrap.style.display = (value === 'other') ? 'block' : 'none';
    if (value === 'other') {
      const inp = document.getElementById('tana-guest-other-input');
      if (inp) inp.focus();
    }
  }

  const errEl = document.getElementById('tana-count-error');
  if (errEl) errEl.style.display = 'none';

  syncTanaToInnerRsvp();
};

// Relationship selection
window.selectTanaRelation = function(labelEl, value) {
  window.tanaRsvpState.relationship = value;
  const parent = labelEl.closest('.rsvp-options-grid-two');
  if (parent) {
    parent.querySelectorAll('.rsvp-radio-card').forEach(el => el.classList.remove('checked'));
  }
  labelEl.classList.add('checked');
  const radio = labelEl.querySelector('input[type="radio"]');
  if (radio) radio.checked = true;

  const otherWrap = document.getElementById('tana-relation-other-wrap');
  if (otherWrap) {
    otherWrap.style.display = (value === 'other') ? 'block' : 'none';
    if (value === 'other') {
      const inp = document.getElementById('tana-relation-other-input');
      if (inp) inp.focus();
    }
  }

  const errEl = document.getElementById('tana-relation-error');
  if (errEl) errEl.style.display = 'none';

  syncTanaToInnerRsvp();
};

// Submit form
window.submitTanaRsvp = async function() {
  const nameInput = document.getElementById('rsvp-tana-name');
  const nameVal = nameInput ? nameInput.value.trim() : '';

  let hasError = false;

  // Validate Name
  const nameError = document.getElementById('tana-name-error');
  if (!nameVal) {
    if (nameError) {
      nameError.textContent = 'Vui lòng nhập họ và tên của bạn.';
      nameError.style.display = 'block';
    }
    hasError = true;
  } else if (nameVal.length > 120) {
    if (nameError) {
      nameError.textContent = 'Tên không được dài quá 120 ký tự.';
      nameError.style.display = 'block';
    }
    hasError = true;
  } else if (nameError) {
    nameError.style.display = 'none';
  }

  // Attendance
  const attVal = window.tanaRsvpState.attendance;
  const attError = document.getElementById('tana-attendance-error');
  if (!attVal) {
    if (attError) attError.style.display = 'block';
    hasError = true;
  } else if (attError) {
    attError.style.display = 'none';
  }

  // Count
  let finalCount = 1;
  const countError = document.getElementById('tana-count-error');
  if (attVal !== 'declined') {
    if (window.tanaRsvpState.guestChoice === 'other') {
      const otherInput = document.getElementById('tana-guest-other-input');
      const parsed = parseInt(otherInput ? otherInput.value : '', 10);
      if (!parsed || parsed < 1) {
        if (countError) {
          countError.textContent = 'Vui lòng nhập số người từ 1 trở lên.';
          countError.style.display = 'block';
        }
        hasError = true;
      } else {
        finalCount = parsed;
        if (countError) countError.style.display = 'none';
      }
    } else {
      finalCount = parseInt(window.tanaRsvpState.guestChoice, 10) || 1;
      if (countError) countError.style.display = 'none';
    }
  } else {
    finalCount = 0;
  }

  // Relationship
  const relVal = window.tanaRsvpState.relationship;
  let relNote = '';
  const relError = document.getElementById('tana-relation-error');
  if (!relVal) {
    if (relError) relError.style.display = 'block';
    hasError = true;
  } else {
    if (relVal === 'other') {
      const relInput = document.getElementById('tana-relation-other-input');
      relNote = relInput ? relInput.value.trim() : '';
      if (!relNote) {
        if (relError) {
          relError.textContent = 'Vui lòng cho chúng tôi biết thêm thông tin mối quan hệ.';
          relError.style.display = 'block';
        }
        hasError = true;
      } else if (relError) {
        relError.style.display = 'none';
      }
    } else if (relError) {
      relError.style.display = 'none';
    }
  }

  if (hasError) return;

  const submitBtn = document.getElementById('tana-submit-btn');
  const originalBtnText = submitBtn ? submitBtn.innerHTML : 'GỬI PHÚC ĐÁP';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'ĐANG GỬI XÁC NHẬN...';
  }

  // Text mapping for readability in database / sheet
  const attendanceLabels = {
    attending: 'Có, mình sẽ tham dự',
    considering: 'Đang cân nhắc sắp xếp',
    declined: 'Tiếc quá, mình không tham gia được'
  };

  const relationLabels = {
    family: 'Gia đình / Người thân',
    friend: 'Bạn bè',
    coworker: 'Đồng nghiệp',
    other: relNote ? `Mối quan hệ khác: ${relNote}` : 'Mối quan hệ khác'
  };

  const wishInput = document.getElementById('tana-wish-text');
  const wishVal = wishInput ? wishInput.value.trim() : '';

  const rsvpPayload = {
    name: nameVal,
    attendance: attendanceLabels[attVal] || attVal,
    guestOf: 'Cô Dâu (Thuỳ Linh)',
    guestCount: String(finalCount),
    eventTarget: 'Lễ Cưới Nhà Gái (17/11/2026)',
    email: '',
    relationship: relationLabels[relVal] || relVal,
    note: wishVal
  };

  // 1. Send to Local Backend API
  try {
    fetch('/api/rsvp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rsvpPayload)
    }).catch(err => console.warn('Local API RSVP save warning:', err));
  } catch (e) {}

  // 2. Send to Google Sheets if configured
  if (typeof GOOGLE_SCRIPT_URL !== 'undefined' && GOOGLE_SCRIPT_URL) {
    try {
      const sheetParams = {
        sheetName: 'RSVP',
        action: 'rsvp',
        name: nameVal,
        guestOf: 'Cô Dâu (Thuỳ Linh)',
        attendance: attendanceLabels[attVal] || attVal,
        count: finalCount,
        eventTarget: 'Lễ Cưới Nhà Gái (17/11/2026)',
        note: `[Quan hệ: ${relationLabels[relVal] || relVal}] ${wishVal}`.trim()
      };
      const qs = new URLSearchParams(sheetParams).toString();
      const scriptUrl = GOOGLE_SCRIPT_URL.includes('?') ? `${GOOGLE_SCRIPT_URL}&${qs}` : `${GOOGLE_SCRIPT_URL}?${qs}`;
      fetch(scriptUrl, { method: 'GET', mode: 'no-cors' }).catch(err => console.warn('Google Sheets RSVP warning:', err));
    } catch (e) {}
  }

  // 3. If guest provided a wish, also store in Wishes Guestbook
  if (wishVal) {
    try {
      fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameVal, message: wishVal })
      }).catch(err => console.warn('Wish save warning:', err));
    } catch (e) {}
  }

  // Show Success UI
  setTimeout(() => {
    const formWrap = document.getElementById('tana-form-inner');
    const successView = document.getElementById('tana-success-view');
    const successMsg = document.getElementById('tana-success-msg');
    const autoRedirectText = document.getElementById('tana-auto-redirect-note');

    if (formWrap) formWrap.style.display = 'none';
    if (successView) successView.style.display = 'flex';

    if (successMsg) {
      if (attVal === 'declined') {
        successMsg.textContent = 'Cảm ơn bạn đã dành thời gian phúc đáp. Chúng mình rất trân trọng tình cảm của bạn và hy vọng sớm có dịp gặp lại!';
      } else if (attVal === 'considering') {
        successMsg.textContent = 'Chúng mình đã ghi nhận bạn đang cân nhắc sắp xếp. Bạn hãy liên hệ hai gia đình khi chốt được lịch nhé!';
      } else {
        successMsg.textContent = 'Hẹn gặp bạn tại buổi tiệc vào 11:00 ngày 17.11.2026. Sự hiện diện của bạn là niềm hạnh phúc lớn của hai gia đình!';
      }
    }

    // Auto transition to invitation after 2.5s with countdown indicator
    if (autoRedirectText) {
      let countdown = 3;
      autoRedirectText.textContent = `Tự động chuyển đến thiệp mời sau ${countdown}s...`;
      const timer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          autoRedirectText.textContent = `Tự động chuyển đến thiệp mời sau ${countdown}s...`;
        } else {
          clearInterval(timer);
          const rsvpScreen = document.getElementById('tana-rsvp-screen');
          if (rsvpScreen && !rsvpScreen.classList.contains('is-hidden')) {
            window.openWeddingInvitation(null, true);
          }
        }
      }, 1000);
    }
  }, 400);
};

// Navigation logic with HTML5 History API (Back/Forward browser buttons support)
window.navigateToScreen = function(screenName, pushHistory = true) {
  // Always trigger synchronization between all forms
  if (typeof window.syncTanaToInnerRsvp === 'function') {
    window.syncTanaToInnerRsvp();
  }

  const rsvpScreen = document.getElementById('tana-rsvp-screen');
  const novaCover = document.getElementById('nova-cover');

  if (screenName === 'invitation') {
    if (pushHistory && window.location.hash !== '#thiep-moi') {
      const url = new URL(window.location);
      url.hash = '#thiep-moi';
      history.pushState({ screen: 'invitation' }, '', url.toString());
    }

    if (rsvpScreen) {
      rsvpScreen.classList.add('is-hidden');
    }

    if (novaCover) {
      novaCover.style.display = 'flex';
      novaCover.classList.remove('nova-opening');
    }

    // Lock body scroll while on opening cover
    document.body.classList.add('nova-cover-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (typeof window.refreshScrollReveal === 'function') {
      window.refreshScrollReveal();
    }
  } else {
    // screenName === 'rsvp'
    if (pushHistory && window.location.hash !== '#phuc-dap' && window.location.hash !== '') {
      const url = new URL(window.location);
      url.hash = '#phuc-dap';
      history.pushState({ screen: 'rsvp' }, '', url.toString());
    }

    if (rsvpScreen) {
      rsvpScreen.classList.remove('is-hidden');
      rsvpScreen.scrollTop = 0;
    }

    // Release cover lock so page scroll isn't disabled when going back
    document.body.classList.remove('nova-cover-active');
  }
};

// Transition from RSVP front page to opening cover invitation (giao diện MỞ THIỆP)
window.openWeddingInvitation = function(e, pushHistory = true) {
  if (e && e.preventDefault) e.preventDefault();
  if (typeof window.syncTanaToInnerRsvp === 'function') {
    window.syncTanaToInnerRsvp();
  }
  window.navigateToScreen('invitation', pushHistory);
};

// Return to RSVP front page from main invitation
window.openRsvpLanding = function(e, pushHistory = true) {
  if (e && e.preventDefault) e.preventDefault();
  window.navigateToScreen('rsvp', pushHistory);
};

// History Routing & popstate handling
function initNavigationRouting() {
  const hash = window.location.hash;
  const path = window.location.pathname;

  if (hash === '#thiep-moi' || path.endsWith('/thiep-moi')) {
    window.navigateToScreen('invitation', false);
    history.replaceState({ screen: 'invitation' }, '', window.location.href);
  } else {
    window.navigateToScreen('rsvp', false);
    const url = new URL(window.location);
    if (!url.hash) url.hash = '#phuc-dap';
    history.replaceState({ screen: 'rsvp' }, '', url.toString());
  }

  // Listen for browser Back (<-) and Forward (->) buttons
  window.addEventListener('popstate', (event) => {
    const curHash = window.location.hash;
    const state = event.state;
    if (curHash === '#thiep-moi' || (state && state.screen === 'invitation')) {
      window.navigateToScreen('invitation', false);
    } else {
      window.navigateToScreen('rsvp', false);
    }
  });
}

// Listen for real-time input changes to synchronize both forms instantly
function initTanaFormSync() {
  const tanaName = document.getElementById('rsvp-tana-name');
  const otherCount = document.getElementById('tana-guest-other-input');
  const tanaWish = document.getElementById('tana-wish-text');
  const innerName = document.getElementById('rsvp-name');
  const wishAuthor = document.getElementById('wish-author');
  const wishMsg = document.getElementById('wish-message');

  // Khôi phục từ storage nếu có
  try {
    const savedName = localStorage.getItem('wedding_guest_name') || sessionStorage.getItem('wedding_guest_name');
    const savedWish = localStorage.getItem('wedding_guest_wish') || sessionStorage.getItem('wedding_guest_wish');

    if (savedName) {
      if (tanaName && !tanaName.value) tanaName.value = savedName;
      if (innerName && !innerName.value) innerName.value = savedName;
      if (wishAuthor && !wishAuthor.value) wishAuthor.value = savedName;
    }
    if (savedWish) {
      if (tanaWish && !tanaWish.value) tanaWish.value = savedWish;
      if (wishMsg && !wishMsg.value) wishMsg.value = savedWish;
    }
  } catch (e) {}

  if (tanaName) {
    ['input', 'change', 'blur'].forEach(evt => {
      tanaName.addEventListener(evt, window.syncTanaToInnerRsvp);
    });
  }

  if (otherCount) {
    ['input', 'change', 'blur'].forEach(evt => {
      otherCount.addEventListener(evt, window.syncTanaToInnerRsvp);
    });
  }

  if (tanaWish) {
    ['input', 'change', 'blur'].forEach(evt => {
      tanaWish.addEventListener(evt, window.syncTanaToInnerRsvp);
    });
  }

  // 2-way sync: gõ ở Sổ lưu bút (Section 11) -> cập nhật Form trang đầu & Inner RSVP
  if (wishAuthor) {
    ['input', 'change', 'blur'].forEach(evt => {
      wishAuthor.addEventListener(evt, () => {
        const val = wishAuthor.value.trim();
        if (val) {
          if (tanaName) tanaName.value = val;
          if (innerName) innerName.value = val;
          try {
            sessionStorage.setItem('wedding_guest_name', val);
            localStorage.setItem('wedding_guest_name', val);
          } catch (e) {}
        }
      });
    });
  }

  if (wishMsg) {
    ['input', 'change', 'blur'].forEach(evt => {
      wishMsg.addEventListener(evt, () => {
        const val = wishMsg.value;
        if (tanaWish) tanaWish.value = val;
        try {
          sessionStorage.setItem('wedding_guest_wish', val);
          localStorage.setItem('wedding_guest_wish', val);
        } catch (e) {}
      });
    });
  }

  // 2-way sync: gõ ở Form RSVP nội bộ -> cập nhật Form trang đầu & Sổ lưu bút
  if (innerName) {
    ['input', 'change', 'blur'].forEach(evt => {
      innerName.addEventListener(evt, () => {
        const val = innerName.value.trim();
        if (val) {
          if (tanaName) tanaName.value = val;
          if (wishAuthor) wishAuthor.value = val;
          try {
            sessionStorage.setItem('wedding_guest_name', val);
            localStorage.setItem('wedding_guest_name', val);
          } catch (e) {}
        }
      });
    });
  }

  // Initial sync
  window.syncTanaToInnerRsvp();
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTanaGuestFromUrl();
  initTanaFormSync();
  initNavigationRouting();
});
