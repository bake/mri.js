import { WebpMachineOptions } from 'webp-hero'

export interface MriMachineOptions extends WebpMachineOptions {
	fetch?(input: RequestInfo, init?: RequestInit): Promise<Response>
}
