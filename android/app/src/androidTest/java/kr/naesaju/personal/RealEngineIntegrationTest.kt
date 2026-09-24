package kr.naesaju.personal

import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import kr.naesaju.personal.bridge.LocalJsEngine
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.domain.parseReadingSnapshot
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class RealEngineIntegrationTest {
    @Test
    fun packagedLocalEngineCalculatesRealProfileAndReadableCopy() {
        val context = InstrumentationRegistry.getInstrumentation().targetContext
        val engine = LocalJsEngine(context)
        val profile = UserProfile(
            name = "민규",
            calendar = "solar",
            birthDate = "1987-06-14",
            birthTime = "11:45",
            birthTimeKnown = true,
            gender = "male"
        )
        val latch = CountDownLatch(1)
        var outcome: Result<String>? = null

        try {
            engine.calculate(profile.toEngineRequestJson()) { result ->
                outcome = result
                latch.countDown()
            }

            assertTrue("패키지된 로컬 계산 엔진이 20초 안에 응답해야 합니다.", latch.await(20, TimeUnit.SECONDS))
            val raw = outcome?.getOrThrow() ?: throw AssertionError("계산 결과가 없습니다.")
            val root = JSONObject(raw)

            assertTrue(root.optBoolean("ok", false))
            val pillars = root.getJSONObject("chart").getJSONObject("pillarStrings")
            assertEquals("정묘", pillars.getString("year"))
            assertEquals("병오", pillars.getString("month"))
            assertEquals("갑오", pillars.getString("day"))
            assertEquals("경오", pillars.getString("hour"))

            val reading = parseReadingSnapshot(raw)
            assertNotNull(reading)
            val parsed = reading ?: throw AssertionError("실제 계산 결과를 앱 표시 모델로 변환하지 못했습니다.")

            assertTrue(parsed.headline.length >= 10)
            assertEquals(7, parsed.sajuSections.size)
            assertTrue(parsed.sajuSections.all { it.summary.length >= 4 && it.action.length >= 4 })
            assertEquals(4, parsed.today.items.size)
            assertTrue(parsed.today.items.all { it.text.length >= 8 })
            assertEquals(12, parsed.months.size)
            assertEquals(12, parsed.months.map { it.action }.toSet().size)
        } finally {
            engine.close()
        }
    }
}
