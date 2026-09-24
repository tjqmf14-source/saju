package kr.naesaju.personal.bridge

import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import org.json.JSONObject
import org.json.JSONTokener
import java.io.ByteArrayInputStream
import java.util.ArrayDeque

class LocalJsEngine(context: Context) : SajuEngineGateway {
    private val appContext = context.applicationContext
    private val mainHandler = Handler(Looper.getMainLooper())
    private val pending = ArrayDeque<PendingRequest>()
    private var webView: WebView? = null
    private var ready = false
    private var closed = false

    init {
        mainHandler.post {
            if (!closed) {
                webView = createEngineView().also { it.loadUrl(ENGINE_URL) }
            }
        }
    }

    override fun calculate(requestJson: String, callback: (Result<String>) -> Unit) {
        enqueue("calculate", requestJson, callback)
    }

    override fun calculateCompatibility(requestJson: String, callback: (Result<String>) -> Unit) {
        enqueue("calculateCompatibility", requestJson, callback)
    }

    override fun drawTarot(requestJson: String, callback: (Result<String>) -> Unit) {
        enqueue("drawTarot", requestJson, callback)
    }

    private fun enqueue(
        method: String,
        requestJson: String,
        callback: (Result<String>) -> Unit
    ) {
        mainHandler.post {
            if (closed) {
                callback(Result.failure(IllegalStateException("사주 계산 엔진이 종료되었습니다.")))
                return@post
            }

            val request = PendingRequest(method, requestJson, callback)
            if (!ready || webView == null) {
                pending.addLast(request)
                return@post
            }

            evaluate(request)
        }
    }

    override fun close() {
        mainHandler.post {
            if (closed) return@post
            closed = true
            ready = false
            val error = IllegalStateException("사주 계산 엔진이 종료되었습니다.")
            while (pending.isNotEmpty()) {
                pending.removeFirst().callback(Result.failure(error))
            }
            webView?.apply {
                stopLoading()
                loadUrl("about:blank")
                clearHistory()
                destroy()
            }
            webView = null
        }
    }

    private fun createEngineView(): WebView {
        return WebView(appContext).apply {
            setBackgroundColor(android.graphics.Color.TRANSPARENT)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = false
            settings.blockNetworkLoads = true
            settings.allowContentAccess = false
            settings.allowFileAccess = true
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.Q) {
                @Suppress("DEPRECATION")
                run {
                    settings.allowFileAccessFromFileURLs = false
                    settings.allowUniversalAccessFromFileURLs = false
                }
            }
            settings.javaScriptCanOpenWindowsAutomatically = false
            settings.setSupportMultipleWindows(false)
            settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            settings.mediaPlaybackRequiresUserGesture = true
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                settings.safeBrowsingEnabled = true
            }
            webViewClient = LocalOnlyClient()
        }
    }

    private fun evaluate(request: PendingRequest) {
        val view = webView
        if (view == null || !ready) {
            pending.addFirst(request)
            return
        }

        val quoted = JSONObject.quote(request.json)
        val script = "globalThis.SajutaroEngine." + request.method + "(" + quoted + ")"
        view.evaluateJavascript(script) { encoded ->
            try {
                val decoded = JSONTokener(encoded).nextValue() as? String
                    ?: throw IllegalStateException("계산 결과 형식이 올바르지 않습니다.")
                request.callback(Result.success(decoded))
            } catch (error: Throwable) {
                request.callback(Result.failure(error))
            }
        }
    }

    private fun markReady() {
        val view = webView ?: return
        view.evaluateJavascript(
            "Boolean(globalThis.SajutaroEngine && globalThis.SajutaroEngine.calculate && globalThis.SajutaroEngine.calculateCompatibility && globalThis.SajutaroEngine.drawTarot)"
        ) { result ->
            ready = result == "true"
            if (!ready) {
                val error = IllegalStateException("로컬 사주 계산 엔진을 불러오지 못했습니다.")
                while (pending.isNotEmpty()) {
                    pending.removeFirst().callback(Result.failure(error))
                }
                return@evaluateJavascript
            }
            while (pending.isNotEmpty()) {
                evaluate(pending.removeFirst())
            }
        }
    }

    private inner class LocalOnlyClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
            return !isEngineAsset(request.url)
        }

        override fun shouldInterceptRequest(
            view: WebView,
            request: WebResourceRequest
        ): WebResourceResponse? {
            return if (isEngineAsset(request.url)) null else blockedResponse()
        }

        override fun onPageFinished(view: WebView, url: String) {
            if (url == ENGINE_URL) markReady()
        }
    }

    private data class PendingRequest(
        val method: String,
        val json: String,
        val callback: (Result<String>) -> Unit
    )

    companion object {
        private const val ENGINE_URL = "file:///android_asset/engine/host.html"
        private const val ENGINE_PATH_PREFIX = "/android_asset/engine/"

        private fun isEngineAsset(uri: Uri): Boolean {
            return uri.scheme.equals("file", ignoreCase = true) &&
                uri.path?.startsWith(ENGINE_PATH_PREFIX) == true
        }

        private fun blockedResponse(): WebResourceResponse {
            return WebResourceResponse(
                "text/plain",
                "UTF-8",
                403,
                "Forbidden",
                mapOf("Cache-Control" to "no-store"),
                ByteArrayInputStream(ByteArray(0))
            )
        }
    }
}
