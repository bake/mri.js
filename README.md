# MangaRock Image decoder

`mri.js` decodes `.mri` (MangaRock Image) files. MRIs are basically XORed WEBP images without the corresponding header. This module uses [webp-hero](https://github.com/chase-moskal/webp-hero) to decode and render the resulting WEBPs.

## Installation

```
$ npm install --save mri.js
```

## Examples

### Replace all images

```js
import { MriMachine } from 'mri.js'

const mriMachine = new MriMachine
mriMachine.polyfillDocument()
```

### Replace a specific image

```js
import { MriMachine } from 'mri.js'

const mriMachine = new MriMachine
const image = document.querySelector('img[src$=".mri"]')
mriMachine.polyfillImage(image)
```

### Only decode an MRIs body

```js
import { MriMachine } from 'mri.js'

const mriMachine = new MriMachine
fetch('image.mri')
	.then(res => res.arrayBuffer())
	.then(buff => new Uint8Array(buff))
	.then(arr => mriMachine.decode(arr))
	.then(console.log) // 82, 73, 70, 70, ...
```
