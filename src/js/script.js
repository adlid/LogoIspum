
// REVIEWS SLIDER
let CommentsSlider = new Swiper('.reviews-slider', {
    slidesPerView: 3,
    loop: true,
    spaceBetween: 50,
    autoHeight: true,
    breakpoints: {
        1540: {
            slidesPerView: 3
        },
        1020: {
            slidesPerView: 3
        },
        700: {
            slidesPerView: 2
        },
        530: {
            slidesPerView: 1
        },
        320: {
            slidesPerView: 1
        }
    }
});
const isMobile ={
    Android:function (){
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry:function (){
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS:function (){
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera:function (){
        return navigator.userAgent.match(/Opera/i);
    },
    Windows:function (){
        return navigator.userAgent.match(/IEMobile/i);
    },
    any:function (){
        return (
            isMobile.Android() ||
            isMobile.BlackBerry() ||
            isMobile.iOS() ||
            isMobile.Opera ||
            isMobile.Windows()
        );
    }
};

if(isMobile.any()){
    document.body.classList.add('_touch');
    let menuArrows = document.querySelectorAll('.menu__arrow');
    if(menuArrows.length>0){
        for(let index = 0; index<menuArrows.length; index++){
            const menuArrow = menuArrows[index];
            menuArrow.addEventListener('click',(e)=>{
                menuArrow.parentElement.classList.toggle('_active');
            })
        }
    }
}else {
    document.body.classList.add('_pc');
}
let menuLinks = document.querySelectorAll('.menu__link[data-goto]');
if(menuLinks.length>0){
    menuLinks.forEach(menuLink=>{
        menuLink.addEventListener('click', onMenuLinkClick)
    })
    function  onMenuLinkClick(e){
        const menuLink = e.target;
        if(menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)){
            const gotoBlock = document.querySelector(menuLink.dataset.goto);
            const gotoBlockValue = gotoBlock.getBoundingClientRect().top + pageYOffset;

            if (iconMenu.classList.contains('_active')){
                document.body.classList.remove('_lock')
                iconMenu.classList.remove('_active')
                menuBody.classList.remove('_active')
            }

            window.scrollTo({
                top:gotoBlockValue,
                behavior:'smooth'
            });
            e.preventDefault();
        }
    }
}
const iconMenu = document.querySelector('.menu__icon')
const menuBody = document.querySelector('.menu__body');
 if(iconMenu){

    iconMenu.addEventListener('click',(e)=>{
        document.body.classList.toggle('_lock')
        iconMenu.classList.toggle('_active')
        menuBody.classList.toggle('_active')
    })
}