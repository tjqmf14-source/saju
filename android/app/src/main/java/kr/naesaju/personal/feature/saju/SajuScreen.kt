package kr.naesaju.personal.feature.saju

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.HeroInsightCard
import kr.naesaju.personal.design.InfoPill
import kr.naesaju.personal.design.InsightCard
import kr.naesaju.personal.design.PageHeader
import kr.naesaju.personal.design.SectionHeader
import kr.naesaju.personal.domain.GuidanceSection
import kr.naesaju.personal.domain.ReadingSnapshot

@Composable
fun SajuScreen(
    profile: UserProfile,
    reading: ReadingSnapshot?,
    calculationError: String,
    contentPadding: PaddingValues,
    onEditProfile: () -> Unit
) {
    LazyColumn(
        contentPadding = PaddingValues(
            start = 20.dp,
            top = contentPadding.calculateTopPadding() + 18.dp,
            end = 20.dp,
            bottom = contentPadding.calculateBottomPadding() + 28.dp
        ),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            PageHeader(
                eyebrow = "나의 사주",
                title = profile.name + "님의\n기질과 생활 패턴",
                subtitle = "명리 용어보다 실제 생활에서 어떻게 드러나는지 중심으로 읽습니다."
            )
            val calendarText = if (profile.calendar == "lunar") "음력" else "양력"
            val timeText = if (profile.birthTimeKnown) profile.birthTime else "시간 모름"
            InfoPill(
                text = calendarText + " " + profile.birthDate + " · " + timeText,
                modifier = Modifier.padding(top = 12.dp)
            )
            TextButton(onClick = onEditProfile, modifier = Modifier.padding(top = 2.dp)) {
                Text("출생정보 수정")
            }
        }

        when {
            calculationError.isNotBlank() -> item {
                InsightCard("계산 정보를 확인해 주세요", calculationError, accent = true)
            }
            reading == null -> item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 28.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    CircularProgressIndicator()
                    Text("기기 안에서 사주를 계산하고 있습니다.", style = MaterialTheme.typography.bodyLarge)
                }
            }
            else -> {
                item {
                    HeroInsightCard(
                        label = "CORE",
                        title = "나를 한 문장으로",
                        body = reading.headline
                    )
                }
                item {
                    SectionHeader(
                        title = "나를 이해하는 세 가지 관점",
                        description = "요약 → 이유 → 행동 순서로 필요한 만큼만 읽어보세요."
                    )
                }
                items(reading.sajuSections.filterNot { it.title == "나를 한 문장으로" }) { section ->
                    GuidanceInsight(section)
                }
            }
        }
    }
}

@Composable
private fun GuidanceInsight(section: GuidanceSection) {
    InsightCard(
        title = section.title,
        body = section.summary,
        meta = section.reason,
        action = section.action
    )
}
