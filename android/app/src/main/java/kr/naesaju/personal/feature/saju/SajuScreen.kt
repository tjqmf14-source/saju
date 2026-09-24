package kr.naesaju.personal.feature.saju

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.data.profile.UserProfile
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
            top = contentPadding.calculateTopPadding() + 24.dp,
            end = 20.dp,
            bottom = contentPadding.calculateBottomPadding() + 28.dp
        ),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text("사주", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
            Text(
                profile.name + "님의\n기본 흐름",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(top = 8.dp)
            )
            val calendarText = if (profile.calendar == "lunar") "음력" else "양력"
            val timeText = if (profile.birthTimeKnown) profile.birthTime else "출생시간 모름"
            Text(
                calendarText + " " + profile.birthDate + " · " + timeText,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )
            TextButton(onClick = onEditProfile, modifier = Modifier.padding(top = 2.dp)) {
                Text("프로필 수정")
            }
        }

        when {
            calculationError.isNotBlank() -> item {
                MessageCard(
                    title = "계산 정보를 확인해 주세요",
                    body = calculationError
                )
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
                    MessageCard(
                        title = "나를 한 문장으로",
                        body = reading.headline,
                        emphasized = true
                    )
                }
                items(reading.sajuSections.filterNot { it.title == "나를 한 문장으로" }) { section ->
                    GuidanceCard(section)
                }
            }
        }
    }
}

@Composable
private fun GuidanceCard(section: GuidanceSection) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 22.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(section.title, style = MaterialTheme.typography.titleLarge)
            if (section.summary.isNotBlank()) {
                Text(section.summary, style = MaterialTheme.typography.bodyLarge)
            }
            if (section.reason.isNotBlank()) {
                Text(
                    section.reason,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            if (section.action.isNotBlank()) {
                Text(
                    section.action,
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
        }
    }
}

@Composable
private fun MessageCard(
    title: String,
    body: String,
    emphasized: Boolean = false
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (emphasized) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 22.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                title,
                style = MaterialTheme.typography.titleLarge,
                color = if (emphasized) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
            )
            Text(
                body,
                style = MaterialTheme.typography.bodyLarge,
                color = if (emphasized) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
