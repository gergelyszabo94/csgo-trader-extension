//ensures that we are on a profile page, it's not possible with simple regex
// if($("body").hasClass("profile_page")){
//     let repText = "repreprep";
//     let repButton = `<span class="btn_green_white_innerfade btn_small" id="repper">+rep<span>`;
//     $(".commentthread_textarea").after(repButton);
//     $("#repper").click(function () {
//         $(".commentthread_textarea").text(repText);
//        $("form").each(function () {
//            console.log($(this));
//            console.log($(this).attr('id'));
//            if(/commentthread/.test($(this).attr('id'))){
//                console.log("in the if");
//                $(this).submit();
//            }
//        })
//     });
//
//     overrideShowTradeOffer();
// }