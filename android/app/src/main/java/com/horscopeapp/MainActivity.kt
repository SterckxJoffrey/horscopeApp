package com.horscopeapp

import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    @Volatile
    @JvmStatic
    var kioskLocked: Boolean = true
  }

  private val rehideHandler = Handler(Looper.getMainLooper())
  private val rehideRunnable = object : Runnable {
    override fun run() {
      if (!kioskLocked) return
      val controller = WindowInsetsControllerCompat(window, window.decorView)
      controller.hide(WindowInsetsCompat.Type.systemBars())
      controller.systemBarsBehavior =
        WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
      rehideHandler.postDelayed(this, 50)
    }
  }

  override fun getMainComponentName(): String = "horscopeApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
    configureDeviceOwner()
    if (kioskLocked) applyHide()
  }

  override fun onResume() {
    super.onResume()
    if (kioskLocked) startLockTaskSafe()
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus && kioskLocked) applyHide()
  }

  override fun onDestroy() {
    rehideHandler.removeCallbacks(rehideRunnable)
    super.onDestroy()
  }

  private fun configureDeviceOwner() {
    val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return
    if (!dpm.isDeviceOwnerApp(packageName)) return
    val admin = ComponentName(this, KioskDeviceAdminReceiver::class.java)
    try {
      dpm.setLockTaskPackages(admin, arrayOf(packageName))
      dpm.setLockTaskFeatures(admin, 0)
      dpm.setKeyguardDisabled(admin, true)
    } catch (_: Throwable) {}
  }

  fun applyHide() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    startLockTaskSafe()
    rehideHandler.removeCallbacks(rehideRunnable)
    rehideHandler.post(rehideRunnable)
  }

  fun applyShow() {
    stopLockTaskSafe()
    rehideHandler.removeCallbacks(rehideRunnable)
    WindowCompat.setDecorFitsSystemWindows(window, true)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.show(WindowInsetsCompat.Type.systemBars())
  }

  private fun isDeviceOwner(): Boolean {
    val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return false
    return dpm.isDeviceOwnerApp(packageName)
  }

  private fun startLockTaskSafe() {
    if (!isDeviceOwner()) return
    try { startLockTask() } catch (_: Throwable) {}
  }

  private fun stopLockTaskSafe() {
    if (!isDeviceOwner()) return
    try { stopLockTask() } catch (_: Throwable) {}
  }
}
