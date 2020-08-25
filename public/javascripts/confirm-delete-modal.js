document.getElementById('js-delete-story-btn').addEventListener('click', function () {
    document.querySelector('.confirm-delete-modal').style.display = "block";
});

document.querySelector('.js-confirm-delete-modal__choice-btn--no').addEventListener('click', function () {
    document.querySelector('.confirm-delete-modal').style.display = "none";
});

document.querySelector('.js-confirm-delete-modal-close-btn__icon').addEventListener('click', function () {
    document.querySelector('.confirm-delete-modal').style.display = "none";
});

document.querySelector('.js-confirm-delete-modal').addEventListener('click', function (e) {
    if (e.target !== this)
        return;
    document.querySelector('.confirm-delete-modal').style.display = "none";
});