# Avatar parser

Create avatar badges from a set of input images using nodejs.

## :memo: Assignment

In the context of a recruitment process, this app is meant to showcase a set of simple image-manipulation functions :

It features :

- A test-function to check wether a given badge meets the required format
  - For instance : 510x510 size, a round transparent mask, and file format is `png`
  - And returns a _happy-score_ based on the image's colors.
- A utility-function to convert any given image to an avatar given a specific format
  - For instance : 510x510 size, a round transparent mask, and convert to `png`
  - Compatible file formats are : JPEG, PNG, WebP, AVIF (limited to 8-bit depth), TIFF, GIF and SVG (input)

## Installation

NodeJs version 18 is required. Preferably install through [`nvm`](https://nodejs.org/en/download/package-manager#nvm).

Once you have nodejs, you'll also have it's default package-manager ready. Use it to install the prod-dependencies :

```bash
$ NODE_ENV=production npm i
```

> The bundler cannot bundle every dependency in the output build, since the dependencies inclue some native binaries (eg. [`sharp`](https://www.npmjs.com/package/sharp))

## Usage

Copy your images inside an `input` folder, and run :

```bash
$ npm start
```

or (using node) `$ node .` or even `$ node dist/index.cjs`.

From there you will be guided by the CLI into which program to use. Available programs are :

- `test` the _test-function_ -> will expect badge-like images from `input/`
- `create` the _utility-function_ -> will take any compatible image from `input/`

## Future improvements

### Happy-score calculation

The score is computed given highly arbitrary metrics, that stipulate that bright, saturated and warn colors give a higher "happy" feeling than other colors.

This method could benefit some more investigation to determine more accurately what a "happy" image is.

One solution might even simply be to use an pre-trained machine-learning models like [CLIP](https://github.com/mlfoundations/open_clip).

### Change the mask-blend method

Performing a _XOR_ blend is not exactly appropriate for a bunch of edge-cases.

To fully understand why, let's first understand how the _XOR_ blend works in the first place.

When performing the blend, each pixel is xor'ed individually. Each pixel is made of 4 channels : R, G, B and A (alpha) for transparency. Each channel is represented as a 256 bit word, which is going to be xor'ed to the same channel from the corresponding pixel in the mask.

We have a mask with a white and transparent disk, and a black opaque contour.

Pixels on the disc will stay the same, since xor'ing with zero returns the same value, and the mask's pixels there are all at `(0, 0, 0, 0)` (transparent white).

However, pixels outside the disc in the mask have the following value `(0, 0, 0, 255)`. Colors (RGB) channels will stay the same, but the alpha channel will change. The XOR operation returns 1 if the bits are different and 0 if they are the same.

This means that fully opaque pixels from the source image will become fully transparent :

```
Alpha-channel XOR :

   11111111 <- source is opaque
X  11111111 <- mask is opaque (contour)
------------
   00000000 <- output is transparent
```

But if for some reason, the source image has some transparent or (worse) semi-transparent pixels, those won't be handled properly :

```
Alpha-channel XOR :

   11011010 <- source is (218/255)% opaque
X  11111111 <- mask is opaque (contour)
------------
   00100101 <- output is (37/255)% opaque
```

The problem here is pretty clear : the output would **not** be fully transparent.

A proper solution would probably be to use a different (and proper) blend method.

### Inconsistant compression

Non-PNG source images are converted to PNG using a fast convertion provided by [`sharp`](https://sharp.pixelplumbing.com/api-output#png).

However, PNG images are kept as-is, and are not subject to the convertion-compression.

This causes inconsistant image-quality between source-formats (despite every image being resized to the save pixel-size).

A solution could be spending more time converting source images in order to output the best quality possible.

## Installation (build from source)

To build the package from source, you will need the following :

- NodeJs version 18 (Preferably install through [`nvm`](https://nodejs.org/en/download/package-manager#nvm))
- Install pnpm version 8.6.11 or similar - installing using previously-installed `npm` is fine :

```bash
$ npm install -g pnpm@8.6.11
```

Then, install all the dependencies :

```bash
$ [npm | pnpm] install
```

Build the sources :

```bash
$ pnpm build
```
