/* ═══════════════════════════════════════════════════
   E-PORTFOLIO PPL — Faisal Fajar Ramadhan
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
                // Animate progress bars on reveal
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
   MODULE 5: PDF VIEWER (iframe-based)
────────────────────────────────────────────────── */
const PDFModule = (() => {

    const PDF_URL = "modul-ajar-faisal.pdf";
    let loaded = false;

    function toggle() {
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
        a.download = "Modul-Ajar-Faisal-Fajar-Ramadhan-2530830.pdf";
        a.click();
    }

    return {
        toggle,
        close,
        fullscreen,
        download
    };

})();
/* ──────────────────────────────────────────────────
   MODULE 6: ASSESSMENT TABS
────────────────────────────────────────────────── */
const AssessmentModule = (() => {
    function switchTab(tabId) {
        document.querySelectorAll('.assess-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.assess-panel').forEach(p => p.classList.remove('active'));
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.getElementById(`panel-${tabId}`).classList.add('active');

        // Re-trigger bar animations for the newly shown panel
        setTimeout(() => {
            document.querySelectorAll(`#panel-${tabId} [data-width]`).forEach((bar, i) => {
                setTimeout(() => { bar.style.width = bar.dataset.width + '%'; }, i * 60 + 100);
            });
        }, 50);
    }

    function init() {
        document.querySelectorAll('.assess-tab').forEach(tab => {
            tab.addEventListener('click', () => switchTab(tab.dataset.tab));
        });
        // Activate first tab
        const first = document.querySelector('.assess-tab');
        if (first) switchTab(first.dataset.tab);
    }

    return { init, switchTab };
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

        /* Chart 1 — Kemandirian Mengajar */
        instances.kemandirian = new Chart(document.getElementById('chartKemandirian'), {
            type: 'bar',
            data: {
                labels: ['Siklus 1', 'Siklus 2', 'Siklus 3'],
                datasets: [{
                        label: 'Kemandirian (%)',
                        data: [40, 70, 100],
                        backgroundColor: ['rgba(56,189,248,0.45)', 'rgba(129,140,248,0.45)', 'rgba(52,211,153,0.45)'],
                        borderColor: ['#38bdf8', '#818cf8', '#34d399'],
                        borderWidth: 2,
                        borderRadius: 8,
                    },
                    {
                        label: 'Intervensi GP (%)',
                        data: [60, 30, 5],
                        backgroundColor: 'rgba(248,113,113,0.2)',
                        borderColor: '#f87171',
                        borderWidth: 2,
                        borderRadius: 8,
                    }
                ]
            },
            options: {
                ...defaultOpts(c),
                scales: {
                    y: { beginAtZero: true, max: 110, grid: { color: c.grid }, ticks: { color: c.text } },
                    x: { grid: { color: c.grid }, ticks: { color: c.text } }
                }
            }
        });

        /* Chart 2 — Radar Kompetensi */
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

        /* Chart 3 — Partisipasi Siswa */
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

        /* Chart 4 — Distribusi Waktu */
        instances.waktu = new Chart(document.getElementById('chartWaktu'), {
            type: 'doughnut',
            data: {
                labels: ['Pendahuluan (15%)', 'Kegiatan Inti (55%)', 'Diskusi/Latihan (20%)', 'Penutup & Evaluasi (10%)'],
                datasets: [{
                    data: [15, 55, 20, 10],
                    backgroundColor: ['rgba(56,189,248,0.7)', 'rgba(129,140,248,0.7)', 'rgba(52,211,153,0.7)', 'rgba(251,191,36,0.7)'],
                    borderColor: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24'],
                    borderWidth: 2,
                    hoverOffset: 10,
                }]
            },
            options: {...defaultOpts(c), cutout: '62%' }
        });
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
            if (chart.options.plugins && chart.options.plugins.legend && chart.options.plugins.legend.labels) {
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
        window.addEventListener('scroll', () => {
            nav.style.boxShadow = window.scrollY > 40 ? '0 4px 30px rgba(0,0,0,0.3)' : '';
        }, { passive: true });
    }
    return { init };
})();

/* ──────────────────────────────────────────────────
   MODULE 9: SMOOTH SCROLL (nav links)
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
});

window.addEventListener('load', () => {
    ChartsModule.create();
});

/* ── Global function bindings (for inline HTML onclick) ── */
window.toggleTheme = ThemeModule.toggle;
window.togglePDF = PDFModule.toggle;
window.closePDF = PDFModule.close;
window.fullscreenPDF = PDFModule.fullscreen;
window.downloadPDF = PDFModule.download;
window.switchTab = AssessmentModule.switchTab;