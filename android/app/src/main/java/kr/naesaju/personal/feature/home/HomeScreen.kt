package kr.naesaju.personal.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.HeroInsightCard
import kr.naesaju.personal.design.InfoPill
import kr.naesaju.personal.design.PageHeader
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
        modifier = Modifier.safeDrawingPadding().testTag("home-list"),
        contentPadding = PaddingValues(
            start = 20.dp,
            top = contentPadding.calculateTopPadding() + 18.dp,
            end = 20.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                PageHeader(
                    eyebrow = "오늘의 사주",
                    title = profile.name + "님,\n오늘의 흐름이에요.",
                    subtitle = "긴 해설보다 지금 필요한 방향부터 보여드릴게요."
                )
                TextButton(onClick = onEditProfile) { Text("프로필") }
            }
        }

        item {
            HeroInsightCard(
                label = "TODAY",
                title = reading?.today?.headline ?: "오늘의 흐름을 정리하고 있어요.",
                body = reading?.today?.good ?: "출생정보는 기기 안에서만 계산하고 저장합니다."
            )
        }

        if (reading != null) {
            item {
                SectionHeader(
                    title = "오늘의 네 가지 흐름",
                    description = "한눈에 읽고, 필요한 항목만 자세히 보세요."
                )
            }

            reading.today.items.forEach { flow ->
                item { DailyFlowRow(flow) }
            }

            item {
                SectionHeader(title = "오늘의 행동")
            }
            item {
                ActionSummary(
                    good = reading.today.good,
                    avoid = reading.today.avoid
                )
            }

            item {
                SectionHeader(
                    title = "올해의 큰 방향",
                    description = reading.year.summary
                )
            }
            item {
                InfoPill(text = reading.year.action.ifBlank { "지금 할 수 있는 한 가지부터 정리해 보세요." })
            }
        }

        item {
            SectionHeader(
                title = "두 사람의 관계",
                description = "좋고 나쁨보다 서로 다른 반응 방식과 조율할 지점을 봅니다."
            )
        }
        item {
            OutlinedButton(
                onClick = onOpenCompatibility,
                modifier = Modifier.fillMaxWidth().heightIn(min = 54.dp)
            ) { Text("두 사람 궁합 보기") }
        }
    }
}

@Composable
private fun DailyFlowRow(item: TodayItem) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 15.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Column(modifier = Modifier.weight(0.24f)) {
                Text(item.title, style = MaterialTheme.typography.titleMedium)
                Text(
                    item.label,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
            Text(
                item.text,
                modifier = Modifier.weight(0.76f),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ActionSummary(good: String, avoid: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 18.dp, vertical = 17.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("해보면 좋은 것", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
                Text(good, style = MaterialTheme.typography.bodyLarge)
            }
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                color = MaterialTheme.colorScheme.surfaceVariant
            ) {
                Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text("오늘은 줄여보기", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.tertiary)
                    Text(avoid, style = MaterialTheme.typography.bodyMedium)
                }
            }
        }
    }
}
