import os
import zipfile
import PyPDF2
import re
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.files.storage import default_storage
from django.http import FileResponse

def extract_serial_number(text):
    match = re.search(r"Sr\.?\s*No\.?\s*/?\s*ID\s*No\.?\s*:\s*([\dA-Za-z/-]+(?:\s*/SSB/\S+)?)", text)
    if match:
        serial_number = match.group(1).strip().replace(" /", "_").replace("/", "_")
        return serial_number  
    return None


def split_pdf_and_save(input_pdf_path, output_folder):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    extracted_files = []
    with open(input_pdf_path, "rb") as pdf_file:
        reader = PyPDF2.PdfReader(pdf_file)
        
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            serial_number = extract_serial_number(text) or f"Page_{i+1}" 
            output_filename = f"{output_folder}/{serial_number}.pdf"
            
            writer = PyPDF2.PdfWriter()
            writer.add_page(page)
            
            with open(output_filename, "wb") as output_pdf:
                writer.write(output_pdf)
            print(f"Saved: {output_filename}")
            extracted_files.append(output_filename)

    return extracted_files

import os
import zipfile
from django.http import FileResponse
from rest_framework.response import Response
from rest_framework.decorators import api_view

@api_view(["POST"])
def upload_and_process_pdf(request):
    if 'file' not in request.FILES:
        return Response({"error": "No file uploaded"}, status=400)

    uploaded_file = request.FILES['file']
    file_name_without_ext = os.path.splitext(uploaded_file.name)[0]  # Extract file name without .pdf

    temp_folder = "media/temp"
    os.makedirs(temp_folder, exist_ok=True)

    input_pdf_path = os.path.join(temp_folder, uploaded_file.name)  

    with open(input_pdf_path, "wb") as f:
        for chunk in uploaded_file.chunks():
            f.write(chunk)  

    output_folder = "media/split_pdfs"
    os.makedirs(output_folder, exist_ok=True)  

    extracted_files = split_pdf_and_save(input_pdf_path, output_folder)

    zip_filename = f"{file_name_without_ext}.zip"  # ✅ Use uploaded file's name for ZIP
    zip_path = os.path.join("media", zip_filename)

    with zipfile.ZipFile(zip_path, "w") as zipf:
        for file in extracted_files:
            zipf.write(file, os.path.basename(file))

    return FileResponse(open(zip_path, "rb"), as_attachment=True, filename=zip_filename)

