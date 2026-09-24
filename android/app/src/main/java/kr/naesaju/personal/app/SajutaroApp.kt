package kr.naesaju.personal.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kr.naesaju.personal.feature.home.HomeScreen

@Composable
fun SajutaroApp() {
    var destinationName by rememberSaveable { mutableStateOf(AppDestination.HOME.name) }
    val selected = AppDestination.valueOf(destinationName)

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar(
                modifier = Modifier.semantics {
                    contentDescription = "주요 메뉴: 홈, 사주, 운세, 타로"
                },
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                AppDestination.entries.forEach { destination ->
                    NavigationBarItem(
                        modifier = Modifier.heightIn(min = 56.dp),
                        selected = selected == destination,
                        onClick = { destinationName = destination.name },
                        icon = {
                            DestinationGlyph(selected = selected == destination)
                        },
                        label = {
                            Text(
                                text = destination.label,
                                style = MaterialTheme.typography.labelMedium
                            )
                        },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.primary,
                            selectedTextColor = MaterialTheme.colorScheme.primary,
                            indicatorColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
            }
        }
    ) { innerPadding ->
        when (selected) {
            AppDestination.HOME -> HomeScreen(contentPadding = innerPadding)
            AppDestination.SAJU -> PlaceholderDestination(
                title = "사주",
                message = "나를 이해하는 핵심 해설을 이곳에 담습니다.",
                modifier = Modifier.fillMaxSize()
            )
            AppDestination.FORTUNE -> PlaceholderDestination(
                title = "운세",
                message = "오늘 · 올해 · 토정비결을 한 흐름으로 정리합니다.",
                modifier = Modifier.fillMaxSize()
            )
            AppDestination.TAROT -> PlaceholderDestination(
                title = "타로",
                message = "질문에서 카드 선택까지 몰입감 있게 이어집니다.",
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun DestinationGlyph(selected: Boolean) {
    Box(
        modifier = Modifier
            .size(if (selected) 11.dp else 9.dp)
            .background(
                color = if (selected) {
                    MaterialTheme.colorScheme.primary
                } else {
                    MaterialTheme.colorScheme.onSurfaceVariant
                },
                shape = CircleShape
            )
    )
}

@Composable
private fun PlaceholderDestination(
    title: String,
    message: String,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier, contentAlignment = Alignment.Center) {
        Text(
            text = "$title\n$message",
            style = MaterialTheme.typography.bodyLarge
        )
    }
}
