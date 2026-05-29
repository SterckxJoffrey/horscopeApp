package com.horscopeapp

import android.app.ActivityManager
import android.app.KeyguardManager
import android.app.admin.DevicePolicyManager
import android.app.role.RoleManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.provider.Settings
import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

  companion object {
    private const val TAG = "Kiosk"
    private const val HOME_ALIAS = "com.horscopeapp.HomeActivityAlias"

    /**
     * True while the kiosk is locked down. Set false by the operator-exit path
     * (KioskModule.showSystemBars) so onResume() does NOT re-lock and the operator
     * can actually leave. Re-armed by JS on next foreground.
     */
    @Volatile
    @JvmStatic
    var kioskLocked: Boolean = true
  }

  private var screenOffRegistered = false
  private var systemUiKilled = false

  private val screenOffReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
      if (intent?.action == Intent.ACTION_SCREEN_OFF && !ConfigHolder.allowScreenOff) {
        dismissKeyguard()
      }
    }
  }

  override fun getMainComponentName(): String = "horscopeApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    ConfigHolder.init(applicationContext)
    kioskLocked = ConfigHolder.lockTaskMode

    applyScreenOnFlags()
    registerScreenOffReceiver()
    registerSystemUiListener()
    enableHomeAlias()
    configureDeviceOwner()

    if (kioskLocked) applyHide()
  }

  override fun onResume() {
    super.onResume()
    if (kioskLocked) {
      ensureLockTaskMode()
      applyHide()
      maybeKillSystemUi()
    }
  }

  override fun onWindowFocusChanged(hasFocus: Boolean) {
    super.onWindowFocusChanged(hasFocus)
    if (hasFocus && kioskLocked) applyHide()
  }

  override fun onDestroy() {
    if (screenOffRegistered) {
      try { unregisterReceiver(screenOffReceiver) } catch (_: Throwable) {}
      screenOffRegistered = false
    }
    super.onDestroy()
  }

  // --- Layer 4: keep screen alive --------------------------------------------------

  private fun applyScreenOnFlags() {
    if (ConfigHolder.allowScreenOff) return
    window.addFlags(
      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON or
        WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
        WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON,
    )
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
    }
  }

  private fun registerScreenOffReceiver() {
    if (screenOffRegistered || ConfigHolder.allowScreenOff) return
    ContextCompat.registerReceiver(
      this,
      screenOffReceiver,
      IntentFilter(Intent.ACTION_SCREEN_OFF),
      ContextCompat.RECEIVER_NOT_EXPORTED,
    )
    screenOffRegistered = true
  }

  private fun dismissKeyguard() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
    val km = getSystemService(Context.KEYGUARD_SERVICE) as? KeyguardManager ?: return
    km.requestDismissKeyguard(this, null)
  }

  // --- Layer 3: immersive full-screen ----------------------------------------------

  private fun registerSystemUiListener() {
    @Suppress("DEPRECATION")
    window.decorView.setOnSystemUiVisibilityChangeListener { visibility ->
      // Bars reappeared (e.g. user swiped) -> re-hide while locked.
      if (kioskLocked && (visibility and View.SYSTEM_UI_FLAG_FULLSCREEN) == 0) {
        applyHide()
      }
    }
  }

  fun applyHide() {
    WindowCompat.setDecorFitsSystemWindows(window, false)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.hide(WindowInsetsCompat.Type.systemBars())
    controller.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility = (
      View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
        View.SYSTEM_UI_FLAG_FULLSCREEN or
        View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
        View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
        View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
        View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
      )
    ensureLockTaskMode()
  }

  fun applyShow() {
    stopLockTaskSafe()
    WindowCompat.setDecorFitsSystemWindows(window, true)
    val controller = WindowInsetsControllerCompat(window, window.decorView)
    controller.show(WindowInsetsCompat.Type.systemBars())
    @Suppress("DEPRECATION")
    window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_VISIBLE
    supportActionBar?.show()
    if (ConfigHolder.requireRoot) {
      RootUtil.restoreSystemUi()
      systemUiKilled = false
    }
  }

  // --- Layer 1: lock task mode -----------------------------------------------------

  fun ensureLockTaskMode() {
    if (!ConfigHolder.lockTaskMode || !kioskLocked) return
    if (isInLockTaskMode()) return
    startLockTaskSafe()
  }

  private fun isInLockTaskMode(): Boolean {
    val am = getSystemService(Context.ACTIVITY_SERVICE) as? ActivityManager ?: return false
    return am.lockTaskModeState != ActivityManager.LOCK_TASK_MODE_NONE
  }

  private fun startLockTaskSafe() {
    try {
      if (!isDeviceOwner()) {
        Log.w(TAG, "Not device owner: startLockTask falls back to user-confirmable screen pinning (weaker lockdown)")
      }
      startLockTask()
    } catch (t: Throwable) {
      Log.w(TAG, "startLockTask failed; immersive mode only", t)
    }
  }

  private fun stopLockTaskSafe() {
    try {
      if (isInLockTaskMode()) stopLockTask()
    } catch (t: Throwable) {
      Log.w(TAG, "stopLockTask failed", t)
    }
  }

  // --- Layer 2: device owner / home launcher ---------------------------------------

  private fun isDeviceOwner(): Boolean {
    val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return false
    return dpm.isDeviceOwnerApp(packageName)
  }

  /**
   * Enable the HOME activity-alias on every device (it ships disabled in the manifest).
   * On device-owner devices configureDeviceOwner() additionally pins it as the sticky
   * default. On non-owner devices this just makes the app eligible as a HOME app so an
   * operator can select it via openHomeLauncherSettings() / the system chooser.
   */
  private fun enableHomeAlias() {
    val alias = ComponentName(packageName, HOME_ALIAS)
    try {
      packageManager.setComponentEnabledSetting(
        alias,
        PackageManager.COMPONENT_ENABLED_STATE_ENABLED,
        PackageManager.DONT_KILL_APP,
      )
    } catch (t: Throwable) {
      Log.w(TAG, "enableHomeAlias failed", t)
    }
  }

  private fun configureDeviceOwner() {
    val dpm = getSystemService(Context.DEVICE_POLICY_SERVICE) as? DevicePolicyManager ?: return
    if (!dpm.isDeviceOwnerApp(packageName)) {
      Log.w(TAG, "App is NOT device owner. Lock task / sticky HOME / keyguard disable unavailable; HOME role still selectable manually via openHomeLauncherSettings().")
      return
    }
    val admin = ComponentName(this, KioskDeviceAdminReceiver::class.java)
    try {
      if (ConfigHolder.lockTaskMode) {
        dpm.setLockTaskPackages(admin, arrayOf(packageName))
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          dpm.setLockTaskFeatures(admin, 0)
        }
      }
      if (!ConfigHolder.allowScreenOff) {
        dpm.setKeyguardDisabled(admin, true)
      }
      registerAsHomeLauncher(dpm, admin)
    } catch (t: Throwable) {
      Log.w(TAG, "configureDeviceOwner failed", t)
    }
  }

  /** Device-owner only: make the (already enabled) HOME alias the sticky default. */
  private fun registerAsHomeLauncher(dpm: DevicePolicyManager, admin: ComponentName) {
    val alias = ComponentName(packageName, HOME_ALIAS)
    val filter = IntentFilter(Intent.ACTION_MAIN).apply {
      addCategory(Intent.CATEGORY_HOME)
      addCategory(Intent.CATEGORY_DEFAULT)
    }
    dpm.addPersistentPreferredActivity(admin, filter, alias)
  }

  /**
   * Operator action (non-owner devices): ask the OS to make this app the HOME launcher.
   * On Android 12+ this shows the one-tap "set as default Home" dialog via RoleManager;
   * otherwise it falls back to the system Default-Home settings screen. Must be invoked
   * from the operator's *unlocked* path — startActivity is blocked under lock task.
   */
  fun openHomeLauncherSettings() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      val rm = getSystemService(Context.ROLE_SERVICE) as? RoleManager
      if (rm != null && rm.isRoleAvailable(RoleManager.ROLE_HOME)) {
        if (rm.isRoleHeld(RoleManager.ROLE_HOME)) return // already the Home app; nothing to do
        try {
          startActivity(rm.createRequestRoleIntent(RoleManager.ROLE_HOME))
          return
        } catch (t: Throwable) {
          Log.w(TAG, "requestRole(HOME) failed; falling back to Home settings", t)
        }
      }
    }
    try {
      startActivity(
        Intent(Settings.ACTION_HOME_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK),
      )
    } catch (t: Throwable) {
      Log.w(TAG, "openHomeLauncherSettings failed", t)
    }
  }

  // --- Layer 6: optional root hard-kill --------------------------------------------

  private fun maybeKillSystemUi() {
    if (!ConfigHolder.requireRoot || systemUiKilled) return
    RootUtil.killSystemUi()
    systemUiKilled = true
  }
}
