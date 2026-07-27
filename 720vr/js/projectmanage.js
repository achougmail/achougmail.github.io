/**
 * 项目管理脚本
 * 负责卡片渲染、搜索过滤、标签切换等功能
 */

/**
 * 当前选中的标签和关键词
 */
var currentTag = '全部';
var currentKeyword = '';

/**
 * 渲染卡片函数
 * @param {string} filterTag - 过滤标签
 * @param {string} keyword - 搜索关键词
 */
function renderCards(filterTag, keyword) {
  var container = document.getElementById('cardContainer');
  container.innerHTML = '';

  var filteredData = cardData.filter(function(item) {
    var tagMatch = filterTag === '全部' || item.tag === filterTag;
    var keywordMatch = !keyword || item.name.indexOf(keyword) !== -1;
    return tagMatch && keywordMatch;
  });

  var fixedItem = filteredData.find(function(item) { return item.id === 1; });
  var randomItems = filteredData.filter(function(item) { return item.id !== 1; });
  
  for (var i = randomItems.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = randomItems[i];
    randomItems[i] = randomItems[j];
    randomItems[j] = temp;
  }
  
  filteredData = fixedItem ? [fixedItem].concat(randomItems) : randomItems;

  var largeCard = filteredData.find(function(item) { return item.isLarge; });
  var smallCards = filteredData.filter(function(item) { return !item.isLarge; });

  if (largeCard) {
    container.innerHTML += createCard(largeCard);
  }

  if (smallCards.length > 0) {
    var gridHtml = '<div class="grid">';
    smallCards.forEach(function(item) {
      gridHtml += createCard(item);
    });
    gridHtml += '</div>';
    container.innerHTML += gridHtml;
  }

  if (filteredData.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #999;">暂无匹配结果</div>';
  } else {
    setTimeout(function() {
      var animateElements = container.querySelectorAll('.animate-this');
      animateElements.forEach(function(el, ctr) {
        setTimeout(function() {
          el.classList.add('fadeInUp', 'animated');
        }, ctr * 100);
      });
    }, 100);
  }
}

/**
 * 创建卡片HTML（全部项目页样式）
 * @param {object} item - 卡片数据
 * @returns {string} HTML字符串
 */
function createCard(item) {
  var className = item.isLarge ? 'card-large' : 'card';
  var subscribeBadge = item.subscribe ? '<div class="subscribe-badge animate-this">订阅</div>' : '';
  return '<div class="' + className + ' animate-this" onclick="location.href=\'' + item.link + '\'">' +
         '<img class="card-img animate-this" src="' + item.image + '" alt="' + item.name + '" />' +
         subscribeBadge +
         '<div class="card-info">' +
         '<div class="card-title animate-this">' + item.name + '</div>' +
         '<div class="card-tag animate-this">' + item.tag + '</div>' +
         '</div>' +
         '</div>';
}

/**
 * 创建大卡片HTML（首页样式）
 * @param {object} item - 卡片数据
 * @returns {string} HTML字符串
 */
function createLargeCard(item) {
  var subscribeBadge = item.subscribe ? '<span class="subscribe-badge animate-this">订阅</span>' : '';
  return '<div class="main-card animate-this" onclick="location.href=\'' + item.link + '\'">' +
         '<img src="' + item.image + '" class="main-card-img animate-this" alt="' + item.name + '">' +
         '<div class="main-card-overlay">' +
         '<span class="main-card-badge animate-this">' + item.tag + '</span>' +
         '<h3 class="animate-this">' + item.name + '</h3>' +
         '<p class="animate-this">沉浸式全景体验</p>' + 
         subscribeBadge +
         '</div>' +
         '</div>';
}

/**
 * 创建小卡片HTML（首页样式）
 * @param {object} item - 卡片数据
 * @returns {string} HTML字符串
 */
function createSmallCard(item) {
  return '<div class="small-card animate-this" onclick="location.href=\'' + item.link + '\'">' +
         '<img src="' + item.image + '" alt="' + item.name + '" onload="updateScrollButtons()">' +
         '<div class="small-card-overlay">' +
         '<span class="small-card-badge animate-this">' + item.tag + '</span>' +
         '<h4 class="animate-this">' + item.name + '</h4>' +  
         '</div>' +
         '</div>';
}

