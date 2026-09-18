import fs from 'fs';
import path from 'path';

const brainDir = 'C:\\Users\\rajav\\.gemini\\antigravity\\brain\\cd90e3ef-4314-4fad-8886-b432a8a115f4';
const screenshotsDir = 'C:\\Users\\rajav\\Documents\\projects\\mentor-os\\frontend\\screenshots';

function toBase64(fileName) {
  const filePath = path.join(screenshotsDir, fileName);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

const screens = [
  {
    id: 'career',
    title: '🎓 Home (Career)',
    desc: 'Mode toggle at Career, rich Sage hero card with focus/verify CTAs, growth/streak cards, tactile task rows, inline mentor verification, and Phase 1 test card.',
    desktop: toBase64('home_career_desktop.png'),
    mobile: toBase64('home_career_mobile.png'),
  },
  {
    id: 'personal',
    title: '🌿 Home (Personal)',
    desc: 'Mode toggle at Personal, warm Peach hero card (2 of 4 done with white progress bar), daily habits (Drink water, Hair oil) with 48px check buttons, 14d streak, and routine consistency.',
    desktop: toBase64('home_personal_desktop.png'),
    mobile: toBase64('home_personal_mobile.png'),
  },
  {
    id: 'milestone',
    title: '★ Milestone Test',
    desc: 'Deep multi-question phase exam (Phase 1 check-in · Q2 of 5, progress segments, SQL query prompt, conversational cat mentor grading bubble offering second attempt).',
    desktop: toBase64('milestone_test_modal_desktop.png'),
    mobile: toBase64('milestone_test_modal_mobile.png'),
  },
  {
    id: 'upload',
    title: '📅 Auto-Calendar Confirm',
    desc: 'Mockup Screen 3 confirmation (Reading data_analyst_roadmap.pdf, 3 phases detected, 7 tasks scheduled, 3 milestones dated, auto-filled calendar notice, and View my calendar CTA).',
    desktop: toBase64('upload_autocalendar_confirmation.png'),
    mobile: toBase64('upload_autocalendar_mobile.png'),
  },
  {
    id: 'calendar',
    title: '🗓️ Populated Calendar',
    desc: 'September calendar with 7-day horizontal scrubber, status legend (Completed, Today, Critical, Revision), and Sep 16 auto-scheduled tasks with coral left stripes.',
    desktop: toBase64('calendar_autopopulated_desktop.png'),
    mobile: toBase64('calendar_agenda_mobile.png'),
  },
  {
    id: 'progress',
    title: '📈 Career Analytics',
    desc: 'Career growth screen with Living Garden stage, Focus sessions: 12, Milestone tests passed: 3/4 stat card, evening focus coach insight, and phase test triggers.',
    desktop: toBase64('progress_career_analytics_desktop.png'),
    mobile: toBase64('progress_career_growth_mobile.png'),
  },
];

const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>MentorAI Real Screenshot Gallery</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
  </style>
</head>
<body class="bg-[#F5F2EB] text-[#231F1C] antialiased p-4 sm:p-6">
  <div class="max-w-5xl mx-auto space-y-4">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2DCD2]">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-[#231F1C] flex items-center gap-2">
          <span>🐱</span> MentorAI Visual Verification Gallery
        </h1>
        <p class="text-xs sm:text-sm text-[#686058] font-medium">
          Actual rendered PNG screenshots from localhost:5173 with verified design tokens
        </p>
      </div>
      <!-- Viewport Switcher -->
      <div class="flex bg-[#EDE8DF] p-1 rounded-2xl border border-[#E2DCD2] self-start sm:self-auto">
        <button id="btnDesktop" onclick="setViewport('desktop')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all bg-[#2D6A45] text-white shadow-xs cursor-pointer">
          🖥️ Desktop (1280px)
        </button>
        <button id="btnMobile" onclick="setViewport('mobile')" class="px-3.5 py-1.5 rounded-xl text-xs font-black transition-all text-[#686058] hover:text-[#231F1C] cursor-pointer">
          📱 Mobile (390px)
        </button>
      </div>
    </div>

    <!-- Screen Tabs -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-[#E2DCD2] no-scrollbar">
      ${screens
        .map(
          (s, idx) => `
        <button id="tab-${s.id}" onclick="selectScreen('${s.id}')" class="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            idx === 0
              ? 'bg-[#2D6A45] text-white shadow-xs'
              : 'bg-white text-[#686058] hover:text-[#231F1C] border border-[#E2DCD2]'
          }">
          ${s.title}
        </button>
      `
        )
        .join('')}
    </div>

    <!-- Active Screen Description -->
    <div id="screenInfo" class="p-4 rounded-2xl bg-white border border-[#E2DCD2] shadow-xs space-y-1">
      <h2 id="screenTitle" class="text-base font-black text-[#231F1C]">${screens[0].title}</h2>
      <p id="screenDesc" class="text-xs text-[#686058] leading-relaxed">${screens[0].desc}</p>
    </div>

    <!-- Image Display Frame -->
    <div class="p-3 sm:p-4 rounded-3xl bg-white border border-[#E2DCD2] shadow-sm flex items-center justify-center min-h-[420px] overflow-hidden">
      <div id="imageContainer" class="w-full flex justify-center transition-all">
        <img id="mainImage" src="${screens[0].desktop}" alt="Screen Preview" class="rounded-2xl border border-[#E2DCD2] shadow-md max-w-full object-contain max-h-[700px]" />
      </div>
    </div>
  </div>

  <script>
    const screensData = ${JSON.stringify(
      screens.reduce((acc, s) => {
        acc[s.id] = s;
        return acc;
      }, {})
    )};

    let currentScreenId = 'career';
    let currentViewport = 'desktop';

    function updateView() {
      const data = screensData[currentScreenId];
      if (!data) return;

      document.getElementById('screenTitle').textContent = data.title;
      document.getElementById('screenDesc').textContent = data.desc;

      const img = document.getElementById('mainImage');
      const src = currentViewport === 'desktop' ? data.desktop : data.mobile;
      img.src = src;

      const container = document.getElementById('imageContainer');
      if (currentViewport === 'mobile') {
        container.className = 'max-w-[420px] flex justify-center transition-all';
      } else {
        container.className = 'w-full flex justify-center transition-all';
      }

      // Update tabs
      Object.keys(screensData).forEach(id => {
        const btn = document.getElementById('tab-' + id);
        if (btn) {
          if (id === currentScreenId) {
            btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer bg-[#2D6A45] text-white shadow-xs';
          } else {
            btn.className = 'px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer bg-white text-[#686058] hover:text-[#231F1C] border border-[#E2DCD2]';
          }
        }
      });

      // Update viewport buttons
      const btnD = document.getElementById('btnDesktop');
      const btnM = document.getElementById('btnMobile');
      if (currentViewport === 'desktop') {
        btnD.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all bg-[#2D6A45] text-white shadow-xs cursor-pointer';
        btnM.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all text-[#686058] hover:text-[#231F1C] cursor-pointer';
      } else {
        btnM.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all bg-[#2D6A45] text-white shadow-xs cursor-pointer';
        btnD.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all text-[#686058] hover:text-[#231F1C] cursor-pointer';
      }
    }

    function selectScreen(id) {
      currentScreenId = id;
      updateView();
    }

    function setViewport(vp) {
      currentViewport = vp;
      updateView();
    }
  </script>
</body>
</html>`;

const outPath = path.join(brainDir, 'visual_audit_gallery.html');
fs.writeFileSync(outPath, htmlContent, 'utf8');
console.log('Successfully generated self-contained visual_audit_gallery.html with base64 embedded images!');
