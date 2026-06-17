// ===== 幻灯片全局状态 =====
let currentIndex = 0;
let isAnimating = false;
let autoPlayTimer = null;
let progressTimer = null;
let progressValue = 0;
let isPaused = false;
const AUTO_PLAY_INTERVAL = 6000;
let remainingTime = AUTO_PLAY_INTERVAL;
let startTime = 0;
let isInitialized = false;

const slider = document.getElementById('slider');
const indicatorsContainer = document.getElementById('indicators');
const progressBar = document.getElementById('progressBar');
const pageNumber = document.getElementById('pageNumber');

// 使用 people 数据
const currentData = typeof people !== 'undefined' ? people : [];

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
          <p class="slide-quote">"${person.quote.replace(/\n\n/g, '<br><br>')}"</p>
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

// ===== 滚动动画观察器 =====
const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.bottom-section, .gallery-section, .testimonial-section').forEach(section => {
  scrollObserver.observe(section);
});

// ===== 客户寄言轮播 =====
const testimonialTrack = document.getElementById('testimonialTrack');
const testimonialDots = document.getElementById('testimonialDots');
let currentTestimonial = 0;

// 仅在存在寄言区域时初始化
if (testimonialTrack && testimonialDots) {
  // 初始化寄言
  testimonials.forEach((t, i) => {
    const item = document.createElement('div');
    item.className = 'testimonial-item';
    item.innerHTML = `
      <p class="testimonial-quote">${t.quote}</p>
      <div class="testimonial-author">
        <img class="testimonial-avatar" src="${t.avatar}" alt="${t.name}">
        <div class="testimonial-info">
          <span class="testimonial-name">${t.name}</span>
          <span class="testimonial-role">${t.role}</span>
        </div>
      </div>
    `;
    testimonialTrack.appendChild(item);

    const dot = document.createElement('button');
    dot.className = 'testimonial-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToTestimonial(i));
    testimonialDots.appendChild(dot);
  });

  function goToTestimonial(index) {
    currentTestimonial = index;
    testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.testimonial-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }

  function nextTestimonial() {
    goToTestimonial((currentTestimonial + 1) % testimonials.length);
  }

  // 每5秒自动切换
  setInterval(nextTestimonial, 5000);
}

// ===== 寄言滑动切换 =====
let testimonialTouchStartX = 0;
let testimonialTouchEndX = 0;
const testimonialSliderEl = document.getElementById('testimonialSlider');

