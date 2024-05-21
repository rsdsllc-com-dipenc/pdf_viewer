class PdfsController < ApplicationController
  def upload
  end

  def process_pdf
    if params[:pdf].present?
      pdf_file = params[:pdf].path
      highlighted_pdf = highlight_pdf(pdf_file)
      send_data highlighted_pdf, filename: "highlighted.pdf", type: "application/pdf"
    else
      redirect_to upload_pdfs_path, alert: "Please upload a PDF file."
    end
  end

  private

  def highlight_pdf(pdf_file)
    doc = HexaPDF::Document.open(pdf_file)

    highlight_words_on_page(doc, 1, 'law')
    highlight_words_on_page(doc, 2, 'insurance')

    io = StringIO.new
    doc.write(io)
    io.string
  end

  def highlight_words_on_page(doc, page_number, word)
    page = doc.pages[page_number - 1]
    puts "********************************"
    puts page.inspect
    text_layer = page.text_layer

    text_layer.words.each do |text_word|
      next unless text_word.string.downcase.include?(word.downcase)

      text_word.rectangles.each do |rect|
        page.canvas.fill_color(1, 1, 0).fill_rectangle(rect.x, rect.y, rect.width, rect.height)
      end
    end
  end
end
