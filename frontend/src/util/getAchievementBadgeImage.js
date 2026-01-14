export default function getAchievementBadgeImage(badgeNumber) {
    const badges = {
        1: require("../static/images/achievement-badges/built-paths.png"),
        2: require("../static/images/achievement-badges/destroyed-paths.png"),
        3: require("../static/images/achievement-badges/destroyed-tools.png"),
        4: require("../static/images/achievement-badges/gold-nuggets.png"),
        5: require("../static/images/achievement-badges/played-games.png"),
        6: require("../static/images/achievement-badges/repaired-tools.png"),
        7: require("../static/images/achievement-badges/victories.png"),

    };

    return badges[badgeNumber] || require("../static/images/achievement-badges/default-achievement-badge.png");
}