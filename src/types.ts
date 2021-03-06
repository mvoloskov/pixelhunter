export interface AbstractSize {
	name: string,
	width: number,
	height: number,
}

export interface StandaloneSize extends AbstractSize {
	app: string,
}

export interface SizeWithSrc extends StandaloneSize {
	src: string,
}

export interface SizeWithBlob extends StandaloneSize {
	blob: Blob,
}

export interface UCMeta {
	compress: boolean,
	extension: string,
}
