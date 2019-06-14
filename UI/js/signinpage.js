document.addEventListener('DOMContentLoaded', () => {
    const lineTwo = document.querySelector('.line-two');
    const line = document.querySelector('.line');
    const sixChar = document.querySelector('.p-char');
    const paraConfirmPassword = document.querySelector('.p-signin-2');
    const searchBoxConfirmPassword = document.querySelector('.search-confirm-password');
    const signInButton = document.querySelector('.button');
    const forgotPassword = document.querySelector('.forgot-p');
    document.querySelector('.log-in').onclick = () => {
        line.style.display = 'block';
        lineTwo.style.display = 'none';
        sixChar.style.display = 'none';
        paraConfirmPassword.style.display = 'none';
        searchBoxConfirmPassword.style.display = 'none';
        signInButton.value = 'Login';
        forgotPassword.style.display = 'block';
    }
    document.querySelector('.sign-up-pg').onclick = () => {
        lineTwo.style.display = 'block';
        line.style.display = 'none';
        sixChar.style.display = 'block';
        paraConfirmPassword.style.display = 'block';
        searchBoxConfirmPassword.style.display = 'block';
        signInButton.value = 'Sign up';
        forgotPassword.style.display = 'none';
    }
    document.querySelector('.sign-up-pg').onmouseover = () => {
        lineTwo.style.display = 'block';
    }
    document.querySelector('.log-in').onmouseover = () => {
        line.style.display = 'block';
    }
    document.querySelector('.sign-up-pg').onmouseout = () => {
        lineTwo.style.display = 'none';
    }
    document.querySelector('.log-in').onmouseout = () => {
        line.style.display = 'none';
    }

    const arrowUp = document.querySelector('.arrow-up');
    const dropDown = document.querySelector('.dropdown');
    const body = document.querySelector('.body');
    
    document.querySelector('.img-svg').onclick = () => {
        if(arrowUp.style.display == 'none' && dropDown.style.display == 'none') {
            arrowUp.style.display = 'block';
            dropDown.style.display = 'block';
        } else {
            dropDown.style.display = 'none';
            arrowUp.style.display = 'none';
        }
    }

    const nav = document.querySelector('.nav');
    const mainIndex = document.querySelector('.main-index');
    document.querySelector('#nav-toggle').onclick = () => {
        if(nav.className === "nav") {
            nav.className += " responsive";
            mainIndex.className += " responsive";

        }   else {
                nav.className = "nav";
                mainIndex.className = "main-index";
        }
    }
})