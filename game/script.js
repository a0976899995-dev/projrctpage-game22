// --- 1. 遊戲狀態與音效初始化 ---
let conflictPoints = 0;
let commPoints = 0;
let impressPoints = 0;
let currentStep = 0;
let subStep = 0; // 新增：追蹤長句子的分段頁數

// 從瀏覽器記憶體讀取已解鎖的圖片清單 (畫廊)
let unlockedScenes = JSON.parse(localStorage.getItem('cotc_unlocked_scenes')) || [];

// 定義音效物件
const sounds = {
    click: new Audio('sounds_click.mp3'),
    menuBGM: new Audio('sounds_menu_bgm.mp3'),
    gameBGM: new Audio('sounds_game_bgm.mp3'),
    endPerfect: new Audio('end_perfect.mp3'),
    endHard: new Audio('end_hard.mp3'),
    endNormal: new Audio('end_normal.mp3')
};

// 設定 BGM 循環播放
sounds.menuBGM.loop = true;
sounds.gameBGM.loop = true;

// 播放音效的輔助函式
function playSFX(audio) {
    audio.currentTime = 0; 
    audio.play().catch(e => console.log("音效播放受阻:", e));
}

// 頁面載入後自動嘗試播放封面 BGM
window.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', () => {
        if (sounds.menuBGM.paused && currentStep === 0) {
            sounds.menuBGM.play();
        }
    }, { once: true });
});

// --- 2. 核心遊戲流程 ---

function startGame() {
    playSFX(sounds.click);
    sounds.menuBGM.pause();
    sounds.gameBGM.currentTime = 0;
    sounds.gameBGM.play();

    currentStep = 0;
    subStep = 0; // 重置分段
    conflictPoints = 0;
    commPoints = 0;
    impressPoints = 0;
    
    const startScreen = document.getElementById('start-screen');
    startScreen.style.opacity = '0';
    
    setTimeout(() => {
        startScreen.style.display = 'none';
        renderPage();
    }, 1200);
}

function saveGame() {
    playSFX(sounds.click);
    const gameState = {
        currentStep: currentStep,
        subStep: subStep,
        conflictPoints: conflictPoints,
        commPoints: commPoints,
        impressPoints: impressPoints
    };
    localStorage.setItem('cotc_save_data', JSON.stringify(gameState));
    alert("Progress Saved!");
}

function loadGame() {
    playSFX(sounds.click);
    const savedData = localStorage.getItem('cotc_save_data');
    if (savedData) {
        const state = JSON.parse(savedData);
        currentStep = state.currentStep;
        subStep = state.subStep || 0;
        conflictPoints = state.conflictPoints;
        commPoints = state.commPoints;
        impressPoints = state.impressPoints;
        
        sounds.menuBGM.pause();
        sounds.gameBGM.play();
        document.getElementById('start-screen').style.display = 'none';
        renderPage();
    } else {
        alert("No save data found.");
    }
}

// --- 3. 畫廊 (Gallery) 邏輯 ---
function toggleGallery(show) {
    playSFX(sounds.click);
    const gallery = document.getElementById('gallery-overlay');
    if (show) {
        gallery.classList.remove('hidden');
        refreshGalleryUI();
    } else {
        gallery.classList.add('hidden');
    }
}

function refreshGalleryUI() {
    unlockedScenes.forEach(sceneId => {
        const slot = document.getElementById(`slot-${sceneId}`);
        if (slot) {
            slot.style.backgroundImage = `url('${sceneId}.png')`;
            slot.innerHTML = ""; 
        }
    });
}

