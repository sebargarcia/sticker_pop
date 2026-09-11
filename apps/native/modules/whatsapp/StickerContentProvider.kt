package com.anonymous.sticker_pop.whatsapp

import android.content.ContentProvider
import android.content.ContentValues
import android.content.UriMatcher
import android.content.res.AssetFileDescriptor
import android.database.Cursor
import android.database.MatrixCursor
import android.net.Uri
import android.os.ParcelFileDescriptor
import android.text.TextUtils
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileNotFoundException

/**
 * Serves the most recently exported sticker pack to WhatsApp.
 *
 * WhatsApp only adds third-party packs through this ContentProvider contract
 * (authority `<package>.stickercontentprovider`, read permission
 * `com.whatsapp.sticker.READ`). It queries `metadata`, `metadata/<id>` and
 * `stickers/<id>` for the manifest, then pulls each sticker and the tray icon
 * from `stickers_asset/<id>/<file>`.
 *
 * Packs are read from `<filesDir>/whatsapp/pack/contents.json` on every query
 * so WhatsApp can fetch them without the JS runtime running and always sees
 * the latest export. See `lib/whatsapp.ts` for the writer of that folder.
 */
class StickerContentProvider : ContentProvider() {

	private val matcher = UriMatcher(UriMatcher.NO_MATCH)

	override fun onCreate(): Boolean {
		val authority = authority() ?: return false
		matcher.addURI(authority, METADATA, METADATA_CODE)
		matcher.addURI(authority, "$METADATA/*", METADATA_SINGLE_CODE)
		matcher.addURI(authority, "$STICKERS/*", STICKERS_CODE)
		matcher.addURI(authority, "$STICKERS_ASSET/*/*", STICKERS_ASSET_CODE)
		return true
	}

	override fun query(
		uri: Uri,
		projection: Array<out String>?,
		selection: String?,
		selectionArgs: Array<out String>?,
		sortOrder: String?,
	): Cursor {
		val packs = loadPacks()
		return when (matcher.match(uri)) {
			METADATA_CODE -> packInfoCursor(uri, packs)
			METADATA_SINGLE_CODE -> {
				val identifier = uri.lastPathSegment
				packInfoCursor(uri, packs.filter { it.identifier == identifier })
			}
			STICKERS_CODE -> {
				val identifier = uri.lastPathSegment
				val pack = packs.firstOrNull { it.identifier == identifier }
				val cursor = MatrixCursor(
					arrayOf(
						STICKER_FILE_NAME,
						STICKER_FILE_EMOJI,
						STICKER_FILE_ACCESSIBILITY_TEXT,
					),
				)
				pack?.stickers?.forEach { sticker ->
					cursor.addRow(
						arrayOf(
							sticker.imageFile,
							sticker.emojis.joinToString(","),
							sticker.accessibilityText ?: "",
						),
					)
				}
				cursor.setNotificationUri(requireProviderContext().contentResolver, uri)
				cursor
			}
			else -> throw IllegalArgumentException("Unknown URI: $uri")
		}
	}

	override fun openAssetFile(uri: Uri, mode: String): AssetFileDescriptor? {
		val descriptor = openDescriptor(uri) ?: return null
		return AssetFileDescriptor(descriptor, 0, AssetFileDescriptor.UNKNOWN_LENGTH)
	}

	override fun openFile(uri: Uri, mode: String): ParcelFileDescriptor? = openDescriptor(uri)

	private fun openDescriptor(uri: Uri): ParcelFileDescriptor? {
		if (matcher.match(uri) != STICKERS_ASSET_CODE) {
			return null
		}
		val segments = uri.pathSegments
		if (segments.size != 3) {
			throw IllegalArgumentException("path segments should be 3, uri is: $uri")
		}
		val identifier = segments[1]
		val fileName = segments[2]
		if (TextUtils.isEmpty(identifier)) {
			throw IllegalArgumentException("identifier is empty, uri: $uri")
		}
		if (TextUtils.isEmpty(fileName)) {
			throw IllegalArgumentException("file name is empty, uri: $uri")
		}

		val pack = loadPacks().firstOrNull { it.identifier == identifier } ?: return null
		val allowed = fileName == pack.trayImageFile ||
			pack.stickers.any { it.imageFile == fileName }
		if (!allowed) {
			return null
		}
		val file = File(pack.dir, fileName)
		if (!file.isFile) {
			return null
		}
		return try {
			ParcelFileDescriptor.open(file, ParcelFileDescriptor.MODE_READ_ONLY)
		} catch (e: FileNotFoundException) {
			null
		}
	}

