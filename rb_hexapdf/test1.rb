require 'hexapdf'
require 'set'

class HighlightWordsProcessor < HexaPDF::Content::Processor
  def initialize(page, words)
    super()
    @canvas = page.canvas(type: :overlay)
    @words = words.map(&:downcase).to_set
    @current_word = ""
    @current_boxes = []
  end

  def show_text(str)
    boxes = decode_text_with_positioning(str)
    return if boxes.string.empty?

    boxes.each do |box|
      if box.string =~ /\s/
        check_and_highlight_current_word
        @current_word = ""
        @current_boxes.clear
      else
        @current_word << box.string
        @current_boxes << box
      end
    end

    check_and_highlight_current_word
  end
  alias :show_text_with_positioning :show_text

  private

  def check_and_highlight_current_word
    if @words.include?(@current_word.downcase)
      @current_boxes.each do |box|
        x, y = *box.lower_left
        tx, ty = *box.upper_right
        @canvas.save_graphics_state do
          
          @canvas.stroke_color(224, 0, 0)
          @canvas.line_width = 0.5

          @canvas.fill_color(0, 224, 0) # Yellow color
          @canvas.rectangle(x, y, tx - x, ty - y).stroke
        end
      end
    end
  end
end

# Function to highlight words on a specific page
def highlight_words_on_page(pdf, page_number, words)
  page = pdf.pages[page_number - 1]
  processor = HighlightWordsProcessor.new(page, words)
  page.process_contents(processor)
end

# Load the PDF
pdf = HexaPDF::Document.open('simple.pdf')

# Highlight 'vehicle' on the first page
highlight_words_on_page(pdf, 1, ['This'])

# Highlight 'update' on the second page
# highlight_words_on_page(pdf, 2, ['update'])

# Save the modified PDF
pdf.write('highlighted_insurance.pdf', optimize: true)
