package com.horscopeapp

import android.content.Context
import android.util.Log
import org.json.JSONObject

/**
 * Per-device kiosk configuration. Each lockdown layer is independently toggleable.
 *
 * Resolution order on init():
 *   1. defaults below
 *   2. SharedPreferences ("kiosk_config")
 *   3. optional JSON overlay at filesDir/kiosk_config.json (lets you re-provision a
 *      device by dropping a file, no rebuild). Values found there are persisted back
 *      into SharedPreferences so they survive the file being removed.
 */
object ConfigHolder {

  private const val TAG = "Kiosk"
  private const val PREFS = "kiosk_config"
  private const val CONFIG_FILE = "kiosk_config.json"

  const val KEY_LOCK_TASK_MODE = "lockTaskMode"
  const val KEY_ALLOW_SCREEN_OFF = "allowScreenOff"
  const val KEY_REQUIRE_ROOT = "requireRoot"
  const val KEY_LAUNCH_ON_BOOT = "launchOnBoot"
  const val KEY_UNLOCK_PINCODE = "unlockPincode"

  // Defaults. Strong lockdown by default; relax per-device via prefs or JSON file.
  @Volatile var lockTaskMode: Boolean = true
    private set
  @Volatile var allowScreenOff: Boolean = false
    private set
  @Volatile var requireRoot: Boolean = false
    private set
  @Volatile var launchOnBoot: Boolean = true
    private set
  @Volatile var unlockPincode: String = "2697"
    private set

  fun init(context: Context) {
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    lockTaskMode = prefs.getBoolean(KEY_LOCK_TASK_MODE, lockTaskMode)
    allowScreenOff = prefs.getBoolean(KEY_ALLOW_SCREEN_OFF, allowScreenOff)
    requireRoot = prefs.getBoolean(KEY_REQUIRE_ROOT, requireRoot)
    launchOnBoot = prefs.getBoolean(KEY_LAUNCH_ON_BOOT, launchOnBoot)
    unlockPincode = prefs.getString(KEY_UNLOCK_PINCODE, unlockPincode) ?: unlockPincode
    applyJsonOverlay(context, prefs)
    Log.i(TAG, "Config: lockTaskMode=$lockTaskMode allowScreenOff=$allowScreenOff requireRoot=$requireRoot launchOnBoot=$launchOnBoot")
  }

  fun setBoolean(context: Context, key: String, value: Boolean) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(key, value).apply()
    when (key) {
      KEY_LOCK_TASK_MODE -> lockTaskMode = value
      KEY_ALLOW_SCREEN_OFF -> allowScreenOff = value
      KEY_REQUIRE_ROOT -> requireRoot = value
      KEY_LAUNCH_ON_BOOT -> launchOnBoot = value
    }
  }

  fun setString(context: Context, key: String, value: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(key, value).apply()
    if (key == KEY_UNLOCK_PINCODE) unlockPincode = value
  }

  private fun applyJsonOverlay(context: Context, prefs: android.content.SharedPreferences) {
    val file = java.io.File(context.filesDir, CONFIG_FILE)
    if (!file.exists()) return
    try {
      val json = JSONObject(file.readText())
      val editor = prefs.edit()
      if (json.has(KEY_LOCK_TASK_MODE)) {
        lockTaskMode = json.getBoolean(KEY_LOCK_TASK_MODE)
        editor.putBoolean(KEY_LOCK_TASK_MODE, lockTaskMode)
      }
      if (json.has(KEY_ALLOW_SCREEN_OFF)) {
        allowScreenOff = json.getBoolean(KEY_ALLOW_SCREEN_OFF)
        editor.putBoolean(KEY_ALLOW_SCREEN_OFF, allowScreenOff)
      }
      if (json.has(KEY_REQUIRE_ROOT)) {
        requireRoot = json.getBoolean(KEY_REQUIRE_ROOT)
        editor.putBoolean(KEY_REQUIRE_ROOT, requireRoot)
      }
      if (json.has(KEY_LAUNCH_ON_BOOT)) {
        launchOnBoot = json.getBoolean(KEY_LAUNCH_ON_BOOT)
        editor.putBoolean(KEY_LAUNCH_ON_BOOT, launchOnBoot)
      }
      if (json.has(KEY_UNLOCK_PINCODE)) {
        unlockPincode = json.getString(KEY_UNLOCK_PINCODE)
        editor.putString(KEY_UNLOCK_PINCODE, unlockPincode)
      }
      editor.apply()
      Log.i(TAG, "Applied JSON config overlay from $CONFIG_FILE")
    } catch (t: Throwable) {
      Log.w(TAG, "Failed to parse $CONFIG_FILE, ignoring", t)
    }
  }
}