	override fun getType(uri: Uri): String? {
		val authority = authority()
		return when (matcher.match(uri)) {
			METADATA_CODE -> "vnd.android.cursor.dir/vnd.$authority.$METADATA"
			METADATA_SINGLE_CODE -> "vnd.android.cursor.item/vnd.$authority.$METADATA"
			STICKERS_CODE -> "vnd.android.cursor.dir/vnd.$authority.$STICKERS"
			STICKERS_ASSET_CODE ->
				if (uri.lastPathSegment?.endsWith(".png", ignoreCase = true) == true) {
					"image/png"
				} else {
					"image/webp"
				}
			else -> null
		}
	}

	override fun insert(uri: Uri, values: ContentValues?): Uri? =
		throw UnsupportedOperationException("Not supported")

	override fun delete(uri: Uri, selection: String?, selectionArgs: Array<out String>?): Int =
		throw UnsupportedOperationException("Not supported")

	override fun update(
		uri: Uri,
		values: ContentValues?,
		selection: String?,
		selectionArgs: Array<out String>?,
	): Int = throw UnsupportedOperationException("Not supported")

	private fun authority(): String? {
		val ctx = context ?: return null
		return "${ctx.packageName}$AUTHORITY_SUFFIX"
	}

	private fun requireProviderContext() =
		context ?: throw IllegalStateException("ContentProvider is not attached to a context.")

	private fun packInfoCursor(uri: Uri, packs: List<StickerPack>): Cursor {
		val cursor = MatrixCursor(
			arrayOf(
				STICKER_PACK_IDENTIFIER,
				STICKER_PACK_NAME,
				STICKER_PACK_PUBLISHER,
				STICKER_PACK_ICON,
				ANDROID_PLAY_STORE_LINK,
				IOS_APP_DOWNLOAD_LINK,
				PUBLISHER_EMAIL,
				PUBLISHER_WEBSITE,
				PRIVACY_POLICY_WEBSITE,
				LICENSE_AGREEMENT_WEBSITE,
				IMAGE_DATA_VERSION,
				AVOID_CACHE,
				ANIMATED_STICKER_PACK,
			),
		)
		for (pack in packs) {
			cursor.newRow()
				.add(pack.identifier)
				.add(pack.name)
				.add(pack.publisher)
				.add(pack.trayImageFile)
				.add(pack.androidPlayStoreLink)
				.add(pack.iosAppDownloadLink)
				.add(pack.publisherEmail)
				.add(pack.publisherWebsite)
				.add(pack.privacyPolicyWebsite)
				.add(pack.licenseAgreementWebsite)
				.add(pack.imageDataVersion)
				.add(if (pack.avoidCache) 1 else 0)
				.add(if (pack.animatedStickerPack) 1 else 0)
		}
		cursor.setNotificationUri(requireProviderContext().contentResolver, uri)
		return cursor
	}

	private fun loadPacks(): List<StickerPack> {
		val dir = File(requireProviderContext().filesDir, PACKS_RELATIVE_DIR)
		val contents = File(dir, CONTENT_FILE_NAME)
		if (!contents.isFile) {
			return emptyList()
		}
		return try {
			listOf(parsePack(contents.readText(), dir))
		} catch (e: Exception) {
			emptyList()
		}
	}

