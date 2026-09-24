package kr.naesaju.personal.feature.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import kr.naesaju.personal.domain.ReadingSnapshot
import kr.naesaju.personal.domain.TodayItem

@Composable
fun HomeScreen(
    profile: UserProfile,
    reading: ReadingSnapshot?,
    contentPadding: PaddingValues,
    onOpenSaju: () -> Unit,
    onOpenFortune: () -> Unit,
    onOpenTarot: () -> Unit,
    onOpenCompatibility: () -> Unit,
    onEditProfile: () -> Unit
) {
    LazyColumn(
        modifier = Modifier.safeDrawingPadding().testTag("home-list"),
        contentPadding = PaddingValues(
            start = 20.dp,
            top = contentPadding.calculateTopPadding() + 24.dp,
            end = 20.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "사주타로",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.secondary
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = profile.name + "님,\n오늘은 이렇게 읽혀요.",
                        style = MaterialTheme.typography.headlineMedium,
                        color = MaterialTheme.colorScheme.onBackground
                    )
                }
                TextButton(onClick = onEditProfile) { Text("프로필") }
            }
        }

        item {
            HighlightCard(
                eyebrow = "오늘의 한마디",
                title = reading?.today?.headline ?: "기기 안에서 오늘의 흐름을 계산하고 있습니다.",
                body = reading?.headline ?: "출생정보는 외부로 전송하지 않습니다."
            )
        }

        if (reading != null) {
            item {
                SectionTitle(
                    title = "오늘의 흐름",
                    description = "점수보다 지금 어떤 태도가 도움이 되는지 짧게 정리합니다."
                )
            }

            reading.today.items.chunked(2).forEach { pair ->
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        pair.forEach { flow ->
                            FlowCard(item = flow, modifier = Modifier.weight(1f))
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }

            item {
                AdviceCard(
                    title = "지금 필요한 행동",
                    body = reading.today.good
                )
            }

            item {
                SectionTitle(
                    title = "올해 한눈에",
                    description = reading.year.summary
                )
            }
        }

        item {
            SectionTitle(
                title = "빠르게 보기",
                description = "필요한 순간에 바로 들어갈 수 있게 핵심 기능만 남겼습니다."
            )
        }

        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Button(
                    onClick = onOpenSaju,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)
                ) { Text("내 사주 자세히 보기") }
                OutlinedButton(
                    onClick = onOpenFortune,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)
                ) { Text("오늘 · 올해 · 월별 운세") }
                OutlinedButton(
                    onClick = onOpenTarot,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)
                ) { Text("타로 카드 펼치기") }
                OutlinedButton(
                    onClick = onOpenCompatibility,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp)
                ) { Text("두 사람 궁합 보기") }
            }
        }
    }
}

@Composable
private fun HighlightCard(
    eyebrow: String,
    title: String,
    body: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.primary)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 22.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(eyebrow, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.tertiary)
            Text(title, style = MaterialTheme.typography.titleLarge, color = MaterialTheme.colorScheme.onPrimary)
            Text(
                body,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.82f)
            )
        }
    }
}

@Composable
private fun FlowCard(item: TodayItem, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(22.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(item.title, style = MaterialTheme.typography.titleMedium)
            Text(item.label, style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.secondary)
            Text(
                item.text,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                maxLines = 4
            )
        }
    }
}

@Composable
private fun AdviceCard(title: String, body: String) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 22.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(title, style = MaterialTheme.typography.titleMedium)
            Text(body, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun SectionTitle(title: String, description: String) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(text = title, style = MaterialTheme.typography.titleLarge)
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