// 仅在存在寄言区域时添加触摸事件
if (testimonialSliderEl) {
  testimonialSliderEl.addEventListener('touchstart', (e) => {
    testimonialTouchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  testimonialSliderEl.addEventListener('touchend', (e) => {
    testimonialTouchEndX = e.changedTouches[0].screenX;
    const diff = testimonialTouchStartX - testimonialTouchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextTestimonial();
      else goToTestimonial((currentTestimonial - 1 + testimonials.length) % testimonials.length);
    }
  }, { passive: true });
}

// ===== 渲染关于内容区 =====
function renderAboutSection() {
  const aboutSection = document.getElementById('aboutSection');
  if (!aboutSection || !aboutData) return;
  
  aboutSection.innerHTML = `
    <h2 class="bottom-title">${aboutData.title}</h2>
    <div class="bottom-text">
      ${aboutData.paragraphs.map(p => `<p>${p}</p>`).join('')}
    </div>
  `;
}

// ===== 渲染业务信息区 =====
function renderBusinessSection() {
  const businessSection = document.getElementById('businessSection');
  if (!businessSection || !businessData) return;
  
  businessSection.innerHTML = `
    <h2 class="gallery-title">${businessData.title}</h2>
    <div class="gallery-grid">
      ${businessData.items.map(item => `
        <div class="gallery-item">
          <div class="gallery-icon">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `).join('')}
    </div>
  `;
}

// ===== 地图功能 =====
let smallMap;
let modalMap;

// 初始化小地图
function initSmallMap() {
  if (typeof AMap === 'undefined') return;
  
  const smallMapEl = document.getElementById('smallMap');
  if (!smallMapEl) return;

  smallMap = new AMap.Map('smallMap', {
    zoom: 20,
    center: [113.532747, 22.803479],
    mapStyle: 'amap://styles/darkblue',
    scrollWheel: true,
    zoomEnable: true,
    dragEnable: false
  });

  const marker = new AMap.Marker({
    position: [113.532747, 22.803479],
    title: '湾區茶馆创享湾店',
    icon: new AMap.Icon({
      size: new AMap.Size(20, 30),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(20, 30)
    })
  });

  smallMap.add(marker);

  // 点击小地图打开弹窗
  smallMapEl.addEventListener('click', function() {
    const mapModal = document.getElementById('mapModal');
    if (mapModal) {
      mapModal.classList.add('active');
      initModalMap();
    }
  });
}

function initMapModal() {
  const mapModal = document.getElementById('mapModal');
  const mapModalClose = document.getElementById('mapModalClose');
  const mapModalNavBtn = document.getElementById('mapModalNavBtn');
  const mapModalOverlay = document.querySelector('.map-modal-overlay');

  // 打开弹窗（点击小地图已处理）

  // 关闭弹窗
  function closeModal() {
    mapModal.classList.remove('active');
  }

  if (mapModalClose) {
    mapModalClose.addEventListener('click', closeModal);
  }

  if (mapModalOverlay) {
    mapModalOverlay.addEventListener('click', closeModal);
  }

  // 导航按钮
  if (mapModalNavBtn) {
    mapModalNavBtn.addEventListener('click', function() {
      const address = encodeURIComponent('广州市南沙区创享湾3栋一楼湾区茶馆');
      const lat = 22.803479;
      const lng = 113.532747;

      if (isGaoDeApp()) {
        window.location.href = 'amapuri://route/plan?dlat=' + lat + '&dlon=' + lng + '&dname=' + address + '&dev=0';
      } else if (isBaiduMapApp()) {
        window.location.href = 'baidumap://map/direction?destination=name:' + address + '|latlng:' + lat + ',' + lng + '&mode=driving';
      } else if (isTencentMapApp()) {
        window.location.href = 'qqmap://map/routeplan?type=drive&to=' + address + '&tocoord=' + lat + ',' + lng;
      } else {
        window.open('https://uri.amap.com/marker?position=' + lng + ',' + lat + '&name=' + address + '&callnative=0');
      }
    });
  }
}

// 初始化弹窗内的地图
function initModalMap() {
  if (modalMap || typeof AMap === 'undefined') return;
  
  const modalMapEl = document.getElementById('modalMap');
  if (!modalMapEl) return;

  modalMap = new AMap.Map('modalMap', {
    zoom: 30,
    center: [113.532747, 22.803479],
    mapStyle: 'amap://styles/darkblue'
  });

  const marker = new AMap.Marker({
    position: [113.532747, 22.803479],
    title: '湾區茶馆创享湾店',
    icon: new AMap.Icon({
      size: new AMap.Size(20, 30),
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
      imageSize: new AMap.Size(20, 30)
    })
  });

  modalMap.add(marker);

  const infoWindow = new AMap.InfoWindow({
    content: '<div style="padding: 10px;">' +
             '<h4 style="color: #f0c040; margin-bottom: 5px;">湾區茶馆创享湾店</h4>' +
             '<p style="color: #fff; font-size: 14px;">广州市南沙区创享湾3栋一楼</p>' +
             '</div>',
    offset: new AMap.Pixel(0, -20)
  });

  marker.on('click', function() {
    infoWindow.open(modalMap, marker.getPosition());
  });

  infoWindow.open(modalMap, marker.getPosition());
}

// 判断地图App
function isGaoDeApp() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('amap') !== -1 || ua.indexOf('autonavi') !== -1;
}

function isBaiduMapApp() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('baidumap') !== -1;
}

function isTencentMapApp() {
  const ua = navigator.userAgent.toLowerCase();
  return ua.indexOf('qqmap') !== -1 || ua.indexOf('qqmapview') !== -1;
}

// ===== 启动 =====
document.addEventListener('DOMContentLoaded', () => {
  initSlides();
  slider.classList.add('auto-playing');
  startAutoPlay();
  isInitialized = true;
  renderAboutSection();
  renderBusinessSection();
  initSmallMap();
  initMapModal();
});
