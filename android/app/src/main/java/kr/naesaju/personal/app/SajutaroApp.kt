package kr.naesaju.personal.app

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import kr.naesaju.personal.bridge.LocalJsEngine
import kr.naesaju.personal.data.profile.ProfileStore
import kr.naesaju.personal.data.profile.UserProfile
import kr.naesaju.personal.domain.parseReadingSnapshot
import kr.naesaju.personal.feature.compatibility.CompatibilityScreen
import kr.naesaju.personal.feature.fortune.FortuneScreen
import kr.naesaju.personal.feature.home.HomeScreen
import kr.naesaju.personal.feature.onboarding.ProfileScreen
import kr.naesaju.personal.feature.saju.SajuScreen
import kr.naesaju.personal.feature.tarot.TarotScreen

@Composable
fun SajutaroApp() {
    val context = LocalContext.current.applicationContext
    val profileStore = remember(context) { ProfileStore(context) }
    val engine = remember(context) { LocalJsEngine(context) }
    val scope = rememberCoroutineScope()

    var profile by remember { mutableStateOf<UserProfile?>(null) }
    var profileLoaded by remember { mutableStateOf(false) }
    var editingProfile by rememberSaveable { mutableStateOf(false) }
    var compatibilityOpen by rememberSaveable { mutableStateOf(false) }
    var destinationName by rememberSaveable { mutableStateOf(AppDestination.HOME.name) }
    var readingRaw by remember { mutableStateOf<String?>(null) }
    var calculationError by remember { mutableStateOf("") }

    DisposableEffect(engine) {
        onDispose { engine.close() }
    }

    LaunchedEffect(profileStore) {
        profile = runCatching { profileStore.load() }.getOrNull()
        profileLoaded = true
    }

    LaunchedEffect(profile) {
        val current = profile ?: return@LaunchedEffect
        readingRaw = null
        calculationError = ""
        engine.calculate(current.toEngineRequestJson()) { result ->
            if (profile != current) return@calculate
            result.onSuccess { raw ->
                val parsed = parseReadingSnapshot(raw)
                if (parsed == null) {
                    calculationError = "계산 결과를 읽지 못했습니다. 프로필 정보를 확인해 주세요."
                } else {
                    readingRaw = raw
                }
            }.onFailure { error ->
                calculationError = error.message ?: "사주 계산 중 문제가 생겼습니다."
            }
        }
    }

    if (!profileLoaded) {
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
        return
    }

    if (profile == null || editingProfile) {
        ProfileScreen(
            initial = if (editingProfile) profile else null,
            onSave = { updated ->
                scope.launch {
                    profileStore.save(updated)
                    profile = updated
                    editingProfile = false
                    destinationName = AppDestination.HOME.name
                }
            }
        )
        return
    }

    val currentProfile = profile ?: return
    val reading = parseReadingSnapshot(readingRaw)

    if (compatibilityOpen) {
        CompatibilityScreen(
            profile = currentProfile,
            engine = engine,
            onBack = { compatibilityOpen = false }
        )
        return
    }

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
                        icon = { DestinationGlyph(selected = selected == destination) },
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
        AnimatedContent(
            targetState = selected,
            label = "main_destination",
            transitionSpec = {
                (fadeIn(tween(220)) + slideInHorizontally(tween(220)) { fullWidth -> fullWidth / 18 })
                    .togetherWith(
                        fadeOut(tween(140)) + slideOutHorizontally(tween(140)) { fullWidth -> -fullWidth / 24 }
                    )
            }
        ) { destination ->
            when (destination) {
                AppDestination.HOME -> HomeScreen(
                    profile = currentProfile,
                    reading = reading,
                    contentPadding = innerPadding,
                    onOpenCompatibility = { compatibilityOpen = true },
                    onEditProfile = { editingProfile = true }
                )
                AppDestination.SAJU -> SajuScreen(
                    profile = currentProfile,
                    reading = reading,
                    calculationError = calculationError,
                    contentPadding = innerPadding,
                    onEditProfile = { editingProfile = true }
                )
                AppDestination.FORTUNE -> FortuneScreen(
                    reading = reading,
                    calculationError = calculationError,
                    contentPadding = innerPadding
                )
                AppDestination.TAROT -> TarotScreen(
                    engine = engine,
                    contentPadding = innerPadding
                )
            }
        }
    }
}

@Composable
private fun DestinationGlyph(selected: Boolean) {
    Box(
        modifier = Modifier
            .size(if (selected) 11.dp else 9.dp)
            .background(
                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                shape = CircleShape
            )
    )
}
