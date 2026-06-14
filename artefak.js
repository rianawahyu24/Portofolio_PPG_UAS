/* ═══════════════════════════════════════════════════
   ARTEFAK.JS — Logic khusus halaman artefak.html
   E-Portfolio PPL — Riana Wahyu Puspitasari
   ═══════════════════════════════════════════════════ */

/* ── State modal ── */
let currentModalSrc = '';
let currentDownloadSrc = '';   // ← tambahan: simpan URL asli untuk tombol Buka Link

/* ════════════════════════════════════════
   SWITCH TAB ARTEFAK
════════════════════════════════════════ */
function switchArfTab(btn, panelId) {
    document.querySelectorAll('.arf-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.arf-panel').forEach(p => p.classList.remove('active'));

    btn.classList.add('active');

    const panel = document.getElementById('panel-' + panelId);
    if (panel) {
        panel.classList.add('active');
        panel.querySelectorAll('.reveal').forEach(el => {
            el.classList.remove('visible');
            setTimeout(() => el.classList.add('visible'), 50);
        });
    }
}

/* ════════════════════════════════════════
   BUKA MODAL
════════════════════════════════════════ */
function openArfModal(title, sub, badgeClass, topik, durasi, model, iconClass, desc, src) {

    document.getElementById('modalTitle').textContent  = title;
    document.getElementById('modalSub').textContent    = sub;
    document.getElementById('modalTopik').textContent  = topik;
    document.getElementById('modalDurasi').textContent = durasi;
    document.getElementById('modalModel').textContent  = model;
    document.getElementById('modalDesc').textContent   = desc;

    const iconEl = document.getElementById('modalIcon');
    if (iconEl) iconEl.className = iconClass + ' fa-3x';

    const badgeEl = document.getElementById('modalBadge');
    badgeEl.className = 'arf-badge ' + badgeClass;
    badgeEl.textContent = topik;

    /* ── Tentukan URL preview & download ── */
    let previewSrc   = src || '';
    let downloadSrc  = src || '';   // ← selalu simpan URL asli
    let thumbnailSrc = '';

    const driveMatch = src && src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        const fileId = driveMatch[1];
        previewSrc   = `https://drive.google.com/file/d/${fileId}/preview`;
        downloadSrc  = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
        thumbnailSrc = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;
    }

    currentModalSrc    = previewSrc;
    currentDownloadSrc = downloadSrc;   // ← simpan ke state

    /* ── Area preview atas ── */
    const previewEl = document.getElementById('modalPreview');
    previewEl.style.height = '';

    if (thumbnailSrc) {
        previewEl.innerHTML = `
            <img src="${thumbnailSrc}" alt="Preview thumbnail"
                 style="width:100%;height:100%;object-fit:cover;display:block;border-radius:8px;"
                 onerror="this.style.display='none';document.getElementById('modalIconFallback').style.display='flex'">
            <div id="modalIconFallback" style="display:none;flex-direction:column;align-items:center;gap:0.5rem;">
                <i class="${iconClass} fa-3x"></i>
                <span>Preview tersedia setelah file diunggah</span>
            </div>
        `;
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(src)) {
        previewEl.innerHTML = `
            <img src="${src}" alt="Preview"
                 style="width:100%;height:100%;object-fit:cover;display:block;border-radius:8px;">
        `;
    } else {
        previewEl.innerHTML = `
            <i id="modalIcon" class="${iconClass} fa-3x"></i>
            <span>Preview tersedia setelah file diunggah</span>
        `;
    }

    /* ── Tombol "Buka Link" — selalu pakai downloadSrc ── */
    const dlBtn = document.getElementById('modalBtnDownload');
    if (downloadSrc) {
        dlBtn.href        = downloadSrc;    // ← URL asli / Drive view
        dlBtn.target      = '_blank';
        dlBtn.rel         = 'noopener noreferrer';
        dlBtn.innerHTML   = '<i class="fas fa-external-link-alt"></i> Buka Link';
        dlBtn.style.display = 'inline-flex';
    } else {
        dlBtn.style.display = 'none';
    }

    document.getElementById('arfModal').classList.add('open');
    document.body.style.overflow = 'hidden';
}

document.querySelectorAll('.dok-item img').forEach(img => {
    img.addEventListener('error', function() {
        this.closest('.dok-item').style.display = 'none';
    });
});

