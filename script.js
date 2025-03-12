// 카드 객체
class Card {
    constructor(front, back, deckId, image = null) {
        this.front = front;
        this.back = back;
        this.image = image;
        this.deckId = deckId;
        this.isFlipped = false;
    }
}

// 덱 객체
class Deck {
    constructor(name) {
        this.id = Date.now().toString(); // 고유 ID 생성
        this.name = name;
        this.cards = [];
    }
}

let decks = []; // 덱 목록
let cards = []; // 카드 목록
let selectedDeck = null;
let currentCardIndex = 0; // 현재 학습 중인 카드의 인덱스
let learningMode = false; // 학습 모드인지 여부
let currentCard = null; // 현재 보여지는 카드

// 카드 생성 함수
function createCard() {
    const front = document.getElementById("card-front").value;
    const back = document.getElementById("card-back").value;
    const deckSelect = document.getElementById("deck-select");
    const deckId = deckSelect.value;

    const imageInput = document.getElementById("card-image");
    let image = null;

    if (imageInput.files.length > 0) {
        const file = imageInput.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            image = e.target.result;
            const newCard = new Card(front, back, deckId, image);
            addCardToList(newCard);
            saveCardToDeck(newCard);
        };
        reader.readAsDataURL(file);
    } else {
        const newCard = new Card(front, back, deckId);
        addCardToList(newCard);
        saveCardToDeck(newCard);
    }

    document.getElementById("card-front").value = "";
    document.getElementById("card-back").value = "";
    imageInput.value = "";
}

// 카드 목록에 추가
function addCardToList(card) {
    const cardList = document.getElementById("card-list");
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.innerHTML = `
        <p>앞면: ${card.front}</p>
        <p>뒷면: ${card.back}</p>
        ${card.image ? `<img src="${card.image}" alt="카드 이미지" width="100">` : ""}
    `;
    cardList.appendChild(cardElement);
}
//카드 리스트 초기화
function resetCardList(){
    const cardList = document.getElementById("card-list");
    cardList.innerHTML = "";
}

// 덱 생성 함수
function createDeck() {
    const deckName = document.getElementById("deck-name").value;
    if (deckName.trim() === "") {
        alert("덱 이름을 입력해주세요.");
        return;
    }
    const newDeck = new Deck(deckName);
    decks.push(newDeck);
    addDeckToDropdown(newDeck);
    addDeckToList(newDeck);
    document.getElementById("deck-name").value = "";
    console.log("덱 생성 후 전체 덱 목록:", decks); // 덱 생성 후 로그 출력
    saveDecksToLocalStorage();
}

// 덱 드롭다운 목록에 추가
function addDeckToDropdown(deck) {
    const deckSelect = document.getElementById("deck-select");
    const option = document.createElement("option");
    option.value = deck.id;
    option.text = deck.name;
    deckSelect.add(option);
}
//덱 리스트 디자인 초기화
function resetDeckListDesign(){
    const deckList = document.getElementById("deck-list");
    Array.from(deckList.children).forEach(child => {
        child.classList.remove("select-deck");
    });
}
//덱을 선택한 디자인으로 변경
function selectDeckDesign(deckId){
    const deckList = document.getElementById("deck-list");
    Array.from(deckList.children).forEach(child => {
        if(child.id === deckId){
            child.classList.add("select-deck");
        }
    });
}

//덱 리스트 추가
function addDeckToList(deck) {
    const deckList = document.getElementById("deck-list");
    const deckElement = document.createElement("li");
    deckElement.textContent = deck.name;
    deckElement.id = deck.id;
    
    // 삭제 버튼 생성
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "삭제";
    deleteButton.classList.add("delete-deck-button");
    deleteButton.onclick = () => deleteDeck(deck.id); // 삭제 함수 호출
    
    deckElement.appendChild(deleteButton);
    deckList.appendChild(deckElement);

    // 덱 이름을 클릭했을 때 이벤트 추가
    deckElement.addEventListener("click", () => {
        selectedDeck = deck;
        resetDeckListDesign();
        selectDeckDesign(deck.id);
        showCardsInDeck(deck.id);
    });
}
//덱에 카드가 들어있는지 확인
function showCardsInDeck(deckId) {
    resetCardList();
    decks.forEach(deck => {
        if (deck.id === deckId) {
            deck.cards.forEach(card => {
                addCardToList(card);
            });
        }
    });
}

//카드 덱에 저장
function saveCardToDeck(card){
    const deck = decks.find(deck => deck.id === card.deckId);
    if (deck){
        deck.cards.push(card);
        console.log(`카드 "${card.front}"가 덱 "${deck.name}"(ID: ${deck.id})에 저장되었습니다.`);
        console.log("저장된 카드 목록:", deck.cards);
        console.log("전체 덱 목록:", decks); // 덱 생성 후 로그 출력
    }
    saveDecksToLocalStorage();
}

