# GlucoPass

Interactive, mobile-first prototype of a diabetes meal diary and health passport, with patient and doctor sides. English, switchable to Bahasa Melayu. All data, AI and OCR are simulated.

## Run

Open `index.html` in a browser. No server needed.

## Edit

`index.html` is generated. Edit the files in `src/`, then rebuild:

```
npm install
node build.js
```

The `src/*.jsx` files are concatenated in filename order, compiled with Babel, and injected into `src/template.html`.
