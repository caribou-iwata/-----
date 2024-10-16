let originalViewBox; // 元のビューポートの値を保存する変数
const animationDuration = 500; // アニメーションの期間（ミリ秒）
let animationFrameId; // アニメーションフレームの ID
let isZoomFixed = false; // ズームが固定されているかどうかを示すフラグ
let isAnimating = false; // アニメーション中かどうかを示すフラグ
const isActive = "active"
const isHover = "is_hover"

// SVG のロード処理
document.getElementById('map').addEventListener("load", () => {
  const svg = document.getElementById('map');
  originalViewBox = svg.getAttribute('viewBox');
});

// 汎用的なズーム計算ロジック（アニメーションとクラスの設定）
function zoomToTarget(svg, country, zoomFactor, className, fixedZoom = false) {


  const bbox = country.getBBox(); // 国のバウンディングボックスを取得
  const currentValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);

  // 国の中心座標を計算
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;

  // 新しいビューポート値の計算
  const endValues = [
    centerX - svg.clientWidth / (2 * zoomFactor),
    centerY - svg.clientHeight / (2 * zoomFactor),
    svg.clientWidth / zoomFactor,
    svg.clientHeight / zoomFactor
  ];

  // アニメーションをキャンセルし、ズームを開始
  cancelAnimationFrame(animationFrameId);
  animateZoom(svg, currentValues, endValues);

  // クラスの操作（兄弟要素からクラスを削除し、現在の要素にクラスを付与）
  if (className) {
    const allElements = svg.querySelectorAll('*'); // SVG 内のすべての要素を取得
    allElements.forEach(element => {
        element.classList.remove(className); // 各要素からクラスを削除
    });
    country.classList.add(className); // 対象にクラスを追加
  }

  if (fixedZoom) {
    isZoomFixed = true; // ズームを固定
  }
}

// マウスホバー時のズーム処理
function zoomToCountry(countryId, zoomFactor, className) {
  if (isZoomFixed) return; // ズームが固定されている場合またはアニメーション中は処理しない

  const svg = document.getElementById('map');
  const country = document.getElementById(countryId);

  zoomToTarget(svg, country, zoomFactor, className);
}


// アニメーションロジック
function animateZoom(svg, startValues, endValues) {
  let startTime = null;
  isAnimating = true; // アニメーション開始時にフラグを立てる

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }

  function step(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = (currentTime - startTime) / animationDuration;

    // イージング関数を適用
    const easedProgress = easeInOutCubic(progress < 1 ? progress : 1);

    // 新しいビューポートを計算して設定
    const newViewBox = startValues.map((start, i) => {
      return start + (endValues[i] - start) * easedProgress;
    }).join(' ');

    svg.setAttribute('viewBox', newViewBox);

    // アニメーションが完了していなければ再帰呼び出し
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(step);
    } else {
      isAnimating = false; // アニメーション終了時にフラグをリセット
    }
  }

  animationFrameId = requestAnimationFrame(step);
}


// マウスアクションからの処理
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('mouseover', () => {
    if (isZoomFixed) return; // ズームが固定されている場合は処理しない
    const countryId = button.getAttribute('data-id');
    const zoomFactor = button.getAttribute('data-zoom');
    const svg = document.getElementById('map');
    const country = document.getElementById(countryId);
    const className = isHover

    zoomToTarget(svg, country, zoomFactor, className);
  });

  button.addEventListener('click', () => { //ボタンがクリックされた場合の処理
    if (isAnimating) return; // アニメーション中なら操作を無効化
    const countryId = button.getAttribute('data-id'); //ボタンからdata-idを取得
    const zoomFactor = button.getAttribute('data-zoom'); //ボタンからズームする定数を取得
    const svg = document.getElementById('map');
    const country = document.getElementById(countryId); //svg上からdata-idに一致するidを取得
    const className = isActive; //ズームされている状態を占めすcssクラスの付与
    zoomToTarget(svg, country, zoomFactor, className, true); // ズームのロジックを実行
    const allElements = svg.querySelectorAll('*'); // SVG 内のすべての要素を取得
    allElements.forEach(element => {
        element.classList.remove("is_hover"); // 各要素からクラスを削除
    });
  });

  button.addEventListener('mouseout', () => { //マウスホバーが外れた場合の処理
    const countryId = button.getAttribute('data-id');
    const svg = document.getElementById('map');
    const country = document.getElementById(countryId);
    const className = isHover;

    resetZoom(svg, country, className);
  });
});

// リセットボタンがクリックされたときの処理
document.getElementById('resetButton').addEventListener('click', () => {
  isZoomFixed = false; // ズーム固定を解除
  const className = isActive
  const svg = document.getElementById('map');
  resetZoom(svg, null, className); // 元のビューポートに戻す
});

// 汎用的なリセットロジック（アニメーションとクラス解除）
function resetZoom(svg, country, className) {
  if (isZoomFixed) return; // ズームが固定されている場合は無効化

  cancelAnimationFrame(animationFrameId);

  const startValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);
  const endValues = originalViewBox.split(' ').map(parseFloat);
  className = isActive;
  animateZoom(svg, startValues, endValues);

  // クラスを解除
  if (className) {
    const allElements = svg.querySelectorAll('*'); // SVG 内のすべての要素を取得
    allElements.forEach(element => {
        element.classList.remove(className); // 各要素からクラスを削除
    });
  }

}