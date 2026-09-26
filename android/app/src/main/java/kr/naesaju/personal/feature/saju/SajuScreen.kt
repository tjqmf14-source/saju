package kr.naesaju.personal.feature.saju

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
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
            start = 18.dp,
            top = contentPadding.calculateTopPadding() + 18.dp,
            end = 18.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            PageHeader(
                eyebrow = "사주",
                title = profile.name + "님의 기본 흐름",
                subtitle = "명리 용어를 그대로 나열하지 않고 성향과 행동 기준으로 풀어봅니다."
            )
            Row(
                modifier = Modifier.padding(top = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                InfoPill(if (profile.calendar == "lunar") "음력" else "양력")
                InfoPill(profile.birthDate)
                InfoPill(if (profile.birthTimeKnown) profile.birthTime else "시간 모름")
            }
            TextButton(onClick = onEditProfile, modifier = Modifier.padding(top = 2.dp)) {
                Text("프로필 수정")
            }
        }

        when {
            calculationError.isNotBlank() -> item {
                InsightCard("계산 정보를 확인해 주세요", calculationError)
            }
            reading == null -> item {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    CircularProgressIndicator()
                    Text("기기 안에서 사주를 계산하고 있습니다.", style = MaterialTheme.typography.bodyLarge)
                }
            }
            else -> {
                item {
                    HeroInsightCard(
                        label = "나를 한 문장으로",
                        title = reading.headline,
                        body = "아래에서는 강점·주의 상황·행동 기준을 나눠서 설명합니다."
                    )
                }
                item {
                    SectionHeader(
                        title = "나를 이해하는 세 가지 관점",
                        description = "요약 → 이유 → 행동 순서로 읽으면 핵심만 빠르게 파악할 수 있습니다."
                    )
                }
                reading.sajuSections.filterNot { it.title == "나를 한 문장으로" }.forEach { section ->
                    item { GuidanceCard(section) }
                }
            }
        }
    }
}

@Composable
private fun GuidanceCard(section: GuidanceSection) {
    InsightCard(
        title = section.title,
        body = section.summary,
        meta = if (section.reason.isBlank()) "" else "왜 이렇게 보나요 · " + section.reason,
        action = section.action
    )
}
