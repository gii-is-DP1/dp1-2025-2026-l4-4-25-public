export default function getIconImage(iconNumber) {
    const icons = {
        1: require("../static/images/icons/1.jpeg"),
        2: require("../static/images/icons/2.jpeg"),
        3: require("../static/images/icons/3.jpeg"),
        4: require("../static/images/icons/4.jpeg"),
    };

    return icons[iconNumber] || require("../static/images/icons/default_profile_avatar.png");
}