package com.horscopeapp

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class KioskModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = "KioskModule"

  @ReactMethod
  fun hideSystemBars() {
    MainActivity.kioskLocked = true
    val activity = getCurrentActivity() as? MainActivity ?: return
    activity.runOnUiThread { activity.applyHide() }
  }

  @ReactMethod
  fun showSystemBars() {
    MainActivity.kioskLocked = false
    val activity = getCurrentActivity() as? MainActivity ?: return
    activity.runOnUiThread { activity.applyShow() }
  }
}
