import * as THREE from 'three';

window.VM = window.VM || {};

const VM = window.VM;

var viewToolbarVisible = false;

function initUI() {
  initFileInput();
  initLogo();
  initMenu();
  initViewToolbar();
  initToggles();
  initClipping();
}

function initFileInput() {
  var fileInput = document.getElementById('fileInput');
  fileInput.addEventListener('change', function(e) {
    var file = e.target.files && e.target.files[0];
    if (file) VM.loadFromFile(file);
    e.target.value = '';
  });
}

function initLogo() {
  var logoEl = document.getElementById('logo');
  var toolbarEl = document.getElementById('toolbar');

  logoEl.addEventListener('click', function() {
    toolbarEl.style.display = toolbarEl.style.display === 'flex' ? 'none' : 'flex';
  });

  var toolbarClose = document.getElementById('toolbarClose');
  toolbarClose.addEventListener('click', function() {
    toolbarEl.style.display = 'none';
  });
}

function initMenu() {
  var menuBtn = document.getElementById('menuBtn');
  var sidebar = document.getElementById('sidebar');

  menuBtn.addEventListener('click', function() {
    VM.toggleClass(sidebar, 'active');
  });

  var viewToolbar = document.getElementById('viewToolbar');
  var viewToolbarToggle = document.getElementById('viewToolbarToggle');

  document.addEventListener('click', function(e) {
    if (!menuBtn.contains(e.target) && !sidebar.contains(e.target)) {
      sidebar.classList.remove('active');
    }

    var toolbarEl = document.getElementById('toolbar');
    var logoEl = document.getElementById('logo');
    if (!logoEl.contains(e.target) && !toolbarEl.contains(e.target)) {
      toolbarEl.style.display = 'none';
    }

    if (!viewToolbar.contains(e.target) && !viewToolbarToggle.contains(e.target)) {
      viewToolbarVisible = false;
      viewToolbar.classList.remove('visible');
      viewToolbarToggle.classList.remove('hidden');
    }
  });
}

function initViewToolbar() {
  var viewToolbar = document.getElementById('viewToolbar');
  var viewToolbarToggle = document.getElementById('viewToolbarToggle');

  viewToolbarToggle.addEventListener('click', function() {
    viewToolbarVisible = !viewToolbarVisible;
    VM.toggleClass(viewToolbar, 'visible', viewToolbarVisible);
    VM.toggleClass(viewToolbarToggle, 'hidden', viewToolbarVisible);
  });

  var topViewBtn = document.getElementById('topViewBtn');
  var isoViewBtn = document.getElementById('isoViewBtn');
  var frontViewBtn = document.getElementById('frontViewBtn');
  var reloadBtn = document.getElementById('reloadBtn');

  topViewBtn.addEventListener('click', VM.setTopView);
  isoViewBtn.addEventListener('click', VM.setIsoView);
  frontViewBtn.addEventListener('click', VM.setFrontView);

  reloadBtn.addEventListener('click', function() {
    var edgeToggle = document.getElementById('edgeToggle');
    var shadowToggle = document.getElementById('shadowToggle');
    var gridToggle = document.getElementById('gridToggle');
    var axisToggle = document.getElementById('axisToggle');
    var clipToggle = document.getElementById('clipToggle');

    if (edgeToggle) edgeToggle.checked = true;
    if (shadowToggle) shadowToggle.checked = false;
    if (gridToggle) gridToggle.checked = true;
    if (axisToggle) axisToggle.checked = true;
    if (clipToggle) clipToggle.checked = false;

    VM.edgeLines.forEach(function(line) {
      line.visible = true;
    });

    VM.renderer.shadowMap.enabled = false;
    VM.mainLight.castShadow = false;
    if (VM.currentModel) {
      VM.currentModel.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });
    }

    if (VM.grid) VM.grid.visible = true;
    if (VM.axisHelper) VM.axisHelper.visible = true;

    VM.clipEnabled = false;
    var clipSliderBar = document.getElementById('clipSliderBar');
    if (clipSliderBar) clipSliderBar.classList.remove('active');

    if (VM.camera) {
      VM.camera.up.set(0, 1, 0);
    }

    VM.loadFromURL(VM.currentModelUrl || 'model.glb');
  });
}

