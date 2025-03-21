document.addEventListener('DOMContentLoaded', function() {
  // DOM要素
  const imageInput = document.getElementById('imageInput');
  const overlayText = document.getElementById('overlayText');
  const fontSize = document.getElementById('fontSize');
  const fontFamily = document.getElementById('fontFamily');
  const textColor = document.getElementById('textColor');
  const textOpacity = document.getElementById('textOpacity');
  const saveButton = document.getElementById('saveButton');
  const clearButton = document.getElementById('clearButton');
  const canvasContainer = document.getElementById('canvasContainer');
  const imageCanvas = document.getElementById('imageCanvas');
  const ctx = imageCanvas.getContext('2d');
  const textOverlay = document.getElementById('textOverlay');
  const colorPreview = document.getElementById('colorPreview');
  
  // 画像オブジェクト
  let image = null;
  
  // 初期状態
  colorPreview.style.backgroundColor = textColor.value;
  textOverlay.style.display = 'none'; // 初期状態ではテキストオーバーレイを非表示
  canvasContainer.classList.add('empty'); // 初期状態では空のクラスを追加
  
  // カラーピッカーの変更を監視
  textColor.addEventListener('input', function() {
      const color = textColor.value;
      colorPreview.style.backgroundColor = color;
      updateTextOverlayStyle();
  });
  
  // テキストのスタイルを更新
  function updateTextOverlayStyle() {
      textOverlay.style.fontFamily = fontFamily.value;
      textOverlay.style.fontSize = fontSize.value + 'px';
      textOverlay.style.color = textColor.value;
      textOverlay.style.opacity = textOpacity.value / 100; // 0-100の値を0-1に変換
      textOverlay.textContent = overlayText.value;
  }
  
  // スタイル変更イベントリスナー
  overlayText.addEventListener('input', updateTextOverlayStyle);
  fontSize.addEventListener('input', updateTextOverlayStyle);
  fontFamily.addEventListener('change', updateTextOverlayStyle);
  textOpacity.addEventListener('input', updateTextOverlayStyle);
  
  // キャンバスコンテナをクリックしてファイル選択を開く
  canvasContainer.addEventListener('click', function() {
      if (canvasContainer.classList.contains('empty')) {
          imageInput.click();
      }
  });
  
  // 画像ファイル選択
  imageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
          loadImage(file);
      }
  });
  
  // ドラッグ＆ドロップ機能
  canvasContainer.addEventListener('dragover', function(e) {
      e.preventDefault();
      if (canvasContainer.classList.contains('empty')) {
          canvasContainer.classList.add('drag-over');
      }
  });
  
  canvasContainer.addEventListener('dragleave', function(e) {
      e.preventDefault();
      canvasContainer.classList.remove('drag-over');
  });
  
  canvasContainer.addEventListener('drop', function(e) {
      e.preventDefault();
      canvasContainer.classList.remove('drag-over');
      
      // 画像がまだ読み込まれていない場合のみ処理
      if (canvasContainer.classList.contains('empty')) {
          const files = e.dataTransfer.files;
          if (files.length > 0 && files[0].type.match('image.*')) {
              loadImage(files[0]);
              // ファイル入力の値をリセット（同じファイルを選択できるように）
              imageInput.value = '';
          }
      }
  });
  
  // 画像読み込み関数
  function loadImage(file) {
      const reader = new FileReader();
      reader.onload = function(event) {
          image = new Image();
          image.onload = function() {
              // コンテナの幅を取得
              const containerWidth = canvasContainer.clientWidth;
              let canvasWidth = image.width;
              let canvasHeight = image.height;
              
              // 画像が大きすぎる場合はサイズを調整
              if (image.width > containerWidth) {
                  const scaleFactor = containerWidth / image.width;
                  canvasWidth = containerWidth;
                  canvasHeight = image.height * scaleFactor;
              }
              
              // キャンバスのサイズを設定
              imageCanvas.width = canvasWidth;
              imageCanvas.height = canvasHeight;
              
              // 画像を描画
              ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
              ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);
              
              // テキストオーバーレイを表示
              textOverlay.style.display = 'block';
              
              // テキストオーバーレイの位置をリセット
              textOverlay.style.left = '20px';
              textOverlay.style.top = '20px';
              textOverlay.style.width = 'auto';
              textOverlay.style.height = 'auto';
              
              // 空のクラスを削除
              canvasContainer.classList.remove('empty');
          };
          image.src = event.target.result;
      };
      reader.readAsDataURL(file);
  }
  
  // 画像クリアボタン
  clearButton.addEventListener('click', function() {
      // キャンバスをクリア
      ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
      
      // キャンバスのサイズをリセット
      imageCanvas.width = 0;
      imageCanvas.height = 0;
      
      // 画像をリセット
      image = null;
      
      // ファイル入力フィールドをリセット
      imageInput.value = '';
      
      // テキストオーバーレイを非表示
      textOverlay.style.display = 'none';
      
      // 空のクラスを追加
      canvasContainer.classList.add('empty');
  });
  
  // ドラッグ機能
  let isDragging = false;
  let isResizing = false;
  let currentResizer = null;
  let startX, startY;
  let startWidth, startHeight;
  let startLeft, startTop;
  
  // ドラッグ開始
  textOverlay.addEventListener('mousedown', function(e) {
      if (e.target.classList.contains('resizer')) {
          // リサイズ開始
          isResizing = true;
          currentResizer = e.target;
      } else {
          // 移動開始
          isDragging = true;
      }
      
      startX = e.clientX;
      startY = e.clientY;
      
      // 初期サイズと位置を保存
      const rect = textOverlay.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = textOverlay.offsetLeft;
      startTop = textOverlay.offsetTop;
      
      e.preventDefault();
  });
  
  // マウス移動
  document.addEventListener('mousemove', function(e) {
      if (isDragging) {
          // オーバーレイの移動
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          const newLeft = startLeft + deltaX;
          const newTop = startTop + deltaY;
          
          // コンテナ内に収まるように制限
          const containerRect = canvasContainer.getBoundingClientRect();
          const overlayRect = textOverlay.getBoundingClientRect();
          
          const maxLeft = containerRect.width - overlayRect.width;
          const maxTop = containerRect.height - overlayRect.height;
          
          textOverlay.style.left = Math.max(0, Math.min(newLeft, maxLeft)) + 'px';
          textOverlay.style.top = Math.max(0, Math.min(newTop, maxTop)) + 'px';
          
      } else if (isResizing) {
          // リサイズ処理
          const deltaX = e.clientX - startX;
          const deltaY = e.clientY - startY;
          
          if (currentResizer.classList.contains('se')) {
              textOverlay.style.width = (startWidth + deltaX) + 'px';
              textOverlay.style.height = (startHeight + deltaY) + 'px';
          } else if (currentResizer.classList.contains('sw')) {
              textOverlay.style.width = (startWidth - deltaX) + 'px';
              textOverlay.style.left = (startLeft + deltaX) + 'px';
              textOverlay.style.height = (startHeight + deltaY) + 'px';
          } else if (currentResizer.classList.contains('ne')) {
              textOverlay.style.width = (startWidth + deltaX) + 'px';
              textOverlay.style.height = (startHeight - deltaY) + 'px';
              textOverlay.style.top = (startTop + deltaY) + 'px';
          } else if (currentResizer.classList.contains('nw')) {
              textOverlay.style.width = (startWidth - deltaX) + 'px';
              textOverlay.style.left = (startLeft + deltaX) + 'px';
              textOverlay.style.height = (startHeight - deltaY) + 'px';
              textOverlay.style.top = (startTop + deltaY) + 'px';
          }
      }
  });
  
  // ドラッグ終了
  document.addEventListener('mouseup', function() {
      isDragging = false;
      isResizing = false;
      currentResizer = null;
  });
  
  // 保存ボタン
  saveButton.addEventListener('click', function() {
      if (!image) {
          alert('画像を選択してください');
          return;
      }
      
      // 一時キャンバスを作成（オリジナルの画像サイズで保存するため）
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = image.width;
      tempCanvas.height = image.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      // 背景画像を描画（オリジナルサイズ）
      tempCtx.drawImage(image, 0, 0, image.width, image.height);
      
      // テキストを描画
      const overlayRect = textOverlay.getBoundingClientRect();
      const canvasRect = imageCanvas.getBoundingClientRect();
      
      // スケール係数を計算（プレビューとオリジナル画像のサイズ比）
      const scaleX = image.width / imageCanvas.width;
      const scaleY = image.height / imageCanvas.height;
      
      // テキストの位置を計算（相対位置から絶対位置に変換し、スケーリング）
      const textX = (overlayRect.left - canvasRect.left) * (image.width / canvasRect.width);
      const textY = (overlayRect.top - canvasRect.top) * (image.height / canvasRect.height);
      
      // テキストのスタイルを設定（フォントサイズをスケーリング）
      const scaledFontSize = parseInt(fontSize.value) * scaleX;
      tempCtx.font = scaledFontSize + 'px ' + fontFamily.value;
      tempCtx.fillStyle = textColor.value;
      tempCtx.globalAlpha = textOpacity.value;
      
      // テキストを描画
      tempCtx.fillText(overlayText.value, textX, textY + scaledFontSize);
      
      // 透明度をリセット
      tempCtx.globalAlpha = 1.0;
      
      // 画像をダウンロード
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
  });
  
  // 初期テキストスタイルを設定
  updateTextOverlayStyle();
});