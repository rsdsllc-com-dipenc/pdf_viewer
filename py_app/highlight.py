import pymupdf

doc = pymupdf.open("simple.pdf")

# the text to be marked
needle = "Word2"

# work with first page only
page = doc[0]

# get list of text locations
# we use "quads", not rectangles because text may be tilted!
rl = page.search_for(needle, quads=True)

# mark all found quads with one annotation
page.add_squiggly_annot(rl)

# save to a new PDF
doc.save("out.pdf")
