// on load
window.addEventListener('load', () => {

    // get div
    const div = document.querySelector('div');

    // add mousehover event to change color
    div.addEventListener('mouseover', () => {
        div.style.backgroundColor = 'red';
    });

    // add mouseleave event to change color
    div.addEventListener('mouseleave', () => {
        div.style.backgroundColor = '';
    });

    console.log('js lancé');
});
