package com.horscopeapp

import android.util.Log
import java.io.DataOutputStream

/**
 * Best-effort hard system-UI suppression for rooted devices. Only meaningful when
 * ConfigHolder.requireRoot is true AND `su` is present. Every call is a no-op (logged)
 * when root is unavailable; nothing here ever throws to the caller.
 */
object RootUtil {

  private const val TAG = "Kiosk"

  fun isRootAvailable(): Boolean = runSuCommands(listOf("id")) != null

  /** Push the system bars off-screen, then attempt to stop SystemUI entirely. */
  fun killSystemUi() {
    val ok = runSuCommands(
      listOf(
        // Push status/nav bars off the visible area as a fallback.
        "wm overscan 0,0,0,-200",
        // Hard kill: stops the bars from rendering at all until next boot.
        "am force-stop com.android.systemui",
      ),
    )
    if (ok == null) Log.w(TAG, "killSystemUi: root unavailable, skipping (immersive mode only)")
    else Log.i(TAG, "killSystemUi: applied via su")
  }

  /** Undo overscan and let SystemUI come back (used on operator exit). */
  fun restoreSystemUi() {
    runSuCommands(listOf("wm overscan reset"))
  }

  /**
   * Runs commands through `su`. Returns null if su is missing or the shell exits
   * non-zero (treated as "no root"); never propagates an exception.
   */
  private fun runSuCommands(commands: List<String>): Unit? {
    return try {
      val process = Runtime.getRuntime().exec("su")
      DataOutputStream(process.outputStream).use { os ->
        commands.forEach { os.writeBytes(it + "\n") }
        os.writeBytes("exit\n")
        os.flush()
      }
      if (process.waitFor() == 0) Unit else null
    } catch (t: Throwable) {
      null
    }
  }
}
