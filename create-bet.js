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