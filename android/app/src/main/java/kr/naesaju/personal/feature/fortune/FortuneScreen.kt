package kr.naesaju.personal.feature.fortune

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.domain.ReadingSnapshot

@Composable
fun FortuneScreen(
    reading: ReadingSnapshot?,
    calculationError: String,
    contentPadding: PaddingValues
) {
    var tab by rememberSaveable { mutableStateOf("today") }

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
            Text("운세", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
            Text(
                "오늘부터 올해까지\n필요한 흐름만 봅니다.",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(top = 8.dp)
            )
            LazyRow(
                modifier = Modifier.padding(top = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item { FilterChip(selected = tab == "today", onClick = { tab = "today" }, label = { Text("오늘") }) }
                item { FilterChip(selected = tab == "year", onClick = { tab = "year" }, label = { Text("올해") }) }
                item { FilterChip(selected = tab == "months", onClick = { tab = "months" }, label = { Text("1~12월") }) }
                item { FilterChip(selected = tab == "tojeong", onClick = { tab = "tojeong" }, label = { Text("토정비결") }) }
            }
        }

        when {
            calculationError.isNotBlank() -> item { FortuneCard("계산 정보를 확인해 주세요", calculationError) }
            reading == null -> item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp), modifier = Modifier.padding(vertical = 28.dp)) {
                    CircularProgressIndicator()
                    Text("운세 흐름을 정리하고 있습니다.", style = MaterialTheme.typography.bodyLarge)
                }
            }
            tab == "today" -> {
                item { FortuneCard("오늘 한마디", reading.today.headline, emphasized = true) }
                items(reading.today.items) { flow ->
                    FortuneCard(flow.title, flow.text, meta = flow.label)
                }
                item { FortuneCard("오늘 하면 좋은 것", reading.today.good) }
                item { FortuneCard("오늘 피하면 좋은 것", reading.today.avoid) }
            }
            tab == "year" -> {
                item { FortuneCard("올해 전체 흐름", reading.year.summary, emphasized = true) }
                if (reading.year.reason.isNotBlank()) item { FortuneCard("왜 그런가요", reading.year.reason) }
                if (reading.year.action.isNotBlank()) item { FortuneCard("올해의 행동 기준", reading.year.action) }
            }
            tab == "months" -> {
                items(reading.months) { month ->
                    FortuneCard(
                        title = month.month.toString() + "월 · " + month.focus,
                        body = month.action,
                        meta = month.check + " · " + month.signal
                    )
                }
            }
            else -> {
                val tojeong = reading.tojeong
                if (tojeong == null) {
                    item { FortuneCard("토정비결", "검증된 작괘 데이터를 불러오지 못했습니다.") }
                } else {
                    item {
                        FortuneCard(
                            title = tojeong.targetYear.toString() + " 토정비결 · " + tojeong.code + "괘",
                            body = tojeong.overview.tone,
                            meta = tojeong.overview.topics.joinToString(" · "),
                            emphasized = true
                        )
                    }
                    item {
                        FortuneCard(
                            title = "올해 행동 기준",
                            body = tojeong.overview.action,
                            meta = tojeong.overview.note
                        )
                    }
                    items(tojeong.months) { month ->
                        FortuneCard(
                            title = month.month.toString() + "월 · " + month.guide.tone,
                            body = month.guide.action,
                            meta = month.guide.topics.joinToString(" · ")
                        )
                    }
                    item {
                        FortuneCard(
                            title = "계산 기준",
                            body = tojeong.methodName,
                            meta = tojeong.reference
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun FortuneCard(
    title: String,
    body: String,
    meta: String = "",
    emphasized: Boolean = false
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (emphasized) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 22.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                title,
                style = MaterialTheme.typography.titleMedium,
                color = if (emphasized) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
            )
            Text(
                body,
                style = MaterialTheme.typography.bodyLarge,
                color = if (emphasized) MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurfaceVariant
            )
            if (meta.isNotBlank()) {
                Text(
                    meta,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (emphasized) {
                        MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.78f)
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
            }
        }
    }
}
