/* ═══════════════════════════════════════════════════
   E-PORTFOLIO PPL — Riana Wahyu Puspitasari
   main.js — Semua logic terpisah & modular
   ═══════════════════════════════════════════════════ */

/* ──────────────────────────────────────────────────
   MODULE 1: THEME TOGGLE
────────────────────────────────────────────────── */
const ThemeModule = (() => {
    const KEY = 'portfolio-theme';

    function init() {
        const saved = localStorage.getItem(KEY) || 'dark';
        document.documentElement.dataset.theme = saved;
    }

    function toggle() {
        const html = document.documentElement;
        const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
        html.dataset.theme = next;
        localStorage.setItem(KEY, next);
        ChartsModule.updateTheme();
    }

    return { init, toggle };
})();

/* ──────────────────────────────────────────────────
   MODULE 2: TYPING ANIMATION
────────────────────────────────────────────────── */
const TypingModule = (() => {
    const phrases = [
        'Calon Guru Profesional',
        'Pendidik Berbasis Teknologi',
        'Melakukan Refleksi Pembelajaran',
        'Melaksanakan PPL Terbimbing',
        'Tumbuh bersama siswa ❤️'
    ];
    let phraseIdx = 0,
        charIdx = 0,
        deleting = false;

    function tick() {
        const el = document.getElementById('typing-text');
        if (!el) return;
        const cur = phrases[phraseIdx];
        if (!deleting) {
            el.textContent = cur.slice(0, ++charIdx);
            if (charIdx === cur.length) {
                deleting = true;
                setTimeout(tick, 1900);
                return;
            }
        } else {
            el.textContent = cur.slice(0, --charIdx);
            if (charIdx === 0) {
                deleting = false;
                phraseIdx = (phraseIdx + 1) % phrases.length;
            }
        }
        setTimeout(tick, deleting ? 55 : 85);
    }

    return { init: tick };
})();

/* ──────────────────────────────────────────────────
   MODULE 3: SCROLL REVEAL
────────────────────────────────────────────────── */
const RevealModule = (() => {
    function init() {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.classList.add('visible');
                el.querySelectorAll('[data-width]').forEach((bar, i) => {
                    setTimeout(() => {
                        bar.style.width = bar.dataset.width + '%';
                    }, i * 80 + 200);
                });
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.reveal, .cycle-item').forEach(el => io.observe(el));
    }

    return { init };
})();

/* ──────────────────────────────────────────────────
   VIDEO + PDF TOGGLE
────────────────────────────────────────────────── */

/* ── TOGGLE VIDEO ── */
function toggleVideo(btn) {
    const section = btn.closest('.cycle-media-section');
    const wrapper = section.querySelector('.cycle-video-wrap');
    const isOpen  = wrapper.style.display !== 'none';

    if (isOpen) {
        const iframe = wrapper.querySelector('.yt-iframe');
        iframe.src = '';
        iframe.style.display = 'none';
        wrapper.querySelector('.yt-thumb').style.display = 'block';
        wrapper.style.display = 'none';
        btn.classList.remove('open');
        btn.querySelector('.pdf-toggle-text').textContent = 'Tonton Video Pembelajaran';
    } else {
        wrapper.style.display = 'block';
        btn.classList.add('open');
        btn.querySelector('.pdf-toggle-text').textContent = 'Tutup Video';
    }
}

/* ── KLIK THUMBNAIL → LOAD IFRAME YT ── */
function loadYT(thumb) {
    const videoId = thumb.dataset.videoid;
    const iframe  = thumb.nextElementSibling;
    iframe.src    = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    iframe.style.display = 'block';
    thumb.style.display  = 'none';
}

