package kr.naesaju.personal.domain

import org.json.JSONArray
import org.json.JSONObject

data class GuidanceSection(
    val id: String,
    val title: String,
    val summary: String,
    val reason: String,
    val action: String
)

data class TodayItem(
    val id: String,
    val title: String,
    val label: String,
    val text: String
)

data class TodayReading(
    val headline: String,
    val items: List<TodayItem>,
    val good: String,
    val avoid: String
)

data class MonthReading(
    val month: Int,
    val focus: String,
    val action: String,
    val check: String,
    val signal: String
)

data class TojeongGuide(
    val tone: String,
    val topics: List<String>,
    val action: String,
    val note: String
)

data class TojeongMonth(
    val month: Int,
    val guide: TojeongGuide
)

data class TojeongReading(
    val targetYear: Int,
    val code: String,
    val overview: TojeongGuide,
    val months: List<TojeongMonth>,
    val methodName: String,
    val reference: String
)

data class ReadingSnapshot(
    val headline: String,
    val sajuSections: List<GuidanceSection>,
    val today: TodayReading,
    val year: GuidanceSection,
    val months: List<MonthReading>,
    val tojeong: TojeongReading? = null,
    val mbti: String
)

data class TarotCardReading(
    val position: String,
    val name: String,
    val englishName: String,
    val keywords: String,
    val imagePath: String,
    val reversed: Boolean,
    val orientation: String,
    val meaning: String,
    val advice: String
)

data class TarotReading(
    val mode: String,
    val cards: List<TarotCardReading>
)

fun parseReadingSnapshot(raw: String?): ReadingSnapshot? {
    if (raw.isNullOrBlank()) return null
    val root = runCatching { JSONObject(raw) }.getOrNull() ?: return null
    if (!root.optBoolean("ok", false)) return null
    val native = root.optJSONObject("native") ?: return null

    val sections = native.optJSONArray("sajuSections").objects().map { item ->
        GuidanceSection(
            id = item.optString("id"),
            title = item.optString("title"),
            summary = item.optString("summary"),
            reason = item.optString("reason"),
            action = item.optString("action")
        )
    }

    val todayObject = native.optJSONObject("today") ?: JSONObject()
    val today = TodayReading(
        headline = todayObject.optString("headline"),
        items = todayObject.optJSONArray("items").objects().map { item ->
            TodayItem(
                id = item.optString("id"),
                title = item.optString("title"),
                label = item.optString("label"),
                text = item.optString("text")
            )
        },
        good = todayObject.optString("good"),
        avoid = todayObject.optString("avoid")
    )

    val yearObject = native.optJSONObject("year") ?: JSONObject()
    val year = GuidanceSection(
        id = yearObject.optString("id", "year"),
        title = yearObject.optString("title", "올해의 흐름"),
        summary = yearObject.optString("summary"),
        reason = yearObject.optString("reason"),
        action = yearObject.optString("action")
    )

    val months = native.optJSONArray("months").objects().map { item ->
        MonthReading(
            month = item.optInt("month"),
            focus = item.optString("focus"),
            action = item.optString("action"),
            check = item.optString("check"),
            signal = item.optString("signal")
        )
    }

    return ReadingSnapshot(
        headline = native.optString("headline"),
        sajuSections = sections,
        today = today,
        year = year,
        months = months,
        tojeong = parseTojeong(native.optJSONObject("tojeong")),
        mbti = native.optString("mbti")
    )
}

private fun parseTojeong(value: JSONObject?): TojeongReading? {
    if (value == null) return null
    val overviewObject = value.optJSONObject("overview") ?: return null
    val method = value.optJSONObject("method") ?: JSONObject()
    val months = value.optJSONArray("months").objects().map { item ->
        TojeongMonth(
            month = item.optInt("month"),
            guide = parseTojeongGuide(item)
        )
    }
    return TojeongReading(
        targetYear = value.optInt("targetYear"),
        code = value.optString("code"),
        overview = parseTojeongGuide(overviewObject),
        months = months,
        methodName = method.optString("name"),
        reference = method.optString("reference")
    )
}

private fun parseTojeongGuide(value: JSONObject): TojeongGuide {
    return TojeongGuide(
        tone = value.optString("tone"),
        topics = value.optJSONArray("topics").strings(),
        action = value.optString("action"),
        note = value.optString("note")
    )
}

fun parseTarotReading(raw: String?): TarotReading? {
    if (raw.isNullOrBlank()) return null
    val root = runCatching { JSONObject(raw) }.getOrNull() ?: return null
    if (!root.optBoolean("ok", false)) return null

    val cards = root.optJSONArray("spread").objects().map { item ->
        val card = item.optJSONObject("card") ?: JSONObject()
        TarotCardReading(
            position = item.optString("position"),
            name = card.optString("name"),
            englishName = card.optString("en"),
            keywords = card.optString("keywords"),
            imagePath = card.optString("image").removePrefix("/"),
            reversed = item.optBoolean("reversed", false),
            orientation = item.optString("orientation"),
            meaning = item.optString("meaning"),
            advice = item.optString("advice")
        )
    }

    return TarotReading(
        mode = root.optString("mode"),
        cards = cards
    )
}

private fun JSONArray?.objects(): List<JSONObject> {
    if (this == null) return emptyList()
    return buildList {
        for (index in 0 until length()) {
            optJSONObject(index)?.let(::add)
        }
    }
}

private fun JSONArray?.strings(): List<String> {
    if (this == null) return emptyList()
    return buildList {
        for (index in 0 until length()) {
            val value = optString(index)
            if (value.isNotBlank()) add(value)
        }
    }
}
