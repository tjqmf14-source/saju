package kr.naesaju.personal

import android.content.ContentValues
import android.os.Environment
import android.provider.MediaStore
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.captureToImage
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.onNodeWithTag
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.test.performClick
import androidx.compose.ui.test.performScrollTo
import androidx.compose.ui.test.performScrollToIndex
import androidx.test.platform.app.InstrumentationRegistry
import java.io.File
import java.io.FileOutputStream
import kr.naesaju.personal.bridge.SajuEngineGateway
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.SajutaroTheme
import kr.naesaju.personal.domain.GuidanceSection
import kr.naesaju.personal.domain.MonthReading
import kr.naesaju.personal.domain.ReadingSnapshot
import kr.naesaju.personal.domain.TodayItem
import kr.naesaju.personal.domain.TodayReading
import kr.naesaju.personal.feature.compatibility.CompatibilityScreen
import kr.naesaju.personal.feature.fortune.FortuneScreen
import kr.naesaju.personal.feature.home.HomeScreen
import kr.naesaju.personal.feature.onboarding.ProfileScreen
import kr.naesaju.personal.feature.saju.SajuScreen
import kr.naesaju.personal.feature.tarot.TarotScreen
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class NativeScreenSmokeTest {
    @get:Rule
    val composeRule = createComposeRule()

    private val profile = UserProfile(
        name = "민규",
        calendar = "solar",
        birthDate = "1987-06-14",
        birthTime = "11:45",
        birthTimeKnown = true,
        gender = "male"
    )

    private val reading = ReadingSnapshot(
        headline = "혼자 생각을 정리할 시간이 있을 때 강점이 잘 드러나는 편입니다.",
        sajuSections = listOf(
            GuidanceSection("overview", "나를 한 문장으로", "핵심 요약", "핵심 이유", "핵심 행동"),
            GuidanceSection("strengths", "내가 잘하는 것", "강점 요약", "강점 이유", "강점 행동"),
            GuidanceSection("temperament", "힘들어지는 상황", "주의 요약", "주의 이유", "주의 행동")
        ),
        today = TodayReading(
            headline = "속도를 높이기보다 중요한 한 가지를 먼저 정리해 보세요.",
            items = listOf(
                TodayItem("work", "일", "안정", "우선순위를 한 가지로 좁혀보세요."),
                TodayItem("money", "돈", "점검", "지출 조건을 숫자로 확인해 보세요."),
                TodayItem("love", "관계", "대화", "추측보다 확인하는 대화를 우선하세요."),
                TodayItem("condition", "컨디션", "회복", "쉬는 시간을 일정에 먼저 넣어보세요.")
            ),
            good = "미뤄둔 한 가지를 작게 끝내보세요.",
            avoid = "한 번에 여러 결정을 내리지 마세요."
        ),
        year = GuidanceSection("year", "올해의 흐름", "올해는 정리와 실행의 균형이 중요합니다.", "연간 이유", "연간 행동"),
        months = (1..12).map { month ->
            MonthReading(month, "집중 · 점검", "한 가지를 정리하세요.", "과한 확장을 피하세요.", "큰 충돌 신호 없음")
        },
        mbti = "INTJ"
    )

    @Test
    fun profileScreenKeepsPrimaryInputsReadable() {
        composeRule.setContent {
            SajutaroTheme {
                ProfileScreen(onSave = {})
            }
        }

        composeRule.onNodeWithText("처음 한 번만\n나를 알려주세요.").assertIsDisplayed()
        composeRule.onNodeWithText("생년월일").assertIsDisplayed()
        composeRule.onNodeWithText("출생시간을 알고 있어요").assertIsDisplayed()
        composeRule.onNodeWithTag("profile-list").performScrollToIndex(6)
        composeRule.onNodeWithText("내 사주 시작하기").assertIsDisplayed()
        saveRootScreenshot("qa-profile.png")
    }

    @Test
    fun homeScreenShowsDailyHierarchyAtLargeFontScale() {
        composeRule.setContent {
            SajutaroTheme {
                HomeScreen(
                    profile = profile,
                    reading = reading,
                    contentPadding = PaddingValues(),
                    onOpenSaju = {},
                    onOpenFortune = {},
                    onOpenTarot = {},
                    onOpenCompatibility = {},
                    onEditProfile = {}
                )
            }
        }

        composeRule.onNodeWithText("오늘의 한마디").assertIsDisplayed()
        composeRule.onNodeWithText("오늘의 흐름").assertIsDisplayed()
        composeRule.onNodeWithTag("home-list").performScrollToIndex(5)
        composeRule.onNodeWithText("지금 필요한 행동").assertIsDisplayed()
        saveRootScreenshot("qa-home.png")
    }

    @Test
    fun sajuScreenExposesRealReadingContent() {
        composeRule.setContent {
            SajutaroTheme {
                SajuScreen(
                    profile = profile,
                    reading = reading,
                    calculationError = "",
                    contentPadding = PaddingValues(),
                    onEditProfile = {}
                )
            }
        }
        composeRule.onNodeWithText("나를 한 문장으로").assertIsDisplayed()
        composeRule.onNodeWithText("내가 잘하는 것").performScrollTo().assertIsDisplayed()
        saveRootScreenshot("qa-saju.png")
    }

    @Test
    fun fortuneScreenExposesTodayYearAndMonthlyNavigation() {
        composeRule.setContent {
            SajutaroTheme {
                FortuneScreen(
                    reading = reading,
                    calculationError = "",
                    contentPadding = PaddingValues()
                )
            }
        }
        composeRule.onNodeWithText("오늘").assertIsDisplayed()
        composeRule.onNodeWithText("올해").assertIsDisplayed()
        composeRule.onNodeWithText("1~12월").performScrollTo().assertIsDisplayed()
        saveRootScreenshot("qa-fortune.png")
    }

    @Test
    fun compatibilityScreenExplainsRelationshipWithoutScore() {
        composeRule.setContent {
            SajutaroTheme {
                CompatibilityScreen(
                    profile = profile,
                    engine = FakeTarotGateway(),
                    onBack = {}
                )
            }
        }

        composeRule.onNodeWithText("점수보다\n서로 다른 방식을 봅니다.").assertIsDisplayed()
        composeRule.onNodeWithTag("compatibility-list").performScrollToIndex(5)
        composeRule.onNodeWithText("관계 흐름 보기").assertIsDisplayed()
        saveRootScreenshot("qa-compatibility.png")
    }

    @Test
    fun tarotDrawShowsFullReadingInsteadOfPlaceholder() {
        composeRule.setContent {
            SajutaroTheme {
                TarotScreen(
                    engine = FakeTarotGateway(),
                    contentPadding = PaddingValues()
                )
            }
        }

        composeRule.onNodeWithText("오늘의 카드 뽑기").performClick()
        composeRule.waitUntil(timeoutMillis = 3_000) {
            composeRule.onAllNodesWithText("별 · 정방향").fetchSemanticsNodes().isNotEmpty()
        }
        composeRule.onNodeWithText("별 · 정방향").performScrollTo().assertIsDisplayed()
        composeRule.onNodeWithText("행동 조언").performScrollTo().assertIsDisplayed()
        saveRootScreenshot("qa-tarot.png")
    }

    private fun saveRootScreenshot(fileName: String) {
        val bitmap = composeRule.onRoot().captureToImage().asAndroidBitmap()
        val context = InstrumentationRegistry.getInstrumentation().targetContext

        val internalFile = File(context.filesDir, fileName)
        FileOutputStream(internalFile).use { stream ->
            assertTrue(bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream))
        }
        assertTrue(internalFile.exists() && internalFile.length() > 1024)

        val resolver = context.contentResolver
        val collection = MediaStore.Downloads.EXTERNAL_CONTENT_URI
        resolver.delete(
            collection,
            MediaStore.MediaColumns.DISPLAY_NAME + "=?",
            arrayOf(fileName)
        )

        val values = ContentValues().apply {
            put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
            put(MediaStore.MediaColumns.MIME_TYPE, "image/png")
            put(
                MediaStore.MediaColumns.RELATIVE_PATH,
                Environment.DIRECTORY_DOWNLOADS + "/sajutaro-qa"
            )
            put(MediaStore.MediaColumns.IS_PENDING, 1)
        }
        val uri = resolver.insert(collection, values)
        assertTrue(uri != null)

        resolver.openOutputStream(uri!!).use { stream ->
            assertTrue(stream != null)
            assertTrue(bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream!!))
        }

        val ready = ContentValues().apply {
            put(MediaStore.MediaColumns.IS_PENDING, 0)
        }
        assertTrue(resolver.update(uri, ready, null, null) >= 0)
    }

    private class FakeTarotGateway : SajuEngineGateway {
        override fun calculate(requestJson: String, callback: (Result<String>) -> Unit) {
            callback(Result.failure(UnsupportedOperationException()))
        }

        override fun calculateCompatibility(requestJson: String, callback: (Result<String>) -> Unit) {
            callback(Result.failure(UnsupportedOperationException()))
        }

        override fun drawTarot(requestJson: String, callback: (Result<String>) -> Unit) {
            callback(
                Result.success(
                    """
                    {
                      "ok": true,
                      "mode": "today",
                      "spread": [{
                        "position": "오늘의 메시지",
                        "reversed": false,
                        "orientation": "정방향",
                        "meaning": "긴장 뒤에 회복의 방향을 찾고 가능성을 다시 그려볼 수 있습니다.",
                        "advice": "원하는 방향을 구체적으로 적고 오늘 가능한 작은 행동 하나를 시작하세요.",
                        "card": {
                          "name": "별",
                          "en": "The Star",
                          "keywords": "희망·회복·비전",
                          "image": "/tarot-rws/m17.jpg"
                        }
                      }]
                    }
                    """.trimIndent()
                )
            )
        }

        override fun close() = Unit
    }
}
