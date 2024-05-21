class HomeController < ApplicationController
  def index
  end

  def result
    search_text = params[:search_text]
    pdf_path = params[:pdf_path]

    if search_text.present? && pdf_path.present?
      @pdf_text, @occurrences, @highlighted_pdf = process_pdf(pdf_path, search_text)
    else
      redirect_to root_path, alert: "Please provide both text and a PDF file."
    end
  end

  def create
    search_text = params[:search_text]
    pdf_file = params[:pdf_file]

    if search_text.present? && pdf_file.present?
      pdf_path = Rails.root.join('tmp', pdf_file.original_filename)
      File.open(pdf_path, 'wb') do |file|
        file.write(pdf_file.read)
      end

      redirect_to result_path(search_text: search_text, pdf_path: pdf_path)
    else
      redirect_to root_path, alert: "Please provide both text and a PDF file."
    end
  end

  private

  def process_pdf(file_path, search_text)
    reader = PDF::Reader.new(file_path)
    pdf_text = ""
    occurrences = 0
    highlighted_pdf = ""

    reader.pages.each do |page|
      text = page.text
      occurrences += text.scan(/#{Regexp.quote(search_text)}/i).size
      highlighted_pdf += highlight_text(text, search_text)
      pdf_text += text
    end

    [pdf_text, occurrences, highlighted_pdf]
  end

  def highlight_text(text, search_text)
    text.gsub(/(#{Regexp.quote(search_text)})/i, '<mark>\1</mark>')
  end
end
