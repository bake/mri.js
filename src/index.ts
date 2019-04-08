import { PolyfillDocumentOptions, WebpMachine } from 'webp-hero'
import { Webp } from 'webp-hero/libwebp/dist/webp'
import { MriMachineOptions } from './interfaces'

export class MriMachine {
	// The key can be extracted from MangaRocks client.js file.
	private key: number = 101

	private webpMachine: WebpMachine
	private cache: { [key: string]: string } = {}
	private fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>

	/**
	 * Create a new MriMachine. `fetch` can be used to change the fetch
	 * implementation, for example to use one that retries requests.
	 */
	constructor({
		webp = new Webp(),
		fetch = window.fetch.bind(window),
	}: MriMachineOptions = {}) {
		this.fetch = fetch
		this.webpMachine = new WebpMachine({ webp })
	}

	/**
	 * Decode the .mris body into a (hopefully) valid .webp which in turn can be
	 * decoded by another library like
	 * [webp-hero](https://github.com/chase-moskal/webp-hero).
	 */
	async decode(body: Uint8Array): Promise<Uint8Array> {
		body = body.map(b => b ^ this.key)

		const size: number = body.length + 7
		const header = new Uint8Array([
			0x52,
			0x49,
			0x46,
			0x46, // RIFF
			(size >> 0) & 255,
			(size >> 8) & 255,
			(size >> 16) & 255,
			(size >> 24) & 255,
			0x57,
			0x45,
			0x42,
			0x50, // WEBP
			0x56,
			0x50,
			0x38, // VP8
		])

		const data = new Uint8Array(header.length + body.length)
		data.set(header)
		data.set(body, header.length)

		return data
	}

	/**
	 * Decode an image and replace its source with a base64 encoded PNG image.
	 */
	async polyfillImage(image: HTMLImageElement): Promise<void> {
		const { src } = image
		if (!/\.mri$/i.test(src)) {
			return
		}
		if (this.cache[src]) {
			image.src = this.cache[src]
			return
		}

		image.src = this.cache[src] = await this.fetch(src)
			.then((res: Response) => res.arrayBuffer())
			.then((buf: ArrayBuffer) => new Uint8Array(buf))
			.then((mri: Uint8Array) => this.decode(mri))
			.then((webp: Uint8Array) => this.webpMachine.decode(webp))
	}

	/**
	 * Decode all MRIs on the page.
	 */
	async polyfillDocument({
		document = window.document,
	}: PolyfillDocumentOptions = {}): Promise<void> {
		for (const image of Array.from(document.querySelectorAll('img'))) {
			await this.polyfillImage(image)
		}
	}
}
