# Avatar parser

Create avatar badges from a set of input images using nodejs.

## :memo: Assignment

In the context of a recruitment process, this app is meant to showcase a set of simple image-manipulation functions :

It features :

- A test-function to check wether a given badge meets the required format
  - For instance : 510x510 size, a round transparent mask, and file format is `png`
- A utility-function to convert any given image to an avatar given a specific format
  - For instance : 510x510 size, a round transparent mask, and convert to `png`
  - Compatible file formats are : JPEG, PNG, WebP, AVIF (limited to 8-bit depth), TIFF, GIF and SVG (input)

## Installation

Only NodeJs version 18 is required. Preferably install through [`nvm`](https://nodejs.org/en/download/package-manager#nvm).

## Usage

Copy your image library inside an `images` folder, and run :

```bash
$ npm start
```

or (using node) `$ node .` or even `$ node dist/index.cjs`

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
