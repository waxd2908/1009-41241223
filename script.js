const cardContainer = document.getElementById('cardContainer');
const startButton = document.getElementById('startButton');
const themeSelector = document.getElementById('themeSelector');
const gridSizeSelector = document.getElementById('gridSizeSelector');
const countdownSelector = document.getElementById('countdownSelector');
const hideCompletedCheckbox = document.getElementById('hideCompleted');
const timeRecords = document.getElementById('timeRecords');
const placeholderImage = document.getElementById('placeholderImage');
const themeImage = document.getElementById('themeImage');

let startTime, endTime;
let matchedPairs = 0;
let totalPairs = 8; // default total pairs
let canClick = false;

const successSound = new Audio('success.mp3');
const failSound = new Audio('fail.mp3');

// 主題圖片組
const themes = {
    AZUR: {
        images: [
            'azur lane1.png', 'azur lane1.png',
            'azur lane2.png', 'azur lane2.png',
            'azur lane3.png', 'azur lane3.png',
            'azur lane4.png', 'azur lane4.png',
            'azur lane5.png', 'azur lane5.png',
            'azur lane6.png', 'azur lane6.png',
            'azur lane7.png', 'azur lane7.png',
            'azur lane8.png', 'azur lane8.png',
            'azur lane9.png', 'azur lane9.png',
            'azur lane10.png', 'azur lane10.png',
            'azur lane11.png', 'azur lane11.png',
            'azur lane12.png', 'azur lane12.png',
            'azur lane13.png', 'azur lane13.png',
            'azur lane14.png', 'azur lane14.png',
            'azur lane15.png', 'azur lane15.png',
            'azur lane16.png', 'azur lane16.png',
            'azur lane17.png', 'azur lane17.png',
            'azur lane18.png', 'azur lane18.png'
        ],
        frontText: 'AZUR',
        placeholderImage: 'AZUR_placeholder.jpg'
    },
    HOLO: {
        images: [
            'sticker1.png', 'sticker1.png',
            'sticker2.png', 'sticker2.png',
            'sticker3.png', 'sticker3.png',
            'sticker4.png', 'sticker4.png',
            'sticker5.png', 'sticker5.png',
            'sticker6.png', 'sticker6.png',
            'sticker7.png', 'sticker7.png',
            'sticker8.png', 'sticker8.png',
            'sticker9.png', 'sticker9.png',
            'sticker10.png', 'sticker10.png',
            'sticker11.png', 'sticker11.png',
            'sticker12.png', 'sticker12.png',
            'sticker13.png', 'sticker13.png',
            'sticker14.png', 'sticker14.png',
            'sticker15.png', 'sticker15.png',
            'sticker16.png', 'sticker16.png',
            'sticker17.png', 'sticker17.png',
            'sticker18.png', 'sticker18.png'
        ],
        frontText: 'HOLO',
        placeholderImage: 'HOLO_placeholder.jpg'
    }
};

// 洗牌函數
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 根據選擇的主題更新佔位符圖片
function updatePlaceholderImage() {
    const selectedTheme = themeSelector.value;
    const theme = themes[selectedTheme];
    themeImage.src = theme.placeholderImage;
}

// 創建卡片
function createCards(theme) {
    const gridSize = parseInt(gridSizeSelector.value);
    const totalCards = gridSize * gridSize;
    totalPairs = totalCards / 2;

    const { images, frontText } = themes[theme];

    // 檢查圖片數量是否足夠
    if (images.length < totalCards) {
        alert('圖片數量不足以生成選擇的網格大小，請選擇較小的網格。');
        return;
    }

    // 取所需的圖片對
    const imagesNeeded = images.slice(0, totalCards);
    const shuffledImages = shuffle(imagesNeeded);

    // 調整 CSS grid 布局
    cardContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

    // 調整卡片大小和文字大小
    let cardSize, fontSize;
    if (gridSize === 2) {
        cardSize = '150px';
        fontSize = '2.8em';
    } else if (gridSize === 4) {
        cardSize = '125px';
        fontSize = '2.3em';
    } else {
        cardSize = '80px';
        fontSize = '1.5em';
    }
    cardContainer.style.gridGap = '10px';

    const style = document.createElement('style');
    style.innerHTML = `
        .card {
            width: ${cardSize};
            height: ${cardSize};
        }
        .card-front {
            font-size: ${fontSize};
        }
    `;
    document.head.appendChild(style);

    shuffledImages.forEach(image => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.image = image;
        card.onclick = () => flipCard(card);

        card.innerHTML = `
            <div class="card-inner">
                <div class="card-front">
                    <span>${frontText}</span>
                </div>
                <div class="card-back">
                    <img src="${image}" alt="正面" />
                </div>
            </div>
        `;

        cardContainer.appendChild(card);
    });
}


