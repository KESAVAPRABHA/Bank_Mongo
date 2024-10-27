document.addEventListener("DOMContentLoaded", async function() {
    try {
        const response = await fetch('/api/userData'); // Endpoint to fetch user data
        const userData = await response.json();

        document.getElementById('username').textContent = userData.username;
        document.getElementById('balance').textContent = userData.balance.toFixed(2);

        const transactionsDiv = document.getElementById('transactions');
        userData.transactions.forEach(transaction => {
            const transactionElement = document.createElement('div');
            transactionElement.classList.add('transaction');
            transactionElement.innerHTML = `
                <p><strong>Amount:</strong> ${transaction.amount.toFixed(2)}</p>
                <p><strong>Date:</strong> ${new Date(transaction.date).toLocaleString()}</p>
                <p><strong>From Account:</strong> ${transaction.fromAccount}</p>
            `;
            transactionsDiv.appendChild(transactionElement);
        });
    } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error gracefully, e.g., display an error message on the page
    }
});