// --- 4. 故事數據庫 (已改為分段陣列格式) ---
const storyData = [
    {
        speaker: "News Anchor",
        bg: "scene1", 
        dialogue: [
            "Breaking news: The U.S. has announced it is considering imposing steep tariffs on imported chips.",
            "Trump stressed that this move is meant to protect domestic manufacturing. This could send costs soaring—what’s your response?"
        ],
        choices: [
            { text: "Support the tariffs to signal cooperation.", scores: { conflict: 5, comm: -5, impress: 10 } },
            { text: "Lobby for exemptions to protect consumers.", scores: { conflict: -5, comm: 10, impress: 5 } }
        ]
    },
    {
        speaker: "Chief Financial Officer",
        bg: "scene1_2", 
        dialogue: [
            "If these tariffs go through, restructuring the supply chain will cost a fortune.",
            "Should we abandon global efficiency in favor of regional political priorities?"
        ],
        choices: [
            { text: "Prioritize efficiency over politics.", scores: { conflict: 15, comm: -10, impress: 5 } },
            { text: "Prioritize security and align with policy.", scores: { conflict: -5, comm: 15, impress: 10 } }
        ]
    },
    {
        speaker: "U.S. Commerce Representative",
        bg: "scene1_3",
        dialogue: [
            "Advisor, we need to see real commitment.",
            "Are you willing to scale back advanced manufacturing capacity outside the U.S. to ensure security?"
        ],
        choices: [
            { text: "Taiwan's capacity is non-negotiable.", scores: { conflict: 20, comm: -15, impress: 5 } },
            { text: "Open to reciprocal capacity allocation.", scores: { conflict: 5, comm: 10, impress: 15 } }
        ]
    },
    {
        speaker: "U.S. Congress Member",
        bg: "scene2", 
        dialogue: [
            "Risk diversification is essential.",
            "Moving the cutting-edge 2nm process to Arizona is our bottom line."
        ],
        choices: [
            { text: "Keep 2nm in Taiwan as a 'Silicon Shield'.", scores: { conflict: 15, comm: -5, impress: 5 } },
            { text: "Transfer 2nm in exchange for military protection.", scores: { conflict: 5, comm: 15, impress: 10 } }
        ]
    },
    {
        speaker: "Engineer Xiao Zhang",
        bg: "scene2_2",
        dialogue: [
            "U.S. employees are resisting the 24-hour shift culture.",
            "Sir, should we insist on strict Taiwanese-style management here?"
        ],
        choices: [
            { text: "Maintain strict, efficient management.", scores: { conflict: 10, comm: -15, impress: -5 } },
            { text: "Adapt to local union labor arrangements.", scores: { conflict: -5, comm: 20, impress: 15 } }
        ]
    },
    {
        speaker: "HR Director",
        bg: "scene2_3",
        dialogue: [
            "Large-scale talent outflow is fueling fears of a ‘brain drain.’",
            "How should we calm public concerns at home?"
        ],
        choices: [
            { text: "Restrict talent outflow with strict contracts.", scores: { conflict: 10, comm: -10, impress: -10 } },
            { text: "Frame U.S. assignments as growth opportunities.", scores: { conflict: 5, comm: 15, impress: 20 } }
        ]
    },
    {
        speaker: "Graduate Student Amir",
        bg: "scene3",
        dialogue: [
            "My visa was denied under the new national security policy.",
            "Sir, does my nationality really matter more than my professional skills?"
        ],
        choices: [
            { text: "Respect the sovereign screening process.", scores: { conflict: 10, comm: -20, impress: -5 } },
            { text: "Use influence to secure visa exceptions.", scores: { conflict: 10, comm: 20, impress: 20 } }
        ]
    },
    {
        speaker: "University President",
        bg: "scene3_2",
        dialogue: [
            "Visa barriers are pushing global talent toward our competitors.",
            "The U.S. is losing its appeal—what’s your take?"
        ],
        choices: [
            { text: "Security outweighs talent mobility.", scores: { conflict: 15, comm: -15, impress: -5 } },
            { text: "Diversity fuels innovation; oppose exclusion.", scores: { conflict: 5, comm: 15, impress: 15 } }
        ]
    },
    {
        speaker: "Decision Meeting",
        bg: "scene3_3",
        dialogue: [
            "Final question, Advisor. Do you believe ‘America First’ policies can bring lasting global prosperity?",
            "Your answer will define the future of our partnership."
        ],
        choices: [
            { text: "A necessary step for supply chain security.", scores: { conflict: 10, comm: -10, impress: 5 } },
            { text: "Cooperation is the only path to progress.", scores: { conflict: 5, comm: 20, impress: 25 } }
        ]
    }
];

