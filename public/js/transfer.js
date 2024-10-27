document.getElementById('transfer-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const recipientUsername = document.getElementById('recipient').value;
    const amount = document.getElementById('amount').value;

    try {
        const response = await fetch('/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ recipientUsername, amount })
        });

        const data = await response.text();
        document.getElementById('message').textContent = data;
    } catch (error) {
        console.error('Error transferring money:', error);
        document.getElementById('message').textContent = 'An error occurred while transferring money';
    }
});
