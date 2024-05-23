# PDF Viewer and Highlighter

![Preview](preview.png)

Although this is a rails project, implementing PDF highlighting in a rails app has been put on hold and I have created multiple smaller apps in javascript, ruby and python as described below until I find the best solution.

# Features
- Display PDF in a browser with basic controls
- Search for a word on a specified page in a PDF and highlight it
- Search for a word under a section and highlight it

# Model

None

# Libraries
- NPM: pdfjs-dist. pdf.js on Github.
- gem 'hexapdf'
- pymupdf python package

# Instructions

## JS
All JS apps are in the js_ folders and are using pdf.js to render the pdf file. js_app uses canvas element, others do not. In the root of the app install the packages from the package.json file with the command:
```sh
yarn install
```

Select any file in the root of the rails app folder and click on "Go Live" in the status bar. Navigate browser to any one of the following locations:
```
http://127.0.0.1:5500/js_final/
http://127.0.0.1:5500/js_mobile_viewer/viewer.html
```

The challenge I am facing:
- how to use the TextHighlighter object to highlight a word pdfViewer.getPageView(0).textLayer.highlighter
- pageView.textLayer.textDivs contains an array of span elements. During execution, there are 0 elements in the array and so I cannot access any of them. However at some point the array gets populated. I need to find out when the Array is populated so I can run code to modify content like add some tags around words.
- Modifying the pageView.textLayer.textDivs may not be the way pdf.js highlights the document so another way needs to be looked into like modifying the pdfViewer.getPageView(0).textLayer.highlighter object.
- Perhaps a new PDFFindController is needed for every page.

## Python App
Located in folder py_app

Install python:
```sh
brew update
brew install python
brew install pipx
```

The python script requires simple.pdf in py_app folder.

```sh
cd py_app
python3 -m venv myenv
source myenv/bin/activate
pip install virtualenv
pip install pymupdf
python3 highlight.py
```

# Other Libraries

- PSPDFKIT - Price: Contact sales
- Apryse - Price: Contact sales
- Pdfjd-express - Price: $440/month (has highlight example)
- pdf-lib.js - no highlight example. Last release 2021
- pdf-reader gem - only reads PDFs
- Prawn gem - only writes to PDFs

## Version

- ruby 3.2.2 (2023-03-30 revision e51014f9c0) [arm64-darwin23]
- Rails 7.1.3.2


## References
- https://github.com/mozilla/pdf.js
- 
