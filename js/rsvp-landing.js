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
  } catch (err) {
    console.warn('Error parsing guest url:', err);
  }
}

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
  }, 400);
};

// Transition from RSVP front page to main invitation page
window.openWeddingInvitation = function(e) {
  if (e && e.preventDefault) e.preventDefault();

  const rsvpScreen = document.getElementById('tana-rsvp-screen');
  if (rsvpScreen) {
    rsvpScreen.classList.add('is-hidden');
  }

  // Remove cover lock on body
  document.body.classList.remove('nova-cover-active');

  // If nova-cover was active, hide it as well
  const novaCover = document.getElementById('nova-cover');
  if (novaCover) {
    novaCover.style.display = 'none';
  }

  // Auto start background music gracefully
  try {
    if (typeof playAudio === 'function') {
      playAudio();
    } else {
      const audio = document.getElementById('bg-audio');
      if (audio && audio.paused) {
        audio.play().catch(() => {});
      }
    }
  } catch (err) {}

  // Scroll to top of wedding invitation smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Return to RSVP front page from main invitation if needed
window.openRsvpLanding = function(e) {
  if (e && e.preventDefault) e.preventDefault();
  const rsvpScreen = document.getElementById('tana-rsvp-screen');
  if (rsvpScreen) {
    rsvpScreen.classList.remove('is-hidden');
    rsvpScreen.scrollTop = 0;
  }
};

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initTanaGuestFromUrl();
});
