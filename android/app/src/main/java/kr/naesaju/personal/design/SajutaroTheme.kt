package kr.naesaju.personal.design

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val SajutaroLightColors = lightColorScheme(
    primary = MidnightInk,
    onPrimary = MoonWhite,
    secondary = MutedViolet,
    onSecondary = MoonWhite,
    tertiary = SoftRose,
    background = MoonIvory,
    onBackground = MidnightInk,
    surface = MoonWhite,
    onSurface = MidnightInk,
    surfaceVariant = MoonIvoryDeep,
    onSurfaceVariant = MidnightInkSoft,
    outline = Hairline
)

@Composable
fun SajutaroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SajutaroLightColors,
        typography = SajutaroTypography,
        content = content
    )
}
