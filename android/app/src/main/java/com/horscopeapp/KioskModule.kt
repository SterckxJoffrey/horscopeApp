package com.horscopeapp

import android.app.admin.DevicePolicyManager
import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap

class KioskModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "KioskModule"

  /** Re-arm the lockdown (called by JS when the gate re-locks). */
  @ReactMethod
  fun hideSystemBars() {
    MainActivity.kioskLocked = true
    val activity = reactContext.currentActivity as? MainActivity ?: return
    activity.runOnUiThread { activity.applyHide() }
  }

  /**
   * Operator exit: drop the lockdown. Sets kioskLocked=false (suppresses the auto
   * re-lock in onResume) and restores system bars, then stops lock task.
   */
  @ReactMethod
  fun showSystemBars() {
    MainActivity.kioskLocked = false
    val activity = reactContext.currentActivity as? MainActivity ?: return
    activity.runOnUiThread { activity.applyShow() }
  }

  /** Returns the resolved per-device config so JS uses the same source of truth. */
  @ReactMethod
  fun getConfig(promise: Promise) {
    ConfigHolder.init(reactContext)
    val map: WritableMap = Arguments.createMap().apply {
      putBoolean("lockTaskMode", ConfigHolder.lockTaskMode)
      putBoolean("allowScreenOff", ConfigHolder.allowScreenOff)
      putBoolean("requireRoot", ConfigHolder.requireRoot)
      putBoolean("launchOnBoot", ConfigHolder.launchOnBoot)
      putString("unlockPincode", ConfigHolder.unlockPincode)
      putBoolean("deviceOwner", isDeviceOwner())
    }
    promise.resolve(map)
  }

  private fun isDeviceOwner(): Boolean {
    val dpm = reactContext.getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager
    return dpm?.isDeviceOwnerApp(reactContext.packageName) == true
  }

  /**
   * Operator action for non-device-owner devices: open the system "Default Home app"
   * picker so the operator can set this app as the HOME launcher. On device-owner
   * devices the HOME role is already pinned automatically and this is unnecessary.
   */
  @ReactMethod
  fun setAsHomeLauncher() {
    val activity = reactContext.currentActivity as? MainActivity ?: return
    activity.runOnUiThread { activity.openHomeLauncherSettings() }
  }

  @ReactMethod
  fun setConfigBool(key: String, value: Boolean) {
    ConfigHolder.setBoolean(reactContext, key, value)
  }

  @ReactMethod
  fun setConfigString(key: String, value: String) {
    ConfigHolder.setString(reactContext, key, value)
  }
}
