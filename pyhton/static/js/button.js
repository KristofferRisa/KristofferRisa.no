
$("#navy-icon").click(function() {
    //window.location.hash = "#cv";
    scrolltoCv(500);
    selectEdu(2);
});

$('#college-icon').click(function() {
    scrolltoCv(500);
    selectEdu(1);
});

$('#ricoh-icon').click(function() {
    scrolltoCv(500);
    selectEdu(3);
});

$('#visma-icon').click(function() {
    scrolltoCv(500);
    selectEdu(4);
});

$('#cvBtn').click(function() {
    scrolltoCv(500);
});

$('#careerBtn').click(function() {
    $('html, body').animate({
        scrollTop: $('#Career').offset().top
    }, 500);
});

$('#contactBtn').click(function(){
    $('html, body').animate({
        scrollTop: $('#Contact').offset().top
    }, 800);
});

$('#homeBtn').click(function(){
    $('html, body').animate({
        scrollTop: $('#content').offset().top
    }, 500);
});


//Key stones section
$('#keystones').click(function(){
    $('html, body').animate({
        scrollTop: $('#cv').offset().top
    }, 700);
});