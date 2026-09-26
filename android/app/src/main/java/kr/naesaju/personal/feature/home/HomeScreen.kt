package kr.naesaju.personal.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.HeroInsightCard
import kr.naesaju.personal.design.InfoPill
import kr.naesaju.personal.design.InsightCard
import kr.naesaju.personal.design.SectionHeader
import kr.naesaju.personal.domain.ReadingSnapshot
import kr.naesaju.personal.domain.TodayItem

@Composable
fun HomeScreen(
    profile: UserProfile,
    reading: ReadingSnapshot?,
    contentPadding: PaddingValues,
    onOpenCompatibility: () -> Unit,
    onEditProfile: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.testTag("home-list"),
        contentPadding = PaddingValues(
            start = 18.dp,
            top = contentPadding.calculateTopPadding() + 18.dp,
            end = 18.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        "사주타로",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Text(
                        profile.name + "님, 오늘의 흐름",
                        style = MaterialTheme.typography.headlineMedium
                    )
                    Text(
                        "복잡한 풀이보다 오늘 필요한 판단을 먼저 보여드려요.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    MoonMark()
                    TextButton(onClick = onEditProfile) { Text("프로필") }
                }
            }
        }

        item {
            HeroInsightCard(
                label = "오늘의 한마디",
                title = reading?.today?.headline ?: "오늘의 흐름을 정리하고 있어요.",
                body = reading?.headline ?: "입력한 정보는 기기 안에서 계산됩니다."
            )
        }

        if (reading != null) {
            item {
                SectionHeader(
                    title = "오늘의 흐름",
                    description = "점수 대신 일·돈·관계·컨디션에서 무엇을 먼저 볼지 정리했습니다."
                )
            }

            reading.today.items.forEach { flow ->
                item { FlowRow(flow) }
            }

            item {
                InsightCard(
                    title = "지금 필요한 행동",
                    body = reading.today.good,
                    action = reading.today.avoid,
                    accent = true
                )
            }

            item {
                SectionHeader(
                    title = "올해 한눈에",
                    description = reading.year.summary
                )
            }

            item {
                InsightCard(
                    title = "올해의 행동 기준",
                    body = reading.year.action.ifBlank { reading.year.summary },
                    meta = reading.year.reason
                )
            }
        }

        item {
            SectionHeader(
                title = "관계 살펴보기",
                description = "좋고 나쁨보다 서로 다른 반응 방식과 조율 포인트를 확인합니다."
            )
        }

        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    InfoPill("두 사람의 차이를 생활 언어로")
                    Text(
                        "궁합 결과는 점수가 아니라 대화 방식, 갈등 지점, 맞추기 쉬운 부분으로 보여줍니다.",
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Button(
                        onClick = onOpenCompatibility,
                        modifier = Modifier.fillMaxWidth().heightIn(min = 50.dp)
                    ) {
                        Text("두 사람 궁합 보기")
                    }
                }
            }
        }
    }
}

@Composable
private fun MoonMark() {
    Text(
        text = "◐",
        style = MaterialTheme.typography.titleLarge,
        color = MaterialTheme.colorScheme.tertiary
    )
}

@Composable
private fun FlowRow(item: TodayItem) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 15.dp),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(
                modifier = Modifier.weight(0.26f),
                verticalArrangement = Arrangement.spacedBy(5.dp)
            ) {
                Text(item.title, style = MaterialTheme.typography.titleMedium)
                InfoPill(item.label)
            }
            Text(
                item.text,
                modifier = Modifier.weight(0.74f),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}