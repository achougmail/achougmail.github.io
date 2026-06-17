// ===== 幻灯片全局状态 =====
let currentIndex = 0;
let isAnimating = false;
let autoPlayTimer = null;
let progressTimer = null;
let progressValue = 0;
let isPaused = false;
const AUTO_PLAY_INTERVAL = 20000;
let remainingTime = AUTO_PLAY_INTERVAL;
let startTime = 0;
let isInitialized = false;

const slider = document.getElementById('slider');
const indicatorsContainer = document.getElementById('indicators');
const progressBar = document.getElementById('progressBar');
const pageNumber = document.getElementById('pageNumber');

// 使用 teachers 数据
const currentData = typeof teachers !== 'undefined' ? teachers : [];

// ===== 初始化幻灯片 =====
function initSlides() {
  currentData.forEach((person, index) => {
    // 创建幻灯片
    const slide = document.createElement('div');
    slide.className = 'slide' + (index === 0 ? ' active' : '');
    slide.dataset.index = index;

    slide.innerHTML = `
      <img class="slide-image" src="${person.image}" alt="${person.name}" loading="${index === 0 ? 'eager' : 'lazy'}">
      <div class="slide-overlay"></div>
      <div class="slide-dark-bg"></div>
      <div class="slide-content">
        <div class="slide-content-inner">
          <div class="slide-tag">${person.tag}</div>
          <h1 class="slide-name">${person.name}</h1>
          <p class="slide-title">${person.title}</p>
          <p class="slide-desc">${person.desc}</p>
          <div class="slide-stats">
            ${person.stats.map(s => `
              <div class="stat-item">
                <div class="stat-number">${s.number}</div>
                <div class="stat-label">${s.label}</div>
              </div>
            `).join('')}
          </div>
          <ul class="slide-cv">
            ${person.CV.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    // 插入到导航箭头之前
    slider.insertBefore(slide, document.getElementById('prevBtn'));

    // 创建指示器
    const dot = document.createElement('div');
    dot.className = 'indicator' + (index === 0 ? ' active' : '');
    dot.dataset.index = index;
    dot.addEventListener('click', () => goToSlide(index));
    indicatorsContainer.appendChild(dot);
  });

  updatePageNumber();
}

// ===== 切换到指定幻灯片 =====
function goToSlide(newIndex, direction) {
  if (isAnimating || newIndex === currentIndex) return;
  isAnimating = true;

  const slides = document.querySelectorAll('.slide');
  const indicators = document.querySelectorAll('.indicator');

  // 确定方向
  if (!direction) {
    direction = newIndex > currentIndex ? 'left' : 'right';
  }

  const oldSlide = slides[currentIndex];
  const newSlide = slides[newIndex];

  // 移除旧幻灯片的 active
  oldSlide.classList.remove('active');

  // 设置新幻灯片的方向类
  newSlide.classList.remove('dir-left', 'dir-right');
  newSlide.classList.add(`dir-${direction}`);

  // 强制重排，确保动画生效
  void newSlide.offsetWidth;

  // 激活新幻灯片
  newSlide.classList.add('active');

  // 更新指示器
  indicators[currentIndex].classList.remove('active');
  indicators[newIndex].classList.add('active');

  currentIndex = newIndex;
  updatePageNumber();

  // 重置自动播放
  resetAutoPlay();

  // 动画结束后解锁
  setTimeout(() => {
    isAnimating = false;
    oldSlide.classList.remove('dir-left', 'dir-right');
  }, 1000);
}

// ===== 上一个 / 下一个 =====
function prevSlide() {
  const newIndex = (currentIndex - 1 + currentData.length) % currentData.length;
  goToSlide(newIndex, 'right');
}

function nextSlide() {
  const newIndex = (currentIndex + 1) % currentData.length;
  goToSlide(newIndex, 'left');
}

// ===== 更新页码 =====
function updatePageNumber() {
  pageNumber.innerHTML = `<span class="current">0${currentIndex + 1}</span> / 0${currentData.length}`;
}

// ===== 自动播放 & 进度条 =====
function startAutoPlay() {
  if (isPaused) return;

  startTime = Date.now();

  progressTimer = setInterval(() => {
    if (isPaused) return;
    progressValue += 100 / (AUTO_PLAY_INTERVAL / 50);
    progressBar.style.width = Math.min(progressValue, 100) + '%';
  }, 50);

  autoPlayTimer = setTimeout(() => {
    if (!isPaused) nextSlide();
  }, remainingTime);
}

function resetAutoPlay() {
  clearTimeout(autoPlayTimer);
  clearInterval(progressTimer);
  progressValue = 0;
  remainingTime = AUTO_PLAY_INTERVAL;
  progressBar.style.width = '0%';
  startAutoPlay();
}

function togglePause() {
  isPaused = !isPaused;
  if (isPaused) {
    clearTimeout(autoPlayTimer);
    clearInterval(progressTimer);
    remainingTime -= Date.now() - startTime;
    if (remainingTime < 0) remainingTime = 0;
    slider.classList.remove('auto-playing');
  } else {
    slider.classList.add('auto-playing');
    startAutoPlay();
  }
}

// ===== 事件绑定 =====
document.getElementById('prevBtn').addEventListener('click', prevSlide);
document.getElementById('nextBtn').addEventListener('click', nextSlide);

// 键盘导航
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') prevSlide();
  if (e.key === 'ArrowRight') nextSlide();
});

// 触摸滑动
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;

slider.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
  touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

slider.addEventListener('touchmove', (e) => {
  const touchX = e.changedTouches[0].screenX;
  const touchY = e.changedTouches[0].screenY;
  const diffX = Math.abs(touchX - touchStartX);
  const diffY = Math.abs(touchY - touchStartY);
  
  if (diffX > diffY && diffX > 10) {
    e.preventDefault();
  }
}, { passive: false });

slider.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  const diff = touchStartX - touchEndX;
  if (Math.abs(diff) > 50) {
    if (diff > 0) nextSlide();
    else prevSlide();
  }
}, { passive: true });

// 点击屏幕暂停/继续
slider.addEventListener('click', (e) => {
  if (e.target.closest('.nav-arrow') || e.target.closest('.indicator')) return;
  togglePause();
});

// ===== 滚动监听：顶部栏背景 =====
const topBar = document.querySelector('.top-bar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 80) {
    topBar.classList.add('scrolled');
  } else {
    topBar.classList.remove('scrolled');
  }
});

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', () => {
  initSlides();
  slider.classList.add('auto-playing');
  startAutoPlay();
  isInitialized = true;
});
