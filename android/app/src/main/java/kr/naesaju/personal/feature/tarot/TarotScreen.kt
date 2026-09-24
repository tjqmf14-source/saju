package kr.naesaju.personal.feature.tarot

import android.graphics.BitmapFactory
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.bridge.SajuEngineGateway
import kr.naesaju.personal.domain.TarotCardReading
import kr.naesaju.personal.domain.TarotReading
import kr.naesaju.personal.domain.parseTarotReading
import org.json.JSONObject

@Composable
fun TarotScreen(
    engine: SajuEngineGateway,
    contentPadding: PaddingValues
) {
    var count by rememberSaveable { mutableStateOf(1) }
    var mode by rememberSaveable { mutableStateOf("today") }
    var reading by remember { mutableStateOf<TarotReading?>(null) }
    var error by rememberSaveable { mutableStateOf("") }
    var drawing by rememberSaveable { mutableStateOf(false) }

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
            Text("타로", style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.tertiary)
            Text(
                "질문을 정하고\n카드를 펼쳐보세요.",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(top = 8.dp)
            )
            Text(
                "미래를 확정하는 답이 아니라 지금 놓친 관점을 확인하는 용도로 사용합니다.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 10.dp)
            )
        }

        item {
            Text("카드 수", style = MaterialTheme.typography.titleMedium)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 8.dp)) {
                FilterChip(
                    selected = count == 1,
                    onClick = {
                        count = 1
                        mode = "today"
                        reading = null
                    },
                    label = { Text("1장") }
                )
                FilterChip(
                    selected = count == 3,
                    onClick = {
                        count = 3
                        if (mode == "today") mode = "question"
                        reading = null
                    },
                    label = { Text("3장") }
                )
            }
        }

        if (count == 3) {
            item {
                Text("질문 유형", style = MaterialTheme.typography.titleMedium)
                LazyRow(
                    contentPadding = PaddingValues(top = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(
                        listOf(
                            "question" to "일반",
                            "career" to "일",
                            "money" to "돈",
                            "love" to "관계"
                        )
                    ) { option ->
                        FilterChip(
                            selected = mode == option.first,
                            onClick = {
                                mode = option.first
                                reading = null
                            },
                            label = { Text(option.second) }
                        )
                    }
                }
            }
        }

        item {
            Button(
                enabled = !drawing,
                modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp),
                onClick = {
                    drawing = true
                    error = ""
                    val request = JSONObject().put("count", count).put("mode", mode).toString()
                    engine.drawTarot(request) { result ->
                        drawing = false
                        result.onSuccess { raw ->
                            reading = parseTarotReading(raw)
                            if (reading == null) {
                                error = "카드 결과를 읽지 못했습니다. 다시 시도해 주세요."
                            }
                        }.onFailure {
                            error = it.message ?: "카드를 펼치는 중 문제가 생겼습니다."
                        }
                    }
                }
            ) {
                Text(if (drawing) "카드를 섞는 중..." else if (count == 1) "오늘의 카드 뽑기" else "3장 펼치기")
            }
        }

        if (error.isNotBlank()) {
            item {
                Text(error, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.error)
            }
        }

        reading?.let { result ->
            items(result.cards) { card ->
                TarotReadingCard(card)
            }
        }
    }
}

@Composable
private fun TarotReadingCard(card: TarotCardReading) {
    Card(
        modifier = Modifier.fillMaxWidth().animateContentSize(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 20.dp, vertical = 22.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(card.position, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.tertiary)
            AssetTarotImage(card)
            Text(card.name + " · " + card.orientation, style = MaterialTheme.typography.titleLarge)
            Text(card.keywords, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text(card.meaning, style = MaterialTheme.typography.bodyLarge)
            Text("행동 조언", style = MaterialTheme.typography.titleMedium)
            Text(card.advice, style = MaterialTheme.typography.bodyLarge, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
private fun AssetTarotImage(card: TarotCardReading) {
    val context = LocalContext.current
    val bitmap = remember(card.imagePath) {
        runCatching {
            context.assets.open(card.imagePath).use { stream ->
                BitmapFactory.decodeStream(stream)
            }
        }.getOrNull()
    }

    Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
        if (bitmap != null) {
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = card.name + " 카드 이미지",
                modifier = Modifier
                    .fillMaxWidth(0.58f)
                    .aspectRatio(0.58f)
                    .clip(RoundedCornerShape(18.dp))
                    .graphicsLayer { rotationZ = if (card.reversed) 180f else 0f },
                contentScale = ContentScale.Fit
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.58f)
                    .aspectRatio(0.58f)
                    .clip(RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(card.name, style = MaterialTheme.typography.titleMedium)
            }
        }
    }
}