/* ── TOGGLE PDF — menggunakan Google Drive /preview langsung ── */
function togglePDF(btn) {
    const box     = btn.closest('.cycle-pdf-box');
    const preview = box.querySelector('.cycle-pdf-preview');
    const iframe  = preview.querySelector('iframe');
    const isOpen  = preview.style.display !== 'none';

    if (isOpen) {
        // Tutup
        preview.style.display = 'none';
        iframe.src = '';
        btn.classList.remove('open');
        btn.querySelector('.pdf-toggle-text').textContent = 'Lihat Preview Modul';

        // Hapus tombol fallback kalau ada
        const fallback = box.querySelector('.pdf-fallback-btn');
        if (fallback) fallback.remove();

    } else {
        // Buka — ambil File ID dari data-pdf
        const rawUrl = btn.dataset.pdf; // format: https://drive.google.com/file/d/FILE_ID/preview
        const match  = rawUrl.match(/\/d\/([^/]+)/);
        const fileId = match ? match[1] : null;

        if (!fileId) return;

        // Gunakan URL preview langsung — paling reliable kalau file sudah publik
        const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
        iframe.src = previewUrl;
        preview.style.display = 'block';
        btn.classList.add('open');
        btn.querySelector('.pdf-toggle-text').textContent = 'Tutup Preview';

        // Setelah 4 detik, kalau iframe masih kosong → tampilkan tombol buka tab baru
        setTimeout(() => {
            // Cek apakah preview masih terbuka
            if (preview.style.display === 'none') return;

            // Tambahkan tombol fallback kalau belum ada
            if (!box.querySelector('.pdf-fallback-btn')) {
                const fallbackBtn = document.createElement('a');
                fallbackBtn.href = `https://drive.google.com/file/d/${fileId}/view`;
                fallbackBtn.target = '_blank';
                fallbackBtn.className = 'pdf-fallback-btn';
                fallbackBtn.style.cssText = `
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0.6rem;
                    padding: 0.6rem 1.2rem;
                    border-radius: 999px;
                    background: rgba(56,189,248,0.1);
                    border: 1px solid rgba(56,189,248,0.3);
                    color: #38bdf8;
                    font-size: 0.8rem;
                    font-weight: 600;
                    text-decoration: none;
                    transition: all 0.3s;
                `;
                fallbackBtn.innerHTML = '🔗 Jika preview tidak muncul, buka di tab baru';
                box.appendChild(fallbackBtn);
            }
        }, 4000);
    }
}

/* ── TAB SWITCHING (untuk siklus.html) ── */
function switchTab(btn, panelId) {
    document.querySelectorAll('.assess-tabs > .assess-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('#penilaian > .container > .assess-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
        animateBars(panel);
    }
}

function switchSubTab(btn, panelId, groupClass) {
    btn.closest('div').querySelectorAll('.assess-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.' + groupClass).forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(panelId);
    if (panel) {
        panel.classList.add('active');
        animateBars(panel);
    }
}

function animateBars(container) {
    (container || document).querySelectorAll('.mini-fill, .breakdown-fill, .progress-fill').forEach(el => {
        const w = el.dataset.width;
        if (w) {
            el.style.width = '0%';
            setTimeout(() => { el.style.width = w + '%'; }, 100);
        }
    });
}

/* ──────────────────────────────────────────────────
   MODULE 4: MAGNET HOVER EFFECT
────────────────────────────────────────────────── */
const MagnetModule = (() => {
    function init() {
        document.querySelectorAll('.magnet-btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const rect = btn.getBoundingClientRect();
                const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
                const y = (e.clientY - rect.top - rect.height / 2) * 0.25;
                btn.style.transform = `translate(${x}px, ${y}px)`;
                btn.style.transition = 'transform 0.1s ease';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
                btn.style.transition = 'transform 0.6s cubic-bezier(0.23,1,0.32,1)';
            });
        });
    }
    return { init };
})();

/* ──────────────────────────────────────────────────
   MODULE 5: PDF VIEWER (iframe-based, modul ajar utama)
────────────────────────────────────────────────── */
const PDFModule = (() => {
    const PDF_URL = "modul-ajar-faisal.pdf";
    let loaded = false;

    function toggleModul() {
        const wrap = document.getElementById("pdfViewerWrapper");
        if (wrap.style.display === "none" || !wrap.style.display) {
            wrap.style.display = "block";
            if (!loaded) {
                document.getElementById("pdfIframe").src = PDF_URL;
                loaded = true;
            }
            wrap.scrollIntoView({ behavior: "smooth" });
        } else {
            wrap.style.display = "none";
        }
    }

    function close() {
        document.getElementById("pdfViewerWrapper").style.display = "none";
    }

    function fullscreen() {
        window.open(PDF_URL, "_blank");
    }

    function download() {
        const a = document.createElement("a");
        a.href = PDF_URL;
        a.download = "Modul-Ajar-Riana-Wahyu-Puspitasari.pdf";
        a.click();
    }

    return { toggleModul, close, fullscreen, download };
})();

