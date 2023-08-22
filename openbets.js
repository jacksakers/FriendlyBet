const db = firebase.firestore();

const betList = document.getElementById('bet-list');
// const createBetButton = document.getElementById('create-bet-btn');

// createBetButton.addEventListener('click', async () => {
//     const description = document.getElementById('bet-description').value;
//     const amount = document.getElementById('bet-amount').value;

//     if (description && amount) {
//         await db.collection('bets').add({
//             description,
//             amount: parseFloat(amount)
//         });

//         document.getElementById('bet-description').value = '';
//         document.getElementById('bet-amount').value = '';
//     }
// });

// Real-time updates
db.collection('bets').onSnapshot(snapshot => {
    betList.innerHTML = '';
    snapshot.forEach(doc => {
        const data = doc.data();
        const betElement = document.createElement('div');
        betElement.classList.add('item');
        const betOptions = data.options;
        var betOptionsDivs = ``;
        betOptions.forEach((option) => {
            betOptionsDivs += `<div class="bet-option">
                ${option} | 1.5
                <input class="enter-bet">
                c
                <button class="wager-button">
                Wager
                </button>
                </div>`;
        });
        // betElement.innerHTML = `<strong>${data.description}</strong> - $${data.amount}`;
        betElement.innerHTML = `<div class="bet-name">
            ${data.title}</div>` + betOptionsDivs;
        betList.appendChild(betElement);
    });
});