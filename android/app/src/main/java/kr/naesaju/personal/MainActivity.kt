package kr.naesaju.personal

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import kr.naesaju.personal.app.SajutaroApp
import kr.naesaju.personal.design.SajutaroTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            SajutaroTheme {
                SajutaroApp()
            }
        }
    }
}
