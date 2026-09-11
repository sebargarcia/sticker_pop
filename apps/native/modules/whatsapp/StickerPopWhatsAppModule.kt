package com.anonymous.sticker_pop.whatsapp

import android.content.ActivityNotFoundException
import android.content.Intent
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Thrown when neither WhatsApp nor WhatsApp Business handles the add-pack intent. */
class WhatsAppNotInstalledException :
	CodedException(
		"ERR_WHATSAPP_NOT_INSTALLED",
		"WhatsApp is not installed on this device",
		null,
	)

/**
 * JS bridge for `lib/whatsapp.ts`.
 *
 * WhatsApp's third-party sticker API has no share target: the app that owns the
 * pack has to start WhatsApp's `ENABLE_STICKER_PACK` activity with the pack
 * identifier and the ContentProvider authority. `StickerContentProvider` serves
 * the pack once WhatsApp asks for it.
 */
class StickerPopWhatsAppModule : Module() {
	override fun definition() = ModuleDefinition {
		Name("StickerPopWhatsApp")

		AsyncFunction("addStickerPack") { identifier: String, name: String ->
			val context = appContext.reactContext
				?: throw CodedException("React context is unavailable.")
			val intent = Intent(ENABLE_STICKER_PACK_ACTION).apply {
				putExtra(EXTRA_STICKER_PACK_ID, identifier)
				putExtra(
					EXTRA_STICKER_PACK_AUTHORITY,
					"${context.packageName}${StickerContentProvider.AUTHORITY_SUFFIX}",
				)
				putExtra(EXTRA_STICKER_PACK_NAME, name)
				addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
			}
			try {
				context.startActivity(intent)
			} catch (e: ActivityNotFoundException) {
				// WhatsApp Business only handles its own action.
				try {
					context.startActivity(
						intent.setAction(ENABLE_STICKER_PACK_ACTION_W4B),
					)
				} catch (e2: ActivityNotFoundException) {
					throw WhatsAppNotInstalledException()
				}
			}
		}
	}

	private companion object {
		const val ENABLE_STICKER_PACK_ACTION = "com.whatsapp.intent.action.ENABLE_STICKER_PACK"
		const val ENABLE_STICKER_PACK_ACTION_W4B = "com.whatsapp.w4b.intent.action.ENABLE_STICKER_PACK"
		const val EXTRA_STICKER_PACK_ID = "sticker_pack_id"
		const val EXTRA_STICKER_PACK_AUTHORITY = "sticker_pack_authority"
		const val EXTRA_STICKER_PACK_NAME = "sticker_pack_name"
	}
}
