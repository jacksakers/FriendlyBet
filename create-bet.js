const db = firebase.firestore();

// const betList = document.getElementById('bet-list');
const createBetButton = document.getElementById('create-bet-btn');

createBetButton.addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const option1 = document.getElementById('bet-option1').value;
    const option2 = document.getElementById('bet-option2').value;

    const optionArray = [option1, option2];

    if (title && option1 && option2) {
        await db.collection('bets').add({
            title: title,
            options: optionArray
        });

        document.getElementById('title').value = '';
        document.getElementById('bet-option1').value = '';
        document.getElementById('bet-option2').value = '';
    }
});

// Real-time updates
// db.collection('bets').onSnapshot(snapshot => {
//     betList.innerHTML = '';
//     snapshot.forEach(doc => {
//         const data = doc.data();
//         const betElement = document.createElement('div');
//         betElement.classList.add('item');
//         const betOptions = data.options;
//         var betOptionsDivs = ``;
//         betOptions.forEach((option) => {
//             betOptionsDivs += `<div class="bet-option">
//                 ${option} | 1.5
//                 <input class="enter-bet">
//                 c
//                 <button class="wager-button">
//                 Wager
//                 </button>
//                 </div>`;
//         });
//         // betElement.innerHTML = `<strong>${data.description}</strong> - $${data.amount}`;
//         betElement.innerHTML = `<div class="bet-name">
//             ${data.title}</div>` + betOptionsDivs;
//         betList.appendChild(betElement);
//     });
// });