/* ──────────────────────────────────────────────────
   MODULE 6: ASSESSMENT TABS
────────────────────────────────────────────────── */
const AssessmentModule = (() => {
    function switchTabLegacy(tabId) {
        document.querySelectorAll('.assess-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.assess-panel').forEach(p => p.classList.remove('active'));
        const tabEl = document.querySelector(`[data-tab="${tabId}"]`);
        const panelEl = document.getElementById(`panel-${tabId}`);
        if (tabEl) tabEl.classList.add('active');
        if (panelEl) {
            panelEl.classList.add('active');
            setTimeout(() => {
                panelEl.querySelectorAll('[data-width]').forEach((bar, i) => {
                    setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 60 + 100);
                });
            }, 50);
        }
    }

    function init() {
        document.querySelectorAll('.assess-tab[data-tab]').forEach(tab => {
            tab.addEventListener('click', () => switchTabLegacy(tab.dataset.tab));
        });
        const first = document.querySelector('.assess-tab[data-tab]');
        if (first) switchTabLegacy(first.dataset.tab);
    }

    return { init, switchTab: switchTabLegacy };
})();

/* ──────────────────────────────────────────────────
   MODULE 7: CHARTS (Chart.js)
────────────────────────────────────────────────── */
const ChartsModule = (() => {
    let instances = {};

    function getColors() {
        const dark = document.documentElement.dataset.theme !== 'light';
        return {
            text: dark ? '#94a3b8' : '#475569',
            grid: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
        };
    }

    function defaultOpts(c) {
        return {
            responsive: true,
            maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { color: c.text, padding: 16, font: { size: 11 } } } },
        };
    }

    function create() {
        const c = getColors();
        Chart.defaults.color = c.text;
        Chart.defaults.borderColor = c.grid;
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

        if (document.getElementById('chartKemandirian')) {
            instances.kemandirian = new Chart(document.getElementById('chartKemandirian'), {
                type: 'bar',
                data: {
                    labels: ['Siklus 1', 'Siklus 2', 'Siklus 3'],
                    datasets: [{
                        label: 'Kemandirian (%)',
                        data: [40, 70, 100],
                        backgroundColor: ['rgba(56,189,248,0.45)', 'rgba(129,140,248,0.45)', 'rgba(52,211,153,0.45)'],
                        borderColor: ['#38bdf8', '#818cf8', '#34d399'],
                        borderWidth: 2, borderRadius: 8,
                    }, {
                        label: 'Intervensi GP (%)',
                        data: [60, 30, 5],
                        backgroundColor: 'rgba(248,113,113,0.2)',
                        borderColor: '#f87171',
                        borderWidth: 2, borderRadius: 8,
                    }]
                },
                options: {
                    ...defaultOpts(c),
                    scales: {
                        y: { beginAtZero: true, max: 110, grid: { color: c.grid }, ticks: { color: c.text } },
                        x: { grid: { color: c.grid }, ticks: { color: c.text } }
                    }
                }
            });
        }

        if (document.getElementById('chartRadar')) {
            instances.radar = new Chart(document.getElementById('chartRadar'), {
                type: 'radar',
                data: {
                    labels: ['Pedagogik', 'Profesional', 'Sosial', 'Kepribadian', 'Komunikasi', 'Inovasi'],
                    datasets: [
                        { label: 'Siklus 1', data: [65, 70, 72, 75, 68, 60], borderColor: '#38bdf8', backgroundColor: 'rgba(56,189,248,0.1)', borderWidth: 2, pointRadius: 4 },
                        { label: 'Siklus 2', data: [75, 80, 80, 83, 77, 72], borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.08)', borderWidth: 2, pointRadius: 4 },
                        { label: 'Siklus 3', data: [85, 88, 87, 90, 85, 82], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)', borderWidth: 2, pointRadius: 4 },
                    ]
                },
                options: {
                    ...defaultOpts(c),
                    scales: { r: { min: 50, max: 100, grid: { color: c.grid }, pointLabels: { color: c.text, font: { size: 11 } }, ticks: { color: c.text, backdropColor: 'transparent' } } }
                }
            });
        }

        if (document.getElementById('chartAktivitas')) {
            instances.aktivitas = new Chart(document.getElementById('chartAktivitas'), {
                type: 'line',
                data: {
                    labels: ['Siklus 1', 'Siklus 2', 'Siklus 3'],
                    datasets: [
                        { label: 'Partisipasi Aktif (%)', data: [55, 72, 88], borderColor: '#818cf8', backgroundColor: 'rgba(129,140,248,0.1)', fill: true, tension: 0.4, borderWidth: 2, pointRadius: 6 },
                        { label: 'Pemahaman Materi (%)', data: [60, 75, 85], borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.05)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 6 },
                        { label: 'Motivasi Belajar (%)', data: [50, 68, 82], borderColor: '#34d399', backgroundColor: 'rgba(52,211,153,0.05)', fill: false, tension: 0.4, borderWidth: 2, pointRadius: 6, borderDash: [5, 5] },
                    ]
                },
                options: {
                    ...defaultOpts(c),
                    scales: {
                        y: { beginAtZero: false, min: 40, max: 100, grid: { color: c.grid }, ticks: { color: c.text } },
                        x: { grid: { color: c.grid }, ticks: { color: c.text } }
                    }
                }
            });
        }

        if (document.getElementById('chartWaktu')) {
            instances.waktu = new Chart(document.getElementById('chartWaktu'), {
                type: 'doughnut',
                data: {
                    labels: ['Pendahuluan (15%)', 'Kegiatan Inti (55%)', 'Diskusi/Latihan (20%)', 'Penutup & Evaluasi (10%)'],
                    datasets: [{
                        data: [15, 55, 20, 10],
                        backgroundColor: ['rgba(56,189,248,0.7)', 'rgba(129,140,248,0.7)', 'rgba(52,211,153,0.7)', 'rgba(251,191,36,0.7)'],
                        borderColor: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'],
                        borderWidth: 2, hoverOffset: 10,
                    }]
                },
                options: { ...defaultOpts(c), cutout: '62%' }
            });
        }
    }

    function updateTheme() {
        const c = getColors();
        Chart.defaults.color = c.text;
        Object.values(instances).forEach(chart => {
            if (!chart) return;
            if (chart.options.scales) {
                Object.values(chart.options.scales).forEach(s => {
                    if (s.grid) s.grid.color = c.grid;
                    if (s.ticks) s.ticks.color = c.text;
                    if (s.pointLabels) s.pointLabels.color = c.text;
                });
            }
            if (chart.options.plugins?.legend?.labels) {
                chart.options.plugins.legend.labels.color = c.text;
            }
            chart.update('none');
        });
    }

    return { create, updateTheme };
})();

