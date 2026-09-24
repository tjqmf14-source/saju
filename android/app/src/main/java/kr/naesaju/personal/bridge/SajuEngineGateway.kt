package kr.naesaju.personal.bridge

interface SajuEngineGateway : AutoCloseable {
    fun calculate(requestJson: String, callback: (Result<String>) -> Unit)

    fun drawTarot(requestJson: String, callback: (Result<String>) -> Unit)

    override fun close()
}
