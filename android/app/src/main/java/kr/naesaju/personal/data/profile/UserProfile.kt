package kr.naesaju.personal.data.profile

import org.json.JSONObject

data class UserProfile(
    val name: String,
    val calendar: String,
    val birthDate: String,
    val birthTime: String,
    val birthTimeKnown: Boolean,
    val gender: String,
    val isLeap: Boolean = false
) {
    fun toEngineRequestJson(): String {
        return JSONObject()
            .put("calendar", calendar)
            .put("birthDate", birthDate)
            .put("birthTime", birthTime)
            .put("birthTimeKnown", birthTimeKnown)
            .put("gender", gender)
            .put("isLeap", calendar == "lunar" && isLeap)
            .put("location", "korea")
            .put("dayBoundary", "midnight")
            .put("precision", false)
            .toString()
    }
}