/* ════════════════════════════════════════
   HANDLE PREVIEW DARI MODAL
════════════════════════════════════════ */
function handleModalPreview() {
    if (!currentModalSrc) return;

    const src = currentModalSrc;
    const previewEl = document.getElementById('modalPreview');

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(src);
    const isDrive = src.includes('drive.google.com');
    const isPDF   = /\.pdf$/i.test(src);
    const isExt   = src.includes('quizizz.com') || src.includes('wordwall.net');
    const isCanva = src.includes('canva.link') || src.includes('canva.com'); // ← tambah ini

    if (isImage) {
        return; // sudah tampil di area atas
    } else if (isDrive || isPDF) {
        previewEl.style.height = '300px';
        previewEl.innerHTML = `
            <iframe src="${src}"
                    style="width:100%;height:100%;border:none;display:block;border-radius:8px;"
                    allow="autoplay"
                    title="Preview File">
            </iframe>
        `;
    } else if (isCanva) {          // ← tambah blok ini
        window.open(src, '_blank');
        return;
    } else if (isExt) {
        window.open(src, '_blank');
    } else {
        // File lokal belum tersedia — buka di tab baru kalau bisa, atau tampilkan info
        if (currentDownloadSrc) {
            window.open(currentDownloadSrc, '_blank');
        } else {
            previewEl.innerHTML = `
                <i class="fas fa-file fa-3x" style="opacity:0.3"></i>
                <span>Format file belum didukung untuk preview</span>
            `;
        }
    }

    
}