// 翻轉卡片的函數
let flippedCards = [];
function flipCard(card) {
    // 檢查是否可以點擊卡片
    if (!canClick || flippedCards.length >= 2 || card.classList.contains('flipped') || card.style.visibility === 'hidden') {
        return;
    }

    const cardInner = card.querySelector('.card-inner');
    cardInner.style.transform = 'rotateY(180deg)';
    card.classList.add('flipped');
    flippedCards.push(card);

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

// 檢查是否匹配
function checkMatch() {
    const [firstCard, secondCard] = flippedCards;

    if (firstCard.dataset.image === secondCard.dataset.image) {
        matchedPairs++;
        successSound.play();  // 播放成功音效

        if (hideCompletedCheckbox.checked) {
            // 隱藏已匹配的卡片
            setTimeout(() => {
                firstCard.style.visibility = 'hidden';
                secondCard.style.visibility = 'hidden';
            }, 500);
        }

        flippedCards = [];
        if (matchedPairs === totalPairs) {
            endGame();
        }
    } else {
        failSound.play();  // 播放失敗音效
        setTimeout(() => {
            firstCard.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
            secondCard.querySelector('.card-inner').style.transform = 'rotateY(0deg)';
            firstCard.classList.remove('flipped');
            secondCard.classList.remove('flipped');
            flippedCards = [];
        }, 1000);
    }
}

// 結束遊戲
function endGame() {
    endTime = new Date();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    // 使用 SweetAlert2 顯示通關時間並詢問是否重新開始
    Swal.fire({
        title: '恭喜通關！',
        text: `通關時間: ${elapsedTime} 秒`,
        icon: 'success',
        confirmButtonText: '重新開始',
    }).then((result) => {
        if (result.isConfirmed) {
            startGame();
        }
    });

    // 在右側添加通關時間紀錄
    const recordItem = document.createElement('li');
    recordItem.textContent = `${elapsedTime} 秒`;
    timeRecords.appendChild(recordItem);
}

// 開始遊戲的函數
function startGame() {
    cardContainer.innerHTML = ''; // 清空之前的卡片
    matchedPairs = 0; // 重置匹配對數
    const selectedTheme = themeSelector.value; // 取得選擇的主題
    const gridSize = parseInt(gridSizeSelector.value); // 取得選擇的網格大小
    const totalCards = gridSize * gridSize;
    totalPairs = totalCards / 2;  // 設定總的配對數

    createCards(selectedTheme); // 根據選擇的主題創建卡片
    startTime = new Date(); // 記錄遊戲開始的時間
    canClick = false; // 遊戲開始時禁用點擊

    placeholderImage.style.display = 'none';
    // 先顯示正面圖片
    const allCards = document.querySelectorAll('.card');
    allCards.forEach(card => {
        const cardInner = card.querySelector('.card-inner');
        cardInner.style.transform = 'rotateY(180deg)'; // 顯示圖片
    });

    const countdownTime = parseInt(countdownSelector.value);

    // 在倒數計時後翻轉到背面
    setTimeout(() => {
        canClick = true; // 啟用點擊
        allCards.forEach(card => {
            const cardInner = card.querySelector('.card-inner');
            cardInner.style.transform = 'rotateY(0deg)'; // 翻轉到背面
        });
    }, countdownTime); // 倒數計時後翻轉並啟用點擊
}

// 監聽主題變化
themeSelector.onchange = updatePlaceholderImage;

// 頁面加載時初始化佔位符圖片
updatePlaceholderImage();

// 為按鈕添加點擊事件
startButton.onclick = startGame;