	private fun parsePack(json: String, dir: File): StickerPack {
		val pack = JSONObject(json)

		val stickers = ArrayList<Sticker>()
		val stickersJson = pack.optJSONArray("stickers") ?: JSONArray()
		for (index in 0 until stickersJson.length()) {
			val sticker = stickersJson.optJSONObject(index) ?: continue
			val imageFile = sticker.optString("image_file")
			if (!isSafeFileName(imageFile)) {
				continue
			}
			val emojis = ArrayList<String>()
			val emojisJson = sticker.optJSONArray("emojis")
			if (emojisJson != null) {
				for (emojiIndex in 0 until emojisJson.length()) {
					val emoji = emojisJson.optString(emojiIndex)
					if (emoji.isNotEmpty()) {
						emojis.add(emoji)
					}
				}
			}
			val accessibilityText = sticker.optString("accessibility_text").ifEmpty { null }
			stickers.add(
				Sticker(
					imageFile = imageFile,
					emojis = if (emojis.isEmpty()) arrayListOf(DEFAULT_EMOJI) else emojis,
					accessibilityText = accessibilityText,
				),
			)
		}

		val tray = pack.optString("tray_image_file").ifEmpty { DEFAULT_TRAY_FILE }
		return StickerPack(
			identifier = pack.optString("identifier"),
			name = pack.optString("name"),
			publisher = pack.optString("publisher"),
			trayImageFile = if (isSafeFileName(tray)) tray else DEFAULT_TRAY_FILE,
			androidPlayStoreLink = pack.optString("android_play_store_link"),
			iosAppDownloadLink = pack.optString("ios_app_download_link"),
			publisherEmail = pack.optString("publisher_email"),
			publisherWebsite = pack.optString("publisher_website"),
			privacyPolicyWebsite = pack.optString("privacy_policy_website"),
			licenseAgreementWebsite = pack.optString("license_agreement_website"),
			imageDataVersion = pack.optString("image_data_version").ifEmpty { "1" },
			avoidCache = pack.optBoolean("avoid_cache", false),
			animatedStickerPack = pack.optBoolean("animated_sticker_pack", false),
			stickers = stickers,
			dir = dir,
		)
	}

	private fun isSafeFileName(fileName: String): Boolean =
		fileName.isNotEmpty() &&
			!fileName.contains("..") &&
			!fileName.contains("/") &&
			!fileName.contains("\\")

	companion object {
		/** Appended to the package name; must match the config plugin. */
		const val AUTHORITY_SUFFIX = ".stickercontentprovider"
		const val CONTENT_FILE_NAME = "contents.json"

		/** Directory under `filesDir` written by `lib/whatsapp.ts`. */
		const val PACKS_RELATIVE_DIR = "whatsapp/pack"

		private const val DEFAULT_EMOJI = "✨"
		private const val DEFAULT_TRAY_FILE = "tray.png"

		private const val METADATA = "metadata"
		private const val STICKERS = "stickers"
		private const val STICKERS_ASSET = "stickers_asset"

		private const val METADATA_CODE = 1
		private const val METADATA_SINGLE_CODE = 2
		private const val STICKERS_CODE = 3
		private const val STICKERS_ASSET_CODE = 4

		// Query column names — fixed by WhatsApp, do not change.
		private const val STICKER_PACK_IDENTIFIER = "sticker_pack_identifier"
		private const val STICKER_PACK_NAME = "sticker_pack_name"
		private const val STICKER_PACK_PUBLISHER = "sticker_pack_publisher"
		private const val STICKER_PACK_ICON = "sticker_pack_icon"
		private const val ANDROID_PLAY_STORE_LINK = "android_play_store_link"
		private const val IOS_APP_DOWNLOAD_LINK = "ios_app_download_link"
		private const val PUBLISHER_EMAIL = "sticker_pack_publisher_email"
		private const val PUBLISHER_WEBSITE = "sticker_pack_publisher_website"
		private const val PRIVACY_POLICY_WEBSITE = "sticker_pack_privacy_policy_website"
		private const val LICENSE_AGREEMENT_WEBSITE = "sticker_pack_license_agreement_website"
		private const val IMAGE_DATA_VERSION = "image_data_version"
		private const val AVOID_CACHE = "whatsapp_will_not_cache_stickers"
		private const val ANIMATED_STICKER_PACK = "animated_sticker_pack"
		private const val STICKER_FILE_NAME = "sticker_file_name"
		private const val STICKER_FILE_EMOJI = "sticker_emoji"
		private const val STICKER_FILE_ACCESSIBILITY_TEXT = "sticker_accessibility_text"
	}
}

private data class Sticker(
	val imageFile: String,
	val emojis: List<String>,
	val accessibilityText: String?,
)

private data class StickerPack(
	val identifier: String,
	val name: String,
	val publisher: String,
	val trayImageFile: String,
	val androidPlayStoreLink: String,
	val iosAppDownloadLink: String,
	val publisherEmail: String,
	val publisherWebsite: String,
	val privacyPolicyWebsite: String,
	val licenseAgreementWebsite: String,
	val imageDataVersion: String,
	val avoidCache: Boolean,
	val animatedStickerPack: Boolean,
	val stickers: List<Sticker>,
	val dir: File,
)
