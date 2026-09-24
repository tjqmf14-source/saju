package kr.naesaju.personal.domain

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Test

class CompatibilityReadingTest {
    @Test
    fun parsesCompatibilitySectionsWithoutScore() {
        val raw = """
            {
              "ok": true,
              "compatibility": {
                "summary": "두 사람의 차이를 조율하는 방식이 중요합니다.",
                "sections": [
                  {"id":"strengths","title":"잘 맞는 부분","text":"강점"},
                  {"id":"differences","title":"다른 부분","text":"차이"},
                  {"id":"conflict","title":"갈등하기 쉬운 상황","text":"주의"},
                  {"id":"understand","title":"서로 이해하면 좋은 점","text":"이해"},
                  {"id":"advice","title":"현실적인 관계 조언","text":"조언"}
                ],
                "note": "점수가 아니라 참고 해설입니다."
              }
            }
        """.trimIndent()

        val result = parseCompatibilityReading(raw)
        assertNotNull(result)
        assertEquals(5, result?.sections?.size)
        assertEquals("현실적인 관계 조언", result?.sections?.last()?.title)
        assertNull(parseCompatibilityReading("""{"ok":false}"""))
    }
}