// 덱 삭제 함수
function deleteDeck(deckId) {
    // 덱 삭제 전에 해당 덱의 카드들을 모두 삭제
    deleteDeckCards(deckId);

    decks = decks.filter(deck => deck.id !== deckId);
    
    // UI에서 덱 목록 제거
    const deckList = document.getElementById("deck-list");
    deckList.innerHTML = ""; // 덱 목록 초기화
    decks.forEach(deck => addDeckToList(deck)); // 덱 목록 다시 생성

    // 드롭다운 목록에서도 제거
    const deckSelect = document.getElementById("deck-select");
    deckSelect.innerHTML = ""; // 드롭다운 목록 초기화
    decks.forEach(deck => addDeckToDropdown(deck)); // 드롭다운 목록 다시 생성

    saveDecksToLocalStorage();
}
//덱을 삭제하면 카드 삭제
function deleteDeckCards(deckId){
    decks.forEach(deck => {
        if (deck.id === deckId) {
            deck.cards = [];
        }
    });
}
// 로컬 스토리지에 덱 저장
function saveDecksToLocalStorage() {
    localStorage.setItem("decks", JSON.stringify(decks));
}

// 로컬 스토리지에서 덱 불러오기
function loadDecksFromLocalStorage() {
    const savedDecks = localStorage.getItem("decks");
    if (savedDecks) {
        decks = JSON.parse(savedDecks);
        decks.forEach(deck => {
            addDeckToDropdown(deck);
            addDeckToList(deck);
        });
        showAllCards();
    }
}
//모든 카드 보여주기
function showAllCards(){
    selectedDeck = null;
    resetCardList();
    resetDeckListDesign();
    decks.forEach(deck => {
        if(deck.cards.length > 0){
            deck.cards.forEach(card =>{
                addCardToList(card);
            })
        }
    });
}
//학습 시작하기
function startLearning() {
    learningMode = true;
    document.getElementById("card-list").style.display = "none";
    document.getElementById("learning-area").style.display = "block";
    document.getElementById("create-card").style.display = "none";
    document.getElementById("deck-select").style.display = "none";
    
    // 학습할 카드 선택 (selectedDeck이 null이면 모든 카드를 대상으로)
    let learningCards = selectedDeck ? selectedDeck.cards : decks.flatMap(deck => deck.cards);

    if (learningCards.length > 0) {
        currentCardIndex = 0; // 학습 시작 시 인덱스 초기화
        currentCard = learningCards[currentCardIndex];
        showCard(currentCard);
    } else {
        alert("학습할 카드가 없습니다.");
        learningMode = false;
    }
}

//카드 보여주기
function showCard(card) {
    const cardFront = document.getElementById("card-front");
    const cardBack = document.getElementById("card-back");
    const showBackButton = document.getElementById("show-back-button");

    cardFront.innerHTML = card.front;
    cardBack.innerHTML = card.back;
    if(card.image){
        cardFront.innerHTML += `<img src="${card.image}" alt="카드 이미지" width="100">`;
    }
    cardBack.style.display = "none";
    showBackButton.style.display = "block";
    card.isFlipped = false;
}

// 카드 뒤집기
function flipCard() {
    const cardFront = document.getElementById("card-front");
    const cardBack = document.getElementById("card-back");
    const showBackButton = document.getElementById("show-back-button");

    if(currentCard){
        if (currentCard.isFlipped) {
            cardBack.style.display = "none";
            showBackButton.style.display = "block";
            currentCard.isFlipped = false;
        } else {
            cardBack.style.display = "block";
            showBackButton.style.display = "none";
            currentCard.isFlipped = true;
        }
    }
}
// 정답 오답 확인
function checkAnswer(isCorrect) {
    if(currentCard){
        // 다음 카드로 이동
        currentCardIndex++;
        let learningCards = selectedDeck ? selectedDeck.cards : decks.flatMap(deck => deck.cards);
        if (currentCardIndex < learningCards.length) {
            currentCard = learningCards[currentCardIndex];
            showCard(currentCard);
        } else {
            alert("학습 완료!");
            endLearning();
        }
    }
}
// 학습 종료
function endLearning(){
    learningMode = false;
    document.getElementById("card-list").style.display = "block";
    document.getElementById("learning-area").style.display = "none";
    document.getElementById("create-card").style.display = "block";
    document.getElementById("deck-select").style.display = "block";
    showAllCards();
}

// 앱 초기화
function initApp() {
    console.log("앱이 시작되었습니다.");
    // 카드 영역 클릭 시 카드 뒤집기
    const showBackButton = document.getElementById("show-back-button");
    showBackButton.addEventListener("click", flipCard);
    // 정답/오답 버튼 이벤트 리스너 추가
    const wrongButton = document.getElementById("wrong-button");
    const correctButton = document.getElementById("correct-button");
    wrongButton.addEventListener("click", () => checkAnswer(false));
    correctButton.addEventListener("click", () => checkAnswer(true));

    const createCardButton = document.getElementById("create-card");
    createCardButton.addEventListener("click", createCard);

    const createDeckButton = document.getElementById("create-deck");
    createDeckButton.addEventListener("click", createDeck);

    const showAllCardsButton = document.getElementById("show-all-cards");
    showAllCardsButton.addEventListener("click", showAllCards);
    
    const startLearningButton = document.getElementById("start-learning");
    startLearningButton.addEventListener("click", startLearning);
    
    const endLearningButton = document.getElementById("end-learning");
    endLearningButton.addEventListener("click", endLearning);

    loadDecksFromLocalStorage();
}

// 앱 시작
window.onload = initApp;