// --- 5. 渲染與邏輯 (分段顯示核心) ---

function renderPage() {
    if (currentStep >= storyData.length) {
        showFinalEnding();
        return;
    }

    const data = storyData[currentStep];
    const textSegments = data.dialogue; // 現在是一個陣列

    // 背景更新
    if (data.bg) {
        document.getElementById("scene-background").style.backgroundImage = `url('${data.bg}.png')`;
        if (!unlockedScenes.includes(data.bg)) {
            unlockedScenes.push(data.bg);
            localStorage.setItem('cotc_unlocked_scenes', JSON.stringify(unlockedScenes));
        }
    }

    document.getElementById("speaker-box").innerText = data.speaker;
    document.getElementById("dialogue-text").innerText = textSegments[subStep];

    const choicesDiv = document.getElementById("choices");
    const nextIndicator = document.querySelector(".next-indicator");
    const dialogueBox = document.getElementById("dialogue-box");

    // 分段逻辑控制
    if (subStep < textSegments.length - 1) {
        // 還有下一段文字
        choicesDiv.classList.add("hidden");
        nextIndicator.classList.remove("hidden");
        
        dialogueBox.onclick = () => {
            playSFX(sounds.click);
            subStep++;
            renderPage();
        };
    } else {
        // 讀到最後一段，顯示選項
        choicesDiv.classList.remove("hidden");
        nextIndicator.classList.add("hidden");
        dialogueBox.onclick = null; // 停止點擊換頁
        
        choicesDiv.innerHTML = "";
        data.choices.forEach(choice => {
            const button = document.createElement("button");
            button.innerText = choice.text;
            button.onclick = (e) => {
                e.stopPropagation();
                playSFX(sounds.click);
                conflictPoints += choice.scores.conflict;
                commPoints += choice.scores.comm;
                impressPoints += choice.scores.impress;
                currentStep++;
                subStep = 0; // 下一關重置分段
                renderPage();
            };
            choicesDiv.appendChild(button);
        });
    }
    
    updateStatusBars();
}

function updateStatusBars() {
    const getPercent = (val) => Math.min(Math.max(val, 0), 100) + "%";
    document.getElementById("bar-conflict").style.width = getPercent(conflictPoints);
    document.getElementById("bar-comm").style.width = getPercent(commPoints);
    document.getElementById("bar-impress").style.width = getPercent(impressPoints);
}

function showFinalEnding() {
    sounds.gameBGM.pause();
    
    let title = "";
    let content = "";
    let finalSound = sounds.endNormal;

    if (commPoints >= 80 && impressPoints >= 80) {
        title = "Perfect Ending: A Leader in Global Prosperity";
        content = "You bridged the geopolitical divide and earned international respect.";
        finalSound = sounds.endPerfect;
    } else if (conflictPoints >= 70) {
        title = "Hardcore Ending: Iron Man Protecting the Island";
        content = "You preserved core technologies but disconnected from the global supply chain.";
        finalSound = sounds.endHard;
    } else {
        title = "Normal Ending: The Realist Follower";
        content = "You maintain a precarious balance, but your strategic advantage is fading.";
        finalSound = sounds.endNormal;
    }

    playSFX(finalSound);
    document.getElementById("speaker-box").innerText = "Final Evaluation";
    document.getElementById("dialogue-text").innerText = `${title}\n\n${content}`;
    document.getElementById("choices").innerHTML = '<button onclick="location.reload()">Back to Menu</button>';
}