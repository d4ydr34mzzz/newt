document.getElementById('js-navbar__login-btn').addEventListener('click', function () {
    document.querySelector('.login-modal').style.display = "block";
});

document.querySelector('.js-close-btn__icon').addEventListener('click', function () {
    document.querySelector('.login-modal').style.display = "none";
});

document.querySelector('.js-login-modal').addEventListener('click', function (e) {
    if (e.target !== this)
        return;
    document.querySelector('.login-modal').style.display = "none";
});