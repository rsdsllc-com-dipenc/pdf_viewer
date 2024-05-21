Rails.application.routes.draw do
  get 'pdfs/upload', to: 'pdfs#upload', as: 'upload_pdfs'
  post 'pdfs/process', to: 'pdfs#process_pdf', as: 'process_pdf_pdfs'
  root 'pdfs#upload'
  # root 'home#index'
  post 'create', to: 'home#create'
  get 'result', to: 'home#result'
end
