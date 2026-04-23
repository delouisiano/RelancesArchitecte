from pathlib import Path
path = Path("src/app/globals.css")
text = path.read_text()
append = """
.modal-card-wide {
  width: min(100%, 56rem);
}

pre {
  margin: 0;
  font-family: inherit;
}
"""
if ".modal-card-wide" not in text:
    path.write_text(text + "\n" + append)
