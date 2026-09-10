/**
 * Minimal ZIP writer (STORE method, no compression).
 *
 * WhatsApp sticker packs ship as a `.wasticker` — a ZIP archive holding
 * `contents.json`, the tray icon and the sticker files. The payloads here
 * (WebP, PNG) are already compressed, so writing them verbatim is both
 * correct and cheap, and it keeps the archive buildable without pulling a
 * zip dependency (or its React Native polyfills) into the bundle.
 */

export interface ZipEntry {
	name: string;
	data: Uint8Array;
}

const CRC_TABLE: Uint32Array = (() => {
	const table = new Uint32Array(256);
	for (let n = 0; n < 256; n++) {
		let c = n;
		for (let k = 0; k < 8; k++) {
			c = (c & 1) !== 0 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
		}
		table[n] = c >>> 0;
	}
	return table;
})();

function crc32(data: Uint8Array): number {
	let crc = 0xffffffff;
	for (let i = 0; i < data.length; i++) {
		const byte = data[i] as number;
		crc = (CRC_TABLE[(crc ^ byte) & 0xff] as number) ^ (crc >>> 8);
	}
	return (crc ^ 0xffffffff) >>> 0;
}

const nameEncoder = new TextEncoder();

/** Packs `entries` into a single ZIP archive. */
export function createZip(entries: ZipEntry[]): Uint8Array {
	const records = entries.map((entry) => {
		const nameBytes = nameEncoder.encode(entry.name);
		return {
			nameBytes,
			data: entry.data,
			crc: crc32(entry.data),
			offset: 0,
		};
	});

	const localChunks: Uint8Array[] = [];
	let offset = 0;
	for (const record of records) {
		record.offset = offset;
		const header = new Uint8Array(30 + record.nameBytes.length);
		const view = new DataView(header.buffer);
		view.setUint32(0, 0x04034b50, true); // local file header
		view.setUint16(4, 20, true); // version needed
		view.setUint16(6, 0x0800, true); // UTF-8 names
		view.setUint16(8, 0, true); // method: store
		view.setUint16(10, 0, true); // mod time
		view.setUint16(12, 0x21, true); // mod date (1980-01-01)
		view.setUint32(14, record.crc, true);
		view.setUint32(18, record.data.length, true);
		view.setUint32(22, record.data.length, true);
		view.setUint16(26, record.nameBytes.length, true);
		view.setUint16(28, 0, true); // extra length
		header.set(record.nameBytes, 30);
		localChunks.push(header, record.data);
		offset += header.length + record.data.length;
	}

	const centralChunks: Uint8Array[] = [];
	let centralSize = 0;
	for (const record of records) {
		const central = new Uint8Array(46 + record.nameBytes.length);
		const view = new DataView(central.buffer);
		view.setUint32(0, 0x02014b50, true); // central directory header
		view.setUint16(4, 20, true); // version made by
		view.setUint16(6, 20, true); // version needed
		view.setUint16(8, 0x0800, true);
		view.setUint16(10, 0, true);
		view.setUint16(12, 0, true);
		view.setUint16(14, 0x21, true);
		view.setUint32(16, record.crc, true);
		view.setUint32(20, record.data.length, true);
		view.setUint32(24, record.data.length, true);
		view.setUint16(28, record.nameBytes.length, true);
		view.setUint16(30, 0, true); // extra
		view.setUint16(32, 0, true); // comment
		view.setUint16(34, 0, true); // disk number
		view.setUint16(36, 0, true); // internal attrs
		view.setUint32(38, 0, true); // external attrs
		view.setUint32(42, record.offset, true);
		central.set(record.nameBytes, 46);
		centralChunks.push(central);
		centralSize += central.length;
	}

	const end = new Uint8Array(22);
	const endView = new DataView(end.buffer);
	endView.setUint32(0, 0x06054b50, true); // end of central directory
	endView.setUint16(4, 0, true); // disk number
	endView.setUint16(6, 0, true); // central dir disk
	endView.setUint16(8, records.length, true);
	endView.setUint16(10, records.length, true);
	endView.setUint32(12, centralSize, true);
	endView.setUint32(16, offset, true);
	endView.setUint16(20, 0, true); // comment length

	let total = centralSize + end.length;
	for (const chunk of localChunks) total += chunk.length;

	const out = new Uint8Array(total);
	let pos = 0;
	for (const chunk of localChunks) {
		out.set(chunk, pos);
		pos += chunk.length;
	}
	for (const chunk of centralChunks) {
		out.set(chunk, pos);
		pos += chunk.length;
	}
	out.set(end, pos);
	return out;
}
