package kr.naesaju.personal.app

enum class AppDestination(
    val label: String,
    val supportingLabel: String
) {
    HOME("홈", "오늘"),
    SAJU("사주", "나"),
    FORTUNE("운세", "흐름"),
    TAROT("타로", "카드")
}