/* ════════════════════════════════════════
   AUTO INJECT DRIVE THUMBNAIL KE ARF-THUMB
════════════════════════════════════════ */
function injectDriveThumbnails() {
    document.querySelectorAll('.arf-card').forEach(card => {
        const thumb = card.querySelector('.arf-thumb');
        if (!thumb) return;

        // Ambil src dari onclick attribute card
        const onclickStr = card.getAttribute('onclick') || '';
        const srcMatch = onclickStr.match(/'([^']*drive\.google\.com[^']*)'\s*\)/);
        if (!srcMatch) return;

        const src = srcMatch[1];
        const driveMatch = src.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (!driveMatch) return;

        const fileId = driveMatch[1];
        const thumbUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`;

        // Inject gambar
        thumb.innerHTML = `
            <img 
                class="arf-thumb-cover"
                src="${thumbUrl}"
                alt="Preview"
                onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
            <div class="arf-thumb-cover-fallback" style="display:none;">
                <i class="fas fa-file fa-2x"></i>
                <span>${thumb.querySelector('span')?.textContent || ''}</span>
            </div>
        `;
    });
}

// Panggil di DOMContentLoaded (sudah ada, tinggal tambahkan baris ini):
document.addEventListener('DOMContentLoaded', function() {
    injectDriveThumbnails(); // ← tambahkan ini
    // ... kode yang sudah ada ...
});

/* ════════════════════════════════════════
   TUTUP MODAL
════════════════════════════════════════ */
function closeArfModal(event) {
    if (event.target === document.getElementById('arfModal')) {
        closeArfModalBtn();
    }
}

function closeArfModalBtn() {
    document.getElementById('arfModal').classList.remove('open');
    document.body.style.overflow = '';

    const previewEl = document.getElementById('modalPreview');
    if (previewEl) previewEl.style.height = '';
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeArfModalBtn();
});

/* ════════════════════════════════════════
   INIT
════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
    injectDriveThumbnails(); // ← tambahkan baris ini
    const firstPanel = document.getElementById('panel-modul');
    if (firstPanel) {
        firstPanel.querySelectorAll('.reveal').forEach((el, i) => {
            setTimeout(() => el.classList.add('visible'), i * 80 + 200);
        });
    }
});

/* ── Expose ke global ── */
window.switchArfTab       = switchArfTab;

/* ════════════════════════════════════════
   HASIL BELAJAR — SWITCH TAB KELAS
════════════════════════════════════════ */
function switchHBClass(btn) {
  const cls = btn.dataset.class;
  document.querySelectorAll('.hb-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('[id^="hbGrid-"]').forEach(g => g.classList.add('hb-hidden'));
  const grid = document.getElementById('hbGrid-' + cls);
  if (grid) grid.classList.remove('hb-hidden');
}

/* ════════════════════════════════════════
   VIDEO PANEL — TAMBAH VIDEO
════════════════════════════════════════ */
function getVpYouTubeId(url) {
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /v=([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

let vpCount = 2; // sudah ada 2 kartu dari HTML

function addVideoPanel() {
  const url   = document.getElementById('vpUrlInput').value.trim();
  const title = document.getElementById('vpTitleInput').value.trim() || 'Video Pembelajaran';
  const id    = getVpYouTubeId(url);

  if (!id) {
    alert('Link YouTube tidak dikenali. Pastikan formatnya benar (youtu.be/... atau youtube.com/watch?v=...)');
    return;
  }

  const idx     = vpCount++;
  const thumbId = 'vpThumb-' + idx;

  const card = document.createElement('div');
  card.className = 'vp-card';
  card.innerHTML = `
    <div class="vp-thumb" id="${thumbId}">
      <img class="vp-preview-img"
           src="https://img.youtube.com/vi/${id}/hqdefault.jpg"
           alt="${title}">
      <button class="vp-play-btn" onclick="vpPlay(${idx},'${id}')" aria-label="Putar video">
        <i class="fas fa-play"></i>
      </button>
    </div>
    <div class="vp-meta">
      <p class="vp-title">${title}</p>
      <p class="vp-info">
        <i class="fas fa-calendar-alt"></i>
        ${new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' })}
      </p>
    </div>
  `;

  document.getElementById('vpGrid').appendChild(card);
  document.getElementById('vpUrlInput').value  = '';
  document.getElementById('vpTitleInput').value = '';
}

function vpPlay(idx, ytId) {
  let modal = document.getElementById('vpModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'vpModal';
    modal.style.cssText = `
      display:none; position:fixed; inset:0; z-index:1000;
      background:rgba(0,0,0,0.88); backdrop-filter:blur(6px);
      align-items:center; justify-content:center; padding:1rem;
    `;
    modal.innerHTML = `
      <div style="position:relative; width:100%; max-width:860px; aspect-ratio:16/9;">
        <button onclick="vpCloseModal()" style="
          position:absolute; top:-48px; right:0;
          display:flex; align-items:center; gap:6px;
          background:linear-gradient(135deg, rgba(52,211,110,0.2), rgba(244,114,182,0.2));
          border:1px solid rgba(52,211,110,0.4);
          color:#fff; font-size:0.82rem; font-family:inherit;
          padding:7px 16px; border-radius:999px; cursor:pointer;
          backdrop-filter:blur(8px); letter-spacing:0.04em;
          transition:all 0.2s;
        " onmouseover="this.style.background='linear-gradient(135deg, rgba(52,211,110,0.4), rgba(244,114,182,0.4))'"
           onmouseout="this.style.background='linear-gradient(135deg, rgba(52,211,110,0.2), rgba(244,114,182,0.2))'">
          <i class="fas fa-times"></i> Tutup
        </button>
        <iframe id="vpIframe" src="" allow="autoplay; encrypted-media"
          allowfullscreen frameborder="0"
          style="width:100%; height:100%; border-radius:12px; display:block;">
        </iframe>
      </div>
    `;
    modal.addEventListener('click', function(e) {
      if (e.target === modal) vpCloseModal();
    });
    document.body.appendChild(modal);
  }

  document.getElementById('vpIframe').src =
    `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function vpCloseModal() {
  const modal = document.getElementById('vpModal');
  if (!modal) return;
  document.getElementById('vpIframe').src = '';
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

/* ════════════════════════════════════════
   DOKUMENTASI — UPLOAD FOTO
════════════════════════════════════════ */
function addDokPhotos(input) {
  const grid = document.getElementById('dokGrid');
  Array.from(input.files).forEach(file => {
    const url = URL.createObjectURL(file);
    const fig = document.createElement('figure');
    fig.className = 'dok-item';
    fig.onclick = function () { openDokLightbox(this); };
    fig.innerHTML = `
      <img src="${url}" alt="${file.name}" loading="lazy">
      <figcaption>${file.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')}</figcaption>
    `;
    grid.prepend(fig);
  });
}

/* ════════════════════════════════════════
   DOK LIGHTBOX
════════════════════════════════════════ */
let currentDokIndex = 0;

function openDokLightbox(figEl) {
  const allFigs = Array.from(document.querySelectorAll('#dokGrid .dok-item'));
  currentDokIndex = allFigs.indexOf(figEl);

  const img     = figEl.querySelector('img');
  const caption = figEl.querySelector('figcaption');

  document.getElementById('dokLbImg').src = img.src;
  document.getElementById('dokLbCaption').textContent = caption ? caption.textContent : '';

  document.getElementById('dokLightbox').classList.add('open');
  document.getElementById('dokLbBackdrop').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDokLightbox() {
  document.getElementById('dokLightbox').classList.remove('open');
  document.getElementById('dokLbBackdrop').classList.remove('open');
  document.body.style.overflow = '';
}

function navDokLightbox(dir) {
  const allFigs = Array.from(document.querySelectorAll('#dokGrid .dok-item'));
  currentDokIndex = (currentDokIndex + dir + allFigs.length) % allFigs.length;
  const fig = allFigs[currentDokIndex];

  const img     = fig.querySelector('img');
  const caption = fig.querySelector('figcaption');

  const lbImg = document.getElementById('dokLbImg');
  lbImg.style.opacity = '0';
  setTimeout(() => {
    lbImg.src = img.src;
    document.getElementById('dokLbCaption').textContent = caption ? caption.textContent : '';
    lbImg.style.opacity = '1';
  }, 120);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeDokLightbox();
    vpCloseModal();
  }
  if (!document.getElementById('dokLightbox')?.classList.contains('open')) return;
  if (e.key === 'ArrowLeft')  navDokLightbox(-1);
  if (e.key === 'ArrowRight') navDokLightbox(1);
});

/* ── Expose ke global ── */
window.switchHBClass   = switchHBClass;
window.addVideoPanel   = addVideoPanel;
window.vpPlay          = vpPlay;
window.addDokPhotos    = addDokPhotos;
window.openDokLightbox = openDokLightbox;
window.closeDokLightbox = closeDokLightbox;
window.navDokLightbox  = navDokLightbox;

window.openArfModal       = openArfModal;
window.closeArfModal      = closeArfModal;
window.closeArfModalBtn   = closeArfModalBtn;
window.handleModalPreview = handleModalPreview;
window.vpCloseModal = vpCloseModal;