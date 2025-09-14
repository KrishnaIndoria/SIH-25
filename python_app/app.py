from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400
    
    files = request.files.getlist('file')
    results = {}

    try:
        for f in files:
            if f.filename.endswith('.csv'):
                df = pd.read_csv(f)
            elif f.filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(f)
            else:
                return jsonify({"error": f"Unsupported file type: {f.filename}"}), 400

            # Example: send back basic info
            results[f.filename] = {
                "rows": df.shape[0],
                "columns": df.shape[1],
                "columns_list": list(df.columns)
            }

        return jsonify({"message": "Files processed successfully", "results": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(port=5000, debug=True)