/* ──────────────────────────────────────────────────
   MODULE 8: NAVBAR SCROLL EFFECT
────────────────────────────────────────────────── */
const NavModule = (() => {
    function init() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        window.addEventListener('scroll', () => {
            nav.style.boxShadow = window.scrollY > 40 ? '0 4px 30px rgba(0,0,0,0.3)' : '';
        }, { passive: true });
    }
    return { init };
})();

/* ──────────────────────────────────────────────────
   MODULE 9: SMOOTH SCROLL
────────────────────────────────────────────────── */
const SmoothScrollModule = (() => {
    function init() {
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', e => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }
    return { init };
})();

/* ──────────────────────────────────────────────────
   BOOTSTRAP — init semua module saat DOM siap
────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    ThemeModule.init();
    TypingModule.init();
    RevealModule.init();
    MagnetModule.init();
    AssessmentModule.init();
    NavModule.init();
    SmoothScrollModule.init();

    // Init bars untuk panel aktif
    document.querySelectorAll('.assess-panel.active').forEach(panel => animateBars(panel));
});

window.addEventListener('load', () => {
    if (typeof Chart !== 'undefined') ChartsModule.create();
});

/* ── Global function bindings ── */
window.toggleTheme    = ThemeModule.toggle;
window.togglePDF      = togglePDF;
window.toggleVideo    = toggleVideo;
window.loadYT         = loadYT;
window.switchTab      = switchTab;
window.switchSubTab   = switchSubTab;
window.animateBars    = animateBars;
window.togglePDFModul = PDFModule.toggleModul;
window.closePDF       = PDFModule.close;
window.fullscreenPDF  = PDFModule.fullscreen;
window.downloadPDF    = PDFModule.download;