currentIndex = 0;
document.getElementById("imagen").addEventListener("click", function () {
    document.getElementById("audio0").play();
});
$('#myCarousel').on('slide.bs.carousel', function (e) {
    var totalItems = $(e.target).find('.item').length;
    currentIndex = $(e.target).find('.active').index();
    var nextIndex;
    stop()
    if (e.direction === 'left') {
        nextIndex = (currentIndex + 1) % totalItems;
    } else {
        nextIndex = (currentIndex - 1 + totalItems) % totalItems;
    }

    var scrollBottom = $(window).scrollTop() + $(window).height();
    var elfin = Math.abs(scrollBottom - $(document).height()) < 5;
    if(elfin){
        if (nextIndex === 0){
            document.getElementById("audio1").play();
        }
        if (nextIndex === 1){
            document.getElementById("audio0").play();
        }
        if (nextIndex === 2){
            document.getElementById("audio2").play();
        }
    }
});


function stop() {
    document.getElementById("audio0").pause();
    document.getElementById("audio1").pause();
    document.getElementById("audio2").pause();
}
function votar() {
    console.log("votaste por: " + currentIndex);
    
}