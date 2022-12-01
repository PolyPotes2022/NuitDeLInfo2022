// on load
window.addEventListener('load', () => {

    // get div
    const div = document.getElementById('div');

    // add mousehover event to change color
    div.addEventListener('mouseover', () => {
        div.style.backgroundColor = 'red';
    });

    // add mouseleave event to change color
    div.addEventListener('mouseleave', () => {
        div.style.backgroundColor = 'blue';
    });


});