package kr.naesaju.personal.feature.compatibility

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.bridge.SajuEngineGateway
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.HeroInsightCard
import kr.naesaju.personal.design.InsightCard
import kr.naesaju.personal.design.PageHeader
import kr.naesaju.personal.domain.CompatibilityReading
import kr.naesaju.personal.domain.parseCompatibilityReading
import org.json.JSONObject

@Composable
fun CompatibilityScreen(
    profile: UserProfile,
    engine: SajuEngineGateway,
    onBack: () -> Unit
) {
    var partnerName by rememberSaveable { mutableStateOf("") }
    var birthDate by rememberSaveable { mutableStateOf("") }
    var birthTime by rememberSaveable { mutableStateOf("12:00") }
    var gender by rememberSaveable { mutableStateOf("female") }
    var result by remember { mutableStateOf<CompatibilityReading?>(null) }
    var error by rememberSaveable { mutableStateOf("") }
    var loading by rememberSaveable { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize().testTag("compatibility-list"),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(
            start = 18.dp,
            top = 18.dp,
            end = 18.dp,
            bottom = 30.dp
        ),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            TextButton(onClick = onBack) { Text("← 홈") }
            PageHeader(
                eyebrow = "궁합",
                title = "점수보다
서로 다른 방식을 봅니다.",
                subtitle = "대화와 생활에서 부딪히기 쉬운 지점, 맞추기 쉬운 지점, 조율 방법을 나눠서 봅니다."
            )
        }

        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(11.dp)
                ) {
                    Text("상대 정보", style = MaterialTheme.typography.titleLarge)
                    OutlinedTextField(
                        value = partnerName,
                        onValueChange = { partnerName = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("이름 또는 닉네임") },
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = birthDate,
                        onValueChange = {
                            val digits = it.filter(Char::isDigit).take(8)
                            birthDate = when {
                                digits.length <= 4 -> digits
                                digits.length <= 6 -> digits.take(4) + "-" + digits.drop(4)
                                else -> digits.take(4) + "-" + digits.substring(4, 6) + "-" + digits.drop(6)
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("상대 생년월일") },
                        supportingText = { Text("양력 기준 · 숫자 8자리") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                    OutlinedTextField(
                        value = birthTime,
                        onValueChange = {
                            val digits = it.filter(Char::isDigit).take(4)
                            birthTime = if (digits.length <= 2) digits else digits.take(2) + ":" + digits.drop(2)
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("상대 출생시간") },
                        supportingText = { Text("모르면 12:00을 그대로 사용하세요.") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                }
            }
        }

        item {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(9.dp)
                ) {
                    Text("상대 성별", style = MaterialTheme.typography.titleMedium)
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        FilterChip(selected = gender == "male", onClick = { gender = "male" }, label = { Text("남성") })
                        FilterChip(selected = gender == "female", onClick = { gender = "female" }, label = { Text("여성") })
                    }
                }
            }
        }

        if (error.isNotBlank()) {
            item { Text(error, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.error) }
        }

        item {
            Button(
                enabled = !loading,
                modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp),
                onClick = {
                    error = validatePartner(birthDate, birthTime)
                    if (error.isNotBlank()) return@Button

                    loading = true
                    result = null
                    val second = JSONObject()
                        .put("calendar", "solar")
                        .put("birthDate", birthDate)
                        .put("birthTime", birthTime)
                        .put("birthTimeKnown", true)
                        .put("gender", gender)
                        .put("precision", false)
                    val request = JSONObject()
                        .put("first", JSONObject(profile.toEngineRequestJson()))
                        .put("second", second)
                        .toString()

                    engine.calculateCompatibility(request) { call ->
                        loading = false
                        call.onSuccess { raw ->
                            result = parseCompatibilityReading(raw)
                            if (result == null) error = "궁합 결과를 읽지 못했습니다. 입력을 다시 확인해 주세요."
                        }.onFailure {
                            error = it.message ?: "궁합 계산 중 문제가 생겼습니다."
                        }
                    }
                }
            ) {
                Text(if (loading) "관계 흐름을 계산하는 중..." else "관계 흐름 보기")
            }
        }

        result?.let { reading ->
            item {
                HeroInsightCard(
                    label = if (partnerName.isBlank()) "두 사람의 관계" else profile.name + " · " + partnerName,
                    title = reading.summary,
                    body = "아래에서 관계의 강점과 조율할 지점을 나눠 확인해 보세요."
                )
            }
            items(reading.sections) { section ->
                InsightCard(section.title, section.text)
            }
            item {
                Text(
                    reading.note,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

private fun validatePartner(date: String, time: String): String {
    val dateMatch = Regex("""^(\d{4})-(\d{2})-(\d{2})$""").matchEntire(date)
        ?: return "상대 생년월일을 8자리로 입력해 주세요."
    val year = dateMatch.groupValues[1].toIntOrNull() ?: return "상대 출생연도를 확인해 주세요."
    val month = dateMatch.groupValues[2].toIntOrNull() ?: return "상대 출생월을 확인해 주세요."
    val day = dateMatch.groupValues[3].toIntOrNull() ?: return "상대 출생일을 확인해 주세요."
    if (year !in 1900..2099 || month !in 1..12 || day !in 1..31) {
        return "지원 범위 안의 생년월일인지 확인해 주세요."
    }

    val timeMatch = Regex("""^(\d{2}):(\d{2})$""").matchEntire(time)
        ?: return "상대 출생시간을 4자리로 입력해 주세요."
    val hour = timeMatch.groupValues[1].toIntOrNull() ?: return "상대 출생시간을 확인해 주세요."
    val minute = timeMatch.groupValues[2].toIntOrNull() ?: return "상대 출생분을 확인해 주세요."
    if (hour !in 0..23 || minute !in 0..59) return "상대 출생시간은 00:00~23:59 범위여야 합니다."
    return ""
}
