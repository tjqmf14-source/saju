package kr.naesaju.personal.domain

import kr.naesaju.personal.data.profile.UserProfile
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class ReadingSnapshotTest {
    @Test
    fun parsesNativeReadingPayload() {
        val raw = """
            {
              "ok": true,
              "native": {
                "headline": "핵심 문장",
                "mbti": "INTJ",
                "sajuSections": [
                  {"id":"overview","title":"나를 한 문장으로","summary":"요약","reason":"이유","action":"행동"}
                ],
                "today": {
                  "headline": "오늘 한마디",
                  "items": [
                    {"id":"work","title":"일","label":"안정","text":"일 설명"},
                    {"id":"money","title":"돈","label":"보통","text":"돈 설명"},
                    {"id":"love","title":"관계","label":"좋음","text":"관계 설명"},
                    {"id":"condition","title":"컨디션","label":"관리","text":"컨디션 설명"}
                  ],
                  "good": "할 일",
                  "avoid": "피할 일"
                },
                "year": {"id":"year","title":"올해의 흐름","summary":"연간 요약","reason":"연간 이유","action":"연간 행동"},
                "months": [
                  {"month":1,"focus":"집중","action":"행동1","check":"주의1","signal":"신호1"}
                ]
              }
            }
        """.trimIndent()

        val result = parseReadingSnapshot(raw)
        assertNotNull(result)
        assertEquals("핵심 문장", result?.headline)
        assertEquals(4, result?.today?.items?.size)
        assertEquals("연간 요약", result?.year?.summary)
        assertEquals(1, result?.months?.first()?.month)
    }

    @Test
    fun rejectsMalformedOrFailedPayload() {
        assertNull(parseReadingSnapshot(null))
        assertNull(parseReadingSnapshot("{broken"))
        assertNull(parseReadingSnapshot("""{"ok":false}"""))
    }

    @Test
    fun parsesTarotPayloadAndNormalizesAssetPath() {
        val raw = """
            {
              "ok": true,
              "mode": "today",
              "spread": [{
                "position": "오늘의 메시지",
                "reversed": false,
                "orientation": "정방향",
                "meaning": "의미",
                "advice": "조언",
                "card": {
                  "name": "별",
                  "en": "The Star",
                  "keywords": "희망·회복",
                  "image": "/tarot-rws/m17.jpg"
                }
              }]
            }
        """.trimIndent()

        val result = parseTarotReading(raw)
        assertNotNull(result)
        assertEquals(1, result?.cards?.size)
        assertEquals("tarot-rws/m17.jpg", result?.cards?.first()?.imagePath)
    }

    @Test
    fun profileEngineRequestContainsNoNetworkOrRemoteFields() {
        val profile = UserProfile(
            name = "테스트",
            calendar = "solar",
            birthDate = "1987-06-14",
            birthTime = "11:45",
            birthTimeKnown = true,
            gender = "male"
        )
        val json = JSONObject(profile.toEngineRequestJson())
        assertEquals("1987-06-14", json.getString("birthDate"))
        assertEquals(false, json.getBoolean("precision"))
        assertEquals("korea", json.getString("location"))
    }
}
