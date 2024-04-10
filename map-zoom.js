let originalViewBox; // 元のビューポートの値を保存する変数
const animationDuration = 500; // アニメーションの期間（ミリ秒）
let animationFrameId; // アニメーションフレームの ID

// SVG 要素が読み込まれたときに実行される処理
document.getElementById('map').addEventListener("load", () => {
    const svg = document.getElementById('map');
    originalViewBox = svg.getAttribute('viewBox');
});

// JavaScript 関数: マウスがボタンにホバーした時に国にズームする
function zoomToCountry(countryId, zoomFactor, className) {
    const country = document.getElementById(countryId);
    const bbox = country.getBBox(); // 国のバウンディングボックスを取得
    const svg = document.getElementById('map');
    
    // アニメーションをキャンセル
    cancelAnimationFrame(animationFrameId);

    // 現在のビューポートの値を取得
    const currentValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);

    // 国の中心座標を計算
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;

    // アニメーション終了時のビューポートの値を設定（元のビューポートよりも小さな値に設定）
    const endValues = [centerX - svg.clientWidth / (2 * zoomFactor), centerY - svg.clientHeight / (2 * zoomFactor), svg.clientWidth / zoomFactor, svg.clientHeight / zoomFactor];

    // アニメーション開始
    animateZoom(svg, currentValues, endValues);

    // クラスの操作
        country.classList.add(className);
}

// JavaScript 関数: マウスがボタンから離れた時にビューポートを元に戻す
function resetZoom(countryId, className) {
    const country = document.getElementById(countryId);

    if (country.classList.contains(className)) {
        country.classList.remove(className);
    }
    const svg = document.getElementById('map');

    // アニメーションをキャンセル
    cancelAnimationFrame(animationFrameId);

    // アニメーション開始時のビューポートの値を設定
    const startValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);

    // アニメーション終了時のビューポートの値を設定（元のビューポートに戻す）
    const endValues = originalViewBox.split(' ').map(parseFloat);

    // アニメーション開始
    animateZoom(svg, startValues, endValues);
}

// アニメーション関数
function animateZoom(svg, startValues, endValues) {
    let startTime = null;

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
        }
    }

    animationFrameId = requestAnimationFrame(step);
}
