document.addEventListener('DOMContentLoaded', function() {
    const feedbackForm = document.getElementById('feedback-form');

    feedbackForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const message = document.getElementById('message').value;

        // Here you can handle the form submission, e.g., send the data to a server
        console.log('Feedback submitted:', { name, email, message });

        // Show a thank you message or clear the form
        alert('Thank you for your feedback!');
        feedbackForm.reset();
    });
});
