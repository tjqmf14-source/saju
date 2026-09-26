package kr.naesaju.personal.feature.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.design.PageHeader

@Composable
fun ProfileScreen(
    initial: UserProfile? = null,
    onSave: (UserProfile) -> Unit
) {
    var name by rememberSaveable(initial) { mutableStateOf(initial?.name.orEmpty()) }
    var calendar by rememberSaveable(initial) { mutableStateOf(initial?.calendar ?: "solar") }
    var isLeap by rememberSaveable(initial) { mutableStateOf(initial?.isLeap ?: false) }
    var birthDate by rememberSaveable(initial) { mutableStateOf(initial?.birthDate.orEmpty()) }
    var birthTime by rememberSaveable(initial) { mutableStateOf(initial?.birthTime ?: "12:00") }
    var birthTimeKnown by rememberSaveable(initial) { mutableStateOf(initial?.birthTimeKnown ?: true) }
    var gender by rememberSaveable(initial) { mutableStateOf(initial?.gender ?: "male") }
    var error by rememberSaveable { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .safeDrawingPadding()
                .imePadding()
                .testTag("profile-list"),
            contentPadding = androidx.compose.foundation.layout.PaddingValues(
                start = 18.dp,
                top = 18.dp,
                end = 18.dp,
                bottom = 24.dp
            ),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                PageHeader(
                    eyebrow = "사주타로",
                    title = if (initial == null) "처음 한 번만
나를 알려주세요." else "프로필을
다시 확인해 주세요.",
                    subtitle = "입력한 정보는 기기 안에서만 계산하고 저장합니다."
                )
            }

            item {
                FormCard("이름") {
                    OutlinedTextField(
                        value = name,
                        onValueChange = { name = it },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("이름 또는 닉네임") },
                        singleLine = true
                    )
                }
            }

            item {
                FormCard("달력 기준") {
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        FilterChip(
                            selected = calendar == "solar",
                            onClick = {
                                calendar = "solar"
                                isLeap = false
                            },
                            label = { Text("양력") }
                        )
                        FilterChip(
                            selected = calendar == "lunar",
                            onClick = { calendar = "lunar" },
                            label = { Text("음력") }
                        )
                    }
                    if (calendar == "lunar") {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text("윤달로 태어났어요", style = MaterialTheme.typography.bodyLarge)
                                Text(
                                    "윤달 생일인 경우에만 켜주세요.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                            Switch(checked = isLeap, onCheckedChange = { isLeap = it })
                        }
                    }
                }
            }

            item {
                FormCard("생년월일") {
                    OutlinedTextField(
                        value = birthDate,
                        onValueChange = { birthDate = formatDate(it) },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("생년월일") },
                        supportingText = { Text("숫자 8자리만 입력해도 자동으로 정리됩니다.") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true
                    )
                }
            }

            item {
                FormCard("출생시간") {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text("출생시간을 알고 있어요", style = MaterialTheme.typography.titleMedium)
                            Text(
                                "모르면 정오 기준으로 계산하고 결과에 표시합니다.",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Switch(
                            checked = birthTimeKnown,
                            onCheckedChange = { birthTimeKnown = it }
                        )
                    }
                    if (birthTimeKnown) {
                        OutlinedTextField(
                            value = birthTime,
                            onValueChange = { birthTime = formatTime(it) },
                            modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                            label = { Text("출생시간") },
                            supportingText = { Text("예: 1145 → 11:45") },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true
                        )
                    }
                }
            }

            item {
                FormCard("성별") {
                    Row(horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        FilterChip(
                            selected = gender == "male",
                            onClick = { gender = "male" },
                            label = { Text("남성") }
                        )
                        FilterChip(
                            selected = gender == "female",
                            onClick = { gender = "female" },
                            label = { Text("여성") }
                        )
                    }
                }
            }

            if (error.isNotBlank()) {
                item {
                    Text(
                        text = error,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.error
                    )
                }
            }

            item {
                Button(
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp),
                    onClick = {
                        error = validateProfile(birthDate, birthTime, birthTimeKnown)
                        if (error.isBlank()) {
                            onSave(
                                UserProfile(
                                    name = name.trim().ifBlank { "사용자" },
                                    calendar = calendar,
                                    birthDate = birthDate,
                                    birthTime = if (birthTimeKnown) birthTime else "12:00",
                                    birthTimeKnown = birthTimeKnown,
                                    gender = gender,
                                    isLeap = calendar == "lunar" && isLeap
                                )
                            )
                        }
                    }
                ) {
                    Text(if (initial == null) "내 사주 시작하기" else "프로필 저장하기")
                }
            }
        }
    }
}

@Composable
private fun FormCard(
    title: String,
    content: @Composable ColumnScope.() -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        color = MaterialTheme.colorScheme.surface
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 15.dp),
            verticalArrangement = Arrangement.spacedBy(9.dp)
        ) {
            Text(title, style = MaterialTheme.typography.labelLarge, color = MaterialTheme.colorScheme.secondary)
            content()
        }
    }
}

private fun formatDate(value: String): String {
    val digits = value.filter(Char::isDigit).take(8)
    return when {
        digits.length <= 4 -> digits
        digits.length <= 6 -> digits.take(4) + "-" + digits.drop(4)
        else -> digits.take(4) + "-" + digits.substring(4, 6) + "-" + digits.drop(6)
    }
}

private fun formatTime(value: String): String {
    val digits = value.filter(Char::isDigit).take(4)
    return if (digits.length <= 2) digits else digits.take(2) + ":" + digits.drop(2)
}

private fun validateProfile(
    birthDate: String,
    birthTime: String,
    birthTimeKnown: Boolean
): String {
    val dateMatch = Regex("""^(\d{4})-(\d{2})-(\d{2})$""").matchEntire(birthDate)
        ?: return "생년월일을 8자리로 입력해 주세요."
    val year = dateMatch.groupValues[1].toIntOrNull() ?: return "출생연도를 확인해 주세요."
    val month = dateMatch.groupValues[2].toIntOrNull() ?: return "출생월을 확인해 주세요."
    val day = dateMatch.groupValues[3].toIntOrNull() ?: return "출생일을 확인해 주세요."
    if (year !in 1900..2099 || month !in 1..12 || day !in 1..31) {
        return "지원 범위 안의 생년월일인지 확인해 주세요."
    }

    if (birthTimeKnown) {
        val timeMatch = Regex("""^(\d{2}):(\d{2})$""").matchEntire(birthTime)
            ?: return "출생시간을 4자리로 입력해 주세요."
        val hour = timeMatch.groupValues[1].toIntOrNull() ?: return "출생시간을 확인해 주세요."
        val minute = timeMatch.groupValues[2].toIntOrNull() ?: return "출생분을 확인해 주세요."
        if (hour !in 0..23 || minute !in 0..59) return "출생시간을 00:00~23:59 범위로 입력해 주세요."
    }
    return ""
}
