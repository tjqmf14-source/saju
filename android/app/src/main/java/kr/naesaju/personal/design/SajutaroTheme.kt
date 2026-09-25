package kr.naesaju.personal.design

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val SajutaroLightColors = lightColorScheme(
    primary = MidnightInk,
    onPrimary = MoonWhite,
    primaryContainer = PaleViolet,
    onPrimaryContainer = PaleVioletInk,
    secondary = MutedViolet,
    onSecondary = MoonWhite,
    secondaryContainer = PaleViolet,
    onSecondaryContainer = PaleVioletInk,
    tertiary = SoftRose,
    onTertiary = MoonWhite,
    tertiaryContainer = PaleRose,
    onTertiaryContainer = PaleRoseInk,
    background = MoonIvory,
    onBackground = MidnightInk,
    surface = MoonWhite,
    onSurface = MidnightInk,
    surfaceVariant = MoonIvoryDeep,
    onSurfaceVariant = MidnightInkSoft,
    outline = Hairline,
    outlineVariant = OutlineSoft
)

@Composable
fun SajutaroTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = SajutaroLightColors,
        typography = SajutaroTypography,
        content = content
    )
}