function initToggles() {
  var edgeToggle = document.getElementById('edgeToggle');
  edgeToggle.addEventListener('change', function(e) {
    VM.edgeLines.forEach(function(line) {
      line.visible = e.target.checked;
    });
    var edgeToggleBar = document.getElementById('edgeToggleBar');
    if (edgeToggleBar) {
      VM.toggleClass(edgeToggleBar, 'active', e.target.checked);
    }
  });

  var edgeToggleBar = document.getElementById('edgeToggleBar');
  edgeToggleBar.addEventListener('click', function() {
    edgeToggle.checked = !edgeToggle.checked;
    edgeToggle.dispatchEvent(new Event('change'));
    VM.toggleClass(edgeToggleBar, 'active', edgeToggle.checked);
  });

  var shadowToggle = document.getElementById('shadowToggle');
  shadowToggle.addEventListener('change', function(e) {
    VM.renderer.shadowMap.enabled = e.target.checked;
    VM.mainLight.castShadow = e.target.checked;
    if (VM.currentModel) {
      VM.currentModel.traverse(function(child) {
        if (child.isMesh) {
          child.castShadow = e.target.checked;
          child.receiveShadow = e.target.checked;
        }
      });
    }
  });

  var gridToggle = document.getElementById('gridToggle');
  gridToggle.addEventListener('change', function(e) {
    if (VM.grid) {
      VM.grid.visible = e.target.checked;
    }
  });

  var axisToggle = document.getElementById('axisToggle');
  axisToggle.addEventListener('change', function(e) {
    if (VM.axisHelper) {
      VM.axisHelper.visible = e.target.checked;
    }
  });

  var perspectiveToggle = document.getElementById('perspectiveToggle');
  perspectiveToggle.addEventListener('change', function(e) {
    if (e.target.checked) {
      const perspCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
      perspCamera.position.copy(VM.camera.position);
      perspCamera.up.copy(VM.camera.up);
      perspCamera.lookAt(VM.controls.target);
      VM.camera = perspCamera;
      VM.controls.object = VM.camera;
    } else {
      const box = new THREE.Box3().setFromObject(VM.currentModel || VM.scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const aspect = window.innerWidth / window.innerHeight;
      const orthoCamera = new THREE.OrthographicCamera(-maxDim * aspect, maxDim * aspect, maxDim, -maxDim, 0.1, 5000);
      orthoCamera.position.copy(VM.camera.position);
      orthoCamera.up.copy(VM.camera.up);
      orthoCamera.lookAt(VM.controls.target);
      VM.camera = orthoCamera;
      VM.controls.object = VM.camera;
    }
    VM.controls.update();
  });
}

function initClipping() {
  var clipToggle = document.getElementById('clipToggle');
  var clipToggleBar = document.getElementById('clipToggleBar');
  var clipSliderBar = document.getElementById('clipSliderBar');
  var clipSlider = document.getElementById('clipSlider');

  function updateClipPlane() {
    var value = parseFloat(clipSlider.value);
    var targetY = (value / 100) * VM.modelHeight;
    VM.clipPlane.constant = VM.modelHeight - targetY;
    clipSlider.style.setProperty('--val', value + '%');
    if (VM.currentModel) {
      VM.enableClip(VM.currentModel);
    }
  }

  function handleClipToggle(enabled) {
    VM.clipEnabled = enabled;
    VM.toggleClass(clipSliderBar, 'active', VM.clipEnabled);
    clipToggle.checked = enabled;
    VM.toggleClass(clipToggleBar, 'active', enabled);
    if (VM.currentModel) {
      VM.enableClip(VM.currentModel);
    }
  }

  clipToggle.addEventListener('change', function(e) {
    handleClipToggle(e.target.checked);
  });

  clipToggleBar.addEventListener('click', function() {
    handleClipToggle(!VM.clipEnabled);
  });

  clipSlider.addEventListener('input', updateClipPlane);
}

document.addEventListener('DOMContentLoaded', function() {
  function waitForDependencies() {
    if (VM.init && VM.loadFromURL) {
      VM.init();
      var container = document.getElementById('container');
      VM.currentModelUrl = container.dataset.model || 'model.glb';
      VM.loadFromURL(VM.currentModelUrl);
      initUI();
    } else {
      setTimeout(waitForDependencies, 50);
    }
  }
  waitForDependencies();
});