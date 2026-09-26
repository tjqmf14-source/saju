package kr.naesaju.personal.feature.fortune

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import kr.naesaju.personal.design.HeroInsightCard
import kr.naesaju.personal.design.InsightCard
import kr.naesaju.personal.design.PageHeader
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
            start = 18.dp,
            top = contentPadding.calculateTopPadding() + 18.dp,
            end = 18.dp,
            bottom = contentPadding.calculateBottomPadding() + 24.dp
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            PageHeader(
                eyebrow = "운세",
                title = "지금 필요한 흐름만",
                subtitle = "오늘부터 올해까지 필요한 흐름만 보고, 월별·토정비결도 같은 기준으로 비교합니다."
            )
            LazyRow(
                modifier = Modifier.padding(top = 14.dp),
                horizontalArrangement = Arrangement.spacedBy(7.dp)
            ) {
                item { FilterChip(selected = tab == "today", onClick = { tab = "today" }, label = { Text("오늘") }) }
                item { FilterChip(selected = tab == "year", onClick = { tab = "year" }, label = { Text("올해") }) }
                item { FilterChip(selected = tab == "months", onClick = { tab = "months" }, label = { Text("1~12월") }) }
                item { FilterChip(selected = tab == "tojeong", onClick = { tab = "tojeong" }, label = { Text("토정비결") }) }
            }
        }

        when {
            calculationError.isNotBlank() -> item {
                InsightCard("계산 정보를 확인해 주세요", calculationError)
            }
            reading == null -> item {
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp)
                ) {
                    CircularProgressIndicator()
                    Text("운세 흐름을 정리하고 있습니다.", style = MaterialTheme.typography.bodyLarge)
                }
            }
            tab == "today" -> {
                item {
                    HeroInsightCard(
                        label = "오늘 한마디",
                        title = reading.today.headline,
                        body = "오늘의 네 영역을 아래에서 하나씩 확인해 보세요."
                    )
                }
                items(reading.today.items) { flow ->
                    InsightCard(
                        title = flow.title,
                        body = flow.text,
                        meta = "현재 흐름 · " + flow.label
                    )
                }
                item { InsightCard("오늘 하면 좋은 것", reading.today.good, accent = true) }
                item { InsightCard("오늘 피하면 좋은 것", reading.today.avoid) }
            }
            tab == "year" -> {
                item {
                    HeroInsightCard(
                        label = "올해 전체 흐름",
                        title = reading.year.summary,
                        body = reading.year.reason
                    )
                }
                if (reading.year.action.isNotBlank()) {
                    item { InsightCard("올해의 행동 기준", reading.year.action, accent = true) }
                }
            }
            tab == "months" -> {
                items(reading.months) { month ->
                    InsightCard(
                        title = month.month.toString() + "월 · " + month.focus,
                        body = month.action,
                        meta = month.check + " · " + month.signal
                    )
                }
            }
            else -> {
                val tojeong = reading.tojeong
                if (tojeong == null) {
                    item { InsightCard("토정비결", "검증된 작괘 데이터를 불러오지 못했습니다.") }
                } else {
                    item {
                        HeroInsightCard(
                            label = tojeong.targetYear.toString() + " 토정비결 · " + tojeong.code + "괘",
                            title = tojeong.overview.tone,
                            body = tojeong.overview.topics.joinToString(" · ")
                        )
                    }
                    item {
                        InsightCard(
                            title = "올해 행동 기준",
                            body = tojeong.overview.action,
                            meta = tojeong.overview.note,
                            accent = true
                        )
                    }
                    items(tojeong.months) { month ->
                        InsightCard(
                            title = month.month.toString() + "월 · " + month.guide.tone,
                            body = month.guide.action,
                            meta = month.guide.topics.joinToString(" · ")
                        )
                    }
                    item {
                        InsightCard(
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