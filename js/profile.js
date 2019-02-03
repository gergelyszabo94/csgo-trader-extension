//ensures that we are on a profile page, it's not possible with simple regex
if($("body").hasClass("profile_page")){
    let repButton = `<span class="btn_green_white_innerfade btn_small" id="repper">+rep<span>`;
    // $(".commentthread_entry_submitlink").append(repButton);
    console.log("we are on a profile");
}