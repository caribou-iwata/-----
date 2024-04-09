var originalViewBox; // 元のビューポートの値を保存する変数
var animationDuration = 500; // アニメーションの期間（ミリ秒）
var animationFrameId; // アニメーションフレームの ID
var zoomFactor = 7; // 拡大率を調整する変数

// SVG 要素が読み込まれたときに実行される処理
document.getElementById('map').addEventListener("load", function() {
    var svg = document.getElementById('map');
    originalViewBox = svg.getAttribute('viewBox');
    console.log('Original ViewBox:', originalViewBox);
});

// JavaScript 関数: マウスがボタンにホバーした時に国にズームする
function zoomToCountry(countryId) {
    var country = document.getElementById(countryId);
    var bbox = country.getBBox(); // 国のバウンディングボックスを取得
    var svg = document.getElementById('map');

    // アニメーションをキャンセル
    cancelAnimationFrame(animationFrameId);

    // 現在のビューポートの値を取得
    var currentValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);

    // 国の中心座標を計算
    var centerX = bbox.x + bbox.width / 2;
    var centerY = bbox.y + bbox.height / 2;

    // アニメーション終了時のビューポートの値を設定（元のビューポートよりも小さな値に設定）
    var endValues = [centerX - svg.clientWidth / (2 * zoomFactor), centerY - svg.clientHeight / (2 * zoomFactor), svg.clientWidth / zoomFactor, svg.clientHeight / zoomFactor];

    console.log('Zooming to country:', countryId);
    console.log('Current ViewBox:', currentValues);
    console.log('End ViewBox:', endValues);

    // アニメーション開始
    animateZoom(svg, currentValues, endValues);
}

// JavaScript 関数: マウスがボタンから離れた時にビューポートを元に戻す
function resetZoom() {
    var svg = document.getElementById('map');

    // アニメーションをキャンセル
    cancelAnimationFrame(animationFrameId);

    // アニメーション開始時のビューポートの値を設定
    var startValues = svg.getAttribute('viewBox').split(' ').map(parseFloat);

    // アニメーション終了時のビューポートの値を設定（元のビューポートに戻す）
    var endValues = originalViewBox.split(' ').map(parseFloat);

    console.log('Resetting zoom');
    console.log('Start ViewBox:', startValues);
    console.log('End ViewBox:', endValues);

    // アニメーション開始
    animateZoom(svg, startValues, endValues);
}

// ボタンにマウスがホバーされた際の処理
function handleButtonHover(countryId) {
    // アニメーションをキャンセル
    cancelAnimationFrame(animationFrameId);
    
    // ボタンにホバーされた場合は、国にズーム
    zoomToCountry(countryId);
}

// アニメーション関数
function animateZoom(svg, startValues, endValues) {
    var startTime = null;

    function easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    }

    function step(currentTime) {
        if (!startTime) startTime = currentTime;
        var progress = (currentTime - startTime) / animationDuration;

        // イージング関数を適用
        var easedProgress = easeInOutCubic(progress < 1 ? progress : 1);

        // 新しいビューポートを計算して設定
        var newViewBox = startValues.map(function (start, i) {
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
