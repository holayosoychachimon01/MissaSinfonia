document.getElementById("imagen").addEventListener("click", function() {
    document.getElementById("audio").play();
});
$('#myCarousel').bind('slid', function (e) {
    var index = $(e.target).find(".active").index();
    if(index === 1)
        alert('slide2 displayed!');
})