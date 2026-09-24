package kr.naesaju.personal.domain

import org.json.JSONObject

data class CompatibilitySection(
    val id: String,
    val title: String,
    val text: String
)

data class CompatibilityReading(
    val summary: String,
    val sections: List<CompatibilitySection>,
    val note: String
)

fun parseCompatibilityReading(raw: String?): CompatibilityReading? {
    if (raw.isNullOrBlank()) return null
    val root = runCatching { JSONObject(raw) }.getOrNull() ?: return null
    if (!root.optBoolean("ok", false)) return null
    val compatibility = root.optJSONObject("compatibility") ?: return null
    val array = compatibility.optJSONArray("sections")
    val sections = buildList {
        if (array != null) {
            for (index in 0 until array.length()) {
                val item = array.optJSONObject(index) ?: continue
                add(
                    CompatibilitySection(
                        id = item.optString("id"),
                        title = item.optString("title"),
                        text = item.optString("text")
                    )
                )
            }
        }
    }
    if (sections.isEmpty()) return null
    return CompatibilityReading(
        summary = compatibility.optString("summary"),
        sections = sections,
        note = compatibility.optString("note")
    )
}
