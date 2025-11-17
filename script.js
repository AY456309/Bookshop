document.addEventListener('DOMContentLoaded', () => {
  const userMenuBtn = document.getElementById('user_menu_btn');
  const userBtn = document.getElementById('user_btn');
  const usernav = document.querySelector('.user_header .navbar');
  const accbox = document.querySelector('.header_acc_box');

  userMenuBtn?.addEventListener('click', () => {
    usernav?.classList.toggle('active');
    accbox?.classList.remove('active');
  });

  userBtn?.addEventListener('click', () => {
    accbox?.classList.toggle('active');
    usernav?.classList.remove('active');
  });

  window.addEventListener('scroll', () => {
    accbox?.classList.remove('active');
    usernav?.classList.remove('active');
    const nav = document.querySelector('.user_header .header_1');
    if (window.scrollY > 70) {
      nav?.classList.add('active');
    } else {
      nav?.classList.remove('active');
    }
  });
});