/**
 * 更新滚动按钮显示状态
 */
function updateScrollButtons() {
  var scrollContainer = document.getElementById('cardsScrollContainer');
  var leftBtn = document.querySelector('.scroll-btn.left');
  var rightBtn = document.querySelector('.scroll-btn.right');
  
  if (!scrollContainer || !leftBtn || !rightBtn) return;
  
  if (window.innerWidth < 768) {
    leftBtn.style.display = 'none';
    rightBtn.style.display = 'none';
    return;
  }
  
  var isAtLeft = scrollContainer.scrollLeft <= 0;
  var isAtRight = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;
  
  leftBtn.style.display = isAtLeft ? 'none' : 'flex';
  rightBtn.style.display = isAtRight ? 'none' : 'flex';
}

/**
 * 滚动卡片函数（首页横向滚动）
 * @param {number} amount - 滚动距离（正值向右，负值向左）
 */
function scrollCards(amount) {
  var scrollContainer = document.getElementById('cardsScrollContainer');
  if (scrollContainer) {
    scrollContainer.scrollBy({
      left: amount,
      behavior: 'smooth'
    });
    setTimeout(updateScrollButtons, 300);
  }
}

/**
 * 首页渲染卡片函数（横向滚动模式）
 * @param {string} filterTag - 过滤标签
 * @param {string} keyword - 搜索关键词
 */
function renderCardsHome(filterTag, keyword) {
  var container = document.getElementById('cardContainer');
  container.innerHTML = '';

  var filteredData = cardData.filter(function(item) {
    var tagMatch = filterTag === '全部' || item.tag === filterTag;
    var keywordMatch = !keyword || item.name.indexOf(keyword) !== -1;
    return tagMatch && keywordMatch;
  });

  var fixedCard = filteredData.find(function(item) { return item.id === 1; });
  var otherCards = filteredData.filter(function(item) { return item.id !== 1; });

  otherCards.sort(function() { return Math.random() - 0.5; });
  var smallCards = otherCards.slice(0, 5);

  if (fixedCard) {
    container.innerHTML += createLargeCard(fixedCard);
  }

  if (smallCards.length > 0) {
    var trackHtml = '<div class="cards-track">';
    smallCards.forEach(function(item) {
      trackHtml += createSmallCard(item);
    });
    trackHtml += '</div>';
    container.innerHTML += '<div class="cards-scroll-wrapper">' +
                           '<button class="scroll-btn left" onclick="scrollCards(-320)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>' +
                           '<div class="cards-scroll" id="cardsScrollContainer">' + trackHtml + '</div>' +
                           '<button class="scroll-btn right" onclick="scrollCards(320)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>' +
                           '</div>';
    
    var scrollContainer = document.getElementById('cardsScrollContainer');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      setTimeout(updateScrollButtons, 100);
    }
  }

  if (!fixedCard && smallCards.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px 0; color: #999;">暂无匹配结果</div>';
  }
}

/**
 * 标签点击事件监听
 */
function initTagListeners() {
  document.querySelectorAll('.tag').forEach(function(tag) {
    tag.addEventListener('click', function() {
      document.querySelectorAll('.tag').forEach(function(t) { t.classList.remove('active'); });
      this.classList.add('active');
      currentTag = this.textContent;
      
      if (currentTag === '全部') {
        var searchBox = document.querySelector('.search-box');
        searchBox.value = '';
        currentKeyword = '';
      }
      
      renderCards(currentTag, currentKeyword);
    });
  });
}

/**
 * 搜索框输入事件监听
 */
function initSearchListener() {
  var searchBox = document.querySelector('.search-box');
  if (searchBox) {
    searchBox.addEventListener('input', function(e) {
      currentKeyword = e.target.value.trim();
      renderCards(currentTag, currentKeyword);
    });
  }
}

/**
 * 初始化函数
 * 在页面加载完成后执行
 */
function initProjectManage() {
  initTagListeners();
  initSearchListener();
  renderCards('全部', '');
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initProjectManage);