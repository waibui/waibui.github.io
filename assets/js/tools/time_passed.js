document.addEventListener("DOMContentLoaded", () => {
    const myTimePassed = document.getElementById('my-time-passed');
    const resultTimePassed = document.getElementById('result-time-passed');
    const dateSelect = document.getElementById('date-select');
    const today = new Date();

    function calculateDays(pastDate) {
        const diffInTime = today - pastDate;
        return Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    }

    myTimePassed.textContent = `My Time Passed is: ${calculateDays(new Date('2004-09-09'))} Days.`;
    dateSelect.addEventListener('change', () => {
        const selectedDate = new Date(dateSelect.value);
        if (!isNaN(selectedDate)) {
            if (selectedDate > today) {
                resultTimePassed.textContent = "The selected date is in the future. Please select a past date.";
            } else {
                resultTimePassed.textContent = `Your Time Passed is: ${calculateDays(selectedDate)} Days`;
            }
        } else {
            resultTimePassed.textContent = "Please Select A Valid Date.";
        }
    });
});