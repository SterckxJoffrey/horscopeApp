package com.horscopeapp

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * Relaunches the kiosk on device boot. Defense-in-depth: when the app is device owner
 * and registered as HOME it would come back anyway, but this covers the non-owner
 * fallback and devices where the HOME role isn't sticky.
 */
class BootReceiver : BroadcastReceiver() {

  override fun onReceive(context: Context, intent: Intent?) {
    val action = intent?.action ?: return
    if (action != Intent.ACTION_BOOT_COMPLETED &&
      action != "android.intent.action.QUICKBOOT_POWERON"
    ) {
      return
    }
    ConfigHolder.init(context.applicationContext)
    if (!ConfigHolder.launchOnBoot) {
      Log.i("Kiosk", "Boot completed but launchOnBoot is disabled; not relaunching")
      return
    }
    Log.i("Kiosk", "Boot completed, relaunching MainActivity")
    val launch = Intent(context, MainActivity::class.java).apply {
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    }
    try {
      context.startActivity(launch)
    } catch (t: Throwable) {
      Log.w("Kiosk", "Failed to relaunch on boot", t)
    }
  }
}
