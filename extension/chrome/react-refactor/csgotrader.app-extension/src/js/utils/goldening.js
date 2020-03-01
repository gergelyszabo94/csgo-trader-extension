const goldenCommenters = () => {
    document.querySelectorAll('.commentthread_author_link').forEach(commenter => {
        if (commenter.innerText.includes('csgotrader.app')) {
            commenter.classList.add('golden');
            const avatar = commenter.parentElement.parentElement.parentElement.querySelector('.playerAvatar');
            avatar.classList.add('golden');
            commenter.addEventListener('mouseover', goldenMiniProfileHandler);
            avatar.addEventListener('mouseover', goldenMiniProfileHandler);
        }
    })
};

const goldenMemberNames = () => {
    document.querySelectorAll('.member_block').forEach(memberBlock =>{
        if (memberBlock.querySelector('.linkFriend').innerText.includes('csgotrader.app')) {
            memberBlock.querySelector('.playerAvatar').classList.add('golden');
            memberBlock.querySelector('.member_block_content').classList.remove('online', 'offline', 'in-game');
            memberBlock.querySelector('.member_block_content').classList.add('golden');
        }
    });
};

const goldenMiniprofile = () => {
    const miniProfile = document.querySelector('.miniprofile_player');

    if (miniProfile  !== null) {
        miniProfile.querySelector('.playerAvatar').classList.add('golden');
        miniProfile.querySelector('.persona').classList.add('golden');
        return true;
    }
    else return false;
};

const goldenMiniProfileHandler = () => {
    goldenMiniprofile();

    const goldenInterval = setInterval((() =>{
        if (goldenMiniprofile()) clearInterval(goldenInterval);
    }), 500)
};

export { goldenCommenters, goldenMemberNames };