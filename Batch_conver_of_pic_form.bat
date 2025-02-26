@echo off 
start cmd /k "python -m http.server  8000"
start "" "index.htm" 
exit 