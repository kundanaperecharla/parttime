var slide_time = 1200; // The time it takes to complete an entire transition
var change_point = slide_time / 2; // Calculates when the slide should change
var on = 1;

setTimeout(function () {
    if (on == 1) {
        on = 0;
        var active_slide = $('.active_slide').next()
        set_transition(active_slide);
        setTimeout(function () {
            $('.active_slide').hide().removeClass('active_slide').next().addClass('active_slide').show();
        }, change_point);
        setTimeout(function () {
            on = 1;
        }, slide_time);
    }
}, 1000);

// Set transition type
function set_transition(tran) {
    var transition_type = tran.data('transition')
    $('.pagetransitions_transition div').each(function () {
        $(this).removeClass(this.className.split(' ').pop());
        setTimeout(function () {
            $('.pagetransitions_transition div').addClass(transition_type)
        }, 100)

    })
}
