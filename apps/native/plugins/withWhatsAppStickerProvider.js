const { withAndroidManifest } = require("@expo/config-plugins");

// Must match the Kotlin package of the inline module in
// `modules/whatsapp/StickerContentProvider.kt` — the class FQCN is fixed, only
// the authority varies with the app package (via ${applicationId}).
const PROVIDER_CLASS =
	"com.anonymous.sticker_pop.whatsapp.StickerContentProvider";
const AUTHORITY_SUFFIX = ".stickercontentprovider";
const READ_PERMISSION = "com.whatsapp.sticker.READ";

/**
 * Registers the WhatsApp third-party sticker ContentProvider declared by
 * `modules/whatsapp/StickerContentProvider.kt`.
 *
 * WhatsApp talks to a sticker app through a `ContentProvider` whose authority
 * starts with the package name and whose read permission is
 * `com.whatsapp.sticker.READ`. The provider itself is compiled from the inline
 * module source in `modules/` (see `experiments.inlineModules` in app.json);
 * this plugin only adds the manifest entry that exposes it.
 */
function withWhatsAppStickerProvider(config) {
	return withAndroidManifest(config, (config) => {
		const application = config.modResults.manifest.application?.[0];
		if (!application) {
			return config;
		}

		application.provider = application.provider ?? [];
		const alreadyRegistered = application.provider.some(
			(provider) => provider.$?.["android:name"] === PROVIDER_CLASS,
		);
		if (!alreadyRegistered) {
			application.provider.push({
				$: {
					"android:name": PROVIDER_CLASS,
					"android:authorities": `\${applicationId}${AUTHORITY_SUFFIX}`,
					"android:exported": "true",
					"android:enabled": "true",
					"android:readPermission": READ_PERMISSION,
				},
			});
		}

		return config;
	});
}

module.exports = withWhatsAppStickerProvider;
